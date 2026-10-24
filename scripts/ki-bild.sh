#!/bin/bash
# Erzeugt ein Bild mit FLUX.1 schnell (Apache 2.0) über die öffentliche Hugging-Face-Seite.
# Aufruf: ki-bild.sh <ziel.webp> <breite> <hoehe> <seed> "<beschreibung>"
set -e
T=$(cat ~/.cache/huggingface/token); S=https://black-forest-labs-flux-1-schnell.hf.space
D=$(python3 -c 'import json,sys; print(json.dumps({"data":[sys.argv[4],int(sys.argv[3]),False,int(sys.argv[1]),int(sys.argv[2]),4]}))' "$2" "$3" "$4" "$5")
ID=$(curl -s --max-time 30 -X POST $S/gradio_api/call/infer -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d "$D" | python3 -c "import sys,json;print(json.load(sys.stdin)['event_id'])")
OUT=$(curl -s -N --max-time 180 $S/gradio_api/call/infer/$ID -H "Authorization: Bearer $T")
URL=$(echo "$OUT" | grep '^data:' | tail -1 | sed 's/^data: //' | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['url'])") || { echo "FEHLER $1: $OUT" | tail -c 300; exit 1; }
curl -s -o "$1" -H "Authorization: Bearer $T" "$URL"; echo "ok $1"
