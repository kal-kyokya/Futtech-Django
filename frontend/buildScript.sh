#!/usr/bin/env bash
# Use the first `bash` in PATH to run this script (portable shebang).

set -euo pipefail
# -e : exit immediately if any command fails
# -u : error on use of undefined variables
# -o pipefail : a pipeline fails if any command in it fails

# --- Config (override via env) ---
FRONTEND_DIR="${FRONTEND_DIR:-$(cd "$(dirname "$0")" && pwd)}"
# Directory of the frontend; default = the folder where this script lives

DOCROOT="${DOCRROT:-/var/www/futtech/app}"
# Nginx document root where the built SPA will be server.

NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
# Node.js memory ceiling for builds; can be overriden by exporting NODE_OPTIONS

# --- Build (no sudo, no --debug) ---
cd "$FRONTEND_DIR"
# Ensures we are in the frontend directory before building.

# npm ci # To be uncommented in CI to guarantee clean, reproducible installs
# Uses `npm ci`in CI pipelines; commented locally avoid reinstalling each run

NODE_OPTIONS="$NODE_OPTIONS" npm run build
# Run the production build with the selected Node options. No sudo. No invalid flags

# --- Deploy built assets ---
sudo mkdir -p "$DOCROOT"
# Create the Nginx docroot if it doesn't exist (needs sudo for /var).

sudo rsync -a --delete "dist/" "$DOCROOT/"
# Atomic-ish sync of built files:
#   -a       : recursive, preserve perms/timestamps
#   --delete : remove files in DOCROOT that no longer exists in dist/
# Using "dist/" -> "$DOCROOT/" prevents nesting an extra dist/ folder

# --- Nginx sanity + reload ---
sudo nginx -t
# Validate Nginx configuration before reloading (fail fast if invalid config)

sudo systemctl reload nginx
# Reload Nginx to serve the new static assets without full restart

echo "✅ Deployed to $DOCROOT"
# Human-friendly confirmation with the effective target path.
