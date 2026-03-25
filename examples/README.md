# Examples

This directory contains advanced runnable examples for `@dcyfr/ai-code-gen`.

## Files

- `custom-generator.ts` — Custom generator registration and execution.
- `ast-refactoring.ts` — AST transformation and refactoring workflows.
- `template-composition.ts` — Template composition and helper patterns.

## Prerequisites

- Install dependencies: `npm install`

## Run examples

From package root:

- `npx tsx examples/custom-generator.ts`
- `npx tsx examples/ast-refactoring.ts`
- `npx tsx examples/template-composition.ts`

## Type-check examples

- `npx tsc --noEmit --module nodenext --moduleResolution nodenext --target es2022 --strict --esModuleInterop true --skipLibCheck true examples/ast-refactoring.ts examples/custom-generator.ts`
