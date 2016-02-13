#!/bin/bash

cd "$(dirname "$0")"
cd ../

jsdoc2md "src/*.js" > api.md