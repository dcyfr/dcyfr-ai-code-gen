/**
 * @dcyfr/ai-code-gen - Data Model Generator
 */

import type { GeneratorMeta, GeneratorConfig, GeneratedFile, ValidationError } from '../types/index.js';
import { BaseGenerator } from './base.js';
import { toPascalCase, toKebabCase } from '../lib/strings.js';
import { DATA_MODEL_TEMPLATE } from '../templates/builtins.js';
import type { TemplateEngine } from '../templates/engine.js';

interface ModelField {
  name: string;
  zodType: string;
  optional?: boolean;
}

interface ModelOptions {
  fields?: ModelField[];
  hasTimestamps?: boolean;
  withTest?: boolean;
  description?: string;
}

export class ModelGenerator extends BaseGenerator {
  readonly meta: GeneratorMeta = {
    name: 'model',
    description: 'Generate a TypeScript data model with Zod schema validation',
    category: 'model',
    version: '1.0.0',
  };

  constructor(templateEngine: TemplateEngine) {
    super(templateEngine);
    this.templateEngine.registerTemplate(DATA_MODEL_TEMPLATE);
  }

  protected validateConfig(config: GeneratorConfig): ValidationError[] {
    const errors: ValidationError[] = [];
    const opts = (config.options ?? {}) as Partial<ModelOptions>;

    if (opts.fields) {
      if (!Array.isArray(opts.fields)) {
        errors.push({ field: 'options.fields', message: 'Fields must be an array' });
      } else {
        for (const field of opts.fields) {
          if (!field.name) {
            errors.push({ field: 'options.fields', message: 'Each field must have a name' });
          }
          if (!field.zodType) {
            errors.push({ field: 'options.fields', message: 'Each field must have a zodType' });
          }
        }
      }
    }

    return errors;
  }

  protected async generateFiles(config: GeneratorConfig): Promise<GeneratedFile[]> {
    const opts = (config.options ?? {}) as ModelOptions;
    const fileName = toKebabCase(config.name);
    const files: GeneratedFile[] = [];

    const fields: ModelField[] = opts.fields ?? [
      { name: 'name', zodType: 'string' },
      { name: 'email', zodType: 'string' },
    ];

    // Main model file
    const modelContent = this.renderRegisteredTemplate('data-model', {
      name: config.name,
      fields,
      hasTimestamps: opts.hasTimestamps ?? true,
      description: opts.description,
    });

    files.push({
      path: `${config.outputDir}/${fileName}.ts`,
      content: modelContent,
    });

    // Optional test file
    if (opts.withTest) {
      const testContent = this.generateTest(toPascalCase(config.name), fileName);
      files.push({
        path: `${config.outputDir}/${fileName}.test.ts`,
        content: testContent,
      });
    }

    return files;
  }

  private generateTest(modelName: string, fileName: string): string {
    return `import { describe, it, expect } from 'vitest';
import { ${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Schema, create${modelName} } from './${fileName}.js';

describe('${modelName}', () => {
  describe('schema', () => {
    it('should validate valid input', () => {
      // TODO: Add schema validation tests
      expect(${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Schema).toBeDefined();
    });
  });

  describe('create${modelName}', () => {
    it('should create a new instance', () => {
      // TODO: Add creation tests
      expect(create${modelName}).toBeDefined();
    });
  });
});
`;
  }
}
