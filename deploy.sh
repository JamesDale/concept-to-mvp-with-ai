#!/bin/bash

# Exit on error
set -e

# Build the project
echo "Building project..."
pnpm build

# Create or update gh-pages branch
echo "Deploying to gh-pages branch..."
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# Remove all files except .git
git rm -rf . || true

# Copy the contents of dist directory directly to root
echo "Copying built files..."
cp -r dist/* .

# Add all files
git add .

# Commit and push
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Switch back to main branch
git checkout main

echo "Deployment complete!" 