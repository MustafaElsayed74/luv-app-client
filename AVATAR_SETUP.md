# Avatar Setup Guide

The signup component now displays image avatars in a 3-column grid instead of emoji avatars.

## How to extract and set up the avatars

You have three options to slice your avatar sprite image into 6 individual files:

### Option 1: Python (Easiest for Windows/macOS/Linux)

```bash
# Install Pillow if you don't have it
pip install pillow

# Run the slicer
python slice_avatars.py
```

### Option 2: Node.js

```bash
# Run the slicer
node slice-avatars.js
```

### Option 3: Shell (macOS/Linux)

Requires ImageMagick:
```bash
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick

# Then run
bash extract-avatars.sh
```

## Steps

1. **Save your sprite image** to `src/assets/avatars/sprite.png`
   - The image should contain 6 avatars in a 2×3 grid (2 columns, 3 rows)
   - Each face should be square or close to square

2. **Run one of the slicing scripts above**
   - This will create: `avatar-1.png` through `avatar-6.png` in `src/assets/avatars/`

3. **Done!** 
   - The signup page will now show these images
   - Users can select their avatar before signing up

## Verification

After slicing, check that these files exist:
```
src/assets/avatars/
├── avatar-1.png
├── avatar-2.png
├── avatar-3.png
├── avatar-4.png
├── avatar-5.png
└── avatar-6.png
```

## Testing

```bash
npm start  # Frontend at http://localhost:4200
```

Then:
1. Go to the signup page
2. You should see 6 image avatars in a grid
3. Click to select one
4. Sign up with a username and password
