/**
 * Tests for AST transformer
 */

import { describe, it, expect } from 'vitest';
import { transform } from '../../src/ast/transformer.js';

describe('AST Transformer', () => {
  describe('add-import', () => {
    it('should add a new import', () => {
      const result = transform('const x = 1;', [
        { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('import { z } from');
      expect(result.source).toContain('zod');
      expect(result.appliedOperations).toBe(1);
    });

    it('should merge with existing import', () => {
      const source = `import { z } from 'zod';\nconst x = 1;`;
      const result = transform(source, [
        { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['ZodError'] },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('ZodError');
    });

    it('should not duplicate existing import', () => {
      const source = `import { z } from 'zod';\nconst x = 1;`;
      const result = transform(source, [
        { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
      ]);
      expect(result.success).toBe(true);
      // Should not duplicate 'z' - z appears in import and in variable assignment, but import only once
      expect(result.source.split('import').length).toBe(2); // 1 import
    });
  });

  describe('remove-import', () => {
    it('should remove entire import', () => {
      const source = `import { z } from 'zod';\nconst x = 1;`;
      const result = transform(source, [
        { type: 'remove-import', moduleSpecifier: 'zod' },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).not.toContain('import');
    });

    it('should remove specific named imports', () => {
      const source = `import { z, ZodError } from 'zod';\nconst x = 1;`;
      const result = transform(source, [
        { type: 'remove-import', moduleSpecifier: 'zod', namedImports: ['ZodError'] },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('z');
      expect(result.source).not.toContain('ZodError');
    });
  });

  describe('add-property', () => {
    it('should add a property to a class', () => {
      const source = `class MyClass {\n  name: string = '';\n}`;
      const result = transform(source, [
        {
          type: 'add-property',
          targetClass: 'MyClass',
          propertyName: 'age',
          propertyType: 'number',
          initializer: '0',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('age');
      expect(result.source).toContain('number');
    });

    it('should fail for nonexistent class', () => {
      const result = transform('const x = 1;', [
        {
          type: 'add-property',
          targetClass: 'NoSuchClass',
          propertyName: 'prop',
          propertyType: 'string',
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations).toHaveLength(1);
    });
  });

  describe('add-method', () => {
    it('should add a method to a class', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'add-method',
          targetClass: 'MyClass',
          methodName: 'greet',
          parameters: 'name: string',
          returnType: 'string',
          body: 'return `Hello ${name}`;',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('greet');
    });
  });

  describe('rename', () => {
    it('should rename a function', () => {
      const source = `function oldName(): void {}\noldName();`;
      const result = transform(source, [
        { type: 'rename', oldName: 'oldName', newName: 'newName' },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('newName');
    });

    it('should rename a class', () => {
      const source = `class OldClass {}`;
      const result = transform(source, [
        { type: 'rename', oldName: 'OldClass', newName: 'NewClass' },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('NewClass');
    });

    it('should fail for nonexistent symbol', () => {
      const result = transform('const x = 1;', [
        { type: 'rename', oldName: 'nothing', newName: 'something' },
      ]);
      expect(result.success).toBe(false);
    });
  });

  describe('multiple operations', () => {
    it('should apply multiple operations', () => {
      const source = `class MyClass {}\nconst x = 1;`;
      const result = transform(source, [
        { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
        {
          type: 'add-method',
          targetClass: 'MyClass',
          methodName: 'validate',
          parameters: '',
          returnType: 'boolean',
          body: 'return true;',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.appliedOperations).toBe(2);
      expect(result.source).toContain('zod');
      expect(result.source).toContain('validate');
    });
  });
});
