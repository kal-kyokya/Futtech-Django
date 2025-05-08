#!/bin/bash

PORT=8080
APP_NAME="futtech-backend"
BACKEND_SCRIPT="./index.js"

echo "🔍 Checking for processes on port $PORT..."
PIDS=$(sudo lsof -ti :$PORT)

if [ -z "$PIDS" ]; then
  echo "✅ No process is using port $PORT."
else
  echo "❌ Port $PORT is in use by PID(s): $PIDS"
  echo "🛑 Killing processes..."
  for pid in $PIDS; do
    sudo kill -9 $pid && echo "Killed PID $pid"
  done
fi

echo ""
echo "🔄 Checking PM2..."
pm2 list

if pm2 list | grep -q "$APP_NAME"; then
  echo "🛑 Stopping and deleting PM2 app: $APP_NAME"
  pm2 stop "$APP_NAME"
  pm2 delete "$APP_NAME"
else
  echo "ℹ️ No PM2 process named '$APP_NAME' found."
fi

echo ""
echo "🚀 Starting backend: $BACKEND_SCRIPT"
pm2 start "$BACKEND_SCRIPT" --name "$APP_NAME"

echo "💾 Saving PM2 state"
pm2 save

echo "✅ Done! Port $PORT should now be clean and your app restarted."
