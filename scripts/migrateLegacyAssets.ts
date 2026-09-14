import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const customDir = path.join(process.cwd(), 'public', 'images', 'custom');
const partsDir = path.join(process.cwd(), 'public', 'images', 'parts');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(customDir, { recursive: true });
fs.mkdirSync(partsDir, { recursive: true });

// Read all filenames that were referenced
const legacyUrls = [
  'upload_1787041831301_iphone_11_jh_incell_catalogue.png',
  'upload_1787041893876_11_Pro_INCELL.jpg',
  'upload_1787041928174_11_Pro_Max_DD_OLED.jpg',
  'upload_1787041957802_iphone_11_pro_max_jh_incell_catalogue.png',
  'upload_1787042040812_12___12_Pro_DD_OLED.jpg',
  'upload_1787042007599_12_Pro_INCELL.jpg',
  'upload_1787042081781_iphone_12_mini_jh_incell_catalogue.png',
  'upload_1787042140535_12_Pro_Max_DD_OLED.jpg',
  'upload_1787042111771_iphone_12_pro_max_jh_incell_catalogue.png',
  'upload_1787042202579_iphone_13_jh_incell_catalogue.png',
  'upload_1787042327224_iphone_13_mini_jh_incell_catalogue.png',
  'upload_1787042397415_13_Pro_DD_OLED.jpg',
  'upload_1787042381541_iphone_13_pro_jh_incell_catalogue.png',
  'upload_1787042547709_iphone_13_pro_max_dd_oled_catalogue.png',
  'upload_1787042528611_iphone_13_pro_max_jh_incell_catalogue.png',
];

const customFilenames = [
  'custom_1787352229676_iphone_14_dd_oled_catalogue.webp',
  'custom_1787352219945_iphone_14_jh_incell_catalogue.webp',
  'custom_1787352556318_iphone_14_plus_dd_oled_catalogue.webp',
  'custom_1787352639814_14_Pro_DD_OLED.jpg',
  'custom_1787352626039_14_Pro_INCELL.jpg',
  'custom_1787352759733_iphone_14_pro_max_dd_oled_catalogue.webp',
  'custom_1787352756146_iphone_14_pro_max_jh_incell_catalogue.webp',
  'custom_1787352931747_15_DD_OLED.jpg',
  'custom_1787352919557_15_INCELL.jpg',
  'custom_1787353306053_15_Plus_DD_OLED.jpg',
  'custom_1787353324543_iphone_15_plus_jh_incell_catalogue.webp',
  'custom_1787353403812_15_Pro_DD_OLED.jpg',
  'custom_1787353382882_iPhone_15_Pro_INCELL.jpg',
  'custom_1787353567001_15_Pro_Max_DD_OLED.jpg',
  'custom_1787353583166_iphone_15_pro_max_jh_incell_catalogue.webp',
  'custom_1787353610359_iphone_16_dd_oled_catalogue.webp',
  'custom_1787353674456_iphone_16_pro_dd_oled_catalogue.webp',
  'custom_1787353700083_iphone_16_pro_max_dd_oled_catalogue.webp',
  'custom_1787353719528_iphone_17_pro_dd_oled_catalogue.webp',
  'custom_1787353747730_17_Pro_Max_DD_OLED.jpg',
  'custom_1787351614666_11_Pro_INCELL.jpg',
  'custom_1787351651048_11_Pro_Max_DD_OLED.jpg',
  'custom_1787351737430_12_Pro_INCELL.jpg',
  'custom_1787351744438_12___12_Pro_DD_OLED.jpg',
  'custom_1787351829497_12_Pro_Max_DD_OLED.jpg',
  'custom_1787352105514_iPhone_13_DD_OLED.jpg',
  'custom_1787352423675_13_Pro_DD_OLED.jpg',
  'custom_1787352888133_iPhone_15_Pro_INCELL.jpg',
  'custom_1787353207436_iPhone_13_Pro_DD_OLED.jpg',
  'custom_1787353233674_13_Pro_Max_DD_OLED.jpg',
  'part-screen-xs-imageurl.png',
  'part-screen-xsmax-imageurl.png'
];

function getAppropriateSvg(name: string): string {
  const isOled = name.toLowerCase().includes('oled') || name.toLowerCase().includes('dd');
  const isDynamic = name.includes('14_pro') || name.includes('14_Pro') || name.includes('15') || name.includes('16') || name.includes('17');
  
  if (isOled) {
    const slug = isDynamic ? '15pro' : '12-12pro';
    return fs.readFileSync(path.join(partsDir, `part-screen-${slug}-oled.svg`), 'utf-8');
  } else {
    const slug = isDynamic ? '15pro' : '11';
    return fs.readFileSync(path.join(partsDir, `part-screen-${slug}-incell.svg`), 'utf-8');
  }
}

// Write valid SVG fallback content to uploads and custom
for (const file of legacyUrls) {
  const content = getAppropriateSvg(file);
  fs.writeFileSync(path.join(uploadsDir, file), content);
}

for (const file of customFilenames) {
  const content = getAppropriateSvg(file);
  fs.writeFileSync(path.join(customDir, file), content);
}

// Ensure part-screen-xs-incell.png and part-screen-xsmax-incell.png in public/images/parts/ are valid SVGs
fs.writeFileSync(path.join(partsDir, 'part-screen-xs-incell.png'), fs.readFileSync(path.join(partsDir, 'part-screen-xs-incell.svg'), 'utf-8'));
fs.writeFileSync(path.join(partsDir, 'part-screen-xsmax-incell.png'), fs.readFileSync(path.join(partsDir, 'part-screen-xsmax-incell.svg'), 'utf-8'));

console.log('Legacy uploads and custom fallback files successfully written!');
