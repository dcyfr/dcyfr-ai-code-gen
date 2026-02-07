# AST Manipulation - TypeScript Code Transformation

**Target Audience:** Advanced developers building code transformation tools  
**Prerequisites:** Understanding of Abstract Syntax Trees (AST), TypeScript compiler API basics

---

## Overview

The AST module provides a complete toolkit for parsing, analyzing, transforming, and formatting TypeScript code using `ts-morph` (TypeScript Compiler API wrapper).

**Key Capabilities:**
- Parse TypeScript source into queryable AST
- Transform code (add/remove/modify declarations)
- Analyze code structure and detect issues
- Compare structures for diff detection
- Format code with Prettier integration
- Generate documentation and metadata

---

## Parsing

### Parse Source Code

```typescript
import { parseSource } from '@dcyfr/ai-code-gen';

const source = `
import { User } from './types';

export class UserService {
  private users: User[] = [];

  async getUser(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }
}
`;

const ast = parseSource(source);

console.log(ast.classes);
// [{
//   name: 'UserService',
//   isExported: true,
//   properties: [{ name: 'users', type: 'User[]', isPrivate: true }],
//   methods: [{ name: 'getUser', parameters: [...], returnType: 'Promise<User | null>' }]
// }]

console.log(ast.imports);
// [{ moduleSpecifier: './types', namedImports: ['User'] }]

console.log(ast.exports);
// [{ name: 'UserService', kind: 'class' }]
```

### Parse File

```typescript
import { parseFile } from '@dcyfr/ai-code-gen';

const ast = await parseFile('src/services/user-service.ts');

// Same structure as parseSource
console.log(ast.functions);
console.log(ast.interfaces);
console.log(ast.types);
```

### AST Structure

The parsed AST contains:

```typescript
interface ParsedAST {
  // Declarations
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  functions: FunctionInfo[];
  types: TypeAliasInfo[];
  enums: EnumInfo[];
  variables: VariableInfo[];
  
  // Imports/Exports
  imports: ImportInfo[];
  exports: ExportInfo[];
  
  // Metrics
  metrics: {
    lines: number;
    classes: number;
    functions: number;
    interfaces: number;
    // ... more metrics
  };
}
```

---

## Transformations

### Add Import

```typescript
import { transform } from '@dcyfr/ai-code-gen';

const source = `
export function processData(data: any) {
  return data;
}
`;

const result = transform(source, [
  {
    type: 'add-import',
    moduleSpecifier: 'zod',
    namedImports: ['z'],
  },
]);

console.log(result.source);
```

**Output:**
```typescript
import { z } from 'zod';

export function processData(data: any) {
  return data;
}
```

### Remove Import

```typescript
const source = `
import { unused } from 'unused-lib';
import { User } from './types';

export const user: User = { id: '1', name: 'John' };
`;

const result = transform(source, [
  {
    type: 'remove-import',
    moduleSpecifier: 'unused-lib',
  },
]);
```

**Output:**
```typescript
import { User } from './types';

export const user: User = { id: '1', name: 'John' };
```

### Add Property to Class

```typescript
const source = `
export class User {
  name: string;
}
`;

const result = transform(source, [
  {
    type: 'add-property',
    className: 'User',
    propertyName: 'email',
    propertyType: 'string',
    isOptional: false,
  },
  {
    type: 'add-property',
    className: 'User',
    propertyName: 'age',
    propertyType: 'number',
    isOptional: true,
  },
]);
```

**Output:**
```typescript
export class User {
  name: string;
  email: string;
  age?: number;
}
```

### Add Method to Class

```typescript
const source = `
export class UserService {
  private users: User[] = [];
}
`;

const result = transform(source, [
  {
    type: 'add-method',
    className: 'UserService',
    methodName: 'getAll',
    returnType: 'User[]',
    body: 'return this.users;',
  },
  {
    type: 'add-method',
    className: 'UserService',
    methodName: 'getById',
    parameters: [{ name: 'id', type: 'string' }],
    returnType: 'User | undefined',
    body: 'return this.users.find(u => u.id === id);',
    isAsync: true,
  },
]);
```

**Output:**
```typescript
export class UserService {
  private users: User[] = [];

  getAll(): User[] {
    return this.users;
  }

  async getById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
```

### Rename Identifier

```typescript
const source = `
export function oldName(param: string) {
  console.log(oldName);
  return oldName(param);
}
`;

const result = transform(source, [
  {
    type: 'rename',
    oldName: 'oldName',
    newName: 'newName',
  },
]);
```

**Output:**
```typescript
export function newName(param: string) {
  console.log(newName);
  return newName(param);
}
```

### Add Export

```typescript
const source = `
interface User {
  id: string;
  name: string;
}

function createUser(): User {
  return { id: '1', name: 'John' };
}
`;

const result = transform(source, [
  { type: 'add-export', exportName: 'User' },
  { type: 'add-export', exportName: 'createUser' },
]);
```

**Output:**
```typescript
export interface User {
  id: string;
  name: string;
}

export function createUser(): User {
  return { id: '1', name: 'John' };
}
```

### Chain Multiple Transformations

```typescript
const source = `
class User {
  name: string;
}
`;

const result = transform(source, [
  // Add imports
  { type: 'add-import', moduleSpecifier: 'zod', namedImports: ['z'] },
  
  // Add property
  { type: 'add-property', className: 'User', propertyName: 'email', propertyType: 'string' },
  
  // Add method
  {
    type: 'add-method',
    className: 'User',
    methodName: 'validate',
    returnType: 'boolean',
    body: 'return !!this.name && !!this.email;',
  },
  
  // Export the class
  { type: 'add-export', exportName: 'User' },
]);
```

**Output:**
```typescript
import { z } from 'zod';

export class User {
  name: string;
  email: string;

  validate(): boolean {
    return !!this.name && !!this.email;
  }
}
```

---

## Advanced Transformations

### Add Interface Property

```typescript
const source = `
export interface User {
  id: string;
}
`;

const result = transform(source, [
  {
    type: 'add-interface-property',
    interfaceName: 'User',
    propertyName: 'name',
    propertyType: 'string',
  },
  {
    type: 'add-interface-property',
    interfaceName: 'User',
    propertyName: 'email',
    propertyType: 'string',
    isOptional: true,
  },
]);
```

**Output:**
```typescript
export interface User {
  id: string;
  name: string;
  email?: string;
}
```

### Add Type Alias

```typescript
const source = `
export interface User {
  id: string;
  name: string;
}
`;

const result = transform(source, [
  {
    type: 'add-type-alias',
    typeName: 'UserId',
    typeDefinition: 'string',
  },
  {
    type: 'add-type-alias',
    typeName: 'UserStatus',
    typeDefinition: '"active" | "inactive" | "pending"',
  },
]);
```

**Output:**
```typescript
export interface User {
  id: string;
  name: string;
}

type UserId = string;
type UserStatus = "active" | "inactive" | "pending";
```

### Wrap in Namespace

```typescript
const source = `
export interface User {
  id: string;
}

export function createUser(): User {
  return { id: '1' };
}
`;

const result = transform(source, [
  {
    type: 'wrap-namespace',
    namespaceName: 'UserModule',
    declarations: ['User', 'createUser'],
  },
]);
```

**Output:**
```typescript
export namespace UserModule {
  export interface User {
    id: string;
  }

  export function createUser(): User {
    return { id: '1' };
  }
}
```

---

## Code Analysis

### Analyze Code Quality

```typescript
import { analyzeCode } from '@dcyfr/ai-code-gen';

const source = `
function processData(input: any) {
  console.log(input);
  
  if (input.a) {
    if (input.b) {
      if (input.c) {
        if (input.d) {
          if (input.e) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}
`;

const analysis = analyzeCode(source);

console.log(analysis.issues);
```

**Output:**
```json
[
  {
    "type": "any-type",
    "severity": "warning",
    "message": "Avoid using 'any' type",
    "line": 1,
    "suggestion": "Use specific type or 'unknown'"
  },
  {
    "type": "console-log",
    "severity": "warning",
    "message": "Console.log detected",
    "line": 2,
    "suggestion": "Use proper logging or remove"
  },
  {
    "type": "high-complexity",
    "severity": "error",
    "message": "Cyclomatic complexity too high (6 > 5)",
    "line": 1,
    "suggestion": "Refactor into smaller functions"
  }
]
```

### Issue Types Detected

The analyzer detects:

- **any-type** - Usage of `any` type (should use specific types)
- **console-log** - Console.log statements (use proper logging)
- **dead-code** - Unreachable code or unused declarations
- **high-complexity** - Cyclomatic complexity > 5
- **long-function** - Functions > 50 lines
- **missing-jsdoc** - Exported functions without JSDoc
- **naming-convention** - PascalCase classes, camelCase functions, etc.
- **large-file** - Files > 500 lines

### Complexity Analysis

```typescript
import { calculateComplexity } from '@dcyfr/ai-code-gen';

const source = `
function complexFunction(a: number, b: number) {
  if (a > 0) {  // +1
    if (b > 0) {  // +1
      return a + b;
    } else if (b < 0) {  // +1
      return a - b;
    }
  } else if (a < 0) {  // +1
    return -a;
  }
  return 0;
}
`;

const complexity = calculateComplexity(source);
console.log(complexity);
// { total: 4, functions: [{ name: 'complexFunction', complexity: 4 }] }
```

---

## Structure Comparison

### Compare Two Versions

```typescript
import { compareStructure } from '@dcyfr/ai-code-gen';

const oldSource = `
export interface User {
  id: string;
  name: string;
}

export function getUser() {}
`;

const newSource = `
export interface User {
  id: string;
  name: string;
  email: string;  // Added
}

export function getUser() {}
export function createUser() {}  // Added
`;

const diff = compareStructure(oldSource, newSource);

console.log(diff.added);
// [{ kind: 'interface-property', name: 'User.email' }, { kind: 'function', name: 'createUser' }]

console.log(diff.removed);
// []

console.log(diff.modified);
// []
```

### Diff Report

```typescript
const report = diff.generateReport();

console.log(report);
```

**Output:**
```
Structure Changes:
==================

Added (2):
  - interface-property: User.email
  - function: createUser

Removed (0):

Modified (0):

Summary: 2 additions, 0 removals, 0 modifications
```

---

## Code Formatting

### Format TypeScript

```typescript
import { formatTypeScript } from '@dcyfr/ai-code-gen';

const messy = `
export   function     test (  x: number  ,y :string) :   boolean{return   true;}
`;

const formatted = formatTypeScript(messy, {
  singleQuote: true,
  tabWidth: 2,
  semi: true,
  printWidth: 100,
});

console.log(formatted);
```

**Output:**
```typescript
export function test(x: number, y: string): boolean {
  return true;
}
```

### Add License Header

```typescript
import { addLicenseHeader } from '@dcyfr/ai-code-gen';

const source = `
export function myFunction() {}
`;

const withLicense = addLicenseHeader(source, 'MIT', 2026);

console.log(withLicense);
```

**Output:**
```typescript
/**
 * Copyright (c) 2026
 * Licensed under the MIT License
 */

export function myFunction() {}
```

### Generate JSDoc

```typescript
import { generateJsDoc } from '@dcyfr/ai-code-gen';

const jsDoc = generateJsDoc({
  description: 'Processes user data and returns validation result',
  params: [
    { name: 'userId', type: 'string', description: 'The user ID' },
    { name: 'data', type: 'UserData', description: 'User data to process' },
  ],
  returns: { type: 'Promise<boolean>', description: 'True if valid' },
  examples: [
    'const result = await processUser("123", { name: "John" });',
  ],
});

console.log(jsDoc);
```

**Output:**
```typescript
/**
 * Processes user data and returns validation result
 * 
 * @param userId - The user ID
 * @param data - User data to process
 * @returns True if valid
 * 
 * @example
 * const result = await processUser("123", { name: "John" });
 */
```

---

## Custom Transformers

### Create Custom Transformer

```typescript
import { TransformationRule } from '@dcyfr/ai-code-gen';

// Add 'use client' directive to React components
const addUseClientTransformer: TransformationRule = {
  type: 'custom',
  name: 'add-use-client',
  transform: (project, sourceFile) => {
    // Check if file has React component
    const hasComponent = sourceFile.getFunctions().some(fn => {
      const returnType = fn.getReturnType().getText();
      return returnType.includes('JSX.Element') || returnType.includes('ReactElement');
    });

    if (hasComponent) {
      // Add 'use client' at the top
      sourceFile.insertStatements(0, "'use client';\n");
    }

    return sourceFile.getText();
  },
};

// Use custom transformer
const result = transform(source, [addUseClientTransformer]);
```

### Add Dependency Injection

```typescript
const addDITransformer: TransformationRule = {
  type: 'custom',
  name: 'add-dependency-injection',
  transform: (project, sourceFile) => {
    const classes = sourceFile.getClasses();

    for (const cls of classes) {
      // Find constructor
      let constructor = cls.getConstructors()[0];

      if (!constructor) {
        // Add constructor if not exists
        constructor = cls.addConstructor();
      }

      // Add @injectable decorator to class
      if (!cls.getDecorator('injectable')) {
        sourceFile.addImportDeclaration({
          moduleSpecifier: 'inversify',
          namedImports: ['injectable', 'inject'],
        });
        cls.addDecorator({ name: 'injectable', arguments: [] });
      }

      // Add @inject decorators to constructor parameters
      const params = constructor.getParameters();
      params.forEach((param, index) => {
        if (!param.getDecorator('inject')) {
          param.addDecorator({
            name: 'inject',
            arguments: [`TYPES.${param.getType().getText()}`],
          });
        }
      });
    }

    return sourceFile.getText();
  },
};
```

### Migrate Class to Functional Component

```typescript
const classToFunctionTransformer: TransformationRule = {
  type: 'custom',
  name: 'class-to-function-component',
  transform: (project, sourceFile) => {
    const classes = sourceFile.getClasses();

    for (const cls of classes) {
      const name = cls.getName();
      if (!name) continue;

      // Get render method
      const renderMethod = cls.getMethod('render');
      if (!renderMethod) continue;

      // Get state from constructor
      const constructor = cls.getConstructors()[0];
      const stateVars: Array<{ name: string; initialValue: string }> = [];

      if (constructor) {
        // Parse this.state = { ... }
        const body = constructor.getBodyText() || '';
        const stateMatch = body.match(/this\.state\s*=\s*({[^}]+})/);
        if (stateMatch) {
          // Extract state variables (simplified)
          const stateObj = stateMatch[1];
          // ... parse state ...
        }
      }

      // Generate functional component
      let functionCode = `function ${name}(props: ${name}Props) {\n`;

      // Add useState hooks
      for (const stateVar of stateVars) {
        functionCode += `  const [${stateVar.name}, set${capitalize(stateVar.name)}] = useState(${stateVar.initialValue});\n`;
      }

      // Add render logic
      const renderBody = renderMethod.getBodyText();
      functionCode += `\n  return ${renderBody};\n`;
      functionCode += `}\n`;

      // Replace class with function
      cls.remove();
      sourceFile.addStatements(functionCode);
    }

    return sourceFile.getText();
  },
};
```

---

## Metadata Extraction

### Extract Type Information

```typescript
import { extractTypeInfo } from '@dcyfr/ai-code-gen';

const source = `
export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  metadata: Record<string, any>;
}
`;

const typeInfo = extractTypeInfo(source, 'User');

console.log(typeInfo);
```

**Output:**
```json
{
  "name": "User",
  "kind": "interface",
  "properties": [
    { "name": "id", "type": "string", "required": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": true },
    { "name": "roles", "type": "Role[]", "required": true },
    { "name": "metadata", "type": "Record<string, any>", "required": true }
  ]
}
```

### Extract Function Signatures

```typescript
import { extractFunctionSignatures } from '@dcyfr/ai-code-gen';

const source = `
export async function getUser(id: string): Promise<User> {
  return { id, name: 'John' };
}

export function createUser(data: CreateUserDto): User {
  return { id: '1', ...data };
}
`;

const signatures = extractFunctionSignatures(source);

console.log(signatures);
```

**Output:**
```json
[
  {
    "name": "getUser",
    "parameters": [{ "name": "id", "type": "string" }],
    "returnType": "Promise<User>",
    "isAsync": true,
    "isExported": true
  },
  {
    "name": "createUser",
    "parameters": [{ "name": "data", "type": "CreateUserDto" }],
    "returnType": "User",
    "isAsync": false,
    "isExported": true
  }
]
```

---

## Best Practices

1. **Parse Once, Transform Multiple Times**
   ```typescript
   // ❌ BAD - Parses on every transform
   let source = originalSource;
   source = transform(source, [rule1]).source;
   source = transform(source, [rule2]).source;
   
   // ✅ GOOD - Parse once, apply all rules
   const result = transform(originalSource, [rule1, rule2]);
   ```

2. **Validate Before Transforming**
   ```typescript
   // Check if class exists before adding method
   const ast = parseSource(source);
   if (ast.classes.some(c => c.name === 'User')) {
     transform(source, [{ type: 'add-method', className: 'User', ... }]);
   }
   ```

3. **Use Type-Safe Transformations**
   ```typescript
   // Prefer specific transformation types
   { type: 'add-import', moduleSpecifier: '...', namedImports: [...] }
   
   // Over generic custom transformers
   { type: 'custom', transform: (project, file) => { ... } }
   ```

4. **Format After Transforming**
   ```typescript
   const result = transform(source, rules);
   const formatted = formatTypeScript(result.source);
   ```

5. **Handle Errors Gracefully**
   ```typescript
   try {
     const result = transform(source, rules);
   } catch (error) {
     if (error.message.includes('Class not found')) {
       // Handle missing class
     }
   }
   ```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
