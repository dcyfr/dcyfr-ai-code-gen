/**
 * @dcyfr/ai-code-gen - Core type definitions
 *
 * All interfaces and types for the code generation toolkit.
 */

// ─── Generator Types ────────────────────────────────────────────────

/** Supported generator categories */
export type GeneratorCategory = 'component' | 'api-route' | 'model' | 'test' | 'custom';

/** Generator metadata */
export interface GeneratorMeta {
  /** Unique generator identifier */
  name: string;
  /** Human-readable description */
  description: string;
  /** Generator category */
  category: GeneratorCategory;
  /** Version string */
  version: string;
  /** Author or maintainer */
  author?: string;
}

/** Single file output from a generator */
export interface GeneratedFile {
  /** Relative path for the output file */
  path: string;
  /** Generated file content */
  content: string;
  /** Whether to overwrite if file exists */
  overwrite?: boolean;
}

/** Result of a generation run */
export interface GenerationResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Files generated */
  files: GeneratedFile[];
  /** Generator metadata */
  generator: GeneratorMeta;
  /** Duration in ms */
  durationMs: number;
  /** Errors encountered */
  errors: GenerationError[];
  /** Warnings */
  warnings: string[];
}

/** Generation error */
export interface GenerationError {
  /** Error message */
  message: string;
  /** File that caused the error */
  file?: string;
  /** Line number */
  line?: number;
  /** Error code */
  code?: string;
}

/** Generator configuration input */
export interface GeneratorConfig {
  /** Name of the item to generate (e.g., component name) */
  name: string;
  /** Output directory */
  outputDir: string;
  /** Template to use */
  template?: string;
  /** Additional options (generator-specific) */
  options?: Record<string, unknown>;
}

/** Generator interface - all generators implement this */
export interface Generator {
  /** Generator metadata */
  readonly meta: GeneratorMeta;
  /** Generate files from config */
  generate(config: GeneratorConfig): Promise<GenerationResult>;
  /** Validate config before generation */
  validate(config: GeneratorConfig): ValidationResult;
}

// ─── Template Types ─────────────────────────────────────────────────

/** Template variable definition */
export interface TemplateVariable {
  /** Variable name */
  name: string;
  /** Type constraint */
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  /** Description */
  description: string;
  /** Default value */
  defaultValue?: unknown;
  /** Whether required */
  required: boolean;
}

/** Template definition */
export interface TemplateDefinition {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template content (Handlebars) */
  source: string;
  /** Variables used in template */
  variables: TemplateVariable[];
  /** File extension for output */
  outputExtension: string;
}

/** Template rendering context */
export interface TemplateContext {
  /** Template variables */
  [key: string]: unknown;
}

/** Template render result */
export interface TemplateRenderResult {
  /** Rendered content */
  content: string;
  /** Template ID */
  templateId: string;
  /** Variables used */
  variables: Record<string, unknown>;
}

// ─── AST Types ──────────────────────────────────────────────────────

/** AST node kind (simplified categories) */
export type ASTNodeKind =
  | 'class'
  | 'interface'
  | 'function'
  | 'variable'
  | 'type-alias'
  | 'enum'
  | 'import'
  | 'export'
  | 'method'
  | 'property';

/** Simplified AST node representation */
export interface ASTNode {
  /** Node kind */
  kind: ASTNodeKind;
  /** Node name */
  name: string;
  /** Start line (1-based) */
  startLine: number;
  /** End line (1-based) */
  endLine: number;
  /** Whether exported */
  isExported: boolean;
  /** JSDoc comment if present */
  jsdoc?: string;
  /** Child nodes */
  children: ASTNode[];
  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/** Code analysis result */
export interface AnalysisResult {
  /** File path analyzed */
  filePath: string;
  /** Top-level AST nodes */
  nodes: ASTNode[];
  /** Import statements */
  imports: ImportInfo[];
  /** Export statements */
  exports: ExportInfo[];
  /** Complexity metrics */
  metrics: CodeMetrics;
}

/** Import information */
export interface ImportInfo {
  /** Module specifier */
  moduleSpecifier: string;
  /** Named imports */
  namedImports: string[];
  /** Default import name */
  defaultImport?: string;
  /** Namespace import name */
  namespaceImport?: string;
  /** Is type-only import */
  isTypeOnly: boolean;
}

/** Export information */
export interface ExportInfo {
  /** Exported name */
  name: string;
  /** Is default export */
  isDefault: boolean;
  /** Is type-only export */
  isTypeOnly: boolean;
  /** Is re-export */
  isReExport: boolean;
  /** Source module (for re-exports) */
  sourceModule?: string;
}

/** Code complexity metrics */
export interface CodeMetrics {
  /** Lines of code */
  linesOfCode: number;
  /** Number of functions */
  functionCount: number;
  /** Number of classes */
  classCount: number;
  /** Number of imports */
  importCount: number;
  /** Number of exports */
  exportCount: number;
  /** Cyclomatic complexity estimate */
  cyclomaticComplexity: number;
}

// ─── AST Transformation Types ───────────────────────────────────────

/** Transformation operation */
export type TransformOperation =
  | AddImportTransform
  | RemoveImportTransform
  | AddExportTransform
  | AddPropertyTransform
  | AddMethodTransform
  | RenameTransform
  | WrapTransform;

interface BaseTransform {
  type: string;
}

export interface AddImportTransform extends BaseTransform {
  type: 'add-import';
  moduleSpecifier: string;
  namedImports?: string[];
  defaultImport?: string;
  isTypeOnly?: boolean;
}

export interface RemoveImportTransform extends BaseTransform {
  type: 'remove-import';
  moduleSpecifier: string;
  namedImports?: string[];
}

export interface AddExportTransform extends BaseTransform {
  type: 'add-export';
  name: string;
  isDefault?: boolean;
  declaration?: string;
}

export interface AddPropertyTransform extends BaseTransform {
  type: 'add-property';
  targetClass: string;
  propertyName: string;
  propertyType: string;
  initializer?: string;
  isReadonly?: boolean;
}

export interface AddMethodTransform extends BaseTransform {
  type: 'add-method';
  targetClass: string;
  methodName: string;
  parameters: string;
  returnType: string;
  body: string;
}

export interface RenameTransform extends BaseTransform {
  type: 'rename';
  oldName: string;
  newName: string;
  scope?: 'file' | 'class';
  targetClass?: string;
}

export interface WrapTransform extends BaseTransform {
  type: 'wrap';
  targetFunction: string;
  wrapperTemplate: string;
}

/** Transformation result */
export interface TransformResult {
  /** Whether transformation succeeded */
  success: boolean;
  /** Transformed source code */
  source: string;
  /** Operations applied */
  appliedOperations: number;
  /** Operations that failed */
  failedOperations: TransformError[];
}

/** Transformation error */
export interface TransformError {
  /** Operation that failed */
  operation: TransformOperation;
  /** Error message */
  message: string;
}

// ─── AI Code Generation Types ───────────────────────────────────────

/** AI provider configuration */
export interface AIProviderConfig {
  /** Provider name */
  provider: 'openai' | 'anthropic' | 'local' | 'mock';
  /** Model to use */
  model: string;
  /** API key (or env variable name) */
  apiKey?: string;
  /** Maximum tokens */
  maxTokens?: number;
  /** Temperature (0-1) */
  temperature?: number;
  /** Base URL override */
  baseUrl?: string;
}

/** AI generation request */
export interface AICodeRequest {
  /** What to generate */
  prompt: string;
  /** Programming language */
  language: string;
  /** Framework context */
  framework?: string;
  /** Existing code context */
  context?: string;
  /** Constraints */
  constraints?: string[];
  /** Output format */
  outputFormat?: 'code' | 'diff' | 'explanation';
}

/** AI generation response */
export interface AICodeResponse {
  /** Generated code */
  code: string;
  /** Explanation of what was generated */
  explanation: string;
  /** Language detected/used */
  language: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/** Code review finding */
export interface ReviewFinding {
  /** Severity */
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  /** Finding message */
  message: string;
  /** File path */
  file?: string;
  /** Line number */
  line?: number;
  /** Category */
  category: 'security' | 'performance' | 'style' | 'correctness' | 'maintainability';
  /** Suggested fix */
  suggestedFix?: string;
}

/** Code review result */
export interface ReviewResult {
  /** All findings */
  findings: ReviewFinding[];
  /** Summary */
  summary: string;
  /** Overall score (0-100) */
  score: number;
  /** Duration in ms */
  durationMs: number;
}

/** Refactoring suggestion */
export interface RefactorSuggestion {
  /** Description of the refactoring */
  description: string;
  /** Original code */
  original: string;
  /** Refactored code */
  refactored: string;
  /** Rationale */
  rationale: string;
  /** Impact assessment */
  impact: 'low' | 'medium' | 'high';
}

// ─── Validation Types ───────────────────────────────────────────────

/** Validation result */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
}

/** Validation error */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Expected value/type */
  expected?: string;
  /** Received value */
  received?: string;
}

// ─── Configuration Types ────────────────────────────────────────────

/** Global toolkit configuration */
export interface CodeGenConfig {
  /** Default output directory */
  outputDir: string;
  /** Template search paths */
  templatePaths: string[];
  /** AI provider config */
  ai?: AIProviderConfig;
  /** Whether to format output */
  formatOutput: boolean;
  /** Whether to add JSDoc comments */
  addJsdoc: boolean;
  /** Default license header */
  licenseHeader?: string;
  /** Generator overrides */
  generators?: Record<string, Record<string, unknown>>;
}

/** CLI options */
export interface CLIOptions {
  /** Generator to run */
  generator: string;
  /** Name of the item to generate */
  name: string;
  /** Output directory */
  output: string;
  /** Template override */
  template?: string;
  /** Verbose output */
  verbose: boolean;
  /** Dry run (no file writes) */
  dryRun: boolean;
  /** Force overwrite */
  force: boolean;
}
