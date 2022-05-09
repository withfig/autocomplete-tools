#!/bin/bash
if [ $1 == "generate-fig-spec" ]; then
  echo "const completion = {}[]; export default completion"
fi