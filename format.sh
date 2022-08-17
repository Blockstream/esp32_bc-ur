#!/bin/bash
set -eo pipefail

clang-format -i --style='{BasedOnStyle: Google, Language: JavaScript, IndentWidth: 4}' js/jadeqr.js
