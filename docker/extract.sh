#!/bin/bash
set -e

pv client.tar.gz | tar -xzf - -C extract-client/