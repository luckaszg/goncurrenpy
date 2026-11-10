#!/bin/bash

cd "$(dirname "$0")"

if [ -z "$1" ]; then
	echo "Error: Please provide a file to run."
	echo "Usage: $0 <filename>"
	exit 1
fi

TARGET_FILE="$1"

if [ ! -f "$TARGET_FILE"]; then
	echo "Error: File '$TARGET_FILE' not found."
	exit 1
fi

echo "Running $TARGET_FILE..."

uv run python "$TARGET_FILE"
