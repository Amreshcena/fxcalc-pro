#!/usr/bin/env node
/**
 * generate-icons.js
 * Run: node generate-icons.js
 * Generates public/icons/icon-192.png and icon-512.png from the SVG.
 * Requires: npm install sharp (one-time)
 */

const fs   = require('fs')
const path = require('path')

const svgSrc = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#050a0e"/>
  <rect x="20" y="20" width="472" height="472" rx="70" fill="#090f14"/>
  <!-- Top accent line -->
  <rect x="60" y="60" width="392" height="3" rx="2" fill="#00c8ff" opacity="0.6"/>
  <!-- FX text -->
  <text x="60" y="260"
    font-family="monospace" font-size="180" font-weight="bold"
    fill="white" letter-spacing="-5">FX</text>
  <!-- CALC text -->
  <text x="60" y="360"
    font-family="monospace" font-size="100" font-weight="bold"
    fill="#00ff9d" letter-spacing="4">CALC</text>
  <!-- PRO badge -->
  <rect x="60" y="385" width="100" height="34" rx="5" fill="#00c8ff22"/>
  <text x="76" y="408"
    font-family="monospace" font-size="22" fill="#00c8ff" letter-spacing="4">PRO</text>
  <!-- Bottom accent -->
  <rect x="60" y="440" width="392" height="2" rx="1" fill="#00c8ff" opacity="0.3"/>
</svg>
`

async function main() {
  try {
    const sharp = require('sharp')
    const dir   = path.join(__dirname, 'public', 'icons')
    fs.mkdirSync(dir, { recursive: true })

    const buf = Buffer.from(svgSrc)
    await sharp(buf).resize(192, 192).png().toFile(path.join(dir, 'icon-192.png'))
    await sharp(buf).resize(512, 512).png().toFile(path.join(dir, 'icon-512.png'))
    console.log('✅ Icons generated: public/icons/icon-192.png & icon-512.png')
  } catch (err) {
    console.log('ℹ  sharp not installed — writing SVG fallback icons instead.')
    const dir = path.join(__dirname, 'public', 'icons')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'icon.svg'), svgSrc)
    console.log('✅ SVG icon written to public/icons/icon.svg')
    console.log('   To generate PNG icons, run: npm install sharp && node generate-icons.js')
  }
}

main()
