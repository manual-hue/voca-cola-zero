// Generates simple SVG placeholder icons.
// Replace these with real PNG icons for production.
import { writeFileSync } from "fs";

function createSvgIcon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#2563eb"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, sans-serif" font-size="${size * 0.28}" font-weight="bold" fill="white">
    VC0
  </text>
</svg>`;
}

writeFileSync("public/icons/icon-192.svg", createSvgIcon(192));
writeFileSync("public/icons/icon-512.svg", createSvgIcon(512));

console.log("SVG icons generated in public/icons/");
console.log("NOTE: Convert these to PNG for production PWA use.");
console.log("You can use: npx sharp-cli -i public/icons/icon-192.svg -o public/icons/icon-192.png");
