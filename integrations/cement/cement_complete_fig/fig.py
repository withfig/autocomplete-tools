from cement import Controller
from argparse_complete_fig import generate_completion_spec


class GenerateFigSpecController(Controller):
    class Meta:
        label = 'generate_fig_spec'
        stacked_on = 'base'
        stacked_type = 'nested'
        description = 'Generate a fig completion spec for this CLI tool'
        hide = True

    def _pre_argument_parsing(self):
        controller = self.app.controller
        meta_by_parser = {}

        for child in controller._controllers:
            commands = child._collect_commands()
            if commands:
                parent = controller._get_parser_parent_by_controller(child)
                for command in commands:
                    command_parser = parent._name_parser_map.get(
                        command['label']
                    )
                    meta_by_parser[command_parser] = {
                        "meta": command,
                        "type": "command"
                    }
            if child._meta.stacked_type == "embedded":
                continue
            parser = controller._get_parser_by_controller(child)
            meta_by_parser[parser] = {
                "meta": child._meta.__dict__,
                "type": "controller"
            }

        def subcommand_hook(subcommand, parser):
            parser_meta = meta_by_parser.get(parser)
            if parser_meta is not None:
                meta = parser_meta["meta"]
                if meta.get("hide", False):
                    subcommand["hidden"] = True
                if meta.get("description"):
                    subcommand["description"] = meta["description"]
            if subcommand["name"] == "generate_fig_spec":
                subcommand["priority"] = 0

        def arg_filter(arg):
            return arg.dest in ["__dispatch__", "__controller_namespace__"]

        hooks = {"subcommand": subcommand_hook}
        spec = generate_completion_spec(
            controller._parser,
            hooks,
            arg_filter,
            "cement_generate_fig"
        )
        print(spec)

    def _default(self):
        pass
