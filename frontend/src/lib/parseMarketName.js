export function parseMarketName(raw) {
    const parenMatch = raw.match(/^(.+?)\s*\((.+)\)$/);
    if (parenMatch)
        return { name: parenMatch[1].trim(), region: parenMatch[2].trim() };
    const commaMatch = raw.match(/^(.+?),\s*(.+)$/);
    if (commaMatch)
        return { name: commaMatch[1].trim(), region: commaMatch[2].trim() };
    return { name: raw, region: null };
}
