/**
 * @dcyfr/ai-code-gen - API Route Generator
 */

import type { GeneratorMeta, GeneratorConfig, GeneratedFile, ValidationError } from '../types/index.js';
import { BaseGenerator } from './base.js';
import { toPascalCase, toKebabCase } from '../lib/strings.js';
import { API_ROUTE_TEMPLATE } from '../templates/builtins.js';
import type { TemplateEngine } from '../templates/engine.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRouteOptions {
  methods?: HttpMethod[];
  hasAuth?: boolean;
  withTest?: boolean;
  description?: string;
}

const VALID_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export class ApiRouteGenerator extends BaseGenerator {
  readonly meta: GeneratorMeta = {
    name: 'api-route',
    description: 'Generate a Next.js API route handler',
    category: 'api-route',
    version: '1.0.0',
  };

  constructor(templateEngine: TemplateEngine) {
    super(templateEngine);
    this.templateEngine.registerTemplate(API_ROUTE_TEMPLATE);
  }

  protected validateConfig(config: GeneratorConfig): ValidationError[] {
    const errors: ValidationError[] = [];
    const opts = (config.options ?? {}) as Partial<ApiRouteOptions>;

    if (opts.methods) {
      if (!Array.isArray(opts.methods)) {
        errors.push({ field: 'options.methods', message: 'Methods must be an array' });
      } else {
        for (const method of opts.methods) {
          if (!VALID_METHODS.includes(method)) {
            errors.push({
              field: 'options.methods',
              message: `Invalid method: ${method}. Valid: ${VALID_METHODS.join(', ')}`,
            });
          }
        }
      }
    }

    return errors;
  }

  protected async generateFiles(config: GeneratorConfig): Promise<GeneratedFile[]> {
    const opts = (config.options ?? {}) as ApiRouteOptions;
    const routeName = toKebabCase(config.name);
    const methods = opts.methods ?? ['GET'];
    const files: GeneratedFile[] = [];

    // Main route file
    const routeContent = this.renderRegisteredTemplate('api-route', {
      name: config.name,
      methods,
      hasAuth: opts.hasAuth ?? false,
      description: opts.description,
    });

    files.push({
      path: `${config.outputDir}/${routeName}/route.ts`,
      content: routeContent,
    });

    // Optional test file
    if (opts.withTest) {
      const testContent = this.generateTest(toPascalCase(config.name), routeName, methods);
      files.push({
        path: `${config.outputDir}/${routeName}/route.test.ts`,
        content: testContent,
      });
    }

    return files;
  }

  private generateTest(name: string, _routeName: string, methods: HttpMethod[]): string {
    const testCases = methods
      .map(
        (method) => `
  describe('${method}', () => {
    it('should handle ${method} requests', () => {
      // TODO: Implement ${method} test for ${name}
      expect(true).toBe(true);
    });
  });`,
      )
      .join('\n');

    return `import { describe, it, expect } from 'vitest';

describe('${name} API Route', () => {${testCases}
});
`;
  }
}
