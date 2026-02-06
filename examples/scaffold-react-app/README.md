# Example: Scaffold a React App

This example demonstrates using `@dcyfr/ai-code-gen` to scaffold a complete React component library.

## Usage

```typescript
import { createGeneratorRegistry } from '@dcyfr/ai-code-gen';

const registry = createGeneratorRegistry();

// Generate multiple components
const components = [
  { name: 'button', props: [{ name: 'variant', type: "'primary' | 'secondary'", required: true }, { name: 'disabled', type: 'boolean' }], useClient: true },
  { name: 'card', props: [{ name: 'title', type: 'string', required: true }], hasChildren: true },
  { name: 'input', props: [{ name: 'value', type: 'string', required: true }, { name: 'onChange', type: '(value: string) => void', required: true }], useClient: true },
  { name: 'modal', props: [{ name: 'isOpen', type: 'boolean', required: true }, { name: 'onClose', type: '() => void', required: true }], hasChildren: true, useClient: true },
];

for (const comp of components) {
  const result = await registry.run('component', {
    name: comp.name,
    outputDir: 'src/components',
    options: {
      props: comp.props,
      hasChildren: comp.hasChildren,
      useClient: comp.useClient,
      withTest: true,
    },
  });

  if (result.success) {
    console.log(`✅ Generated ${comp.name}: ${result.files.length} files`);
    for (const file of result.files) {
      console.log(`   ${file.path}`);
    }
  }
}
```

## Output Structure

```
src/components/
├── button/
│   ├── button.tsx
│   ├── button.test.tsx
│   └── index.ts
├── card/
│   ├── card.tsx
│   ├── card.test.tsx
│   └── index.ts
├── input/
│   ├── input.tsx
│   ├── input.test.tsx
│   └── index.ts
└── modal/
    ├── modal.tsx
    ├── modal.test.tsx
    └── index.ts
```
