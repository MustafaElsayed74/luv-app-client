#!/usr/bin/env python3

"""
Avatar Cropper - Exact Specifications

Image: 2048 × 1462 px
Layout: 3 columns × 2 rows = 6 avatars
Cell dimensions: 683 × 731 px each

Process:
1. Crop using exact coordinates
2. Center-crop 600×600 from each rectangle
3. Resize to 512×512
4. Export as PNG
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

ORIGINAL_PATH = Path('F:/avatars/5859228.jpg')
OUTPUT_DIR = Path('src/assets/avatars')

# Exact coordinates from spec
CROPS = [
    {"name": "avatar-1", "x1": 0,    "y1": 0,   "x2": 683,  "y2": 731},
    {"name": "avatar-2", "x1": 683,  "y1": 0,   "x2": 1366, "y2": 731},
    {"name": "avatar-3", "x1": 1366, "y1": 0,   "x2": 2048, "y2": 731},
    {"name": "avatar-4", "x1": 0,    "y1": 731, "x2": 683,  "y2": 1462},
    {"name": "avatar-5", "x1": 683,  "y1": 731, "x2": 1366, "y2": 1462},
    {"name": "avatar-6", "x1": 1366, "y1": 731, "x2": 2048, "y2": 1462},
]

def center_crop_square(img, size=600):
    """Center-crop a square of given size from image."""
    w, h = img.size
    left = (w - size) // 2
    top = (h - size) // 2
    right = left + size
    bottom = top + size
    return img.crop((left, top, right, bottom))

if not ORIGINAL_PATH.exists():
    print(f"❌ Original image not found at {ORIGINAL_PATH}")
    sys.exit(1)

try:
    print(f"📸 Loading original image: {ORIGINAL_PATH}")
    original = Image.open(ORIGINAL_PATH)
    print(f"   Dimensions: {original.size[0]}×{original.size[1]} px")
    
    print("\n✂️  Cropping and processing avatars...\n")
    
    for crop_spec in CROPS:
        # Step 1: Crop using exact coordinates
        x1, y1 = crop_spec["x1"], crop_spec["y1"]
        x2, y2 = crop_spec["x2"], crop_spec["y2"]
        rect = (x1, y1, x2, y2)
        
        cropped = original.crop(rect)
        print(f"  • {crop_spec['name']}: Cropped ({x1}, {y1}, {x2}, {y2}) → {cropped.size[0]}×{cropped.size[1]} px")
        
        # Step 2: Center-crop 600×600 from rectangle
        center_square = center_crop_square(cropped, size=600)
        print(f"           Center-cropped 600×600 → {center_square.size}")
        
        # Step 3: Resize to 512×512
        final = center_square.resize((512, 512), Image.Resampling.LANCZOS)
        
        # Step 4: Save as PNG
        output_file = OUTPUT_DIR / f"{crop_spec['name']}.png"
        final.save(output_file, 'PNG')
        print(f"           Saved → {output_file.name} (512×512 PNG)\n")
    
    print("🎉 All avatars created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}", file=sys.stderr)
    sys.exit(1)
