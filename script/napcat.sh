#!/bin/bash

get_script_dir() {
  local script_path="${1:-$0}"
  local script_dir
  script_path=$(readlink -f "$script_path")
  script_dir=$(dirname "$script_path")

  echo "$script_dir"
}

SCRIPT_DIR=$(get_script_dir)

export ELECTRON_RUN_AS_NODE=1

if ! [ -x /opt/QQ/qq ]; then
    echo "Error: /opt/QQ/qq is not executable or does not exist." >&2
    exit 1
fi

/opt/QQ/qq "${SCRIPT_DIR}/napcat.mjs" "$@"
