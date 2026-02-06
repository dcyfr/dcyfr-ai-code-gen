/**
 * @dcyfr/ai-code-gen - AST Transformer
 *
 * Apply transformations to TypeScript source code using ts-morph.
 */

import { Project, type SourceFile } from 'ts-morph';
import type {
  TransformOperation,
  TransformResult,
  TransformError,
  AddImportTransform,
  RemoveImportTransform,
  AddExportTransform,
  AddPropertyTransform,
  AddMethodTransform,
  RenameTransform,
} from '../types/index.js';

/**
 * Apply a series of transformations to source code.
 */
export function transform(source: string, operations: TransformOperation[]): TransformResult {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('transform.ts', source);

  let appliedCount = 0;
  const failures: TransformError[] = [];

  for (const op of operations) {
    try {
      applyOperation(sourceFile, op);
      appliedCount++;
    } catch (error) {
      failures.push({
        operation: op,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    success: failures.length === 0,
    source: sourceFile.getFullText(),
    appliedOperations: appliedCount,
    failedOperations: failures,
  };
}

/**
 * Apply a single transformation operation.
 */
function applyOperation(sourceFile: SourceFile, op: TransformOperation): void {
  switch (op.type) {
    case 'add-import':
      applyAddImport(sourceFile, op);
      break;
    case 'remove-import':
      applyRemoveImport(sourceFile, op);
      break;
    case 'add-export':
      applyAddExport(sourceFile, op);
      break;
    case 'add-property':
      applyAddProperty(sourceFile, op);
      break;
    case 'add-method':
      applyAddMethod(sourceFile, op);
      break;
    case 'rename':
      applyRename(sourceFile, op);
      break;
    case 'wrap':
      throw new Error('Wrap transform not yet implemented');
    default:
      throw new Error(`Unknown transform type: ${(op as TransformOperation).type}`);
  }
}

function applyAddImport(sourceFile: SourceFile, op: AddImportTransform): void {
  // Check if import already exists
  const existing = sourceFile.getImportDeclaration(op.moduleSpecifier);

  if (existing && op.namedImports) {
    // Add named imports to existing declaration
    const existingNames = existing.getNamedImports().map((n) => n.getName());
    const newNames = op.namedImports.filter((n) => !existingNames.includes(n));
    if (newNames.length > 0) {
      existing.addNamedImports(newNames);
    }
  } else if (!existing) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: op.moduleSpecifier,
      namedImports: op.namedImports,
      defaultImport: op.defaultImport,
      isTypeOnly: op.isTypeOnly ?? false,
    });
  }
}

function applyRemoveImport(sourceFile: SourceFile, op: RemoveImportTransform): void {
  const existing = sourceFile.getImportDeclaration(op.moduleSpecifier);
  if (!existing) return;

  if (op.namedImports && op.namedImports.length > 0) {
    // Remove specific named imports
    for (const name of op.namedImports) {
      const namedImport = existing.getNamedImports().find((n) => n.getName() === name);
      namedImport?.remove();
    }
    // If no named imports left, remove the entire declaration
    if (existing.getNamedImports().length === 0 && !existing.getDefaultImport()) {
      existing.remove();
    }
  } else {
    // Remove the entire import declaration
    existing.remove();
  }
}

function applyAddExport(sourceFile: SourceFile, op: AddExportTransform): void {
  if (op.declaration) {
    // Add an export declaration with inline code
    sourceFile.addStatements(`\nexport ${op.isDefault ? 'default ' : ''}${op.declaration}`);
  } else {
    // Add a named export for an existing declaration
    sourceFile.addExportDeclaration({
      namedExports: [op.name],
    });
  }
}

function applyAddProperty(sourceFile: SourceFile, op: AddPropertyTransform): void {
  const cls = sourceFile.getClass(op.targetClass);
  if (!cls) {
    throw new Error(`Class '${op.targetClass}' not found`);
  }

  cls.addProperty({
    name: op.propertyName,
    type: op.propertyType,
    initializer: op.initializer,
    isReadonly: op.isReadonly,
  });
}

function applyAddMethod(sourceFile: SourceFile, op: AddMethodTransform): void {
  const cls = sourceFile.getClass(op.targetClass);
  if (!cls) {
    throw new Error(`Class '${op.targetClass}' not found`);
  }

  cls.addMethod({
    name: op.methodName,
    returnType: op.returnType,
    statements: op.body,
    parameters: parseParameterString(op.parameters),
  });
}

function applyRename(sourceFile: SourceFile, op: RenameTransform): void {
  if (op.scope === 'class' && op.targetClass) {
    const cls = sourceFile.getClass(op.targetClass);
    if (!cls) {
      throw new Error(`Class '${op.targetClass}' not found`);
    }
    const method = cls.getMethod(op.oldName);
    if (method) {
      method.rename(op.newName);
      return;
    }
    const prop = cls.getProperty(op.oldName);
    if (prop) {
      prop.rename(op.newName);
      return;
    }
    throw new Error(`Symbol '${op.oldName}' not found in class '${op.targetClass}'`);
  }

  // File-level rename
  const fn = sourceFile.getFunction(op.oldName);
  if (fn) {
    fn.rename(op.newName);
    return;
  }
  const cls = sourceFile.getClass(op.oldName);
  if (cls) {
    cls.rename(op.newName);
    return;
  }
  const iface = sourceFile.getInterface(op.oldName);
  if (iface) {
    iface.rename(op.newName);
    return;
  }
  const typeAlias = sourceFile.getTypeAlias(op.oldName);
  if (typeAlias) {
    typeAlias.rename(op.newName);
    return;
  }

  throw new Error(`Symbol '${op.oldName}' not found at file scope`);
}

/**
 * Parse a parameter string like "name: string, age: number" into ts-morph parameter structures.
 */
function parseParameterString(params: string): Array<{ name: string; type: string }> {
  if (!params.trim()) return [];

  return params.split(',').map((p) => {
    const parts = p.trim().split(':').map((s) => s.trim());
    return {
      name: parts[0],
      type: parts[1] ?? 'unknown',
    };
  });
}
