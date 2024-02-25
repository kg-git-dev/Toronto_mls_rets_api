#!/bin/bash

# Get the directory containing the script
script_dir=$(dirname "$0")

# Define the relative path to navigate
relative_path="XmlParser/Residential"

# Change directory to the desired location
cd "$script_dir/$relative_path"

# Run the update prcoess
node updateListing.js

# Check if the node process has exited
while pgrep -x "node" > /dev/null; do
    sleep 10
done

# Once the node process has exited, run the redis-cli command to flush database 0
redis-cli -n 0 FLUSHDB
