/**
 * Tests for code analyzer
 */

import { describe, it, expect } from 'vitest';
import { analyzeCode, compareStructure } from '../../src/ast/analyzer.js';

describe('Code Analyzer', () => {
  describe('analyzeCode', () => {
    it('should analyze a simple file', () => {
      const source = `
export function greet(name: string): string {
  return \`Hello \${name}\`;
}
`;
      const report = analyzeCode(source);
      expect(report.metrics.functionCount).toBe(1);
      expect(report.metrics.linesOfCode).toBeGreaterThan(0);
      expect(report.summary).toContain('1 functions');
    });

    it('should detect missing JSDoc on exported items', () => {
      const source = `export function noDoc(): void {}`;
      const report = analyzeCode(source);
      const jsdocIssues = report.issues.filter((i) => i.type === 'missing-jsdoc');
      expect(jsdocIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should flag high complexity', () => {
      // Generate code with many decision points
      const branches = Array.from({ length: 25 }, (_, i) =>
        `  if (x === ${i}) return '${i}';`
      ).join('\n');
      const source = `function complex(x: number): string {\n${branches}\n  return 'default';\n}`;
      const report = analyzeCode(source);
      const complexityIssues = report.issues.filter((i) => i.type === 'complexity');
      expect(complexityIssues.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate a summary', () => {
      const source = `export function a(): void {}\nexport function b(): void {}`;
      const report = analyzeCode(source);
      expect(report.summary).toContain('LOC');
      expect(report.summary).toContain('functions');
    });
  });

  describe('compareStructure', () => {
    it('should detect added declarations', () => {
      const a = 'function foo(): void {}';
      const b = 'function foo(): void {}\nfunction bar(): void {}';
      const diff = compareStructure(a, b);
      expect(diff.added).toContain('function:bar');
    });

    it('should detect removed declarations', () => {
      const a = 'function foo(): void {}\nfunction bar(): void {}';
      const b = 'function foo(): void {}';
      const diff = compareStructure(a, b);
      expect(diff.removed).toContain('function:bar');
    });

    it('should detect no changes for identical files', () => {
      const source = 'function foo(): void {}';
      const diff = compareStructure(source, source);
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });
});
