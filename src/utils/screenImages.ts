import { PartProduct } from '../types';
import { sanitizeImageUrl } from './catalogStorage';

export type ScreenTier = 'Incell' | 'OLED';
export type DeclaredScreenTier = ScreenTier | 'Both';

export function normalizeScreenTier(value: string | undefined): DeclaredScreenTier | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  const hasIncell = normalized.includes('incell');
  const hasOled = normalized.includes('oled');
  if (normalized.includes('both') || (hasIncell && hasOled)) return 'Both';
  if (hasIncell) return 'Incell';
  if (hasOled) return 'OLED';
  return undefined;
}

export function getScreenImageCandidates(
  part: PartProduct,
  tier: ScreenTier,
  placeholder: string,
): string[] {
  const tierImage = tier === 'Incell'
    ? part.incell_image_url || part.incellImageUrl
    : part.oled_image_url || part.oledImageUrl;
  const primaryImage = part.image_url || part.imageUrl;
  const candidates = [
    sanitizeImageUrl(tierImage, part.id, tier === 'Incell' ? 'incell' : 'oled'),
    sanitizeImageUrl(primaryImage, part.id, 'main'),
    placeholder,
  ];

  return candidates.filter((candidate, index) => candidate && candidates.indexOf(candidate) === index);
}
