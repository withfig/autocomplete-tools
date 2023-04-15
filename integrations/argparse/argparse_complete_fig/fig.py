import json
import argparse

REPEATABLE_ACTIONS = ["extend", "append", "append_const", "count"]


def get_arg_list(arg):
    if arg.nargs is None or arg.nargs == 1:
        return [{}]
    elif arg.nargs == argparse.OPTIONAL:
        return [{"isOptional": True}]
    elif arg.nargs == argparse.ZERO_OR_MORE:
        return [{"isOptional": True, "isVariadic": True}]
    elif arg.nargs == argparse.ONE_OR_MORE:
        return [{}, {"isOptional": True, "isVariadic": True}]
    elif isinstance(arg.nargs, int):
        return [{} for i in range(arg.nargs)]
    else:
        return [{"isOptional": True, "isVariadic": True}]


def get_arg_names(arg, n=None):
    if n is None:
        n = len(get_arg_list(arg))
    if isinstance(arg.metavar, tuple):
        return arg.metavar
    elif arg.metavar is not None:
        return (arg.metavar,) * n
    elif arg.dest != argparse.SUPPRESS:
        return (arg.dest,) * n
    return None


def get_base_suggestion(arg):
    """Compute properties shared amongst Fig spec options and args."""
    result = {}
    if arg.help is not None:
        if arg.help == argparse.SUPPRESS:
            result["hidden"] = True
        else:
            result["description"] = str(arg.help)
    elif arg.dest != argparse.SUPPRESS:
        result["description"] = str(arg.dest)
    return result


def construct_args(arg, hooks, parser, add_descriptions = True):
    """Construct Fig arg array given an argparse argument."""
    arg_hook = hooks.get("arg")

    # Construct common base_arg object
    base_arg = get_base_suggestion(arg)

    if not add_descriptions and "description" in base_arg:
      del base_arg["description"]

    if hasattr(arg.choices, '__iter__'):
        base_arg["suggestions"] = [str(a) for a in arg.choices]

    args = get_arg_list(arg)

    # Get names for each arg
    names = get_arg_names(arg, len(args))
    if names is not None:
        for name, arg in zip(names, args):
            arg["name"] = str(name)

    # post process arg list
    for arg in args:
        if arg.get("isVariadic", False):
            arg["optionsCanBreakVariadicArg"] = True
        arg.update(base_arg)
        if arg_hook:
            arg_hook(arg, parser)

    return args


def construct_option(arg, hooks, parser):
    """Construct Fig option given an argparse argument."""
    option_args = construct_args(arg, hooks, parser, add_descriptions=False)
    if len(arg.option_strings) > 1:
        name = [str(name) for name in arg.option_strings]
    else:
        name = arg.option_strings[0]

    option = {
        "name": name,
        **get_base_suggestion(arg)
    }

    if hasattr(arg, "action") and arg.action in REPEATABLE_ACTIONS:
        option["isRepeatable"] = True
    if option_args:
        option["args"] = option_args
    if arg.required:
        option["isRequired"] = True

    option_hook = hooks.get("option")
    if option_hook:
        option_hook(option, parser)

    return option


def construct_subcommand(
    parser,
    hooks=None,
    arg_filter=None,
    is_root=True
):
    """Construct Fig subcommand given an argparse parser."""
    subcommands = []
    options = []
    args = []
    subcommand = {}
    hooks = {} if hooks is None else hooks
    subcommand_hook = hooks.get("subcommand")

    if is_root:
        subcommand["name"] = parser.prog

    for arg in parser._actions:
        if arg_filter is not None and arg_filter(arg):
            continue
        if arg.nargs == argparse.PARSER:
            subcommand.update(get_base_suggestion(arg))
            help_map = {a.dest: a.help for a in arg._choices_actions}

            nested_subcommands = {}
            for name, nested_parser in arg.choices.items():
                if nested_parser in nested_subcommands:
                    nested_subcommands[nested_parser]["name"].append(name)
                else:
                    nested_subcommands[nested_parser] = {
                        "name": [name],
                        **construct_subcommand(
                            nested_parser,
                            hooks=hooks,
                            arg_filter=arg_filter,
                            is_root=False
                        ),
                    }
                if name in help_map and help_map[name] != argparse.SUPPRESS:
                    nested_subcommands[nested_parser]["description"] = str(help_map[name])
            for p, nested_subcommand in nested_subcommands.items():
                if len(nested_subcommand["name"]) == 1:
                    nested_subcommand["name"] = nested_subcommand["name"][0]
                if subcommand_hook:
                    subcommand_hook(nested_subcommand, p)
                subcommands.append(nested_subcommand)
        elif arg.option_strings:
            options.append(construct_option(arg, hooks, parser))
        else:
            args.extend(construct_args(arg, hooks, parser))

    if subcommands:
        subcommand["subcommands"] = subcommands
    if options:
        subcommand["options"] = options
    if args:
        subcommand["args"] = args

    if is_root and subcommand_hook:
        subcommand_hook(subcommand, parser)

    return subcommand


def generate_completion_spec(
    parser,
    hooks=None,
    arg_filter=None,
    tool="argparse_complete_fig"
):
    """Generate Fig spec file given a root ArgumentParser object."""
    spec = construct_subcommand(parser, hooks, arg_filter)
    return f"""// Autogenerated by {tool}
const completionSpec: Fig.Spec = {json.dumps(spec, indent=2)}
export default completionSpec;"""


class GenerateFigSpecAction(argparse.Action):
    def __init__(
        self,
        option_strings,
        help="Generate fig completion spec for this parser",
        *args,
        **kwargs,
    ):
        super(GenerateFigSpecAction, self).__init__(
            option_strings=option_strings,
            dest=argparse.SUPPRESS,
            default=argparse.SUPPRESS,
            help=help,
            nargs=0,
        )

    def __call__(self, parser, namespace, values, option_string=None):
        def option_hook(option, _parser):
            if option["name"] == "--generate-fig-spec":
                option["priority"] = 0

        hooks = {"option": option_hook}
        spec = generate_completion_spec(parser, hooks)
        print(spec)
        parser.exit()


def add_completion_spec_command(parser):
    parser.add_argument("--generate-fig-spec", action=GenerateFigSpecAction)
