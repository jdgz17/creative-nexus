#!/usr/bin/env bash
# Descarga músicos usando curl con headers correctos de Wikimedia

DEST="public/images/musicians"
mkdir -p "$DEST"

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

download() {
  local id=$1
  local url=$2
  local ext="${url##*.}"
  ext="${ext%%\?*}"
  # Normalise extension
  [[ "$ext" == "jpeg" ]] && ext="jpg"
  local dest="$DEST/$id.$ext"
  echo -n "  → $id... "
  HTTP=$(curl -s -o "$dest" -w "%{http_code}" -L \
    -H "User-Agent: $UA" \
    -H "Referer: https://en.wikipedia.org/" \
    "$url")
  if [[ "$HTTP" == "200" ]]; then
    SIZE=$(wc -c < "$dest")
    echo "✅ HTTP $HTTP (${SIZE} bytes, .$ext)"
  else
    echo "❌ HTTP $HTTP"
    rm -f "$dest"
  fi
}

echo ""
echo "🎵 Descargando fotos de músicos via Wikimedia Commons (curl)..."
echo ""

# Freddie Mercury – Wikimedia Commons
download "freddie-mercury" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg/400px-Freddie_Mercury_performing_in_New_Haven%2C_CT%2C_November_1977.jpg"

# Jimi Hendrix
download "jimi-hendrix" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Jimi_Hendrix_1967_uncropped.jpg/400px-Jimi_Hendrix_1967_uncropped.jpg"

# Billie Eilish
download "billie-eilish" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Billie_Eilish_in_2019_2.png/400px-Billie_Eilish_in_2019_2.png"

# Lady Gaga
download "lady-gaga" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg/400px-Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg"

# Michael Jackson
download "michael-jackson" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Michael_Jackson_1984_MJJ.jpg/400px-Michael_Jackson_1984_MJJ.jpg"

# Taylor Swift
download "taylor-swift" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/400px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png"

# Kendrick Lamar
download "kendrick-lamar" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Kendrick_Lamar_%28cropped%29.jpg/400px-Kendrick_Lamar_%28cropped%29.jpg"

# The Weeknd
download "the-weeknd" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/The_Weeknd_Portrait_by_Brian_Ziff.jpg/400px-The_Weeknd_Portrait_by_Brian_Ziff.jpg"

# Prince
download "prince" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Prince_at_Coachella_001.jpg/400px-Prince_at_Coachella_001.jpg"

# Amy Winehouse
download "amy-winehouse" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Amy_Winehouse_f4962007_crop.jpg/400px-Amy_Winehouse_f4962007_crop.jpg"

echo ""
echo "✅ Descarga completada. Archivos en $DEST/"
ls -lh "$DEST/"
