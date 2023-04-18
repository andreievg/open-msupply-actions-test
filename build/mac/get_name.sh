#!/bin/bash

# intel or arm
ARCHITECHTURE=$1
# Get version from package.json, get line with version on it, then remove everything but version
# and replace . with _
VERSION=$(cat package.json | grep 'version":' | sed 's/[^0-9.]//g' | sed 's/[.]/_/g')
HASH=$(git rev-parse --short HEAD)
echo "omSupply_mac_${ARCHITECHTURE}_v${VERSION}_${HASH}"

