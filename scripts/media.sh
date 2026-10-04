#!/bin/sh
# Rebuilds public/media from borrdrilling.com: the homepage's hero film (HP.mp4) and its three photographs, fetched
# at full size from the site's WordPress API host, then encoded for the web. Needs curl, ffmpeg and cwebp.
set -e
cd "$(dirname "$0")/.."
RAW=_scrape/raw; OUT=public/media; mkdir -p "$RAW" "$OUT"
B=https://api.borrdrilling.com/wp-content/uploads
UA="Mozilla/5.0 (Macintosh) Chrome/130"
get() { [ -f "$RAW/$2" ] || curl -sL -A "$UA" "$B/$1" -o "$RAW/$2"; }

# name           live path (acf field on the home page)
get 2024/09/HP.mp4 hero.mp4            # home_video
get 2024/07/home_pic_1.jpg about.jpg   # about_image
get 2024/07/home_pic_2.jpg careers.jpg # join_our_team_image
get 2024/07/home_pic_3.jpg sustainability.jpg # taking_major_steps_image
get 2024/07/world_map.png world-map.png # world_map_image (vectorised by scripts/map.py)

# Hero film: 20s, muted, 1600 wide, faststart. A second, lighter 960-wide cut for phones.
ffmpeg -v error -y -i "$RAW/hero.mp4" -an -vf "scale=1600:-2,fps=25" -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/hero.mp4"
ffmpeg -v error -y -i "$RAW/hero.mp4" -an -vf "scale=960:-2,fps=25" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart "$OUT/hero-960.mp4"
# Poster: the film's own first frame, so the swap from poster to film never jumps.
ffmpeg -v error -y -ss 0 -i "$RAW/hero.mp4" -frames:v 1 -vf "scale=1600:-2" -q:v 3 "$OUT/hero-poster.jpg"

# Photographs: 1600 wide and 800 wide WebP.
for n in about careers sustainability; do
  cwebp -quiet -q 80 -resize 1600 0 "$RAW/$n.jpg" -o "$OUT/$n.webp"
  cwebp -quiet -q 78 -resize 800 0 "$RAW/$n.jpg" -o "$OUT/$n-800.webp"
done
ls -la "$OUT"
