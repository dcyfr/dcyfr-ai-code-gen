# Code Generators - Building Custom Generators

**Target Audience:** Developers creating custom code generation workflows  
**Prerequisites:** Understanding of template engine and AST basics

---

## Overview

The Code Generators module provides a complete framework for building custom code generators with template-based scaffolding, validation, and post-processing hooks.

**Key Features:**
- Pre-built generators (component, API route, model, test)
- Generator registry for custom generators
- Template-based generation with validation
- Post-processing hooks (formatting, linting, AST transformation)
- File system integration with conflict resolution
- Extensible plugin system

---

## Built-in Generators

### Component Generator

Generate React functional components with TypeScript:

```typescript
import { createGeneratorRegistry } from '@dcyfr/ai-code-gen';

const registry = createGeneratorRegistry();

const result = await registry.run('component', {
  name: 'user-card',
  outputDir: 'src/components',
  options: {
    props: [
      { name: 'user', type: 'User', required: true },
      { name: 'onClick', type: '() => void', required: false },
    ],
    useClient: true,
    withTest: true,
    withStorybook: false,
  },
});

console.log(result.files);
```

**Generated Files:**
```
src/components/
├── user-card.tsx        # Component
├── user-card.test.tsx   # Tests (if withTest: true)
└── index.ts             # Barrel export
```

**user-card.tsx:**
```typescript
'use client';

import React from 'react';

export interface UserCardProps {
  user: User;
  onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onClick && <button onClick={onClick}>Action</button>}
    </div>
  );
}
```

### API Route Generator

Generate Next.js API route handlers:

```typescript
const result = await registry.run('api-route', {
  name: 'users',
  outputDir: 'src/app/api',
  options: {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    withValidation: true,
    withAuth: true,
    database: 'prisma',
  },
});
```

**Generated Files:**
```
src/app/api/users/
├── route.ts          # All HTTP methods
├── validation.ts     # Zod schemas (if withValidation: true)
└── service.ts        # Business logic
```

**route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userSchema } from './validation';
import { UserService } from './service';

const service = new UserService();

export async function GET(request: NextRequest) {
  const users = await service.getAll();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = userSchema.parse(body);
  const user = await service.create(data);
  return NextResponse.json(user, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  
  const body = await request.json();
  const user = await service.update(id, body);
  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  
  await service.delete(id);
  return NextResponse.json({ success: true });
}
```

### Model Generator

Generate data models with Zod schemas:

```typescript
const result = await registry.run('model', {
  name: 'user',
  outputDir: 'src/models',
  options: {
    fields: [
      { name: 'id', type: 'string', zodType: 'string', required: true },
      { name: 'email', type: 'string', zodType: 'string().email()', required: true },
      { name: 'name', type: 'string', zodType: 'string()', required: true },
      { name: 'age', type: 'number', zodType: 'number().min(0)', required: false },
    ],
    withFactory: true,
    withMock: true,
  },
});
```

**Generated Files:**
```
src/models/
├── user.ts           # Schema + type + factory
├── user.mock.ts      # Mock data (if withMock: true)
└── index.ts          # Barrel export
```

**user.ts:**
```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  age: z.number().min(0).optional(),
});

export type User = z.infer<typeof userSchema>;

export function createUser(data: Partial<User> = {}): User {
  return userSchema.parse({
    id: data.id ?? crypto.randomUUID(),
    email: data.email ?? 'user@example.com',
    name: data.name ?? 'John Doe',
    age: data.age,
  });
}
```

### Test Generator

Generate Vitest test files:

```typescript
const result = await registry.run('test', {
  name: 'user-service',
  outputDir: 'tests/services',
  options: {
    type: 'unit',
    framework: 'vitest',
    methods: [
      { name: 'getAll', returnType: 'User[]' },
      { name: 'getById', params: ['id: string'], returnType: 'User | null' },
      { name: 'create', params: ['data: CreateUserDto'], returnType: 'User' },
    ],
  },
});
```

**user-service.test.ts:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '@/services/user-service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const result = await service.getAll();
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      const id = '1';
      const result = await service.getById(id);
      // TODO: Add assertions
    });

    it('should return null for non-existent id', async () => {
      const result = await service.getById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = await service.create(data);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(data.name);
    });
  });
});
```

---

## Custom Generators

### Basic Custom Generator

```typescript
import { Generator, GeneratorRegistry } from '@dcyfr/ai-code-gen';

const myGenerator: Generator = {
  id: 'my-generator',
  name: 'My Custom Generator',
  description: 'Generates custom code',
  
  // Validate input data
  validate: (data) => {
    if (!data.name) {
      throw new Error('Name is required');
    }
    if (!/^[a-z-]+$/.test(data.name)) {
      throw new Error('Name must be kebab-case');
    }
  },
  
  // Generate files
  generate: async (data, context) => {
    const { name, outputDir } = data;
    const { templateEngine, fileSystem } = context;

    // Render template
    const content = templateEngine.renderSource(
      'export const {{constantCase name}} = "{{name}}";',
      { name }
    );

    // Return generated files
    return {
      files: [
        {
          path: `${outputDir}/${name}.ts`,
          content: content.content,
        },
      ],
    };
  },
};

// Register generator
const registry = new GeneratorRegistry();
registry.register(myGenerator);

// Use generator
const result = await registry.run('my-generator', {
  name: 'my-constant',
  outputDir: 'src/constants',
});
```

### Generator with Multiple Templates

```typescript
const serviceGenerator: Generator = {
  id: 'service',
  name: 'Service Generator',
  description: 'Generates service class with interface and tests',
  
  generate: async (data, context) => {
    const { name, outputDir, options } = data;
    const { templateEngine } = context;

    const files = [];

    // 1. Service interface
    const interfaceContent = templateEngine.renderSource(
      `
export interface I{{pascalCase name}}Service {
  {{#each methods}}
  {{this.name}}({{#if this.params}}{{join this.params ", "}}{{/if}}): {{this.returnType}};
  {{/each}}
}
      `.trim(),
      { name, methods: options.methods }
    );

    files.push({
      path: `${outputDir}/i-${name}-service.ts`,
      content: interfaceContent.content,
    });

    // 2. Service implementation
    const serviceContent = templateEngine.renderSource(
      `
import { I{{pascalCase name}}Service } from './i-{{kebabCase name}}-service';

export class {{pascalCase name}}Service implements I{{pascalCase name}}Service {
  {{#each methods}}
  async {{this.name}}({{#if this.params}}{{join this.params ", "}}{{/if}}): {{this.returnType}} {
    // TODO: Implement {{this.name}}
    throw new Error('Not implemented');
  }
  
  {{/each}}
}
      `.trim(),
      { name, methods: options.methods }
    );

    files.push({
      path: `${outputDir}/${name}-service.ts`,
      content: serviceContent.content,
    });

    // 3. Tests (if requested)
    if (options.withTests) {
      const testContent = templateEngine.renderSource(
        `
import { describe, it, expect } from 'vitest';
import { {{pascalCase name}}Service } from './${kebabCase name}-service';

describe('{{pascalCase name}}Service', () => {
  {{#each methods}}
  it('should {{this.name}}', async () => {
    const service = new {{../pascalCase ../name}}Service();
    // TODO: Write test
  });
  
  {{/each}}
});
        `.trim(),
        { name, methods: options.methods }
      );

      files.push({
        path: `${outputDir}/${name}-service.test.ts`,
        content: testContent.content,
      });
    }

    return { files };
  },
};
```

### Generator with Post-Processing

```typescript
const componentGenerator: Generator = {
  id: 'component',
  name: 'React Component',
  
  generate: async (data, context) => {
    // ... generate files ...
    return { files };
  },
  
  // Post-process generated files
  postProcess: async (result, context) => {
    const { formatTypeScript, transform } = context;
    
    for (const file of result.files) {
      // 1. Format code
      file.content = formatTypeScript(file.content);
      
      // 2. Add imports if needed
      if (file.path.endsWith('.tsx')) {
        const transformed = transform(file.content, [
          { type: 'add-import', moduleSpecifier: 'react', defaultImport: 'React' },
        ]);
        file.content = transformed.source;
      }
      
      // 3. Add license header
      file.content = `/**\n * Copyright (c) 2026\n */\n\n${file.content}`;
    }
    
    return result;
  },
};
```

---

## Generator Configuration

### Generator Options Schema

```typescript
import { z } from 'zod';

const componentOptionsSchema = z.object({
  props: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().default(true),
  })).default([]),
  useClient: z.boolean().default(false),
  withTest: z.boolean().default(false),
  withStorybook: z.boolean().default(false),
});

const componentGenerator: Generator = {
  id: 'component',
  name: 'React Component',
  optionsSchema: componentOptionsSchema,
  
  generate: async (data, context) => {
    // Options are validated against schema
    const options = componentOptionsSchema.parse(data.options);
    // ... use options ...
  },
};
```

### Generator Hooks

```typescript
const generatorWithHooks: Generator = {
  id: 'my-generator',
  name: 'My Generator',
  
  // Before generation
  beforeGenerate: async (data, context) => {
    console.log('Starting generation:', data.name);
    // Can modify data
    return { ...data, timestamp: Date.now() };
  },
  
  generate: async (data, context) => {
    // ... generate files ...
    return { files };
  },
  
  // After generation
  afterGenerate: async (result, context) => {
    console.log('Generated files:', result.files.length);
    // Can modify result
    return result;
  },
  
  // Post-process
  postProcess: async (result, context) => {
    // Format, lint, transform
    return result;
  },
};
```

---

## Generator Registry

### Create Registry

```typescript
import { createGeneratorRegistry } from '@dcyfr/ai-code-gen';

const registry = createGeneratorRegistry();

// Built-in generators are automatically registered:
// - component
// - api-route
// - model
// - test
```

### Register Custom Generators

```typescript
registry.register(myGenerator);
registry.register(serviceGenerator);
registry.register(componentGenerator);
```

### List Available Generators

```typescript
const generators = registry.list();

for (const gen of generators) {
  console.log(`${gen.id}: ${gen.name}`);
  console.log(`  ${gen.description}`);
}
```

**Output:**
```
component: React Component
  Generate a React functional component with TypeScript

api-route: API Route
  Generate Next.js API route handler

model: Data Model
  Generate Zod schema with TypeScript type

test: Test File
  Generate Vitest test file
```

### Run Generator

```typescript
const result = await registry.run('component', {
  name: 'user-card',
  outputDir: 'src/components',
  options: { /* ... */ },
});

console.log('Generated files:');
for (const file of result.files) {
  console.log(`  - ${file.path} (${file.content.length} bytes)`);
}
```

---

## File System Integration

### Write Generated Files

```typescript
import { writeGeneratedFiles } from '@dcyfr/ai-code-gen';

const result = await registry.run('component', { /* ... */ });

await writeGeneratedFiles(result.files, {
  overwrite: false,  // Don't overwrite existing files
  dryRun: false,     // Actually write files
});
```

### Conflict Resolution

```typescript
const result = await registry.run('component', {
  name: 'existing-component',
  outputDir: 'src/components',
});

try {
  await writeGeneratedFiles(result.files, { overwrite: false });
} catch (error) {
  if (error.message.includes('already exists')) {
    console.log('File exists. Options:');
    console.log('1. Skip');
    console.log('2. Overwrite');
    console.log('3. Merge');
    
    // Handle conflict
    const choice = await prompt('Choose option: ');
    
    if (choice === '2') {
      await writeGeneratedFiles(result.files, { overwrite: true });
    }
  }
}
```

### Dry Run

```typescript
const result = await registry.run('component', { /* ... */ });

// Preview what would be generated
const preview = await writeGeneratedFiles(result.files, {
  dryRun: true,
});

console.log('Would generate:');
for (const file of preview.files) {
  console.log(`  ${file.path}`);
}
```

---

## Advanced Patterns

### Multi-File Generator

Generate entire feature modules:

```typescript
const featureGenerator: Generator = {
  id: 'feature',
  name: 'Feature Module',
  description: 'Generate complete feature with components, hooks, and tests',
  
  generate: async (data, context) => {
    const { name, outputDir } = data;
    const files = [];

    // 1. Component
    const componentResult = await context.registry.run('component', {
      name,
      outputDir: `${outputDir}/components`,
      options: { withTest: true },
    });
    files.push(...componentResult.files);

    // 2. Hook
    const hookResult = await context.registry.run('hook', {
      name: `use-${name}`,
      outputDir: `${outputDir}/hooks`,
    });
    files.push(...hookResult.files);

    // 3. Service
    const serviceResult = await context.registry.run('service', {
      name: `${name}-service`,
      outputDir: `${outputDir}/services`,
    });
    files.push(...serviceResult.files);

    // 4. Index barrel export
    files.push({
      path: `${outputDir}/index.ts`,
      content: `
export { ${pascalCase(name)} } from './components/${name}';
export { use${pascalCase(name)} } from './hooks/use-${name}';
export { ${pascalCase(name)}Service } from './services/${name}-service';
      `.trim(),
    });

    return { files };
  },
};
```

### Conditional Generation

Generate different files based on options:

```typescript
const adaptiveGenerator: Generator = {
  id: 'adaptive',
  name: 'Adaptive Generator',
  
  generate: async (data, context) => {
    const { name, outputDir, options } = data;
    const files = [];

    // Always generate main file
    files.push({
      path: `${outputDir}/${name}.ts`,
      content: '// Main file',
    });

    // Conditionally generate based on framework
    if (options.framework === 'react') {
      files.push({
        path: `${outputDir}/${name}.tsx`,
        content: '// React component',
      });
    } else if (options.framework === 'vue') {
      files.push({
        path: `${outputDir}/${name}.vue`,
        content: '// Vue component',
      });
    }

    // Conditionally generate tests
    if (options.withTests) {
      files.push({
        path: `${outputDir}/${name}.test.ts`,
        content: '// Tests',
      });
    }

    return { files };
  },
};
```

### Generator Composition

Compose generators to build complex workflows:

```typescript
const fullStackGenerator: Generator = {
  id: 'full-stack',
  name: 'Full Stack Feature',
  
  generate: async (data, context) => {
    const { name } = data;
    const files = [];

    // 1. Backend API
    const apiResult = await context.registry.run('api-route', {
      name,
      outputDir: 'src/app/api',
      options: { methods: ['GET', 'POST', 'PUT', 'DELETE'] },
    });
    files.push(...apiResult.files);

    // 2. Database model
    const modelResult = await context.registry.run('model', {
      name,
      outputDir: 'src/models',
      options: { withFactory: true },
    });
    files.push(...modelResult.files);

    // 3. Frontend component
    const componentResult = await context.registry.run('component', {
      name: `${name}-list`,
      outputDir: 'src/components',
      options: { withTest: true },
    });
    files.push(...componentResult.files);

    // 4. API client
    files.push({
      path: `src/services/${name}-api.ts`,
      content: generateAPIClient(name),
    });

    return { files };
  },
};
```

---

## Best Practices

1. **Validate Input Data**
   ```typescript
   validate: (data) => {
     if (!data.name) throw new Error('Name required');
     if (!/^[a-z-]+$/.test(data.name)) throw new Error('Invalid name format');
   },
   ```

2. **Use Options Schema**
   ```typescript
   optionsSchema: z.object({
     props: z.array(z.object({ name: z.string(), type: z.string() })),
     withTests: z.boolean().default(false),
   }),
   ```

3. **Provide Helpful Descriptions**
   ```typescript
   const generator: Generator = {
     id: 'my-gen',
     name: 'My Generator',
     description: 'Generates X with Y. Use for Z scenarios.',
     examples: [
       'npx dcyfr-codegen generate my-gen user-profile --output src',
     ],
   };
   ```

4. **Format Generated Code**
   ```typescript
   postProcess: async (result, context) => {
     result.files.forEach(file => {
       file.content = formatTypeScript(file.content);
     });
     return result;
   },
   ```

5. **Handle Errors Gracefully**
   ```typescript
   generate: async (data, context) => {
     try {
       // ... generate files ...
     } catch (error) {
       throw new Error(`Failed to generate ${data.name}: ${error.message}`);
     }
   },
   ```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
