/**
 * Tests for AI code generation module
 */

import { describe, it, expect } from 'vitest';
import { AICodeGenerator, createAICodeGenerator, MockAIProvider } from '../../src/ai/index.js';
import {
  generateCodePrompt,
  reviewCodePrompt,
  refactorCodePrompt,
  generateDocsPrompt,
} from '../../src/ai/prompts.js';

describe('AI Prompts', () => {
  describe('generateCodePrompt', () => {
    it('should create a code generation prompt', () => {
      const prompt = generateCodePrompt({
        description: 'Create a user service',
        language: 'TypeScript',
      });
      expect(prompt).toContain('Generate TypeScript code');
      expect(prompt).toContain('user service');
    });

    it('should include framework context', () => {
      const prompt = generateCodePrompt({
        description: 'Create a component',
        language: 'TypeScript',
        framework: 'React',
      });
      expect(prompt).toContain('Framework: React');
    });

    it('should include constraints', () => {
      const prompt = generateCodePrompt({
        description: 'Create a function',
        language: 'TypeScript',
        constraints: ['No external dependencies', 'Pure function'],
      });
      expect(prompt).toContain('No external dependencies');
      expect(prompt).toContain('Pure function');
    });

    it('should include existing code context', () => {
      const prompt = generateCodePrompt({
        description: 'Add a method',
        language: 'TypeScript',
        context: 'class MyClass {}',
      });
      expect(prompt).toContain('class MyClass');
    });
  });

  describe('reviewCodePrompt', () => {
    it('should create a review prompt', () => {
      const prompt = reviewCodePrompt({
        code: 'const x = 1;',
        language: 'TypeScript',
      });
      expect(prompt).toContain('Review');
      expect(prompt).toContain('const x = 1');
      expect(prompt).toContain('Security');
    });

    it('should include focus areas', () => {
      const prompt = reviewCodePrompt({
        code: 'const x = 1;',
        language: 'TypeScript',
        focus: ['Performance'],
      });
      expect(prompt).toContain('Performance');
    });
  });

  describe('refactorCodePrompt', () => {
    it('should create a refactoring prompt', () => {
      const prompt = refactorCodePrompt({
        code: 'function a() {}',
        language: 'TypeScript',
      });
      expect(prompt).toContain('refactoring');
    });
  });

  describe('generateDocsPrompt', () => {
    it('should create a docs prompt', () => {
      const prompt = generateDocsPrompt({
        code: 'function greet() {}',
        language: 'TypeScript',
        style: 'jsdoc',
      });
      expect(prompt).toContain('jsdoc');
    });
  });
});

describe('MockAIProvider', () => {
  it('should generate mock code', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generate({
      prompt: 'Create a user service',
      language: 'TypeScript',
    });
    expect(result.code).toContain('user service');
    expect(result.language).toBe('TypeScript');
    expect(result.confidence).toBe(0.85);
    expect(result.usage.totalTokens).toBeGreaterThan(0);
  });

  it('should return mock completion', async () => {
    const provider = new MockAIProvider();
    const result = await provider.complete('Some prompt');
    expect(result).toContain('Mock completion');
  });
});

describe('AICodeGenerator', () => {
  let generator: AICodeGenerator;

  beforeEach(() => {
    generator = createAICodeGenerator({ provider: 'mock', model: 'test' });
  });

  describe('generateCode', () => {
    it('should generate code', async () => {
      const result = await generator.generateCode({
        prompt: 'Create a logger utility',
        language: 'TypeScript',
      });
      expect(result.code).toBeTruthy();
      expect(result.explanation).toContain('logger utility');
    });
  });

  describe('reviewCode', () => {
    it('should review code with heuristics', async () => {
      const result = await generator.reviewCode({
        code: `
          function test(): any {
            console.log("hello");
            // TODO: fix this
          }
        `,
        language: 'TypeScript',
      });
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.summary).toContain('issues');
    });

    it('should give high score to clean code', async () => {
      const result = await generator.reviewCode({
        code: 'export function greet(name: string): string { return name; }',
        language: 'TypeScript',
      });
      expect(result.score).toBeGreaterThanOrEqual(90);
    });
  });

  describe('suggestRefactoring', () => {
    it('should return refactoring suggestions', async () => {
      const result = await generator.suggestRefactoring({
        code: 'function a() {} function b() {} function c() {} function d() {} function e() {} function f() {}',
        language: 'TypeScript',
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateDocs', () => {
    it('should generate documentation', async () => {
      const result = await generator.generateDocs({
        code: 'function greet() {}',
        language: 'TypeScript',
      });
      expect(result).toBeTruthy();
    });
  });
});
