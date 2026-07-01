#!/data/data/com.termux/files/usr/bin/bash

cd "$(dirname "$0")"

pkill -f "http.server" 2>/dev/null

python3 -m http.server 8000 >/dev/null 2>&1 &

sleep 1

termux-open-url http://127.0.0.1:8000
