/**
 * @dcyfr/ai-code-gen - Code Analyzer
 *
 * Static analysis utilities for TypeScript source code.
 */

import type { AnalysisResult, ASTNode, CodeMetrics } from '../types/index.js';
import { parseSource } from './parser.js';

/** Analysis issue */
export interface AnalysisIssue {
  type: 'dead-code' | 'complexity' | 'naming' | 'missing-jsdoc' | 'large-file';
  severity: 'info' | 'warning' | 'error';
  message: string;
  node?: string;
  line?: number;
}

/** Full analysis report */
export interface AnalysisReport {
  filePath: string;
  issues: AnalysisIssue[];
  metrics: CodeMetrics;
  summary: string;
}

/**
 * Analyze source code and produce a report with issues and metrics.
 */
export function analyzeCode(source: string, filePath = 'source.ts'): AnalysisReport {
  const result = parseSource(source, filePath);
  const issues = detectIssues(result);

  return {
    filePath,
    issues,
    metrics: result.metrics,
    summary: generateSummary(result, issues),
  };
}

/**
 * Detect code issues from an analysis result.
 */
function detectIssues(result: AnalysisResult): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  // Check for large files
  if (result.metrics.linesOfCode > 500) {
    issues.push({
      type: 'large-file',
      severity: 'warning',
      message: `File has ${result.metrics.linesOfCode} lines. Consider splitting into smaller modules.`,
    });
  }

  // Check cyclomatic complexity
  if (result.metrics.cyclomaticComplexity > 20) {
    issues.push({
      type: 'complexity',
      severity: 'warning',
      message: `High cyclomatic complexity: ${result.metrics.cyclomaticComplexity}. Consider refactoring.`,
    });
  }

  // Check for missing JSDoc on exported items
  for (const node of result.nodes) {
    checkNodeIssues(node, issues);
  }

  // Check for unused imports (heuristic: if named import not found in exports/nodes)
  for (const imp of result.imports) {
    if (imp.isTypeOnly) continue; // Type imports are fine

    for (const named of imp.namedImports) {
      const isUsed = result.nodes.some(
        (n) =>
          n.name === named ||
          JSON.stringify(n.metadata).includes(named) ||
          n.children.some((c) => c.name === named),
      );
      if (!isUsed) {
        issues.push({
          type: 'dead-code',
          severity: 'info',
          message: `Import '${named}' from '${imp.moduleSpecifier}' may be unused`,
          node: named,
        });
      }
    }
  }

  return issues;
}

function checkNamingConventions(node: ASTNode, issues: AnalysisIssue[]): void {
  if (node.kind === 'class' || node.kind === 'interface') {
    if (!/^[A-Z]/.test(node.name) && node.name !== '<anonymous>') {
      issues.push({
        type: 'naming',
        severity: 'warning',
        message: `${node.kind} '${node.name}' should start with an uppercase letter`,
        node: node.name,
        line: node.startLine,
      });
    }
  }
}

/**
 * Check a single AST node for issues.
 */
function checkNodeIssues(node: ASTNode, issues: AnalysisIssue[]): void {
  // Missing JSDoc on exported declarations
  if (node.isExported && !node.jsdoc) {
    if (node.kind === 'function' || node.kind === 'class' || node.kind === 'interface') {
      issues.push({
        type: 'missing-jsdoc',
        severity: 'info',
        message: `Exported ${node.kind} '${node.name}' is missing JSDoc documentation`,
        node: node.name,
        line: node.startLine,
      });
    }
  }

  // Check naming conventions
  checkNamingConventions(node, issues);

  // Check children recursively
  for (const child of node.children) {
    checkNodeIssues(child, issues);
  }
}

/**
 * Generate a human-readable summary of the analysis.
 */
function generateSummary(result: AnalysisResult, issues: AnalysisIssue[]): string {
  const m = result.metrics;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  const parts = [
    `${m.linesOfCode} LOC`,
    `${m.functionCount} functions`,
    `${m.classCount} classes`,
    `${m.importCount} imports`,
    `${m.exportCount} exports`,
    `complexity: ${m.cyclomaticComplexity}`,
  ];

  const issueStr = [
    errorCount > 0 ? `${errorCount} errors` : null,
    warningCount > 0 ? `${warningCount} warnings` : null,
    infoCount > 0 ? `${infoCount} info` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return `${parts.join(', ')}${issueStr ? ` | Issues: ${issueStr}` : ' | No issues'}`;
}

/**
 * Compare two source files and identify structural differences.
 */
export function compareStructure(
  sourceA: string,
  sourceB: string,
): {
  added: string[];
  removed: string[];
  modified: string[];
} {
  const resultA = parseSource(sourceA, 'a.ts');
  const resultB = parseSource(sourceB, 'b.ts');

  const namesA = new Set(resultA.nodes.map((n) => `${n.kind}:${n.name}`));
  const namesB = new Set(resultB.nodes.map((n) => `${n.kind}:${n.name}`));

  const added = [...namesB].filter((n) => !namesA.has(n));
  const removed = [...namesA].filter((n) => !namesB.has(n));

  // Nodes present in both but with different line counts (rough heuristic)
  const common = [...namesA].filter((n) => namesB.has(n));
  const modified = common.filter((key) => {
    const nodeA = resultA.nodes.find((n) => `${n.kind}:${n.name}` === key);
    const nodeB = resultB.nodes.find((n) => `${n.kind}:${n.name}` === key);
    if (!nodeA || !nodeB) return false;
    const sizeA = nodeA.endLine - nodeA.startLine;
    const sizeB = nodeB.endLine - nodeB.startLine;
    return Math.abs(sizeA - sizeB) > 2;
  });

  return { added, removed, modified };
}
