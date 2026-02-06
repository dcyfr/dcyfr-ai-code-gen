/**
 * @dcyfr/ai-code-gen - React Component Generator
 */

import type { GeneratorMeta, GeneratorConfig, GeneratedFile, ValidationError } from '../types/index.js';
import { BaseGenerator } from './base.js';
import { toPascalCase, toKebabCase } from '../lib/strings.js';
import { REACT_COMPONENT_TEMPLATE } from '../templates/builtins.js';
import type { TemplateEngine } from '../templates/engine.js';

interface ComponentOptions {
  props?: Array<{ name: string; type: string; required?: boolean }>;
  hasChildren?: boolean;
  useClient?: boolean;
  withTest?: boolean;
  withStory?: boolean;
  description?: string;
}

export class ComponentGenerator extends BaseGenerator {
  readonly meta: GeneratorMeta = {
    name: 'component',
    description: 'Generate a React functional component with TypeScript',
    category: 'component',
    version: '1.0.0',
  };

  constructor(templateEngine: TemplateEngine) {
    super(templateEngine);
    this.templateEngine.registerTemplate(REACT_COMPONENT_TEMPLATE);
  }

  protected validateConfig(config: GeneratorConfig): ValidationError[] {
    const errors: ValidationError[] = [];
    const opts = (config.options ?? {}) as Partial<ComponentOptions>;

    if (opts.props && !Array.isArray(opts.props)) {
      errors.push({ field: 'options.props', message: 'Props must be an array' });
    }

    if (opts.props) {
      for (const prop of opts.props) {
        if (!prop.name || !prop.type) {
          errors.push({ field: 'options.props', message: 'Each prop must have name and type' });
        }
      }
    }

    return errors;
  }

  protected async generateFiles(config: GeneratorConfig): Promise<GeneratedFile[]> {
    const opts = (config.options ?? {}) as ComponentOptions;
    const componentName = toPascalCase(config.name);
    const fileName = toKebabCase(config.name);
    const files: GeneratedFile[] = [];

    // Main component file
    const componentContent = this.renderRegisteredTemplate('react-component', {
      name: config.name,
      props: opts.props ?? [],
      hasChildren: opts.hasChildren ?? false,
      useClient: opts.useClient ?? false,
      description: opts.description,
    });

    files.push({
      path: `${config.outputDir}/${fileName}/${fileName}.tsx`,
      content: componentContent,
    });

    // Optional test file
    if (opts.withTest) {
      const testContent = this.generateTest(componentName, fileName);
      files.push({
        path: `${config.outputDir}/${fileName}/${fileName}.test.tsx`,
        content: testContent,
      });
    }

    // Barrel export
    files.push({
      path: `${config.outputDir}/${fileName}/index.ts`,
      content: `export { ${componentName} } from './${fileName}.js';\n`,
    });

    return files;
  }

  private generateTest(componentName: string, _fileName: string): string {
    return `import { describe, it, expect } from 'vitest';

describe('${componentName}', () => {
  it('should be defined', () => {
    // TODO: Implement component tests
    expect(true).toBe(true);
  });
});
`;
  }
}
