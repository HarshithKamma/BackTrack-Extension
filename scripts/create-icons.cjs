#!/usr/bin/env node

/**
 * Simple placeholder icon generator
 * Creates basic PNG icons without external dependencies
 * 
 * Run: node scripts/create-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple 1x1 indigo pixel PNG as base64 (placeholder)
// In production, you'd want proper icons

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple colored PNG (this is a minimal valid PNG structure)
function createSimplePNG(size) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const width = size;
  const height = size;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(2, 9);  // color type (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (simple indigo fill - compressed)
  // For simplicity, we'll create a valid but minimal image
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      // Indigo color: #4f46e5
      rawData[offset] = 79;     // R
      rawData[offset + 1] = 70; // G
      rawData[offset + 2] = 229; // B
    }
  }
  
  // Use zlib to compress
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buffer) {
  let crc = -1;
  for (let i = 0; i < buffer.length; i++) {
    crc = crc32Table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// CRC32 lookup table
const crc32Table = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crc32Table[i] = c;
}

// Generate icons
sizes.forEach(size => {
  const png = createSimplePNG(size);
  const filepath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filepath, png);
  console.log(`✅ Created ${filepath}`);
});

console.log('\n🎉 All icons created! You can replace these with custom designs later.');
console.log('💡 For better icons, open scripts/generate-icons.html in a browser.');
