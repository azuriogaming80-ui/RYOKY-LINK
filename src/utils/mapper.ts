// src/utils/mapper.ts

/**
 * Convertit une clé PascalCase en camelCase
 * Ex: "RunTimeTicks" → "runTimeTicks", "Name" → "name", "ImageTags" → "imageTags"
 */
function pascalToCamel(key: string): string {
  return key
    .replace(/^([A-Z]+)([A-Z][a-z])/, '$1$2') // Gère les acronymes (ISO, URL...)
    .replace(/^([A-Z])/, (m) => m.toLowerCase());
}

/**
 * Map récursivement un objet (ou tableau) Jellyfin PascalCase → camelCase
 */
export function mapJellyfinItem(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => mapJellyfinItem(item));
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = pascalToCamel(key);
    const value = obj[key];

    // Cas spéciaux : ne pas mapper les URLs ou certains strings
    if (typeof value === 'object' && value !== null) {
      result[camelKey] = mapJellyfinItem(value);
    } else {
      result[camelKey] = value;
    }
  }
  return result;
}

/**
 * Map spécifiquement la réponse Items de Jellyfin
 */
export function mapJellyfinItems(response: any): any[] {
  if (!response || !Array.isArray(response.Items)) return [];
  return mapJellyfinItem(response.Items);
}

/**
 * Map un item unique
 */
export function mapJellyfinItemSingle(response: any): any {
  if (!response) return null;
  return mapJellyfinItem(response);
}
export const mapBaseItemDto = mapJellyfinItem;