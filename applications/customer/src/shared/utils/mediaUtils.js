import { getServerRoot, getCachedToken } from '@shared/api/client';

const PRIVATE_PREFIXES = [
  'prescriptions/',
  'discount_ids/',
  'payment_receipts/',
  'chat_images/',
  'payment_qrs/',
];

/**
 * Resolve a media path, full URL, or relative route to an absolute URL pointing
 * to the currently configured backend root (e.g. EXPO_PUBLIC_API_URL).
 *
 * Ensures:
 * 1. Private media routes (/api/media/private/...) use the current host and HTTPS.
 * 2. Cleartext http:// URLs from staging reverse-proxies are rebased to the app's HTTPS base.
 * 3. Relative storage paths for private media are directed to /api/media/private/ instead of /storage/.
 */
export const resolveMediaUrl = (urlOrPath, baseUrl) => {
  if (!urlOrPath) return null;
  const target = typeof urlOrPath === 'string' ? urlOrPath : (urlOrPath?.uri || '');
  if (!target || typeof target !== 'string') return null;

  const rawBase = baseUrl || getServerRoot() || '';
  const cleanBase = String(rawBase).replace(/\/+$/, '').replace(/\/api$/, '');

  // 1. If it's already a private media URL (/api/media/private/...)
  if (target.includes('/api/media/private/')) {
    const pathAndQuery = target.substring(target.indexOf('/api/media/private/'));
    return cleanBase ? `${cleanBase}${pathAndQuery}` : pathAndQuery;
  }

  // 2. If it's a relative path starting with /
  if (target.startsWith('/')) {
    return cleanBase ? `${cleanBase}${target}` : target;
  }

  // 3. If it's a full URL (http:// or https://)
  if (target.startsWith('http://') || target.startsWith('https://')) {
    try {
      const parsed = new URL(target);
      if (cleanBase) {
        const baseParsed = new URL(cleanBase.startsWith('http') ? cleanBase : `http://${cleanBase}`);
        // Rebase if host differs OR if target is insecure HTTP while cleanBase is HTTPS
        if (parsed.host !== baseParsed.host || (parsed.protocol === 'http:' && baseParsed.protocol === 'https:')) {
          return `${cleanBase}${parsed.pathname}${parsed.search}`;
        }
      }
      return target;
    } catch {
      return target;
    }
  }

  // 4. If it's a storage path or filename
  const clean = target.replace(/^\/?storage\//, '').replace(/^\/+/, '');
  const isPrivate = PRIVATE_PREFIXES.some((prefix) => clean.startsWith(prefix));

  if (isPrivate) {
    return cleanBase ? `${cleanBase}/api/media/private/${clean}` : `/api/media/private/${clean}`;
  }

  return cleanBase ? `${cleanBase}/storage/${clean}` : `/storage/${clean}`;
};

/**
 * Resolve an image source object with authentication headers for React Native <Image />.
 * Allows authenticated private media loading even if the signed temporary URL has expired
 * or failed HMAC verification due to reverse-proxy header alterations.
 */
export const resolveMediaSource = (urlOrPath, baseUrl, token) => {
  const uri = resolveMediaUrl(urlOrPath, baseUrl);
  if (!uri) return null;

  const activeToken = token ?? getCachedToken();
  const isPrivate = uri.includes('/api/media/private/');

  if (isPrivate && activeToken) {
    return {
      uri,
      headers: {
        Authorization: `Bearer ${activeToken}`,
        Accept: 'image/*',
      },
    };
  }

  return { uri };
};

// Aliases for compatibility
export const resolveMediaUriRaw = resolveMediaUrl;
export const resolveMediaUri = resolveMediaSource;
