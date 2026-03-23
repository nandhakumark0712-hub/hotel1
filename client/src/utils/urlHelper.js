/**
 * Resolves a potentially relative image URL to a full URL
 * @param {string} url - The URL to resolve
 * @returns {string} - The resolved full URL
 */
export const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || '';
    // Ensure no double slashes if baseUrl ends with / and url starts with /
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${normalizedBase}${normalizedUrl}`;
};
