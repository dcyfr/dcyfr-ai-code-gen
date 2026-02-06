/**
 * @dcyfr/ai-code-gen - AST module exports
 */

export { parseSource, parseFile } from './parser.js';
export { transform } from './transformer.js';
export { analyzeCode, compareStructure } from './analyzer.js';
export type { AnalysisIssue, AnalysisReport } from './analyzer.js';
export {
  formatTypeScript,
  addLicenseHeader,
  generateJsDoc,
  generateImport,
  generateExport,
} from './printer.js';
