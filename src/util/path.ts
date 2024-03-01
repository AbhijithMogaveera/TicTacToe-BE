export function appendBaseUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const normalizedPath = path.replace(/^\/+/, '');
    return `${normalizedBaseUrl}/${normalizedPath}`;
}

export function removeBaseUrl(baseUrl: string, url: string): string {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const normalizedUrl = url.replace(new RegExp(`^${normalizedBaseUrl}/?`), '');
    return normalizedUrl;
}
