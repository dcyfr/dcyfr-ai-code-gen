/**
 * @dcyfr/ai-code-gen - Main library entry point
 *
 * Public API for the code generation toolkit.
 */

// Types
export type {
  Generator,
  GeneratorMeta,
  GeneratorConfig,
  GeneratedFile,
  GenerationResult,
  GenerationError,
  GeneratorCategory,
  TemplateDefinition,
  TemplateVariable,
  TemplateContext,
  TemplateRenderResult,
  ASTNode,
  ASTNodeKind,
  ImportInfo,
  ExportInfo,
  AnalysisResult,
  CodeMetrics,
  TransformOperation,
  TransformResult,
  TransformError,
  AddImportTransform,
  RemoveImportTransform,
  AddExportTransform,
  AddPropertyTransform,
  AddMethodTransform,
  RenameTransform,
  WrapTransform,
  AIProviderConfig,
  AICodeRequest,
  AICodeResponse,
  ReviewFinding,
  ReviewResult,
  RefactorSuggestion,
  ValidationResult,
  ValidationError,
  CodeGenConfig,
  CLIOptions,
} from './types/index.js';

// Template engine
export { TemplateEngine, createTemplateEngine, validateTemplateVariables } from './templates/index.js';
export {
  BUILTIN_TEMPLATES,
  REACT_COMPONENT_TEMPLATE,
  API_ROUTE_TEMPLATE,
  DATA_MODEL_TEMPLATE,
  TEST_FILE_TEMPLATE,
  BARREL_EXPORT_TEMPLATE,
} from './templates/index.js';

// Generators
export {
  BaseGenerator,
  ComponentGenerator,
  ApiRouteGenerator,
  ModelGenerator,
  TestGenerator,
  GeneratorRegistry,
  createGeneratorRegistry,
} from './generators/index.js';

// AST
export {
  parseSource,
  parseFile,
  transform,
  analyzeCode,
  compareStructure,
  formatTypeScript,
  addLicenseHeader,
  generateJsDoc,
  generateImport,
  generateExport,
} from './ast/index.js';
export type { AnalysisIssue, AnalysisReport } from './ast/index.js';

// AI
export {
  AICodeGenerator,
  createAICodeGenerator,
  MockAIProvider,
  createAIProvider,
  generateCodePrompt,
  reviewCodePrompt,
  refactorCodePrompt,
  generateDocsPrompt,
} from './ai/index.js';
export type { AIProvider } from './ai/index.js';

// Utilities
export { loadConfig, validateConfig } from './lib/config.js';
export { createLogger, createSilentLogger } from './lib/logger.js';
export type { Logger, LogLevel } from './lib/logger.js';
export {
  ensureDir,
  writeGeneratedFile,
  readFileContents,
  fileExists,
  listTypeScriptFiles,
  getRelativePath,
} from './lib/file-system.js';
export {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toConstantCase,
  pluralize,
  indent,
  dedent,
} from './lib/strings.js';
