#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

mkdir -p ./.fig/autocomplete/
cd ./.fig/autocomplete/

cp -r "${SCRIPT_DIR}/../boilerplate/." .

mkdir -p src
npm i

"${SCRIPT_DIR}/create-boilerplate.sh" "$@"
