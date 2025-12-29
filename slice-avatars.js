#!/usr/bin/env node

/**
 * Avatar Image Slicer
 * 
 * This script takes the provided avatar sprite image (6 avatars in a 2x3 grid)
 * and slices it into 6 individual avatar files.
 * 
 * Usage:
 *   1. Place the sprite image at: src/assets/avatars/sprite.png
 *   2. Run: node slice-avatars.js
 *   3. Output files: avatar-1.png through avatar-6.png
 */

const fs = require('fs');
const path = require('path');

// Check if 'sharp' is installed; if not, guide user
try {
    require.resolve('sharp');
} catch (e) {
    console.log('⚠️  sharp package not found. Installing...');
    require('child_process').execSync('npm install sharp', { cwd: __dirname, stdio: 'inherit' });
}

const sharp = require('sharp');

const SPRITE_PATH = path.join(__dirname, 'src/assets/avatars/sprite.png');
const OUTPUT_DIR = path.join(__dirname, 'src/assets/avatars');

async function sliceAvatars() {
    try {
        // Check if sprite file exists
        if (!fs.existsSync(SPRITE_PATH)) {
            console.error(`❌ Sprite file not found at ${SPRITE_PATH}`);
            console.log('\n📝 Instructions:');
            console.log('1. Copy your avatar sprite image to: src/assets/avatars/sprite.png');
            console.log('2. Ensure the image shows 6 avatars in a 2×3 grid (2 columns, 3 rows)');
            console.log('3. Run: node slice-avatars.js');
            process.exit(1);
        }

        // Get image metadata to determine dimensions
        const metadata = await sharp(SPRITE_PATH).metadata();
        const { width, height } = metadata;

        console.log(`📸 Sprite dimensions: ${width}×${height}px`);

        // Calculate slice dimensions (2 columns, 3 rows = 6 avatars)
        const sliceWidth = Math.floor(width / 2);
        const sliceHeight = Math.floor(height / 3);

        console.log(`✂️  Slicing into 6 avatars: ${sliceWidth}×${sliceHeight}px each\n`);

        // Extract each avatar
        const positions = [
            { row: 0, col: 0, id: 1 }, // top-left
            { row: 0, col: 1, id: 2 }, // top-right
            { row: 1, col: 0, id: 3 }, // middle-left
            { row: 1, col: 1, id: 4 }, // middle-right
            { row: 2, col: 0, id: 5 }, // bottom-left
            { row: 2, col: 1, id: 6 }  // bottom-right
        ];

        for (const { row, col, id } of positions) {
            const left = col * sliceWidth;
            const top = row * sliceHeight;
            const outputFile = path.join(OUTPUT_DIR, `avatar-${id}.png`);

            await sharp(SPRITE_PATH)
                .extract({ left, top, width: sliceWidth, height: sliceHeight })
                .toFile(outputFile);

            console.log(`✅ Created: avatar-${id}.png`);
        }

        console.log('\n🎉 All avatars extracted successfully!');
    } catch (error) {
        console.error('❌ Error slicing avatars:', error.message);
        process.exit(1);
    }
}

sliceAvatars();
