# Template Engine - Advanced Templating Guide

**Target Audience:** Developers building custom code generators  
**Prerequisites:** Familiarity with Handlebars syntax, TypeScript basics

---

## Overview

The Template Engine provides a Handlebars-based templating system optimized for code generation with 20+ built-in helpers for case conversion, type manipulation, and code formatting.

**Key Features:**
- Handlebars 4.7+ with custom helpers
- Type-safe variable declarations
- Template composition (partials + layouts)
- Output validation and formatting
- File system integration
- Error handling with line numbers

---

## Basic Usage

### Simple Template

```typescript
import { TemplateEngine } from '@dcyfr/ai-code-gen';

const engine = new TemplateEngine();

const result = engine.renderSource(
  'export const {{constantCase name}} = "{{value}}";',
  { name: 'api-url', value: 'https://api.example.com' }
);

console.log(result.content);
// export const API_URL = "https://api.example.com";
```

### Template with Conditionals

```typescript
const template = `
export interface {{pascalCase name}}Props {
  {{#each props}}
  {{this.name}}{{#unless this.required}}?{{/unless}}: {{this.type}};
  {{/each}}
}

export function {{pascalCase name}}({{#if props.length}}props: {{pascalCase name}}Props{{/if}}) {
  {{#if useClient}}
  'use client';
  
  {{/if}}
  return (
    <div>
      {{#each props}}
      <p>{props.{{this.name}}}</p>
      {{/each}}
    </div>
  );
}
`;

const result = engine.renderSource(template, {
  name: 'user-card',
  useClient: true,
  props: [
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'avatar', type: 'string', required: false },
  ],
});
```

**Output:**
```typescript
export interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}

export function UserCard(props: UserCardProps) {
  'use client';
  
  return (
    <div>
      <p>{props.name}</p>
      <p>{props.email}</p>
      <p>{props.avatar}</p>
    </div>
  );
}
```

---

## Built-in Helpers

### Case Conversion Helpers

The template engine includes 5 case conversion helpers for identifier transformations:

```typescript
const template = `
// PascalCase - class names, types, interfaces
export class {{pascalCase name}} {}

// camelCase - variables, functions, properties
export function {{camelCase name}}() {}

// kebab-case - file names, CSS classes
// file: {{kebabCase name}}.ts

// snake_case - database columns, constants
export const {{snakeCase name}} = '';

// CONSTANT_CASE - environment variables, constants
export const {{constantCase name}} = '';
`;

const result = engine.renderSource(template, { name: 'user-profile' });
```

**Output:**
```typescript
// PascalCase - class names, types, interfaces
export class UserProfile {}

// camelCase - variables, functions, properties
export function userProfile() {}

// kebab-case - file names, CSS classes
// file: user-profile.ts

// snake_case - database columns, constants
export const user_profile = '';

// CONSTANT_CASE - environment variables, constants
export const USER_PROFILE = '';
```

### Type Annotation Helpers

Generate TypeScript type annotations:

```typescript
const template = `
export interface {{pascalCase name}} {
  {{#each fields}}
  {{this.name}}: {{typeAnnotation this.type}};
  {{/each}}
}

export function create{{pascalCase name}}(
  {{#each fields}}
  {{this.name}}: {{typeAnnotation this.type}},
  {{/each}}
): {{pascalCase name}} {
  return { {{join (map fields "name") ", "}} };
}
`;

const result = engine.renderSource(template, {
  name: 'user',
  fields: [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'tags', type: 'string[]' },
    { name: 'metadata', type: 'Record<string, any>' },
  ],
});
```

**Output:**
```typescript
export interface User {
  id: number;
  name: string;
  tags: string[];
  metadata: Record<string, any>;
}

export function createUser(
  id: number,
  name: string,
  tags: string[],
  metadata: Record<string, any>,
): User {
  return { id, name, tags, metadata };
}
```

### Generic Type Helper

Generate generic type syntax:

```typescript
const template = `
export type {{pascalCase name}} = {{genericType baseType paramType}};

export function wrap{{pascalCase name}}<T>(value: T): {{genericType baseType "T"}} {
  return { data: value };
}
`;

const result = engine.renderSource(template, {
  name: 'wrapped-response',
  baseType: 'Response',
  paramType: 'User',
});
```

**Output:**
```typescript
export type WrappedResponse = Response<User>;

export function wrapWrappedResponse<T>(value: T): Response<T> {
  return { data: value };
}
```

### Comparison Helpers

Conditional logic with type-safe comparisons:

```typescript
const template = `
{{#if (eq type "component")}}
export function {{pascalCase name}}() {}
{{else if (eq type "hook")}}
export function use{{pascalCase name}}() {}
{{else if (eq type "util")}}
export function {{camelCase name}}() {}
{{/if}}

{{#if (or (eq framework "react") (eq framework "vue"))}}
import { useState } from '{{framework}}';
{{/if}}

{{#unless (eq visibility "public")}}
// @internal
{{/unless}}
export const {{constantCase name}} = '{{value}}';
`;

const result = engine.renderSource(template, {
  name: 'data-fetcher',
  type: 'hook',
  framework: 'react',
  visibility: 'internal',
  value: 'fetcher',
});
```

**Output:**
```typescript
export function useDataFetcher() {}

import { useState } from 'react';

// @internal
export const DATA_FETCHER = 'fetcher';
```

### Utility Helpers

Additional helpers for common code generation patterns:

```typescript
const template = `
// Pluralization
export const {{camelCase (pluralize entityName)}} = [];

// Join arrays
export type {{pascalCase name}} = {{join types " | "}};

// Timestamps
// Generated on: {{timestamp}}
// Copyright {{year}}

// Iteration with index
{{#each items}}
{{@index}}. {{this.name}} - {{this.value}}
{{/each}}
`;

const result = engine.renderSource(template, {
  entityName: 'user',
  name: 'status',
  types: ['"active"', '"pending"', '"inactive"'],
  items: [
    { name: 'First', value: 1 },
    { name: 'Second', value: 2 },
  ],
});
```

**Output:**
```typescript
// Pluralization
export const users = [];

// Join arrays
export type Status = "active" | "pending" | "inactive";

// Timestamps
// Generated on: 2026-02-07T01:45:00.000Z
// Copyright 2026

// Iteration with index
0. First - 1
1. Second - 2
```

---

## Template Registration

### Register Custom Template

```typescript
import { TemplateEngine } from '@dcyfr/ai-code-gen';

const engine = new TemplateEngine();

engine.registerTemplate({
  id: 'zod-schema',
  name: 'Zod Schema',
  description: 'Generate a Zod schema with TypeScript type',
  outputExtension: '.ts',
  variables: [
    { name: 'name', type: 'string', required: true, description: 'Schema name' },
    { name: 'fields', type: 'array', required: true, description: 'Schema fields' },
  ],
  source: `
import { z } from 'zod';

export const {{camelCase name}}Schema = z.object({
  {{#each fields}}
  {{this.name}}: z.{{this.zodType}}(){{#if this.optional}}.optional(){{/if}},
  {{/each}}
});

export type {{pascalCase name}} = z.infer<typeof {{camelCase name}}Schema>;
  `.trim(),
});

// Use the registered template
const result = engine.render('zod-schema', {
  name: 'user',
  fields: [
    { name: 'id', zodType: 'number' },
    { name: 'email', zodType: 'string' },
    { name: 'name', zodType: 'string' },
    { name: 'age', zodType: 'number', optional: true },
  ],
});
```

**Output:**
```typescript
import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  age: z.number().optional(),
});

export type User = z.infer<typeof userSchema>;
```

### Register Multiple Templates

```typescript
const templates = [
  {
    id: 'interface',
    name: 'TypeScript Interface',
    source: 'export interface {{pascalCase name}} {\n  // TODO\n}\n',
    outputExtension: '.ts',
    variables: [{ name: 'name', type: 'string', required: true }],
  },
  {
    id: 'type-alias',
    name: 'TypeScript Type Alias',
    source: 'export type {{pascalCase name}} = {\n  // TODO\n};\n',
    outputExtension: '.ts',
    variables: [{ name: 'name', type: 'string', required: true }],
  },
];

templates.forEach(template => engine.registerTemplate(template));
```

---

## Partials & Composition

### Register Partials

Partials are reusable template fragments:

```typescript
engine.registerPartial('header', `
/**
 * @file {{fileName}}
 * @description {{description}}
 * @created {{timestamp}}
 */
`);

engine.registerPartial('import-react', `
import { {{join imports ", "}} } from 'react';
`);

engine.registerPartial('prop-type', `
{{name}}{{#unless required}}?{{/unless}}: {{type}};
`);

// Use partials in templates
const template = `
{{> header fileName="user-card.tsx" description="User card component"}}

{{> import-react imports=(array "FC" "useState")}}

interface Props {
  {{#each props}}
  {{> prop-type this}}
  {{/each}}
}

export const {{pascalCase name}}: FC<Props> = (props) => {
  return <div>{props.name}</div>;
};
`;
```

### Template Inheritance

Create base templates and extend them:

```typescript
// Base component template
engine.registerTemplate({
  id: 'base-component',
  source: `
{{> header}}

import React from 'react';

interface {{pascalCase name}}Props {
  {{#each props}}
  {{this.name}}: {{this.type}};
  {{/each}}
}

export function {{pascalCase name}}(props: {{pascalCase name}}Props) {
  {{block "body"}}
  return <div>TODO: implement {{pascalCase name}}</div>;
  {{/block}}
}
  `.trim(),
});

// Extend with custom body
const result = engine.renderSource(
  `{{#> base-component name="counter" props=props}}
  {{#block "body"}}
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
  {{/block}}
  {{/base-component}}`,
  { props: [{ name: 'initialCount', type: 'number' }] }
);
```

---

## Advanced Patterns

### Conditional Imports

Generate imports based on template data:

```typescript
const template = `
{{#if useReact}}
import React from 'react';
{{/if}}
{{#if useState}}
import { useState } from 'react';
{{/if}}
{{#if useEffect}}
import { useEffect } from 'react';
{{/if}}
{{#if zod}}
import { z } from 'zod';
{{/if}}

export function {{pascalCase name}}() {
  {{#if useState}}
  const [state, setState] = useState(null);
  {{/if}}
  
  {{#if useEffect}}
  useEffect(() => {
    // Side effect
  }, []);
  {{/if}}
  
  return null;
}
`;

const result = engine.renderSource(template, {
  name: 'my-hook',
  useReact: true,
  useState: true,
  useEffect: true,
  zod: false,
});
```

### Dynamic Method Generation

Generate methods based on data:

```typescript
const template = `
export class {{pascalCase name}}Service {
  {{#each methods}}
  async {{this.name}}({{#if this.params}}{{join this.params ", "}}{{/if}}): Promise<{{this.returnType}}> {
    {{#if (eq this.type "get")}}
    return this.http.get<{{this.returnType}}>('/{{../endpoint}}/{{this.path}}');
    {{else if (eq this.type "post")}}
    return this.http.post<{{this.returnType}}>('/{{../endpoint}}/{{this.path}}', data);
    {{else if (eq this.type "put")}}
    return this.http.put<{{this.returnType}}>('/{{../endpoint}}/{{this.path}}', data);
    {{else if (eq this.type "delete")}}
    return this.http.delete<{{this.returnType}}>('/{{../endpoint}}/{{this.path}}');
    {{/if}}
  }
  
  {{/each}}
}
`;

const result = engine.renderSource(template, {
  name: 'user',
  endpoint: 'users',
  methods: [
    { name: 'getAll', type: 'get', path: '', returnType: 'User[]', params: [] },
    { name: 'getById', type: 'get', path: '{id}', returnType: 'User', params: ['id: string'] },
    { name: 'create', type: 'post', path: '', returnType: 'User', params: ['data: CreateUserDto'] },
    { name: 'update', type: 'put', path: '{id}', returnType: 'User', params: ['id: string', 'data: UpdateUserDto'] },
    { name: 'delete', type: 'delete', path: '{id}', returnType: 'void', params: ['id: string'] },
  ],
});
```

### Nested Data Structures

Handle complex nested data:

```typescript
const template = `
export interface {{pascalCase name}} {
  {{#each fields}}
  {{#if this.nested}}
  {{this.name}}: {
    {{#each this.nested}}
    {{this.name}}: {{this.type}};
    {{/each}}
  };
  {{else}}
  {{this.name}}: {{this.type}};
  {{/if}}
  {{/each}}
}
`;

const result = engine.renderSource(template, {
  name: 'user-profile',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    {
      name: 'address',
      nested: [
        { name: 'street', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'zipCode', type: 'string' },
      ],
    },
  ],
});
```

**Output:**
```typescript
export interface UserProfile {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
}
```

---

## Custom Helpers

### Register Custom Helper

```typescript
// Simple helper
engine.registerHelper('uppercase', (str: string) => str.toUpperCase());

// Helper with options
engine.registerHelper('repeat', (str: string, times: number) => {
  return str.repeat(times);
});

// Block helper
engine.registerHelper('times', function(n: number, options: any) {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += options.fn({ index: i, value: i + 1 });
  }
  return result;
});

// Use custom helpers
const template = `
export const {{uppercase name}} = '{{repeat char 5}}';

{{#times 3}}
console.log('Iteration {{this.value}}');
{{/times}}
`;

const result = engine.renderSource(template, {
  name: 'separator',
  char: '-',
});
```

**Output:**
```typescript
export const SEPARATOR = '-----';

console.log('Iteration 1');
console.log('Iteration 2');
console.log('Iteration 3');
```

### Complex Helper with Context

```typescript
engine.registerHelper('generateCrudMethods', function(entityName: string, options: any) {
  const pascal = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const camel = entityName.charAt(0).toLowerCase() + entityName.slice(1);
  
  return `
  async getAll${pascal}s(): Promise<${pascal}[]> {
    return this.repository.findAll();
  }

  async get${pascal}ById(id: string): Promise<${pascal}> {
    return this.repository.findById(id);
  }

  async create${pascal}(data: Create${pascal}Dto): Promise<${pascal}> {
    return this.repository.create(data);
  }

  async update${pascal}(id: string, data: Update${pascal}Dto): Promise<${pascal}> {
    return this.repository.update(id, data);
  }

  async delete${pascal}(id: string): Promise<void> {
    await this.repository.delete(id);
  }
  `.trim();
});

// Use the helper
const template = `
export class {{pascalCase name}}Service {
  constructor(private repository: Repository<{{pascalCase entityName}}>) {}

  {{generateCrudMethods entityName}}
}
`;
```

---

## Error Handling

### Validation Errors

The template engine validates variables before rendering:

```typescript
engine.registerTemplate({
  id: 'strict-template',
  variables: [
    { name: 'name', type: 'string', required: true },
    { name: 'age', type: 'number', required: false },
  ],
  source: '// Template',
});

try {
  // Missing required variable
  engine.render('strict-template', { age: 25 });
} catch (error) {
  console.error(error.message);
  // Error: Missing required variable: name
}
```

### Template Syntax Errors

Handlebars syntax errors include line numbers:

```typescript
try {
  engine.renderSource('{{#if invalid}}{{/each}}', {});
} catch (error) {
  console.error(error.message);
  // Error: Parse error on line 1: {{#if invalid}}{{/each}}
}
```

---

## File System Integration

### Render to File

```typescript
const result = engine.render('component', {
  name: 'user-card',
  props: [{ name: 'name', type: 'string' }],
});

// result.content contains the rendered template
// result.outputPath contains the suggested file path

await fs.writeFile(result.outputPath, result.content, 'utf-8');
```

### Batch Rendering

```typescript
const components = ['header', 'footer', 'sidebar'];

for (const name of components) {
  const result = engine.render('component', { name, props: [] });
  await fs.writeFile(`src/components/${name}.tsx`, result.content);
}
```

---

## Best Practices

1. **Use Case Helpers Consistently**
   ```typescript
   // ✅ GOOD - Consistent naming
   export interface {{pascalCase name}}Props {}
   export function {{pascalCase name}}() {}
   
   // ❌ BAD - Inconsistent
   export interface {{name}}Props {}
   export function {{pascalCase name}}() {}
   ```

2. **Validate Template Data**
   ```typescript
   // Define expected variables
   const template = {
     id: 'my-template',
     variables: [
       { name: 'name', type: 'string', required: true },
       { name: 'props', type: 'array', required: false },
     ],
     source: '...',
   };
   ```

3. **Use Partials for Reusable Fragments**
   ```typescript
   // Register common headers, imports, etc. as partials
   engine.registerPartial('file-header', '/* ... */');
   
   // Reuse across templates
   const template = '{{> file-header}}\n\nexport class MyClass {}';
   ```

4. **Test Templates with Edge Cases**
   ```typescript
   // Test with empty arrays
   engine.render('component', { name: 'test', props: [] });
   
   // Test with special characters
   engine.render('component', { name: 'user-profile' });
   
   // Test with long names
   engine.render('component', { name: 'veryLongComponentNameThatShouldBeHandledProperly' });
   ```

5. **Format Generated Code**
   ```typescript
   import { formatTypeScript } from '@dcyfr/ai-code-gen';
   
   const result = engine.render('component', data);
   const formatted = formatTypeScript(result.content);
   ```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
