#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

for figdir in "./.fig/autocomplete" "./.fig/user/autocomplete"; do
  mkdir -p $figdir
  cd $figdir

  cp -r "${SCRIPT_DIR}/../boilerplate/." .

  mkdir -p src
  npm i
  cd -
done

# "${SCRIPT_DIR}/create-boilerplate.sh" "$@"
