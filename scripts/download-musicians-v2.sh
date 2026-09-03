#!/usr/bin/env bash
# Consulta MediaWiki API para obtener las URLs actuales y descarga con curl

DEST="public/images/musicians"
mkdir -p "$DEST"

MUSICIANS=(
  "freddie-mercury:Freddie_Mercury"
  "jimi-hendrix:Jimi_Hendrix"
  "billie-eilish:Billie_Eilish"
  "lady-gaga:Lady_Gaga"
  "michael-jackson:Michael_Jackson"
  "taylor-swift:Taylor_Swift"
  "kendrick-lamar:Kendrick_Lamar"
  "the-weeknd:The_Weeknd"
  "prince:Prince_(musician)"
  "amy-winehouse:Amy_Winehouse"
)

echo ""
echo "🎵 Consultando Wikipedia API y descargando músicos..."
echo ""

for entry in "${MUSICIANS[@]}"; do
  id="${entry%%:*}"
  title="${entry##*:}"

  echo -n "  → $id... "

  # Query MediaWiki API, get thumbnail source URL, strip UTM params
  RAW=$(curl -s "https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=400&pilicense=any")
  THUMB=$(echo "$RAW" | python3 -c "
import sys, json
data = json.load(sys.stdin)
pages = data.get('query', {}).get('pages', {})
page = list(pages.values())[0]
src = page.get('thumbnail', {}).get('source', '')
# Strip UTM query params
src = src.split('?')[0] if '?' in src else src
print(src)
" 2>/dev/null)

  if [[ -z "$THUMB" ]]; then
    echo "❌ No thumbnail URL from API"
    continue
  fi

  # Get extension
  EXT="${THUMB##*.}"
  EXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
  [[ "$EXT" == "jpeg" ]] && EXT="jpg"

  DESTFILE="$DEST/$id.$EXT"
  HTTP=$(curl -s -o "$DESTFILE" -w "%{http_code}" \
    -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36" \
    -H "Referer: https://en.wikipedia.org/" \
    -L "$THUMB")

  if [[ "$HTTP" == "200" ]]; then
    SIZE=$(wc -c < "$DESTFILE")
    echo "✅ $HTTP — ${SIZE} bytes (.${EXT}) — $THUMB"
  else
    echo "❌ $HTTP — $THUMB"
    rm -f "$DESTFILE"
    # Try original (non-thumbnail) URL as fallback
    ORIG=$(echo "$THUMB" | sed 's|/thumb/||' | sed 's|/[0-9]*px-[^/]*$||')
    echo "      Fallback: $ORIG"
    EXT2="${ORIG##*.}"
    EXT2=$(echo "$EXT2" | tr '[:upper:]' '[:lower:]')
    [[ "$EXT2" == "jpeg" ]] && EXT2="jpg"
    HTTP2=$(curl -s -o "$DEST/$id.$EXT2" -w "%{http_code}" \
      -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36" \
      -H "Referer: https://commons.wikimedia.org/" \
      -L "$ORIG")
    if [[ "$HTTP2" == "200" ]]; then
      SIZE2=$(wc -c < "$DEST/$id.$EXT2")
      echo "      ✅ Fallback OK — ${SIZE2} bytes"
    else
      echo "      ❌ Fallback $HTTP2"
      rm -f "$DEST/$id.$EXT2"
    fi
  fi

  sleep 0.3
done

echo ""
echo "📁 Archivos descargados:"
ls -lh "$DEST/"
