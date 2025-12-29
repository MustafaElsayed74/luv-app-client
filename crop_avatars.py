#!/usr/bin/env python3
"""
Avatar Cropper - Customized for Love Poke UI
Processes original image into 6 avatar files with exact specifications
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image

# Input image path
image_path = r"F:\New folder\Stickers law School.jpg"

# Output directory
output_dir = Path("public/assets/avatars")
output_dir.mkdir(parents=True, exist_ok=True)

# Load original image
print(f"📸 Loading: {image_path}")
img = Image.open(image_path)
print(f"   Size: {img.size[0]}×{img.size[1]} px\n")

# Avatar crop coordinates (x1, y1, x2, y2)
"""
New 12-avatar grid from a 736×1184 image (3×4 cells).
Exact rectangles provided; then center-crop to square and resize to 512×512.
"""

# Avatar crop coordinates (x1, y1, x2, y2) for 12 cells
crops = [
    # Row 1
    (0, 0, 245, 296),      # avatar-1
    (245, 0, 490, 296),    # avatar-2
    (490, 0, 736, 296),    # avatar-3
    # Row 2
    (0, 296, 245, 592),    # avatar-4
    (245, 296, 490, 592),  # avatar-5
    (490, 296, 736, 592),  # avatar-6
    # Row 3
    (0, 592, 245, 888),    # avatar-7
    (245, 592, 490, 888),  # avatar-8
    (490, 592, 736, 888),  # avatar-9
    # Row 4
    (0, 888, 245, 1184),   # avatar-10
    (245, 888, 490, 1184), # avatar-11
    (490, 888, 736, 1184), # avatar-12
]

FINAL_SIZE = 512

print("✂️  Processing 12 avatars...\n")

for index, (x1, y1, x2, y2) in enumerate(crops, start=1):
    # Crop rectangle
    avatar = img.crop((x1, y1, x2, y2))
    w, h = avatar.size
    print(f"  • avatar-{index}: Cropped ({x1}, {y1}, {x2}, {y2}) → {w}×{h} px")

    # Center-crop to square using min dimension
    square = min(w, h)
    left = (w - square) // 2
    top = (h - square) // 2
    right = left + square
    bottom = top + square
    avatar = avatar.crop((left, top, right, bottom))
    print(f"              Center-cropped {square}×{square} → {avatar.size}")

    # Resize to 512×512
    avatar = avatar.resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)

    # Save file
    filename = f"avatar-{index}.png"
    output_path = output_dir / filename
    avatar.save(output_path, format="PNG")
    print(f"              Saved → {output_path}\n")

print("🎉 All 12 avatars created successfully!")
