#!/bin/bash
if [ $1 == "generate-spec" ]; then
  echo "const completion = {}; export default completion"
fi
