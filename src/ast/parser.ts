/**
 * @dcyfr/ai-code-gen - TypeScript AST Parser
 *
 * Parses TypeScript source files into simplified AST node representations
 * using ts-morph for reliable AST access.
 */

import { Project, SyntaxKind, type SourceFile, type Node } from 'ts-morph';
import type { ASTNode, ASTNodeKind, ImportInfo, ExportInfo, AnalysisResult } from '../types/index.js';

/**
 * Parse a TypeScript source string into an AnalysisResult.
 */
export function parseSource(source: string, filePath = 'source.ts'): AnalysisResult {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(filePath, source);
  return analyzeSourceFile(sourceFile, filePath);
}

/**
 * Parse a TypeScript file from disk into an AnalysisResult.
 */
export function parseFile(filePath: string): AnalysisResult {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);
  return analyzeSourceFile(sourceFile, filePath);
}

/**
 * Analyze a ts-morph SourceFile into our simplified representation.
 */
function analyzeSourceFile(sourceFile: SourceFile, filePath: string): AnalysisResult {
  const nodes: ASTNode[] = [];
  const imports = extractImports(sourceFile);
  const exports = extractExports(sourceFile);

  // Extract classes
  for (const cls of sourceFile.getClasses()) {
    const children: ASTNode[] = [];

    for (const method of cls.getMethods()) {
      children.push({
        kind: 'method',
        name: method.getName(),
        startLine: method.getStartLineNumber(),
        endLine: method.getEndLineNumber(),
        isExported: false,
        jsdoc: getJsDoc(method),
        children: [],
        metadata: {
          isStatic: method.isStatic(),
          isAsync: method.isAsync(),
          parameters: method.getParameters().map((p) => p.getName()),
          returnType: method.getReturnType().getText(),
        },
      });
    }

    for (const prop of cls.getProperties()) {
      children.push({
        kind: 'property',
        name: prop.getName(),
        startLine: prop.getStartLineNumber(),
        endLine: prop.getEndLineNumber(),
        isExported: false,
        children: [],
        metadata: {
          isStatic: prop.isStatic(),
          isReadonly: prop.isReadonly(),
          type: prop.getType().getText(),
        },
      });
    }

    nodes.push({
      kind: 'class',
      name: cls.getName() ?? '<anonymous>',
      startLine: cls.getStartLineNumber(),
      endLine: cls.getEndLineNumber(),
      isExported: cls.isExported(),
      jsdoc: getJsDoc(cls),
      children,
      metadata: {
        isAbstract: cls.isAbstract(),
        extends: cls.getExtends()?.getText(),
        implements: cls.getImplements().map((i) => i.getText()),
      },
    });
  }

  // Extract interfaces
  for (const iface of sourceFile.getInterfaces()) {
    const children: ASTNode[] = iface.getProperties().map((prop) => ({
      kind: 'property' as ASTNodeKind,
      name: prop.getName(),
      startLine: prop.getStartLineNumber(),
      endLine: prop.getEndLineNumber(),
      isExported: false,
      children: [],
      metadata: {
        type: prop.getType().getText(),
        isOptional: prop.hasQuestionToken(),
      },
    }));

    nodes.push({
      kind: 'interface',
      name: iface.getName(),
      startLine: iface.getStartLineNumber(),
      endLine: iface.getEndLineNumber(),
      isExported: iface.isExported(),
      jsdoc: getJsDoc(iface),
      children,
      metadata: {
        extends: iface.getExtends().map((e) => e.getText()),
      },
    });
  }

  // Extract functions
  for (const fn of sourceFile.getFunctions()) {
    nodes.push({
      kind: 'function',
      name: fn.getName() ?? '<anonymous>',
      startLine: fn.getStartLineNumber(),
      endLine: fn.getEndLineNumber(),
      isExported: fn.isExported(),
      jsdoc: getJsDoc(fn),
      children: [],
      metadata: {
        isAsync: fn.isAsync(),
        isGenerator: fn.isGenerator(),
        parameters: fn.getParameters().map((p) => ({
          name: p.getName(),
          type: p.getType().getText(),
        })),
        returnType: fn.getReturnType().getText(),
      },
    });
  }

  // Extract type aliases
  for (const typeAlias of sourceFile.getTypeAliases()) {
    nodes.push({
      kind: 'type-alias',
      name: typeAlias.getName(),
      startLine: typeAlias.getStartLineNumber(),
      endLine: typeAlias.getEndLineNumber(),
      isExported: typeAlias.isExported(),
      jsdoc: getJsDoc(typeAlias),
      children: [],
      metadata: {
        type: typeAlias.getType().getText(),
      },
    });
  }

  // Extract enums
  for (const enumDecl of sourceFile.getEnums()) {
    nodes.push({
      kind: 'enum',
      name: enumDecl.getName(),
      startLine: enumDecl.getStartLineNumber(),
      endLine: enumDecl.getEndLineNumber(),
      isExported: enumDecl.isExported(),
      jsdoc: getJsDoc(enumDecl),
      children: [],
      metadata: {
        members: enumDecl.getMembers().map((m) => m.getName()),
        isConst: enumDecl.isConstEnum(),
      },
    });
  }

  // Extract top-level variable declarations
  for (const varStmt of sourceFile.getVariableStatements()) {
    for (const decl of varStmt.getDeclarations()) {
      nodes.push({
        kind: 'variable',
        name: decl.getName(),
        startLine: varStmt.getStartLineNumber(),
        endLine: varStmt.getEndLineNumber(),
        isExported: varStmt.isExported(),
        children: [],
        metadata: {
          declarationKind: varStmt.getDeclarationKind(),
          type: decl.getType().getText(),
        },
      });
    }
  }

  // Compute metrics
  const metrics = {
    linesOfCode: sourceFile.getEndLineNumber(),
    functionCount: nodes.filter((n) => n.kind === 'function').length,
    classCount: nodes.filter((n) => n.kind === 'class').length,
    importCount: imports.length,
    exportCount: exports.length,
    cyclomaticComplexity: estimateCyclomaticComplexity(sourceFile),
  };

  return { filePath, nodes, imports, exports, metrics };
}

/**
 * Extract import information from a source file.
 */
function extractImports(sourceFile: SourceFile): ImportInfo[] {
  return sourceFile.getImportDeclarations().map((imp) => ({
    moduleSpecifier: imp.getModuleSpecifierValue(),
    namedImports: imp.getNamedImports().map((n) => n.getName()),
    defaultImport: imp.getDefaultImport()?.getText(),
    namespaceImport: imp.getNamespaceImport()?.getText(),
    isTypeOnly: imp.isTypeOnly(),
  }));
}

/**
 * Extract export information from a source file.
 */
function extractExports(sourceFile: SourceFile): ExportInfo[] {
  const exports: ExportInfo[] = [];

  // Named exports
  for (const exp of sourceFile.getExportDeclarations()) {
    for (const named of exp.getNamedExports()) {
      exports.push({
        name: named.getName(),
        isDefault: false,
        isTypeOnly: exp.isTypeOnly(),
        isReExport: !!exp.getModuleSpecifierValue(),
        sourceModule: exp.getModuleSpecifierValue() ?? undefined,
      });
    }
  }

  // Default export
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    exports.push({
      name: defaultExport.getName(),
      isDefault: true,
      isTypeOnly: false,
      isReExport: false,
    });
  }

  // Export assignments (export =, export default ...)
  const exportAssignment = sourceFile.getExportAssignment((e) => !e.isExportEquals());
  if (exportAssignment) {
    exports.push({
      name: 'default',
      isDefault: true,
      isTypeOnly: false,
      isReExport: false,
    });
  }

  return exports;
}

/**
 * Get JSDoc comment from a node.
 */
function getJsDoc(node: Node): string | undefined {
  const jsDocs = (node as { getJsDocs?: () => { getDescription: () => string }[] }).getJsDocs?.();
  if (jsDocs && jsDocs.length > 0) {
    return jsDocs[0].getDescription().trim();
  }
  return undefined;
}

/**
 * Estimate cyclomatic complexity of a source file.
 * Counts decision points: if, for, while, case, catch, &&, ||, ternary
 */
function estimateCyclomaticComplexity(sourceFile: SourceFile): number {
  let complexity = 1; // Base complexity

  sourceFile.forEachDescendant((node) => {
    switch (node.getKind()) {
      case SyntaxKind.IfStatement:
      case SyntaxKind.ForStatement:
      case SyntaxKind.ForInStatement:
      case SyntaxKind.ForOfStatement:
      case SyntaxKind.WhileStatement:
      case SyntaxKind.DoStatement:
      case SyntaxKind.CaseClause:
      case SyntaxKind.CatchClause:
      case SyntaxKind.ConditionalExpression:
        complexity++;
        break;
      case SyntaxKind.BinaryExpression: {
        const opKind = node.getChildAtIndex(1)?.getKind();
        if (
          opKind === SyntaxKind.AmpersandAmpersandToken ||
          opKind === SyntaxKind.BarBarToken
        ) {
          complexity++;
        }
        break;
      }
    }
  });

  return complexity;
}
