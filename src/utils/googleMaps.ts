const SHOP_LOCATION = 'New Pioneer Mall, Kampala, Uganda';

export const buildGoogleMapsEmbedUrl = (location = SHOP_LOCATION): string => {
  const params = new URLSearchParams({
    q: location,
    output: 'embed',
  });

  return `https://www.google.com/maps?${params.toString()}`;
};
