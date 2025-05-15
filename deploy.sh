#!/bin/bash

# Exit on error
set -e

# Build the project
echo "Building project..."
pnpm build

# Create a temporary directory for deployment
echo "Preparing deployment..."
TEMP_DIR=$(mktemp -d)
cp -r dist/* "$TEMP_DIR"

# Create or update gh-pages branch
echo "Deploying to gh-pages branch..."
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# Remove all files except .git
git rm -rf . || true

# Copy the built files
cp -r "$TEMP_DIR"/* .

# Add all files
git add .

# Commit and push
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Clean up
rm -rf "$TEMP_DIR"

# Switch back to main branch
git checkout main

echo "Deployment complete!" 