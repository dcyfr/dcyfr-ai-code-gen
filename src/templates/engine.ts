/**
 * @dcyfr/ai-code-gen - Template engine
 *
 * Handlebars-based template engine with built-in helpers for code generation.
 */

import Handlebars from 'handlebars';
import type {
  TemplateDefinition,
  TemplateContext,
  TemplateRenderResult,
  TemplateVariable,
} from '../types/index.js';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toConstantCase,
  pluralize,
  indent,
} from '../lib/strings.js';

/** Template engine for rendering code templates */
export class TemplateEngine {
  private readonly handlebars: typeof Handlebars;
  private readonly compiledCache: Map<string, HandlebarsTemplateDelegate> = new Map();
  private readonly definitions: Map<string, TemplateDefinition> = new Map();

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerBuiltinHelpers();
  }

  /**
   * Register built-in Handlebars helpers for code generation.
   */
  private registerBuiltinHelpers(): void {
    // Case conversion helpers
    this.handlebars.registerHelper('pascalCase', (str: string) => toPascalCase(str));
    this.handlebars.registerHelper('camelCase', (str: string) => toCamelCase(str));
    this.handlebars.registerHelper('kebabCase', (str: string) => toKebabCase(str));
    this.handlebars.registerHelper('snakeCase', (str: string) => toSnakeCase(str));
    this.handlebars.registerHelper('constantCase', (str: string) => toConstantCase(str));
    this.handlebars.registerHelper('upperCase', (str: string) => str.toUpperCase());
    this.handlebars.registerHelper('lowerCase', (str: string) => str.toLowerCase());

    // Pluralization
    this.handlebars.registerHelper('pluralize', (str: string) => pluralize(str));

    // Indentation
    this.handlebars.registerHelper('indent', (str: string, spaces: number) =>
      typeof spaces === 'number' ? indent(str, spaces) : indent(str, 2),
    );

    // Conditional helpers
    this.handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    this.handlebars.registerHelper('neq', (a: unknown, b: unknown) => a !== b);
    this.handlebars.registerHelper('or', (a: unknown, b: unknown) => a || b);
    this.handlebars.registerHelper('and', (a: unknown, b: unknown) => a && b);
    this.handlebars.registerHelper('not', (a: unknown) => !a);

    // String helpers
    this.handlebars.registerHelper('join', (arr: string[], sep: string) =>
      Array.isArray(arr) ? arr.join(typeof sep === 'string' ? sep : ', ') : '',
    );

    // Timestamp
    this.handlebars.registerHelper('timestamp', () => new Date().toISOString());
    this.handlebars.registerHelper('year', () => new Date().getFullYear().toString());

    // Code generation helpers
    this.handlebars.registerHelper('typeAnnotation', (type: string) =>
      type ? `: ${type}` : '',
    );

    this.handlebars.registerHelper('genericType', (base: string, param: string) =>
      param ? `${base}<${param}>` : base,
    );
  }

  /**
   * Register a template definition.
   */
  registerTemplate(definition: TemplateDefinition): void {
    this.definitions.set(definition.id, definition);
    // Invalidate cache for this template
    this.compiledCache.delete(definition.id);
  }

  /**
   * Register a custom Handlebars helper.
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn);
  }

  /**
   * Register a partial template.
   */
  registerPartial(name: string, source: string): void {
    this.handlebars.registerPartial(name, source);
  }

  /**
   * Compile and render a template by ID.
   */
  render(templateId: string, context: TemplateContext): TemplateRenderResult {
    const definition = this.definitions.get(templateId);
    if (!definition) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.renderSource(definition.source, context, templateId);
  }

  /**
   * Compile and render a raw template string.
   */
  renderSource(
    source: string,
    context: TemplateContext,
    cacheKey?: string,
  ): TemplateRenderResult {
    let compiled: HandlebarsTemplateDelegate;

    if (cacheKey && this.compiledCache.has(cacheKey)) {
      compiled = this.compiledCache.get(cacheKey)!;
    } else {
      compiled = this.handlebars.compile(source, { noEscape: true });
      if (cacheKey) {
        this.compiledCache.set(cacheKey, compiled);
      }
    }

    const content = compiled(context);

    return {
      content,
      templateId: cacheKey ?? 'inline',
      variables: { ...context },
    };
  }

  /**
   * Validate template variables against a definition.
   */
  validateVariables(
    templateId: string,
    context: TemplateContext,
  ): { valid: boolean; errors: string[] } {
    const definition = this.definitions.get(templateId);
    if (!definition) {
      return { valid: false, errors: [`Template not found: ${templateId}`] };
    }

    return validateTemplateVariables(definition.variables, context);
  }

  /**
   * List all registered templates.
   */
  listTemplates(): TemplateDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get a specific template definition.
   */
  getTemplate(templateId: string): TemplateDefinition | undefined {
    return this.definitions.get(templateId);
  }

  /**
   * Clear all compiled template caches.
   */
  clearCache(): void {
    this.compiledCache.clear();
  }
}

/**
 * Validate template variables against their definitions.
 */
export function validateTemplateVariables(
  variables: TemplateVariable[],
  context: TemplateContext,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const variable of variables) {
    const value = context[variable.name];

    if (variable.required && (value === undefined || value === null)) {
      errors.push(`Required variable '${variable.name}' is missing`);
      continue;
    }

    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== variable.type) {
        errors.push(
          `Variable '${variable.name}' expected type '${variable.type}', got '${actualType}'`,
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Create and return a pre-configured TemplateEngine instance.
 */
export function createTemplateEngine(): TemplateEngine {
  return new TemplateEngine();
}
