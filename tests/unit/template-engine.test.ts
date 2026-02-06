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
