/**
 * @dcyfr/ai-code-gen - Generator registry
 *
 * Central registry for discovering and running generators.
 */

import type { Generator, GeneratorConfig, GenerationResult, GeneratorMeta } from '../types/index.js';
import { TemplateEngine } from '../templates/engine.js';
import { BUILTIN_TEMPLATES } from '../templates/builtins.js';
import { ComponentGenerator } from './component.js';
import { ApiRouteGenerator } from './api-route.js';
import { ModelGenerator } from './model.js';
import { TestGenerator } from './test.js';

/** Generator registry for managing available generators */
export class GeneratorRegistry {
  private readonly generators: Map<string, Generator> = new Map();
  private readonly templateEngine: TemplateEngine;

  constructor(templateEngine?: TemplateEngine) {
    this.templateEngine = templateEngine ?? new TemplateEngine();
  }

  /**
   * Register a generator.
   */
  register(generator: Generator): void {
    this.generators.set(generator.meta.name, generator);
  }

  /**
   * Get a generator by name.
   */
  get(name: string): Generator | undefined {
    return this.generators.get(name);
  }

  /**
   * Check if a generator is registered.
   */
  has(name: string): boolean {
    return this.generators.has(name);
  }

  /**
   * List all registered generators.
   */
  list(): GeneratorMeta[] {
    return Array.from(this.generators.values()).map((g) => g.meta);
  }

  /**
   * Run a generator by name with the given config.
   */
  async run(name: string, config: GeneratorConfig): Promise<GenerationResult> {
    const generator = this.generators.get(name);
    if (!generator) {
      return {
        success: false,
        files: [],
        generator: { name, description: '', category: 'custom', version: '0.0.0' },
        durationMs: 0,
        errors: [{ message: `Generator '${name}' not found` }],
        warnings: [],
      };
    }

    return generator.generate(config);
  }

  /**
   * Get the underlying template engine.
   */
  getTemplateEngine(): TemplateEngine {
    return this.templateEngine;
  }
}

/**
 * Create a registry with all built-in generators pre-registered.
 */
export function createGeneratorRegistry(templateEngine?: TemplateEngine): GeneratorRegistry {
  const engine = templateEngine ?? new TemplateEngine();
  const registry = new GeneratorRegistry(engine);

  // Register built-in templates
  for (const template of BUILTIN_TEMPLATES) {
    engine.registerTemplate(template);
  }

  // Register built-in generators
  registry.register(new ComponentGenerator(engine));
  registry.register(new ApiRouteGenerator(engine));
  registry.register(new ModelGenerator(engine));
  registry.register(new TestGenerator(engine));

  return registry;
}
