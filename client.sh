#!/bin/bash

if [ "$1" == "debug" ]; then DEBUG="--inspect-brk"; fi

ARGUMENTS=$@
BASE_PATH=`dirname $(realpath -s $0)`
CLIENT="$BASE_PATH/src/client.js"
PINO="$BASE_PATH/node_modules/.bin/pino"

node $DEBUG $CLIENT $ARGUMENTS | $PINO
