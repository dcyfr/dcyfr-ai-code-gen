/**
 * @dcyfr/ai-code-gen - Base generator
 *
 * Abstract base class for all code generators.
 */

import type {
  Generator,
  GeneratorMeta,
  GeneratorConfig,
  GenerationResult,
  GeneratedFile,
  GenerationError,
  ValidationResult,
  ValidationError,
} from '../types/index.js';
import { TemplateEngine } from '../templates/engine.js';
import type { TemplateContext } from '../types/index.js';

/** Abstract base generator that concrete generators extend */
export abstract class BaseGenerator implements Generator {
  abstract readonly meta: GeneratorMeta;

  protected readonly templateEngine: TemplateEngine;

  constructor(templateEngine: TemplateEngine) {
    this.templateEngine = templateEngine;
  }

  /** Subclasses implement this to produce files */
  protected abstract generateFiles(config: GeneratorConfig): Promise<GeneratedFile[]>;

  /** Subclasses implement this for validation */
  protected abstract validateConfig(config: GeneratorConfig): ValidationError[];

  async generate(config: GeneratorConfig): Promise<GenerationResult> {
    const start = Date.now();
    const errors: GenerationError[] = [];
    const warnings: string[] = [];

    // Validate first
    const validation = this.validate(config);
    if (!validation.valid) {
      return {
        success: false,
        files: [],
        generator: this.meta,
        durationMs: Date.now() - start,
        errors: validation.errors.map((e) => ({
          message: `${e.field}: ${e.message}`,
        })),
        warnings,
      };
    }

    try {
      const files = await this.generateFiles(config);

      return {
        success: true,
        files,
        generator: this.meta,
        durationMs: Date.now() - start,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        files: [],
        generator: this.meta,
        durationMs: Date.now() - start,
        errors,
        warnings,
      };
    }
  }

  validate(config: GeneratorConfig): ValidationResult {
    const errors: ValidationError[] = [];

    // Common validations
    if (!config.name || config.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (!config.outputDir || config.outputDir.trim() === '') {
      errors.push({ field: 'outputDir', message: 'Output directory is required' });
    }

    if (config.name && !/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(config.name)) {
      errors.push({
        field: 'name',
        message: 'Name must start with a letter and contain only alphanumeric characters, hyphens, or underscores',
      });
    }

    // Generator-specific validations
    errors.push(...this.validateConfig(config));

    return { valid: errors.length === 0, errors };
  }

  /**
   * Helper to render a template source with context.
   */
  protected renderTemplate(source: string, context: TemplateContext): string {
    const result = this.templateEngine.renderSource(source, context);
    return result.content;
  }

  /**
   * Helper to render a registered template by ID.
   */
  protected renderRegisteredTemplate(templateId: string, context: TemplateContext): string {
    const result = this.templateEngine.render(templateId, context);
    return result.content;
  }
}
