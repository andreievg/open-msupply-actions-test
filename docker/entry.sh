#!/bin/bash
set -e

# Load reference file
if [ ! -z "$LOAD_REFERENCE_FILE" ]; then
  echo "Loading reference file "
  # Initialise uses testdb to setup database and migrated it, by default we create templates
  # which allows for faster testing, but requires finding workspace
  MSUPPLY_NO_TEST_DB_TEMPLATE=1 ./remote_server_cli initialise-from-export -n "$LOAD_REFERENCE_FILE"
fi


# Run the remote_server with or without faketime
if [ ! -z "$FAKE_DATETIME" ]; then
    # Refresh dates
    if [ "$SHOULD_REFRESH_DATES" = true ]; then
        echo "Refreshing dates"
        faketime "$FAKE_DATETIME" ./remote_server_cli refresh-dates
    fi
  echo "Starting remote_server with faketime: $FAKE_DATETIME"
  exec faketime "$FAKE_DATETIME" ./remote_server
else
    # Refresh dates
    if [ "$SHOULD_REFRESH_DATES" = true ]; then
        echo "Refreshing dates"
        ./remote_server_cli refresh-dates
    fi
  echo "Starting remote_server normally"
  exec ./remote_server
fi