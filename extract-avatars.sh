#!/usr/bin/env bash
# Quick avatar extraction for macOS/Linux users

echo "📸 Extracting avatars from sprite image..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Install with:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

SPRITE_FILE="src/assets/avatars/sprite.png"
if [ ! -f "$SPRITE_FILE" ]; then
    echo "❌ Sprite file not found at $SPRITE_FILE"
    exit 1
fi

# Get image dimensions
DIMS=$(identify "$SPRITE_FILE" | awk '{print $3}')
WIDTH=$(echo $DIMS | cut -dx -f1)
HEIGHT=$(echo $DIMS | cut -dx -f2)

# Calculate slice size (2 cols, 3 rows = 6 avatars)
SLICE_WIDTH=$((WIDTH / 2))
SLICE_HEIGHT=$((HEIGHT / 3))

echo "📐 Sprite: ${WIDTH}×${HEIGHT}px → Slices: ${SLICE_WIDTH}×${SLICE_HEIGHT}px"

# Extract avatars
convert "$SPRITE_FILE" -crop 2x3@ +repage "src/assets/avatars/avatar-%d.png"

# Rename from 0-5 to 1-6
for i in {0..5}; do
    [ -f "src/assets/avatars/avatar-$i.png" ] && mv "src/assets/avatars/avatar-$i.png" "src/assets/avatars/avatar-$((i+1)).png"
done

echo "✅ Done! Avatar files created:"
ls -1 "src/assets/avatars/avatar-"*.png

