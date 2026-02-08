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

  describe('add-import edge cases', () => {
    it('should add type-only imports', () => {
      const result = transform('const x = 1;', [
        {
          type: 'add-import',
          moduleSpecifier: 'zod',
          namedImports: ['ZodSchema'],
          isTypeOnly: true,
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('import type { ZodSchema }');
    });

    it('should add default imports', () => {
      const result = transform('const x = 1;', [
        {
          type: 'add-import',
          moduleSpecifier: 'react',
          defaultImport: 'React',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('import React from');
    });

    it('should not add duplicate named imports', () => {
      const source = `import { z, ZodError } from 'zod';`;
      const result = transform(source, [
        {
          type: 'add-import',
          moduleSpecifier: 'zod',
          namedImports: ['z'],
        },
      ]);
      expect(result.success).toBe(true);
      // Should still have the import, verify it contains z
      expect(result.source).toContain('import { z');
      // Count occurrences manually - should not duplicate in import list
      const importLines = result.source.split('\n').filter(line => line.includes('import'));
      expect(importLines.length).toBe(1);
    });
  });

  describe('remove-import edge cases', () => {
    it('should handle removing from non-existent import', () => {
      const result = transform('const x = 1;', [
        {
          type: 'remove-import',
          moduleSpecifier: 'nonexistent',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('const x = 1;');
    });

    it('should remove import when last named import removed', () => {
      const source = `import { z } from 'zod';\nconst x = 1;`;
      const result = transform(source, [
        {
          type: 'remove-import',
          moduleSpecifier: 'zod',
          namedImports: ['z'],
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).not.toContain('import');
    });

    it('should keep import when default import remains after removing named imports', () => {
      const source = `import React, { useState } from 'react';\nconst x = 1;`;
      const result = transform(source, [
        {
          type: 'remove-import',
          moduleSpecifier: 'react',
          namedImports: ['useState'],
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('import React');
      expect(result.source).not.toContain('useState');
    });
  });

  describe('add-export', () => {
    it('should add default export with declaration', () => {
      const result = transform('const x = 1;', [
        {
          type: 'add-export',
          name: 'MyComponent',
          declaration: 'function MyComponent() { return null; }',
          isDefault: true,
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('export default');
    });

    it('should add named export for existing declaration', () => {
      const source = 'const myVar = 42;';
      const result = transform(source, [
        {
          type: 'add-export',
          name: 'myVar',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('export');
    });

    it('should add export with inline declaration', () => {
      const result = transform('const x = 1;', [
        {
          type: 'add-export',
          name: 'greet',
          declaration: 'function greet() {}',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('export function greet');
    });
  });

  describe('rename edge cases', () => {
    it('should rename class method with scope', () => {
      const source = `class MyClass { oldMethod(): void {} }`;
      const result = transform(source, [
        {
          type: 'rename',
          oldName: 'oldMethod',
          newName: 'newMethod',
          scope: 'class',
          targetClass: 'MyClass',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('newMethod');
      expect(result.source).not.toContain('oldMethod');
    });

    it('should rename class property with scope', () => {
      const source = `class MyClass { oldProp: string = ''; }`;
      const result = transform(source, [
        {
          type: 'rename',
          oldName: 'oldProp',
          newName: 'newProp',
          scope: 'class',
          targetClass: 'MyClass',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('newProp');
    });

    it('should rename interface', () => {
      const source = `interface OldInterface { x: number; }`;
      const result = transform(source, [
        {
          type: 'rename',
          oldName: 'OldInterface',
          newName: 'NewInterface',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('NewInterface');
    });

    it('should rename type alias', () => {
      const source = `type OldType = string;`;
      const result = transform(source, [
        {
          type: 'rename',
          oldName: 'OldType',
          newName: 'NewType',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('NewType');
    });

    it('should fail when renaming non-existent class member', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'rename',
          oldName: 'nonexistent',
          newName: 'anything',
          scope: 'class',
          targetClass: 'MyClass',
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations[0].message).toContain('not found');
    });

    it('should fail when target class not found for scoped rename', () => {
      const result = transform('const x = 1;', [
        {
          type: 'rename',
          oldName: 'method',
          newName: 'newMethod',
          scope: 'class',
          targetClass: 'NonExistentClass',
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations[0].message).toContain('not found');
    });
  });

  describe('error handling', () => {
    it('should fail on wrap operation (not implemented)', () => {
      const result = transform('const x = 1;', [
        {
          type: 'wrap' as any,
          wrapper: 'try-catch',
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations[0].message).toContain('not yet implemented');
    });

    it('should fail on unknown operation type', () => {
      const result = transform('const x = 1;', [
        {
          type: 'invalid-type' as any,
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations[0].message).toContain('Unknown transform type');
    });

    it('should continue applying operations after failure', () => {
      const result = transform('const x = 1;', [
        {
          type: 'rename',
          oldName: 'nonexistent',
          newName: 'anything',
        },
        {
          type: 'add-import',
          moduleSpecifier: 'zod',
          namedImports: ['z'],
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.appliedOperations).toBe(1);
      expect(result.failedOperations).toHaveLength(1);
      expect(result.source).toContain('zod');
    });

    it('should handle multiple failures', () => {
      const result = transform('const x = 1;', [
        {
          type: 'rename',
          oldName: 'a',
          newName: 'b',
        },
        {
          type: 'rename',
          oldName: 'c',
          newName: 'd',
        },
      ]);
      expect(result.success).toBe(false);
      expect(result.failedOperations).toHaveLength(2);
    });
  });

  describe('add-property edge cases', () => {
    it('should add readonly property', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'add-property',
          targetClass: 'MyClass',
          propertyName: 'id',
          propertyType: 'string',
          isReadonly: true,
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('readonly');
      expect(result.source).toContain('id');
    });

    it('should add property with initializer', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'add-property',
          targetClass: 'MyClass',
          propertyName: 'count',
          propertyType: 'number',
          initializer: '0',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('count');
      expect(result.source).toContain('= 0');
    });
  });

  describe('add-method edge cases', () => {
    it('should add method with no parameters', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'add-method',
          targetClass: 'MyClass',
          methodName: 'doSomething',
          parameters: '',
          returnType: 'void',
          body: 'console.log("test");',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('doSomething()');
    });

    it('should add method with multiple parameters', () => {
      const source = `class MyClass {}`;
      const result = transform(source, [
        {
          type: 'add-method',
          targetClass: 'MyClass',
          methodName: 'calculate',
          parameters: 'a: number, b: number',
          returnType: 'number',
          body: 'return a + b;',
        },
      ]);
      expect(result.success).toBe(true);
      expect(result.source).toContain('calculate');
      expect(result.source).toContain('a: number');
      expect(result.source).toContain('b: number');
    });
  });
});
