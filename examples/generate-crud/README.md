# Example: Generate CRUD Operations

This example shows how to generate a complete CRUD module with data model, API routes, and tests.

## Usage

```typescript
import { createGeneratorRegistry } from '@dcyfr/ai-code-gen';

const registry = createGeneratorRegistry();

const modelName = 'product';
const fields = [
  { name: 'name', zodType: 'string' },
  { name: 'description', zodType: 'string', optional: true },
  { name: 'price', zodType: 'number' },
  { name: 'category', zodType: 'string' },
  { name: 'inStock', zodType: 'boolean' },
];

// 1. Generate data model
const model = await registry.run('model', {
  name: modelName,
  outputDir: `src/models`,
  options: {
    fields,
    hasTimestamps: true,
    withTest: true,
    description: 'Product catalog item',
  },
});

console.log(`Model: ${model.files.length} files`);

// 2. Generate API routes
const routes = ['GET', 'POST', 'PUT', 'DELETE'];
const api = await registry.run('api-route', {
  name: modelName,
  outputDir: `src/app/api/${modelName}`,
  options: {
    methods: routes,
    hasAuth: true,
    description: `CRUD operations for ${modelName}`,
  },
});

console.log(`API: ${api.files.length} files`);

// 3. Generate test file
const tests = await registry.run('test', {
  name: `${modelName}-api`,
  outputDir: `tests/api`,
  options: {
    importPath: `../../src/app/api/${modelName}/route.js`,
    functions: routes.map((m) => m),
    description: `API tests for ${modelName}`,
  },
});

console.log(`Tests: ${tests.files.length} files`);
```

## Output Structure

```
src/
├── models/
│   ├── product.ts          # Zod schema + types + factory
│   └── product.test.ts     # Model validation tests
└── app/api/product/
    └── route.ts            # GET, POST, PUT, DELETE handlers
tests/api/
    └── product-api.test.ts # API test scaffolding
```
