/**
 * Tests for the template engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine, validateTemplateVariables } from '../../src/templates/engine.js';
import type { TemplateDefinition, TemplateVariable } from '../../src/types/index.js';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  describe('renderSource', () => {
    it('should render a simple template', () => {
      const result = engine.renderSource('Hello {{name}}!', { name: 'World' });
      expect(result.content).toBe('Hello World!');
    });

    it('should support built-in helpers', () => {
      const result = engine.renderSource('{{pascalCase name}}', { name: 'user-profile' });
      expect(result.content).toBe('UserProfile');
    });

    it('should support camelCase helper', () => {
      const result = engine.renderSource('{{camelCase name}}', { name: 'user-profile' });
      expect(result.content).toBe('userProfile');
    });

    it('should support kebabCase helper', () => {
      const result = engine.renderSource('{{kebabCase name}}', { name: 'UserProfile' });
      expect(result.content).toBe('user-profile');
    });

    it('should support snakeCase helper', () => {
      const result = engine.renderSource('{{snakeCase name}}', { name: 'UserProfile' });
      expect(result.content).toBe('user_profile');
    });

    it('should support constantCase helper', () => {
      const result = engine.renderSource('{{constantCase name}}', { name: 'UserProfile' });
      expect(result.content).toBe('USER_PROFILE');
    });

    it('should support pluralize helper', () => {
      const result = engine.renderSource('{{pluralize name}}', { name: 'user' });
      expect(result.content).toBe('users');
    });

    it('should support eq helper', () => {
      const result = engine.renderSource('{{#if (eq a b)}}yes{{else}}no{{/if}}', { a: 1, b: 1 });
      expect(result.content).toBe('yes');
    });

    it('should cache compiled templates', () => {
      engine.renderSource('{{name}}', { name: 'first' }, 'cached');
      const result = engine.renderSource('{{name}}', { name: 'second' }, 'cached');
      expect(result.content).toBe('second');
    });
  });

  describe('registerTemplate and render', () => {
    it('should register and render templates', () => {
      const definition: TemplateDefinition = {
        id: 'test-template',
        name: 'Test',
        description: 'A test template',
        source: 'Hello {{name}}!',
        variables: [{ name: 'name', type: 'string', description: 'Name', required: true }],
        outputExtension: '.ts',
      };

      engine.registerTemplate(definition);
      const result = engine.render('test-template', { name: 'World' });
      expect(result.content).toBe('Hello World!');
      expect(result.templateId).toBe('test-template');
    });

    it('should throw for unknown template', () => {
      expect(() => engine.render('nonexistent', {})).toThrow('Template not found');
    });
  });

  describe('listTemplates', () => {
    it('should list registered templates', () => {
      engine.registerTemplate({
        id: 'a',
        name: 'A',
        description: '',
        source: '',
        variables: [],
        outputExtension: '.ts',
      });
      engine.registerTemplate({
        id: 'b',
        name: 'B',
        description: '',
        source: '',
        variables: [],
        outputExtension: '.ts',
      });

      const list = engine.listTemplates();
      expect(list).toHaveLength(2);
      expect(list.map((t) => t.id)).toContain('a');
      expect(list.map((t) => t.id)).toContain('b');
    });
  });

  describe('registerHelper', () => {
    it('should register custom helpers', () => {
      engine.registerHelper('double', (str: string) => str + str);
      const result = engine.renderSource('{{double name}}', { name: 'ha' });
      expect(result.content).toBe('haha');
    });
  });

  describe('registerPartial', () => {
    it('should register and use partials', () => {
      engine.registerPartial('greeting', 'Hello {{name}}');
      const result = engine.renderSource('{{> greeting}}!', { name: 'World' });
      expect(result.content).toBe('Hello World!');
    });
  });

  describe('validateVariables', () => {
    it('should validate required variables', () => {
      engine.registerTemplate({
        id: 'v-test',
        name: 'V',
        description: '',
        source: '',
        variables: [{ name: 'title', type: 'string', description: '', required: true }],
        outputExtension: '.ts',
      });

      const result = engine.validateVariables('v-test', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('title');
    });

    it('should validate variable types', () => {
      engine.registerTemplate({
        id: 'v-type',
        name: 'VT',
        description: '',
        source: '',
        variables: [{ name: 'count', type: 'number', description: '', required: true }],
        outputExtension: '.ts',
      });

      const result = engine.validateVariables('v-type', { count: 'not a number' });
      expect(result.valid).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear compiled cache', () => {
      engine.renderSource('{{name}}', { name: 'test' }, 'key');
      engine.clearCache();
      // Should not throw after clearing
      const result = engine.renderSource('{{name}}', { name: 'test2' }, 'key');
      expect(result.content).toBe('test2');
    });
  });

  describe('getTemplate', () => {
    it('should retrieve a registered template', () => {
      const definition: TemplateDefinition = {
        id: 'get-test',
        name: 'GetTest',
        description: 'Test template',
        source: '{{name}}',
        variables: [],
        outputExtension: '.ts',
      };

      engine.registerTemplate(definition);
      const retrieved = engine.getTemplate('get-test');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('get-test');
      expect(retrieved?.name).toBe('GetTest');
    });

    it('should return undefined for unknown template', () => {
      const result = engine.getTemplate('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('template re-registration', () => {
    it('should update template when registered again', () => {
      const definition1: TemplateDefinition = {
        id: 'update-test',
        name: 'Original',
        description: 'Original',
        source: 'Hello {{name}}',
        variables: [],
        outputExtension: '.ts',
      };

      const definition2: TemplateDefinition = {
        id: 'update-test',
        name: 'Updated',
        description: 'Updated',
        source: 'Hi {{name}}',
        variables: [],
        outputExtension: '.ts',
      };

      engine.registerTemplate(definition1);
      let result = engine.render('update-test', { name: 'World' });
      expect(result.content).toBe('Hello World');

      engine.registerTemplate(definition2);
      result = engine.render('update-test', { name: 'World' });
      expect(result.content).toBe('Hi World');
    });

    it('should invalidate cache when template re-registered', () => {
      const definition1: TemplateDefinition = {
        id: 'cache-test',
        name: 'Cache',
        description: 'Cache',
        source: 'V1: {{name}}',
        variables: [],
        outputExtension: '.ts',
      };

      engine.registerTemplate(definition1);
      engine.render('cache-test', { name: 'Test' });

      const definition2: TemplateDefinition = {
        ...definition1,
        source: 'V2: {{name}}',
      };

      engine.registerTemplate(definition2);
      const result = engine.render('cache-test', { name: 'Test' });
      expect(result.content).toBe('V2: Test');
    });
  });

  describe('built-in helper edge cases', () => {
    it('should handle upperCase helper', () => {
      const result = engine.renderSource('{{upperCase name}}', { name: 'hello' });
      expect(result.content).toBe('HELLO');
    });

    it('should handle lowerCase helper', () => {
      const result = engine.renderSource('{{lowerCase name}}', { name: 'WORLD' });
      expect(result.content).toBe('world');
    });

    it('should handle indent with default spaces', () => {
      const result = engine.renderSource('{{indent code}}', { code: 'line1\nline2' });
      expect(result.content).toContain('  line1');
      expect(result.content).toContain('  line2');
    });

    it('should handle indent with custom spaces', () => {
      const result = engine.renderSource('{{indent code 4}}', { code: 'line1\nline2' });
      expect(result.content).toContain('    line1');
      expect(result.content).toContain('    line2');
    });

    it('should handle join with default separator', () => {
      const result = engine.renderSource('{{join items}}', { items: ['a', 'b', 'c'] });
      expect(result.content).toBe('a, b, c');
    });

    it('should handle join with custom separator', () => {
      const result = engine.renderSource('{{join items " | "}}', { items: ['a', 'b', 'c'] });
      expect(result.content).toBe('a | b | c');
    });

    it('should handle join with non-array input', () => {
      const result = engine.renderSource('{{join notArray}}', { notArray: 'not an array' });
      expect(result.content).toBe('');
    });

    it('should handle neq helper', () => {
      const result = engine.renderSource('{{#if (neq a b)}}yes{{else}}no{{/if}}', { a: 1, b: 2 });
      expect(result.content).toBe('yes');
    });

    it('should handle or helper', () => {
      const result1 = engine.renderSource('{{#if (or a b)}}yes{{else}}no{{/if}}', { a: true, b: false });
      expect(result1.content).toBe('yes');

      const result2 = engine.renderSource('{{#if (or a b)}}yes{{else}}no{{/if}}', { a: false, b: false });
      expect(result2.content).toBe('no');
    });

    it('should handle and helper', () => {
      const result1 = engine.renderSource('{{#if (and a b)}}yes{{else}}no{{/if}}', { a: true, b: true });
      expect(result1.content).toBe('yes');

      const result2 = engine.renderSource('{{#if (and a b)}}yes{{else}}no{{/if}}', { a: true, b: false });
      expect(result2.content).toBe('no');
    });

    it('should handle not helper', () => {
      const result1 = engine.renderSource('{{#if (not a)}}yes{{else}}no{{/if}}', { a: false });
      expect(result1.content).toBe('yes');

      const result2 = engine.renderSource('{{#if (not a)}}yes{{else}}no{{/if}}', { a: true });
      expect(result2.content).toBe('no');
    });

    it('should handle timestamp helper', () => {
      const result = engine.renderSource('{{timestamp}}', {});
      // Should be ISO format
      expect(result.content).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle year helper', () => {
      const result = engine.renderSource('{{year}}', {});
      const currentYear = new Date().getFullYear().toString();
      expect(result.content).toBe(currentYear);
    });

    it('should handle typeAnnotation with type', () => {
      const result = engine.renderSource('name{{typeAnnotation type}}', { type: 'string' });
      expect(result.content).toBe('name: string');
    });

    it('should handle typeAnnotation without type', () => {
      const result = engine.renderSource('name{{typeAnnotation type}}', { type: '' });
      expect(result.content).toBe('name');
    });

    it('should handle genericType with parameter', () => {
      const result = engine.renderSource('{{genericType base param}}', { base: 'Array', param: 'string' });
      expect(result.content).toBe('Array<string>');
    });

    it('should handle genericType without parameter', () => {
      const result = engine.renderSource('{{genericType base param}}', { base: 'Array', param: '' });
      expect(result.content).toBe('Array');
    });
  });

  describe('validateVariables edge cases', () => {
    it('should return error for unknown template', () => {
      const result = engine.validateVariables('nonexistent', {});
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Template not found');
    });

    it('should handle null value for required variable', () => {
      engine.registerTemplate({
        id: 'null-test',
        name: 'NullTest',
        description: '',
        source: '',
        variables: [{ name: 'value', type: 'string', description: '', required: true }],
        outputExtension: '.ts',
      });

      const result = engine.validateVariables('null-test', { value: null });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('missing');
    });

    it('should handle undefined value for optional variable', () => {
      engine.registerTemplate({
        id: 'undef-test',
        name: 'UndefTest',
        description: '',
        source: '',
        variables: [{ name: 'value', type: 'string', description: '', required: false }],
        outputExtension: '.ts',
      });

      const result = engine.validateVariables('undef-test', { value: undefined });
      expect(result.valid).toBe(true);
    });

    it('should validate array type', () => {
      engine.registerTemplate({
        id: 'array-test',
        name: 'ArrayTest',
        description: '',
        source: '',
        variables: [{ name: 'items', type: 'array', description: '', required: true }],
        outputExtension: '.ts',
      });

      const result1 = engine.validateVariables('array-test', { items: [1, 2, 3] });
      expect(result1.valid).toBe(true);

      const result2 = engine.validateVariables('array-test', { items: 'not an array' });
      expect(result2.valid).toBe(false);
      expect(result2.errors[0]).toContain('array');
    });
  });
});

describe('validateTemplateVariables', () => {
  it('should pass when all required variables are present', () => {
    const vars: TemplateVariable[] = [
      { name: 'name', type: 'string', description: '', required: true },
    ];
    const result = validateTemplateVariables(vars, { name: 'hello' });
    expect(result.valid).toBe(true);
  });

  it('should fail on type mismatch', () => {
    const vars: TemplateVariable[] = [
      { name: 'count', type: 'number', description: '', required: true },
    ];
    const result = validateTemplateVariables(vars, { count: 'abc' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('number');
  });

  it('should allow optional variables to be missing', () => {
    const vars: TemplateVariable[] = [
      { name: 'desc', type: 'string', description: '', required: false },
    ];
    const result = validateTemplateVariables(vars, {});
    expect(result.valid).toBe(true);
  });
});
