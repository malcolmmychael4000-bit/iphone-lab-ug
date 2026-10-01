export function formatUGX(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'FREE';
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(amount).replace('UGX', 'UGX ');
}

export function buildWhatsAppLink(text: string): string {
  return `https://wa.me/256753234218?text=${encodeURIComponent(text)}`;
}
