#!/bin/bash

cd "$(dirname "$0")"
cd ../

PORT=3000

if [ -n "$1" ]; then PORT=$1; fi

meteor test-packages ./ -p $PORT