/**
 * @dcyfr/ai-code-gen - Code Printer
 *
 * Utilities for formatting and printing generated TypeScript code.
 */

import { Project } from 'ts-morph';

/**
 * Format TypeScript source code using ts-morph's built-in formatter.
 */
export function formatTypeScript(source: string, filePath = 'format.ts'): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, source);

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
    ensureNewLineAtEndOfFile: true,
  });

  return sourceFile.getFullText();
}

/**
 * Add a license header comment to source code if not already present.
 */
export function addLicenseHeader(source: string, header: string): string {
  const comment = `/**\n${header
    .split('\n')
    .map((line) => ` * ${line}`)
    .join('\n')}\n */\n\n`;

  // Check if source already starts with a comment
  if (source.trimStart().startsWith('/**') || source.trimStart().startsWith('//')) {
    return source;
  }

  return comment + source;
}

/**
 * Generate a JSDoc comment block.
 */
export function generateJsDoc(options: {
  description: string;
  params?: Array<{ name: string; type: string; description: string }>;
  returns?: { type: string; description: string };
  example?: string;
  deprecated?: string;
  since?: string;
}): string {
  const lines: string[] = ['/**'];

  // Description
  lines.push(` * ${options.description}`);

  // Params
  if (options.params && options.params.length > 0) {
    lines.push(' *');
    for (const param of options.params) {
      lines.push(` * @param ${param.name} - ${param.description}`);
    }
  }

  // Returns
  if (options.returns) {
    lines.push(` * @returns ${options.returns.description}`);
  }

  // Example
  if (options.example) {
    lines.push(' *');
    lines.push(' * @example');
    lines.push(' * ```typescript');
    for (const line of options.example.split('\n')) {
      lines.push(` * ${line}`);
    }
    lines.push(' * ```');
  }

  // Deprecated
  if (options.deprecated) {
    lines.push(` * @deprecated ${options.deprecated}`);
  }

  // Since
  if (options.since) {
    lines.push(` * @since ${options.since}`);
  }

  lines.push(' */');

  return lines.join('\n');
}

/**
 * Generate an import statement string.
 */
export function generateImport(options: {
  namedImports?: string[];
  defaultImport?: string;
  namespaceImport?: string;
  moduleSpecifier: string;
  isTypeOnly?: boolean;
}): string {
  const parts: string[] = ['import'];

  if (options.isTypeOnly) {
    parts.push('type');
  }

  if (options.defaultImport) {
    parts.push(options.defaultImport);
    if (options.namedImports && options.namedImports.length > 0) {
      parts.push(',');
    }
  }

  if (options.namespaceImport) {
    parts.push(`* as ${options.namespaceImport}`);
  } else if (options.namedImports && options.namedImports.length > 0) {
    if (options.namedImports.length <= 3) {
      parts.push(`{ ${options.namedImports.join(', ')} }`);
    } else {
      const importLines = options.namedImports.map((n) => `  ${n},`).join('\n');
      parts.push(`{\n${importLines}\n}`);
    }
  }

  parts.push('from');
  parts.push(`'${options.moduleSpecifier}';`);

  return parts.join(' ');
}

/**
 * Generate an export statement string.
 */
export function generateExport(options: {
  namedExports?: string[];
  defaultExport?: string;
  sourceModule?: string;
  isTypeOnly?: boolean;
}): string {
  if (options.defaultExport) {
    return `export default ${options.defaultExport};`;
  }

  const parts: string[] = ['export'];

  if (options.isTypeOnly) {
    parts.push('type');
  }

  if (options.namedExports && options.namedExports.length > 0) {
    parts.push(`{ ${options.namedExports.join(', ')} }`);
  }

  if (options.sourceModule) {
    parts.push(`from '${options.sourceModule}';`);
  } else {
    // This is a forward declaration; caller must ensure names are in scope
    parts.push(';');
  }

  return parts.join(' ');
}
