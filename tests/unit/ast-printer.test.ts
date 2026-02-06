/**
 * Tests for code printer utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatTypeScript,
  addLicenseHeader,
  generateJsDoc,
  generateImport,
  generateExport,
} from '../../src/ast/printer.js';

describe('Code Printer', () => {
  describe('formatTypeScript', () => {
    it('should format messy TypeScript', () => {
      const source = 'const   x=1;   const y   = 2;';
      const formatted = formatTypeScript(source);
      expect(formatted).toContain('const x = 1');
      expect(formatted).toContain('const y = 2');
    });

    it('should preserve semantic meaning', () => {
      const source = 'function greet(name: string): string { return name; }';
      const formatted = formatTypeScript(source);
      expect(formatted).toContain('function greet');
      expect(formatted).toContain('return name');
    });
  });

  describe('addLicenseHeader', () => {
    it('should add a license header', () => {
      const result = addLicenseHeader('const x = 1;', 'MIT License\nCopyright 2026');
      expect(result).toContain('MIT License');
      expect(result).toContain('const x = 1');
    });

    it('should not add header if comment already exists', () => {
      const source = '/** Existing comment */\nconst x = 1;';
      const result = addLicenseHeader(source, 'License');
      expect(result).toBe(source);
    });
  });

  describe('generateJsDoc', () => {
    it('should generate basic JSDoc', () => {
      const doc = generateJsDoc({ description: 'A utility function' });
      expect(doc).toContain('/**');
      expect(doc).toContain('A utility function');
      expect(doc).toContain('*/');
    });

    it('should include params', () => {
      const doc = generateJsDoc({
        description: 'Greet',
        params: [{ name: 'name', type: 'string', description: 'The name' }],
      });
      expect(doc).toContain('@param name');
    });

    it('should include returns', () => {
      const doc = generateJsDoc({
        description: 'Get value',
        returns: { type: 'number', description: 'The value' },
      });
      expect(doc).toContain('@returns');
    });

    it('should include example', () => {
      const doc = generateJsDoc({
        description: 'Add numbers',
        example: 'add(1, 2) // 3',
      });
      expect(doc).toContain('@example');
      expect(doc).toContain('add(1, 2)');
    });
  });

  describe('generateImport', () => {
    it('should generate named imports', () => {
      const stmt = generateImport({
        namedImports: ['foo', 'bar'],
        moduleSpecifier: './utils',
      });
      expect(stmt).toBe("import { foo, bar } from './utils';");
    });

    it('should generate default import', () => {
      const stmt = generateImport({
        defaultImport: 'React',
        moduleSpecifier: 'react',
      });
      expect(stmt).toBe("import React from 'react';");
    });

    it('should generate namespace import', () => {
      const stmt = generateImport({
        namespaceImport: 'path',
        moduleSpecifier: 'node:path',
      });
      expect(stmt).toBe("import * as path from 'node:path';");
    });

    it('should generate type-only import', () => {
      const stmt = generateImport({
        namedImports: ['User'],
        moduleSpecifier: './types',
        isTypeOnly: true,
      });
      expect(stmt).toContain('import type');
    });
  });

  describe('generateExport', () => {
    it('should generate named exports', () => {
      const stmt = generateExport({
        namedExports: ['foo', 'bar'],
        sourceModule: './utils',
      });
      expect(stmt).toBe("export { foo, bar } from './utils';");
    });

    it('should generate default export', () => {
      const stmt = generateExport({
        defaultExport: 'MyComponent',
      });
      expect(stmt).toBe('export default MyComponent;');
    });
  });
});
