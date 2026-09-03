#!/bin/bash
# Restart the dev server if it isn't running.
if ! curl -s -o /dev/null --max-time 3 http://localhost:3000/ 2>/dev/null; then
  pkill -f "next dev" 2>/dev/null
  sleep 1
  cd /home/z/my-project
  nohup ./node_modules/.bin/next dev -p 3000 > dev.log 2>&1 < /dev/null &
fi
