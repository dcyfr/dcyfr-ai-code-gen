# AGENTS.md - @dcyfr/ai-code-gen

## Package Overview

**@dcyfr/ai-code-gen** is an AI-powered code generation toolkit providing template-based scaffolding, AST manipulation, and intelligent code analysis for TypeScript projects.

## Architecture

```
src/
├── types/index.ts         # All TypeScript interfaces and types
├── lib/
│   ├── config.ts          # Configuration loading and validation
│   ├── logger.ts          # Structured logging
│   ├── file-system.ts     # File I/O utilities
│   └── strings.ts         # Case conversion and string utilities
├── templates/
│   ├── engine.ts          # Handlebars template engine with helpers
│   ├── builtins.ts        # 5 built-in template definitions
│   └── index.ts           # Barrel export
├── generators/
│   ├── base.ts            # BaseGenerator abstract class
│   ├── component.ts       # React component generator
│   ├── api-route.ts       # Next.js API route generator
│   ├── model.ts           # Zod data model generator
│   ├── test.ts            # Vitest test file generator
│   ├── registry.ts        # GeneratorRegistry + factory
│   └── index.ts           # Barrel export
├── ast/
│   ├── parser.ts          # TypeScript AST parsing via ts-morph
│   ├── transformer.ts     # AST transformation operations
│   ├── analyzer.ts        # Code analysis and diff
│   ├── printer.ts         # Code formatting and JSDoc generation
│   └── index.ts           # Barrel export
├── ai/
│   ├── prompts.ts         # Prompt engineering templates
│   ├── provider.ts        # AIProvider interface + MockAIProvider
│   ├── code-gen.ts        # AICodeGenerator orchestrator
│   └── index.ts           # Barrel export
├── index.ts               # Public API
└── cli.ts                 # CLI entry point
```

## Key Patterns

### Template Engine
- Handlebars-based with isolated instances (`Handlebars.create()`)
- 20+ built-in helpers for case conversion, conditionals, utilities
- Template caching with invalidation on re-registration
- **Critical:** Never place a literal `}` immediately after a Handlebars close tag (e.g., `{{/if}}`). Always add a newline between to avoid `}}}` parse errors.

### Generator System
- `BaseGenerator` abstract class handles validation + error handling
- Concrete generators override `validateConfig()` and `generateFiles()`
- `GeneratorRegistry` manages discovery and execution
- `createGeneratorRegistry()` factory pre-registers all built-in generators

### AST Module
- Uses ts-morph for TypeScript AST operations
- Parser extracts structured data (classes, interfaces, functions, etc.)
- Transformer supports 7 operation types: add-import, remove-import, add-export, add-property, add-method, rename, wrap
- Analyzer detects code quality issues (dead-code, complexity, naming, missing-jsdoc, large-file)

### AI Module
- Pluggable `AIProvider` interface for swappable backends
- `MockAIProvider` for testing and development
- `AICodeGenerator` combines AI with heuristic analysis
- Review scoring: deducts points for console.log, `any` types, TODO comments, long lines

## Testing

```bash
npm test           # Run all 124 tests
npx vitest         # Watch mode
```

**Test coverage:** 9 test files, 124 tests covering all modules.

## Dependencies

- **ts-morph** ^24.0.0 — TypeScript AST manipulation
- **handlebars** ^4.7.8 — Template rendering
- **glob** ^11.0.0 — File pattern matching
- **chalk** ^5.3.0 — Terminal colors
- **zod** ^3.23 — Schema validation

## Conventions

- ESM-only (`"type": "module"`)
- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`)
- Barrel exports for all module directories
- Vitest for testing
- No default exports (named exports only)

## Quality Gates
- TypeScript: 0 errors (`npm run typecheck`)
- Tests: ≥99% pass rate (`npm run test`)
- Lint: 0 errors (`npm run lint`)
