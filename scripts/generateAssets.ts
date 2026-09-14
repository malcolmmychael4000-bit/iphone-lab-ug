import fs from 'fs';
import path from 'path';

const partsDir = path.join(process.cwd(), 'public', 'images', 'parts');
const customDir = path.join(process.cwd(), 'public', 'images', 'custom');

fs.mkdirSync(partsDir, { recursive: true });
fs.mkdirSync(customDir, { recursive: true });

function generateIncellSvg(modelName: string, hasDynamicIsland: boolean): string {
  const notchOrIsland = hasDynamicIsland
    ? `<rect x="250" y="42" width="100" height="22" rx="11" fill="#000000" stroke="#334155" stroke-width="1.5"/><circle cx="330" cy="53" r="4.5" fill="#1D9BB5"/><circle cx="270" cy="53" r="3.5" fill="#0f172a"/>`
    : `<path d="M255 35 h90 v12 c0 4 -3 7 -7 7 h-76 c-4 0 -7 -3 -7 -7 z" fill="#000000" stroke="#334155" stroke-width="1.5"/><line x1="285" y1="42" x2="315" y2="42" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/><circle cx="325" cy="42" r="3" fill="#1D9BB5"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090E17"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="100%" stop-color="#0b1329"/>
    </linearGradient>
    <linearGradient id="goldFlex" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>

  <rect width="600" height="400" fill="url(#bgGrad)" rx="16"/>
  <rect x="1" y="1" width="598" height="398" fill="none" stroke="#1D9BB5" stroke-opacity="0.3" rx="15" stroke-width="1.5"/>

  <g opacity="0.12" stroke="#1D9BB5" stroke-width="1">
    <line x1="40" y1="0" x2="40" y2="400"/>
    <line x1="560" y1="0" x2="560" y2="400"/>
    <line x1="0" y1="50" x2="600" y2="50"/>
    <line x1="0" y1="350" x2="600" y2="350"/>
  </g>

  <g transform="translate(0, 0)">
    <rect x="195" y="25" width="210" height="315" rx="32" fill="url(#frameGrad)" stroke="#1D9BB5" stroke-width="3"/>
    <rect x="207" y="37" width="186" height="291" rx="24" fill="url(#screenGrad)" stroke="#000000" stroke-width="2"/>
    ${notchOrIsland}
    <path d="M210 50 L380 50 L350 220 L210 220 Z" fill="#ffffff" fill-opacity="0.03"/>
    <circle cx="300" cy="175" r="46" fill="#1D9BB5" fill-opacity="0.1" stroke="#1D9BB5" stroke-width="1.5" stroke-dasharray="4,3"/>
    <rect x="282" y="157" width="36" height="36" rx="8" fill="#0f172a" stroke="#1D9BB5" stroke-width="2"/>
    <text x="300" y="180" font-family="sans-serif" font-weight="900" font-size="13" fill="#1D9BB5" text-anchor="middle">JH</text>
    <text x="300" y="235" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="1">INCELL (JH)</text>
    <text x="300" y="252" font-family="sans-serif" font-weight="700" font-size="10" fill="#38bdf8" text-anchor="middle">HIGH BRIGHTNESS DISPLAY</text>
    <g transform="translate(255, 332)">
      <rect x="0" y="0" width="90" height="38" rx="5" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <rect x="15" y="4" width="60" height="8" rx="2" fill="url(#goldFlex)"/>
      <rect x="25" y="16" width="40" height="16" rx="3" fill="#09090b" stroke="#71717a" stroke-width="1"/>
      <text x="45" y="28" font-family="monospace" font-weight="800" font-size="8" fill="#e4e4e7" text-anchor="middle">IC CHIP</text>
    </g>
  </g>

  <g transform="translate(30, 45)">
    <rect x="0" y="0" width="135" height="26" rx="8" fill="#1D9BB5" fill-opacity="0.15" stroke="#1D9BB5" stroke-width="1.5"/>
    <text x="67" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#1D9BB5" text-anchor="middle">GRADE AAA+ INCELL</text>
  </g>

  <g transform="translate(435, 45)">
    <rect x="0" y="0" width="135" height="26" rx="8" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="1.5"/>
    <text x="67" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#38bdf8" text-anchor="middle">TRUE TONE READY</text>
  </g>

  <text x="300" y="388" font-family="sans-serif" font-weight="800" font-size="12" fill="#94a3b8" text-anchor="middle">${modelName} Display Assembly</text>
</svg>`;
}

function generateOledSvg(modelName: string, hasDynamicIsland: boolean): string {
  const notchOrIsland = hasDynamicIsland
    ? `<rect x="250" y="42" width="100" height="22" rx="11" fill="#000000" stroke="#06b6d4" stroke-width="1.5"/><circle cx="330" cy="53" r="4.5" fill="#22d3ee"/><circle cx="270" cy="53" r="3.5" fill="#0284c7"/>`
    : `<path d="M255 35 h90 v12 c0 4 -3 7 -7 7 h-76 c-4 0 -7 -3 -7 -7 z" fill="#000000" stroke="#06b6d4" stroke-width="1.5"/><line x1="285" y1="42" x2="315" y2="42" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/><circle cx="325" cy="42" r="3" fill="#22d3ee"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bgGradOled" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <linearGradient id="frameGradOled" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="oledGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="goldFlexOled" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="600" height="400" fill="url(#bgGradOled)" rx="16"/>
  <rect x="1" y="1" width="598" height="398" fill="none" stroke="#06b6d4" stroke-opacity="0.35" rx="15" stroke-width="1.5"/>

  <g transform="translate(0, 0)">
    <rect x="195" y="25" width="210" height="315" rx="32" fill="url(#frameGradOled)" stroke="#06b6d4" stroke-width="3.5"/>
    <rect x="207" y="37" width="186" height="291" rx="24" fill="#000000" stroke="#000000" stroke-width="2"/>
    ${notchOrIsland}
    <path d="M210 140 Q 300 90, 390 150 Q 300 210, 210 140 Z" fill="url(#oledGlow)" opacity="0.35"/>
    <circle cx="300" cy="175" r="48" fill="#06b6d4" fill-opacity="0.15" stroke="#22d3ee" stroke-width="2"/>
    <rect x="280" y="155" width="40" height="40" rx="8" fill="#020617" stroke="#22d3ee" stroke-width="2"/>
    <text x="300" y="180" font-family="sans-serif" font-weight="900" font-size="12" fill="#22d3ee" text-anchor="middle">OLED</text>
    <text x="300" y="235" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle" letter-spacing="1">DD OLED (OEM)</text>
    <text x="300" y="252" font-family="sans-serif" font-weight="700" font-size="10" fill="#38bdf8" text-anchor="middle">SUPER RETINA XDR DISPLAY</text>
    <g transform="translate(250, 332)">
      <rect x="0" y="0" width="100" height="40" rx="6" fill="#09090b" stroke="#06b6d4" stroke-width="1.5"/>
      <rect x="15" y="4" width="70" height="8" rx="2" fill="url(#goldFlexOled)"/>
      <rect x="25" y="16" width="50" height="18" rx="4" fill="#030712" stroke="#22d3ee" stroke-width="1"/>
      <text x="50" y="29" font-family="monospace" font-weight="900" font-size="8" fill="#22d3ee" text-anchor="middle">OEM OLED IC</text>
    </g>
  </g>

  <g transform="translate(30, 45)">
    <rect x="0" y="0" width="135" height="26" rx="8" fill="#06b6d4" fill-opacity="0.15" stroke="#06b6d4" stroke-width="1.5"/>
    <text x="67" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#22d3ee" text-anchor="middle">ORIGINAL DD OLED</text>
  </g>

  <g transform="translate(435, 45)">
    <rect x="0" y="0" width="135" height="26" rx="8" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="67" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#60a5fa" text-anchor="middle">120Hz PROMOTION</text>
  </g>

  <text x="300" y="388" font-family="sans-serif" font-weight="800" font-size="12" fill="#94a3b8" text-anchor="middle">${modelName} Super Retina XDR OLED</text>
</svg>`;
}

function generateBatterySvg(modelName: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="batBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="batCell" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="goldPin" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="600" height="400" fill="url(#batBg)" rx="16"/>
  <rect x="1" y="1" width="598" height="398" fill="none" stroke="#10b981" stroke-opacity="0.3" rx="15" stroke-width="1.5"/>

  <!-- Battery Pack Shell -->
  <g transform="translate(190, 40)">
    <rect x="0" y="0" width="220" height="290" rx="14" fill="url(#batCell)" stroke="#334155" stroke-width="2.5"/>
    
    <!-- Top Flex Connector -->
    <rect x="30" y="-18" width="50" height="20" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1.5"/>
    <rect x="40" y="-14" width="30" height="8" rx="2" fill="url(#goldPin)"/>

    <!-- Battery Capacity Badge -->
    <circle cx="110" cy="85" r="42" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-width="2"/>
    <text x="110" y="80" font-family="sans-serif" font-weight="900" font-size="20" fill="#10b981" text-anchor="middle">100%</text>
    <text x="110" y="98" font-family="sans-serif" font-weight="800" font-size="9" fill="#34d399" text-anchor="middle">HEALTH CAPACITY</text>

    <text x="110" y="155" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">TI-CHIPSET OEM CELL</text>
    <text x="110" y="175" font-family="sans-serif" font-weight="700" font-size="11" fill="#94a3b8" text-anchor="middle">0 Cycles • Zero Degradation</text>
    <text x="110" y="195" font-family="sans-serif" font-weight="700" font-size="10" fill="#64748b" text-anchor="middle">No Warning Message Tag</text>

    <!-- Certification Barcode Graphic -->
    <rect x="30" y="225" width="160" height="40" rx="6" fill="#020617" stroke="#1e293b" stroke-width="1"/>
    <g opacity="0.6" stroke="#94a3b8" stroke-width="2">
      <line x1="45" y1="233" x2="45" y2="257"/>
      <line x1="50" y1="233" x2="50" y2="257"/>
      <line x1="57" y1="233" x2="57" y2="257"/>
      <line x1="62" y1="233" x2="62" y2="257"/>
      <line x1="72" y1="233" x2="72" y2="257"/>
      <line x1="79" y1="233" x2="79" y2="257"/>
      <line x1="88" y1="233" x2="88" y2="257"/>
      <line x1="98" y1="233" x2="98" y2="257"/>
      <line x1="105" y1="233" x2="105" y2="257"/>
      <line x1="115" y1="233" x2="115" y2="257"/>
      <line x1="125" y1="233" x2="125" y2="257"/>
      <line x1="135" y1="233" x2="135" y2="257"/>
      <line x1="145" y1="233" x2="145" y2="257"/>
      <line x1="155" y1="233" x2="155" y2="257"/>
      <line x1="165" y1="233" x2="165" y2="257"/>
      <line x1="175" y1="233" x2="175" y2="257"/>
    </g>
  </g>

  <g transform="translate(30, 45)">
    <rect x="0" y="0" width="130" height="26" rx="8" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1.5"/>
    <text x="65" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#34d399" text-anchor="middle">GRADE-A OEM CELL</text>
  </g>

  <g transform="translate(440, 45)">
    <rect x="0" y="0" width="130" height="26" rx="8" fill="#1D9BB5" fill-opacity="0.15" stroke="#1D9BB5" stroke-width="1.5"/>
    <text x="65" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#1D9BB5" text-anchor="middle">TI BMS CHIPSET</text>
  </g>

  <text x="300" y="380" font-family="sans-serif" font-weight="800" font-size="12" fill="#94a3b8" text-anchor="middle">${modelName} Battery Cell Assembly</text>
</svg>`;
}

function generateGenericPartSvg(category: string, partName: string, iconType: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="genBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a101f"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="cyanTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D9BB5"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>

  <rect width="600" height="400" fill="url(#genBg)" rx="16"/>
  <rect x="1" y="1" width="598" height="398" fill="none" stroke="#1D9BB5" stroke-opacity="0.3" rx="15" stroke-width="1.5"/>

  <g transform="translate(200, 50)">
    <rect x="0" y="0" width="200" height="250" rx="24" fill="#0f172a" stroke="#1D9BB5" stroke-width="2.5"/>
    <circle cx="100" cy="95" r="50" fill="#1D9BB5" fill-opacity="0.12" stroke="#1D9BB5" stroke-width="2"/>
    <text x="100" y="103" font-family="sans-serif" font-weight="900" font-size="28" fill="#1D9BB5" text-anchor="middle">${iconType}</text>
    <text x="100" y="175" font-family="sans-serif" font-weight="900" font-size="15" fill="#ffffff" text-anchor="middle">${category}</text>
    <text x="100" y="198" font-family="sans-serif" font-weight="700" font-size="11" fill="#38bdf8" text-anchor="middle">GENUINE LAB PART</text>
  </g>

  <g transform="translate(30, 45)">
    <rect x="0" y="0" width="130" height="26" rx="8" fill="#1D9BB5" fill-opacity="0.15" stroke="#1D9BB5" stroke-width="1.5"/>
    <text x="65" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#1D9BB5" text-anchor="middle">TESTED 100%</text>
  </g>

  <g transform="translate(440, 45)">
    <rect x="0" y="0" width="130" height="26" rx="8" fill="#0284c7" fill-opacity="0.15" stroke="#0284c7" stroke-width="1.5"/>
    <text x="65" y="17" font-family="sans-serif" font-weight="800" font-size="11" fill="#38bdf8" text-anchor="middle">WARRANTY</text>
  </g>

  <text x="300" y="375" font-family="sans-serif" font-weight="800" font-size="13" fill="#cbd5e1" text-anchor="middle">${partName}</text>
</svg>`;
}

const screenModels = [
  { slug: 'x', name: 'iPhone X', island: false },
  { slug: 'xs', name: 'iPhone XS', island: false },
  { slug: 'xsmax', name: 'iPhone XS Max', island: false },
  { slug: 'xr', name: 'iPhone XR', island: false },
  { slug: '11', name: 'iPhone 11', island: false },
  { slug: '11pro', name: 'iPhone 11 Pro', island: false },
  { slug: '11promax', name: 'iPhone 11 Pro Max', island: false },
  { slug: '12-12pro', name: 'iPhone 12 & 12 Pro', island: false },
  { slug: '12mini', name: 'iPhone 12 Mini', island: false },
  { slug: '12promax', name: 'iPhone 12 Pro Max', island: false },
  { slug: '13', name: 'iPhone 13', island: false },
  { slug: '13mini', name: 'iPhone 13 Mini', island: false },
  { slug: '13pro', name: 'iPhone 13 Pro', island: false },
  { slug: '13promax', name: 'iPhone 13 Pro Max', island: false },
  { slug: '14', name: 'iPhone 14', island: false },
  { slug: '14plus', name: 'iPhone 14 Plus', island: false },
  { slug: '14pro', name: 'iPhone 14 Pro', island: true },
  { slug: '14promax', name: 'iPhone 14 Pro Max', island: true },
  { slug: '15', name: 'iPhone 15', island: true },
  { slug: '15plus', name: 'iPhone 15 Plus', island: true },
  { slug: '15pro', name: 'iPhone 15 Pro', island: true },
  { slug: '15promax', name: 'iPhone 15 Pro Max', island: true },
  { slug: '16', name: 'iPhone 16', island: true },
  { slug: '16pro', name: 'iPhone 16 Pro', island: true },
  { slug: '16promax', name: 'iPhone 16 Pro Max', island: true },
  { slug: '17pro', name: 'iPhone 17 Pro', island: true },
  { slug: '17promax', name: 'iPhone 17 Pro Max', island: true },
];

for (const m of screenModels) {
  const incellSvg = generateIncellSvg(m.name, m.island);
  const oledSvg = generateOledSvg(m.name, m.island);

  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-incell.svg`), incellSvg);
  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-oled.svg`), oledSvg);
  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-main.svg`), oledSvg);

  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-incell.jpg`), incellSvg);
  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-oled.jpg`), oledSvg);
  fs.writeFileSync(path.join(partsDir, `part-screen-${m.slug}-main.jpg`), oledSvg);
}

const batteryModels = [
  { slug: 'x', name: 'iPhone X' },
  { slug: 'xs', name: 'iPhone XS' },
  { slug: 'xsmax', name: 'iPhone XS Max' },
  { slug: 'xr', name: 'iPhone XR' },
  { slug: '11', name: 'iPhone 11' },
  { slug: '11pro', name: 'iPhone 11 Pro' },
  { slug: '11promax', name: 'iPhone 11 Pro Max' },
  { slug: '12-12pro', name: 'iPhone 12 & 12 Pro' },
  { slug: '12mini', name: 'iPhone 12 Mini' },
  { slug: '12promax', name: 'iPhone 12 Pro Max' },
  { slug: '13', name: 'iPhone 13' },
  { slug: '13mini', name: 'iPhone 13 Mini' },
  { slug: '13pro', name: 'iPhone 13 Pro' },
  { slug: '13promax', name: 'iPhone 13 Pro Max' },
  { slug: '14', name: 'iPhone 14' },
  { slug: '14plus', name: 'iPhone 14 Plus' },
  { slug: '14pro', name: 'iPhone 14 Pro' },
  { slug: '14promax', name: 'iPhone 14 Pro Max' },
  { slug: '15', name: 'iPhone 15' },
  { slug: '15plus', name: 'iPhone 15 Plus' },
  { slug: '15pro', name: 'iPhone 15 Pro' },
  { slug: '15promax', name: 'iPhone 15 Pro Max' },
  { slug: '16', name: 'iPhone 16' },
  { slug: '16plus', name: 'iPhone 16 Plus' },
  { slug: '16pro', name: 'iPhone 16 Pro' },
  { slug: '16promax', name: 'iPhone 16 Pro Max' },
];

for (const b of batteryModels) {
  const batSvg = generateBatterySvg(b.name);
  fs.writeFileSync(path.join(partsDir, `part-battery-${b.slug}.svg`), batSvg);
  fs.writeFileSync(path.join(partsDir, `part-battery-${b.slug}.jpg`), batSvg);
}

// Generate category fallback SVGs
fs.writeFileSync(path.join(partsDir, 'part-backglass-default.svg'), generateGenericPartSvg('Back Glass', 'Laser-Cut Rear Glass', 'REAR'));
fs.writeFileSync(path.join(partsDir, 'part-housing-default.svg'), generateGenericPartSvg('Housing', 'Aerospace Titanium Frame', 'BODY'));
fs.writeFileSync(path.join(partsDir, 'part-camera-default.svg'), generateGenericPartSvg('Camera Glass', 'Sapphire Lens Assembly', 'CAM'));
fs.writeFileSync(path.join(partsDir, 'part-guard-default.svg'), generateGenericPartSvg('Screen Guard', '9H Ceramic Shield', '9H'));
fs.writeFileSync(path.join(partsDir, 'part-acc-default.svg'), generateGenericPartSvg('Accessories', 'Genuine Apple Power', 'FAST'));

console.log('All static parts assets generated successfully!');
