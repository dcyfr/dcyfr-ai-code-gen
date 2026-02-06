/**
 * Tests for AST parser
 */

import { describe, it, expect } from 'vitest';
import { parseSource } from '../../src/ast/parser.js';

describe('AST Parser', () => {
  describe('parseSource', () => {
    it('should parse function declarations', () => {
      const result = parseSource('export function greet(name: string): string { return name; }');
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].kind).toBe('function');
      expect(result.nodes[0].name).toBe('greet');
      expect(result.nodes[0].isExported).toBe(true);
    });

    it('should parse class declarations', () => {
      const source = `
export class MyService {
  private name: string;
  
  getName(): string {
    return this.name;
  }
}`;
      const result = parseSource(source);
      const cls = result.nodes.find((n) => n.kind === 'class');
      expect(cls).toBeDefined();
      expect(cls!.name).toBe('MyService');
      expect(cls!.children.length).toBeGreaterThanOrEqual(2);
    });

    it('should parse interfaces', () => {
      const source = `
export interface User {
  id: string;
  name: string;
  email?: string;
}`;
      const result = parseSource(source);
      const iface = result.nodes.find((n) => n.kind === 'interface');
      expect(iface).toBeDefined();
      expect(iface!.name).toBe('User');
      expect(iface!.children).toHaveLength(3);
    });

    it('should parse type aliases', () => {
      const result = parseSource('export type ID = string;');
      const ta = result.nodes.find((n) => n.kind === 'type-alias');
      expect(ta).toBeDefined();
      expect(ta!.name).toBe('ID');
    });

    it('should parse enums', () => {
      const source = `export enum Status { Active, Inactive }`;
      const result = parseSource(source);
      const enumNode = result.nodes.find((n) => n.kind === 'enum');
      expect(enumNode).toBeDefined();
      expect(enumNode!.name).toBe('Status');
      expect((enumNode!.metadata as { members: string[] }).members).toEqual(['Active', 'Inactive']);
    });

    it('should parse variable declarations', () => {
      const result = parseSource('export const MAX_SIZE = 100;');
      const varNode = result.nodes.find((n) => n.kind === 'variable');
      expect(varNode).toBeDefined();
      expect(varNode!.name).toBe('MAX_SIZE');
    });

    it('should extract imports', () => {
      const source = `
import { readFile } from 'node:fs';
import type { Stats } from 'node:fs';
import path from 'node:path';
`;
      const result = parseSource(source);
      expect(result.imports).toHaveLength(3);
      expect(result.imports[0].namedImports).toContain('readFile');
      expect(result.imports[1].isTypeOnly).toBe(true);
      expect(result.imports[2].defaultImport).toBe('path');
    });

    it('should compute metrics', () => {
      const source = `
import { foo } from './foo';

export function bar(): void {}
export function baz(): void {}
export class Qux {}
`;
      const result = parseSource(source);
      expect(result.metrics.functionCount).toBe(2);
      expect(result.metrics.classCount).toBe(1);
      expect(result.metrics.importCount).toBe(1);
    });

    it('should estimate cyclomatic complexity', () => {
      const source = `
function complex(x: number): string {
  if (x > 10) {
    for (let i = 0; i < x; i++) {
      if (i % 2 === 0) {
        return 'even';
      }
    }
  } else if (x < 0) {
    return 'negative';
  }
  return 'default';
}`;
      const result = parseSource(source);
      // base (1) + 3 ifs + 1 for = 5
      expect(result.metrics.cyclomaticComplexity).toBeGreaterThanOrEqual(4);
    });

    it('should extract JSDoc comments', () => {
      const source = `
/** A greeting function */
export function greet(): void {}
`;
      const result = parseSource(source);
      const fn = result.nodes.find((n) => n.kind === 'function');
      expect(fn?.jsdoc).toContain('greeting');
    });
  });
});
