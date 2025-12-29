#!/usr/bin/env python3

"""
Avatar Image Slicer (Cross-platform)

This script slices the avatar sprite image (6 avatars in a 2x3 grid)
into 6 individual avatar files.

Usage:
    1. Place sprite.png at: src/assets/avatars/sprite.png
    2. Install Pillow: pip install pillow
    3. Run: python slice_avatars.py
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not found. Install with: pip install pillow")
    sys.exit(1)

SPRITE_PATH = Path('src/assets/avatars/sprite.png')
OUTPUT_DIR = Path('src/assets/avatars')

if not SPRITE_PATH.exists():
    print(f"❌ Sprite file not found at {SPRITE_PATH}")
    print("\n📝 Instructions:")
    print("1. Copy your avatar sprite image to: src/assets/avatars/sprite.png")
    print("2. Ensure the image shows 6 avatars in a 2×3 grid (2 columns, 3 rows)")
    print("3. Run: python slice_avatars.py")
    sys.exit(1)

try:
    # Load the sprite image
    sprite = Image.open(SPRITE_PATH)
    width, height = sprite.size
    print(f"📸 Sprite dimensions: {width}×{height}px")

    # Calculate slice dimensions (2 columns, 3 rows)
    slice_width = width // 2
    slice_height = height // 3
    print(f"✂️  Slicing into 6 avatars: {slice_width}×{slice_height}px each\n")

    # Extract each avatar
    positions = [
        (0, 0, 1),   # top-left
        (1, 0, 2),   # top-right
        (0, 1, 3),   # middle-left
        (1, 1, 4),   # middle-right
        (0, 2, 5),   # bottom-left
        (1, 2, 6)    # bottom-right
    ]

    for col, row, avatar_id in positions:
        left = col * slice_width
        top = row * slice_height
        right = left + slice_width
        bottom = top + slice_height

        # Crop the slice
        avatar_img = sprite.crop((left, top, right, bottom))

        # Save it
        output_file = OUTPUT_DIR / f'avatar-{avatar_id}.png'
        avatar_img.save(output_file)
        print(f"✅ Created: avatar-{avatar_id}.png")

    print("\n🎉 All avatars extracted successfully!")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
