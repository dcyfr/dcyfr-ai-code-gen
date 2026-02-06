/**
 * Tests for code generators
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createGeneratorRegistry } from '../../src/generators/registry.js';
import type { GeneratorRegistry } from '../../src/generators/registry.js';

describe('GeneratorRegistry', () => {
  let registry: GeneratorRegistry;

  beforeEach(() => {
    registry = createGeneratorRegistry();
  });

  describe('list', () => {
    it('should list all built-in generators', () => {
      const generators = registry.list();
      expect(generators.length).toBeGreaterThanOrEqual(4);
      const names = generators.map((g) => g.name);
      expect(names).toContain('component');
      expect(names).toContain('api-route');
      expect(names).toContain('model');
      expect(names).toContain('test');
    });
  });

  describe('has', () => {
    it('should return true for registered generators', () => {
      expect(registry.has('component')).toBe(true);
    });

    it('should return false for unknown generators', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('run - unknown generator', () => {
    it('should return failure for unknown generator', async () => {
      const result = await registry.run('nonexistent', {
        name: 'test',
        outputDir: './out',
      });
      expect(result.success).toBe(false);
      expect(result.errors[0].message).toContain('not found');
    });
  });
});

describe('ComponentGenerator', () => {
  let registry: GeneratorRegistry;

  beforeEach(() => {
    registry = createGeneratorRegistry();
  });

  it('should generate a component file', async () => {
    const result = await registry.run('component', {
      name: 'user-card',
      outputDir: 'src/components',
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThanOrEqual(2); // component + barrel
    expect(result.files.some((f) => f.path.includes('user-card.tsx'))).toBe(true);
    expect(result.files.some((f) => f.path.includes('index.ts'))).toBe(true);
  });

  it('should include PascalCase component name in output', async () => {
    const result = await registry.run('component', {
      name: 'user-card',
      outputDir: 'src/components',
    });

    const component = result.files.find((f) => f.path.endsWith('.tsx'));
    expect(component?.content).toContain('UserCard');
    expect(component?.content).toContain('export function');
  });

  it('should generate with props', async () => {
    const result = await registry.run('component', {
      name: 'button',
      outputDir: 'src/components',
      options: {
        props: [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: '() => void', required: false },
        ],
      },
    });

    expect(result.success).toBe(true);
    const component = result.files.find((f) => f.path.endsWith('.tsx'));
    expect(component?.content).toContain('ButtonProps');
    expect(component?.content).toContain('label');
  });

  it('should add use client when requested', async () => {
    const result = await registry.run('component', {
      name: 'counter',
      outputDir: 'src',
      options: { useClient: true },
    });

    const component = result.files.find((f) => f.path.endsWith('.tsx'));
    expect(component?.content).toContain("'use client'");
  });

  it('should generate test file when requested', async () => {
    const result = await registry.run('component', {
      name: 'avatar',
      outputDir: 'src',
      options: { withTest: true },
    });

    expect(result.files.some((f) => f.path.includes('.test.'))).toBe(true);
  });

  it('should fail on invalid name', async () => {
    const result = await registry.run('component', {
      name: '123invalid',
      outputDir: 'src',
    });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail on empty name', async () => {
    const result = await registry.run('component', {
      name: '',
      outputDir: 'src',
    });

    expect(result.success).toBe(false);
  });
});

describe('ApiRouteGenerator', () => {
  let registry: GeneratorRegistry;

  beforeEach(() => {
    registry = createGeneratorRegistry();
  });

  it('should generate a route file', async () => {
    const result = await registry.run('api-route', {
      name: 'users',
      outputDir: 'src/app/api',
    });

    expect(result.success).toBe(true);
    expect(result.files.some((f) => f.path.includes('route.ts'))).toBe(true);
  });

  it('should include specified HTTP methods', async () => {
    const result = await registry.run('api-route', {
      name: 'products',
      outputDir: 'src/app/api',
      options: { methods: ['GET', 'POST', 'DELETE'] },
    });

    const route = result.files.find((f) => f.path.endsWith('route.ts'));
    expect(route?.content).toContain('export async function GET');
    expect(route?.content).toContain('export async function POST');
    expect(route?.content).toContain('export async function DELETE');
  });

  it('should generate test when requested', async () => {
    const result = await registry.run('api-route', {
      name: 'orders',
      outputDir: 'src',
      options: { withTest: true, methods: ['GET'] },
    });

    expect(result.files.some((f) => f.path.includes('.test.'))).toBe(true);
  });
});

describe('ModelGenerator', () => {
  let registry: GeneratorRegistry;

  beforeEach(() => {
    registry = createGeneratorRegistry();
  });

  it('should generate a model file with Zod schema', async () => {
    const result = await registry.run('model', {
      name: 'product',
      outputDir: 'src/models',
      options: {
        fields: [
          { name: 'name', zodType: 'string' },
          { name: 'price', zodType: 'number' },
        ],
      },
    });

    expect(result.success).toBe(true);
    const model = result.files.find((f) => f.path.endsWith('.ts'));
    expect(model?.content).toContain('productSchema');
    expect(model?.content).toContain('z.object');
    expect(model?.content).toContain('createProduct');
  });

  it('should include timestamps by default', async () => {
    const result = await registry.run('model', {
      name: 'user',
      outputDir: 'src',
    });

    const model = result.files.find((f) => f.path.endsWith('.ts') && !f.path.includes('.test.'));
    expect(model?.content).toContain('createdAt');
    expect(model?.content).toContain('updatedAt');
  });
});

describe('TestGenerator', () => {
  let registry: GeneratorRegistry;

  beforeEach(() => {
    registry = createGeneratorRegistry();
  });

  it('should generate a test file', async () => {
    const result = await registry.run('test', {
      name: 'utils',
      outputDir: 'tests',
      options: {
        importPath: '../src/utils.js',
        functions: ['add', 'subtract'],
      },
    });

    expect(result.success).toBe(true);
    const testFile = result.files[0];
    expect(testFile.path).toContain('.test.ts');
    expect(testFile.content).toContain("describe('Utils'");
    expect(testFile.content).toContain("describe('add'");
    expect(testFile.content).toContain("describe('subtract'");
  });
});
