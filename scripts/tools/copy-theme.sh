#!/bin/bash

# Copy theme.zip from docs to public/assets before build
# This script is called by the prebuild npm script

set -e

THEME_SOURCE="docs/theme.zip"
ASSETS_DIR="public/assets"
THEME_DEST="$ASSETS_DIR/theme.zip"

echo "Checking for theme.zip..."

if [ -f "$THEME_SOURCE" ]; then
  echo "Found $THEME_SOURCE"

  # Create assets directory if it doesn't exist
  if [ ! -d "$ASSETS_DIR" ]; then
    echo "Creating $ASSETS_DIR directory..."
    mkdir -p "$ASSETS_DIR"
  fi

  # Copy theme.zip
  echo "Copying $THEME_SOURCE to $THEME_DEST..."
  cp "$THEME_SOURCE" "$THEME_DEST"

  echo "✓ Theme copied successfully"
else
  echo "No theme.zip found in docs/ - skipping"
fi
