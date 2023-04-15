import argparse
import pytest
from argparse_complete_fig import fig
import io
from contextlib import redirect_stdout
import sys
  
### Fixtures
@pytest.fixture
def case_1_fixture():
    return '''// Autogenerated by argparse_complete_fig
const completionSpec: Fig.Spec = {
  "name": "__main__.py",
  "options": [
    {
      "name": [
        "-h",
        "--help"
      ],
      "description": "show this help message and exit"
    },
    {
      "name": "--output",
      "description": "Select output directory",
      "args": [
        {
          "name": "O"
        },
        {
          "isOptional": true,
          "isVariadic": true,
          "name": "O",
          "optionsCanBreakVariadicArg": true
        }
      ]
    },
    {
      "name": "--sum",
      "description": "sum the integers (default: find the max)"
    }
  ],
  "args": [
    {
      "name": "N",
      "description": "an integer for the accumulator"
    },
    {
      "isOptional": true,
      "isVariadic": true,
      "name": "N",
      "optionsCanBreakVariadicArg": true,
      "description": "an integer for the accumulator"
    }
  ]
}
export default completionSpec;'''


@pytest.fixture
def case_2_fixture():
    return '''// Autogenerated by argparse_complete_fig
const completionSpec: Fig.Spec = {
  "name": "__main__.py",
  "options": [
    {
      "name": [
        "-h",
        "--help"
      ],
      "description": "show this help message and exit"
    },
    {
      "name": [
        "-f",
        "--file"
      ],
      "description": "yaml file to process",
      "args": [
        {
          "name": "file"
        }
      ]
    },
    {
      "name": "--generate-fig-spec",
      "description": "Generate fig completion spec for this parser",
      "priority": 0
    }
  ]
}
export default completionSpec;
'''

### Test cases
def test_cli_generate(case_1_fixture):
    parser = argparse.ArgumentParser(description="A root description")
    parser.add_argument('integers', metavar='N', type=int, 
        nargs='+',help='an integer for the accumulator')
    parser.add_argument('--output', dest='accumulate', metavar="O", type=str, nargs=argparse.ONE_OR_MORE, help="Select output directory")
    parser.add_argument('--sum', dest='accumulate', action='store_const',
        const=sum, default=max, help='sum the integers (default: find the max)')
    assert fig.generate_completion_spec(parser) == case_1_fixture

def test_case_2(case_2_fixture):
    parser = argparse.ArgumentParser(description='process yaml file.')
    parser.add_argument('-f', '--file', type=str, help='yaml file to process')
    fig.add_completion_spec_command(parser)


    f = io.StringIO()
    with redirect_stdout(f):
        def blank_fn(*args, **kwargs):
          pass
        exit = sys.exit
        sys.exit = blank_fn
        args = parser.parse_args(['--generate-fig-spec'])
        sys.exit = exit
    assert f.getvalue() == case_2_fixture

