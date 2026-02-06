/**
 * @dcyfr/ai-code-gen - Test File Generator
 */

import type { GeneratorMeta, GeneratorConfig, GeneratedFile, ValidationError } from '../types/index.js';
import { BaseGenerator } from './base.js';
import { toKebabCase } from '../lib/strings.js';
import { TEST_FILE_TEMPLATE } from '../templates/builtins.js';
import type { TemplateEngine } from '../templates/engine.js';

interface TestOptions {
  importPath?: string;
  functions?: string[];
  description?: string;
}

export class TestGenerator extends BaseGenerator {
  readonly meta: GeneratorMeta = {
    name: 'test',
    description: 'Generate a Vitest test file for a module',
    category: 'test',
    version: '1.0.0',
  };

  constructor(templateEngine: TemplateEngine) {
    super(templateEngine);
    this.templateEngine.registerTemplate(TEST_FILE_TEMPLATE);
  }

  protected validateConfig(_config: GeneratorConfig): ValidationError[] {
    return [];
  }

  protected async generateFiles(config: GeneratorConfig): Promise<GeneratedFile[]> {
    const opts = (config.options ?? {}) as TestOptions;
    const fileName = toKebabCase(config.name);
    const importPath = opts.importPath ?? `./${fileName}.js`;

    const testContent = this.renderRegisteredTemplate('test-file', {
      name: config.name,
      importPath,
      functions: opts.functions ?? [],
      description: opts.description,
    });

    return [
      {
        path: `${config.outputDir}/${fileName}.test.ts`,
        content: testContent,
      },
    ];
  }
}
