/**
 * @dcyfr/ai-code-gen - String utilities for code generation
 */

/**
 * Convert a string to PascalCase.
 * @example toPascalCase('user-profile') → 'UserProfile'
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c: string) => c.toUpperCase());
}

/**
 * Convert a string to camelCase.
 * @example toCamelCase('user-profile') → 'userProfile'
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a string to kebab-case.
 * @example toKebabCase('UserProfile') → 'user-profile'
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert a string to snake_case.
 * @example toSnakeCase('UserProfile') → 'user_profile'
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert a string to CONSTANT_CASE.
 * @example toConstantCase('UserProfile') → 'USER_PROFILE'
 */
export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Pluralize a simple English word (basic rules).
 */
export function pluralize(word: string): string {
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') ||
      word.endsWith('sh') || word.endsWith('ch')) {
    return word + 'es';
  }
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  return word + 's';
}

/**
 * Indent each line of a string by the given number of spaces.
 */
export function indent(str: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : pad + line))
    .join('\n');
}

/**
 * Strip leading whitespace from a template literal while preserving relative indentation.
 */
export function dedent(str: string): string {
  const lines = str.split('\n');

  // Remove leading empty line
  if (lines[0]?.trim() === '') lines.shift();
  // Remove trailing empty line
  if (lines[lines.length - 1]?.trim() === '') lines.pop();

  const minIndent = lines
    .filter((l) => l.trim().length > 0)
    .reduce((min, line) => {
      const match = line.match(/^(\s*)/);
      return Math.min(min, match ? match[1].length : 0);
    }, Infinity);

  if (minIndent === Infinity) return str;

  return lines.map((line) => line.slice(minIndent)).join('\n');
}
