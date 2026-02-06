# @dcyfr/ai-code-gen

> AI-powered code generation toolkit with AST manipulation, template engine, and intelligent scaffolding.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview

`@dcyfr/ai-code-gen` is a comprehensive code generation toolkit that combines template-based scaffolding, AST (Abstract Syntax Tree) manipulation, and AI-assisted code generation. It provides a complete pipeline for generating, analyzing, transforming, and reviewing TypeScript code.

## Features

- **Template Engine** — Handlebars-based with 20+ built-in helpers for case conversion, conditionals, and code generation patterns
- **Code Generators** — Pre-built generators for React components, API routes, data models, test files, and barrel exports
- **AST Module** — Parse, transform, analyze, and format TypeScript code using ts-morph
- **AI Integration** — Pluggable AI provider system for intelligent code generation, review, and refactoring
- **CLI** — Command-line interface for scaffolding, analysis, and code review
- **Extensible** — Register custom templates, generators, and AI providers

## Installation

```bash
npm install @dcyfr/ai-code-gen
```

## Quick Start

### Generate a React Component

```typescript
import { createGeneratorRegistry } from '@dcyfr/ai-code-gen';

const registry = createGeneratorRegistry();

const result = await registry.run('component', {
  name: 'user-card',
  outputDir: 'src/components',
  options: {
    props: [
      { name: 'name', type: 'string', required: true },
      { name: 'avatar', type: 'string' },
    ],
    useClient: true,
    withTest: true,
  },
});

for (const file of result.files) {
  console.log(`Generated: ${file.path}`);
}
```

### Analyze TypeScript Code

```typescript
import { analyzeCode } from '@dcyfr/ai-code-gen';

const analysis = analyzeCode(`
  function processData(input: any) {
    console.log(input);
    if (input.a) {
      if (input.b) {
        if (input.c) {
          return true;
        }
      }
    }
    return false;
  }
`);

console.log(analysis.issues);
// Detects: console.log usage, `any` type, high complexity
```

### Transform Code with AST

```typescript
import { transform } from '@dcyfr/ai-code-gen';

const result = transform(sourceCode, [
  { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
  { type: 'rename', oldName: 'fetchData', newName: 'loadData' },
  { type: 'add-export', exportName: 'UserSchema' },
]);

console.log(result.source);
```

### Use the Template Engine

```typescript
import { TemplateEngine } from '@dcyfr/ai-code-gen';

const engine = new TemplateEngine();

const result = engine.renderSource(
  'export function {{camelCase name}}({{#each params}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}): {{returnType}} {}',
  { name: 'get-user-data', params: ['id: string', 'options?: Options'], returnType: 'Promise<User>' }
);

console.log(result.content);
// export function getUserData(id: string, options?: Options): Promise<User> {}
```

## Built-in Generators

| Generator | Description | Output |
|-----------|-------------|--------|
| `component` | React functional component with TypeScript | `.tsx` + barrel export |
| `api-route` | Next.js API route handler | `.ts` with GET/POST/PUT/DELETE |
| `model` | Zod schema data model | `.ts` with schema + types + factory |
| `test` | Vitest test file | `.test.ts` with describe/it scaffolding |

## Built-in Template Helpers

### Case Conversion
- `{{pascalCase name}}` → `UserProfile`
- `{{camelCase name}}` → `userProfile`
- `{{kebabCase name}}` → `user-profile`
- `{{snakeCase name}}` → `user_profile`
- `{{constantCase name}}` → `USER_PROFILE`

### Conditionals
- `{{#if condition}}...{{/if}}`
- `{{#unless condition}}...{{/unless}}`
- `{{eq a b}}`, `{{neq a b}}`, `{{or a b}}`, `{{and a b}}`, `{{not a}}`

### Utilities
- `{{pluralize word}}` — Simple pluralization
- `{{join array ", "}}` — Join array elements
- `{{timestamp}}` — ISO timestamp
- `{{year}}` — Current year
- `{{typeAnnotation type}}` — TypeScript type annotation
- `{{genericType base param}}` — Generic type syntax

## AST Module

### Parse
```typescript
import { parseSource, parseFile } from '@dcyfr/ai-code-gen';

const ast = parseSource('class User { name: string; }');
// Returns: classes, interfaces, functions, types, enums, variables, imports, exports, metrics
```

### Transform
```typescript
import { transform } from '@dcyfr/ai-code-gen';

const result = transform(source, [
  { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
  { type: 'remove-import', moduleSpecifier: 'lodash' },
  { type: 'add-property', className: 'User', propertyName: 'email', propertyType: 'string' },
  { type: 'add-method', className: 'User', methodName: 'validate', returnType: 'boolean', body: 'return true;' },
  { type: 'rename', oldName: 'oldFunc', newName: 'newFunc' },
  { type: 'add-export', exportName: 'MyType' },
]);
```

### Analyze
```typescript
import { analyzeCode, compareStructure } from '@dcyfr/ai-code-gen';

const analysis = analyzeCode(source);
// Detects: dead-code, complexity, naming, missing-jsdoc, large-file issues

const diff = compareStructure(oldSource, newSource);
// Returns: added, removed, modified declarations
```

### Format
```typescript
import { formatTypeScript, addLicenseHeader, generateJsDoc } from '@dcyfr/ai-code-gen';

const formatted = formatTypeScript(source, { singleQuote: true, tabWidth: 2 });
const withHeader = addLicenseHeader(source, 'MIT', 2026);
const doc = generateJsDoc({ description: 'Process data', params: [{ name: 'input', type: 'string' }] });
```

## AI Integration

```typescript
import { createAICodeGenerator } from '@dcyfr/ai-code-gen';

// Uses MockAIProvider by default; plug in your own AIProvider for real AI
const ai = createAICodeGenerator({ provider: 'mock', model: 'gpt-4' });

// Generate code
const generated = await ai.generateCode({ prompt: 'Create a user service', language: 'TypeScript' });

// Review code
const review = await ai.reviewCode({ code: sourceCode, language: 'TypeScript' });

// Suggest refactoring
const suggestions = await ai.suggestRefactoring({ code: sourceCode, language: 'TypeScript' });

// Generate documentation
const docs = await ai.generateDocs({ code: sourceCode, language: 'TypeScript' });
```

## CLI Usage

```bash
# Generate a React component
npx dcyfr-codegen generate component user-card --output src/components

# Analyze a TypeScript file
npx dcyfr-codegen analyze src/utils.ts

# Review code quality
npx dcyfr-codegen review src/service.ts

# List available generators
npx dcyfr-codegen list

# Show help
npx dcyfr-codegen help
```

## Custom Templates

```typescript
import { TemplateEngine } from '@dcyfr/ai-code-gen';

const engine = new TemplateEngine();

engine.registerTemplate({
  id: 'my-template',
  name: 'Custom Template',
  description: 'My custom code template',
  outputExtension: '.ts',
  variables: [
    { name: 'name', type: 'string', required: true },
  ],
  source: 'export class {{pascalCase name}} {\n  // TODO: implement\n}\n',
});

const result = engine.render('my-template', { name: 'my-service' });
```

## Architecture

```
src/
├── types/          # TypeScript type definitions
├── lib/            # Core utilities (config, logger, strings, file-system)
├── templates/      # Handlebars template engine + built-in templates
├── generators/     # Code generators (component, api-route, model, test)
├── ast/            # AST parsing, transformation, analysis, formatting
├── ai/             # AI provider integration + prompt engineering
├── cli.ts          # CLI entry point
└── index.ts        # Public API barrel export
```

## Development

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Run tests
npm test

# Run tests in watch mode
npx vitest

# Lint
npm run lint
```

## Requirements

- Node.js >= 20
- TypeScript >= 5.3

## License

MIT — see [LICENSE](LICENSE) for details.
