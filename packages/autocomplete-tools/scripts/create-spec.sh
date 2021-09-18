#!/bin/bash

clear
echo 
echo 
# echo "$(tput setaf 4)What's the name of the CLI you want to create the Spec for?$(tput sgr0)"

if [[ -z "$1" ]]; then
  read -e -p "What's the name of the CLI tool you want to create an autocomplete spec for: " USER_INPUT_CLI_TOOL
else
  USER_INPUT_CLI_TOOL="$1"
fi

# Must put file path in quotes in case either variable has spaces
FILEPATH="$(pwd)/src/$USER_INPUT_CLI_TOOL.ts"

# The actual name of the spec
SPEC_NAME="$(basename $USER_INPUT_CLI_TOOL)"

# If it's a nested path make sure the directory exists
mkdir -p "$(dirname $FILEPATH)"

# Check if the given file exists
if [[ -f "$FILEPATH" ]]; then
  echo
  echo "$(tput setaf 1)This completion spec already exists$(tput sgr0)"
  echo
  echo Start editing it from the $(tput bold)src/$USER_INPUT_CLI_TOOL.ts$(tput sgr0) now!
  echo 
  exit 0
else 

  ## This is known as a here document (or heredoc)
  ## Using a hyphen between << and EOF will remove any indenting beforehand e.g. <<-EOF
    # https://stackoverflow.com/questions/4937792/using-variables-inside-a-bash-heredoc
  ## Using quotes around EOF will remove expansions
    # https://superuser.com/questions/1436906/need-to-expand-a-variable-in-a-heredoc-that-is-in-quotes
  cat <<EOF >> "$(pwd)/src/$USER_INPUT_CLI_TOOL.ts"
const completionSpec: Fig.Spec = {
  name: "$SPEC_NAME",
  description: "",
  subcommands: [{
    name: "my_subcommand",
    description: "Example subcommand",
    subcommands: [{
      name: "my_nested_subcommand",
      description: "Nested subcommand, example usage: '$SPEC_NAME my_subcommand my_nested_subcommand'"
    }],
  }],
  options: [{
    name: ["--help", "-h"],
    description: "Show help for $SPEC_NAME",
  }],
  // Only uncomment if $SPEC_NAME takes an argument
  // args: {}
};
export default completionSpec;
EOF

  echo
  echo "$(tput setaf 2)Successfully created the new Spec $USER_INPUT_CLI_TOOL!$(tput sgr0)" 
  echo 
  echo "Start editing it at $(tput bold)src/$USER_INPUT_CLI_TOOL.ts$(tput sgr0)... We're opening it for you now!"
  echo
  open "$(pwd)/src/$USER_INPUT_CLI_TOOL.ts"
  exit
fi
