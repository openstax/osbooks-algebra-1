#!/usr/bin/env bash

set -euxo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
venv="$here/.venv"

[ -e "$venv" ] || python3 -m venv "$venv" || python -m venv "$venv"

python() { "$venv/bin/python" "$@"; }
pip() { "$venv/bin/pip" "$@"; }

python -m pip install -U pip
pip install -r "$here/requirements.txt"
python "$here/main.py" "$@"
