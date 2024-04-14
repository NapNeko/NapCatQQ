#!/bin/bash
SCRIPT_DIR=$(realpath $(dirname "${BASH_SOURCE[0]}"))
export ELECTRON_RUN_AS_NODE=1
/opt/QQ/qq ${SCRIPT_DIR}/napcat.cjs $@
