/**
 * Tests for AI code generation module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AICodeGenerator, createAICodeGenerator, MockAIProvider, createAIProvider } from '../../src/ai/index.js';
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

  it('should generate code with framework context', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generate({
      prompt: 'Create a component',
      language: 'TypeScript',
      framework: 'React',
    });
    expect(result.code).toContain('Framework: React');
  });

  it('should generate code with constraints', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generate({
      prompt: 'Create a function',
      language: 'TypeScript',
      constraints: ['No side effects', 'Pure function'],
    });
    expect(result.code).toContain('Constraints: No side effects, Pure function');
  });

  it('should generate non-TypeScript code with fallback', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generate({
      prompt: 'Create a main function',
      language: 'Python',
    });
    expect(result.code).toContain('Python code');
    expect(result.code).toContain('Create a main function');
  });

  it('should handle JavaScript as TypeScript variant', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generate({
      prompt: 'Create a utility',
      language: 'ts',
    });
    expect(result.code).toContain('function generatedFunction');
  });

  it('should calculate token usage', async () => {
    const provider = new MockAIProvider();
    const longPrompt = 'Create a '.repeat(100);
    const result = await provider.generate({
      prompt: longPrompt,
      language: 'TypeScript',
    });
    expect(result.usage.promptTokens).toBe(longPrompt.length);
    expect(result.usage.completionTokens).toBe(result.code.length);
    expect(result.usage.totalTokens).toBe(longPrompt.length + result.code.length);
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

describe('createAIProvider', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should create a mock provider', () => {
    const provider = createAIProvider({ provider: 'mock', model: 'test' });
    expect(provider.name).toBe('mock');
  });

  it('should warn and return mock for unsupported openai provider', () => {
    const provider = createAIProvider({ provider: 'openai', model: 'gpt-4' });
    expect(provider.name).toBe('mock');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('openai')
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('not yet implemented')
    );
  });

  it('should warn and return mock for unsupported anthropic provider', () => {
    const provider = createAIProvider({ provider: 'anthropic', model: 'claude' });
    expect(provider.name).toBe('mock');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('anthropic')
    );
  });

  it('should warn and return mock for unsupported local provider', () => {
    const provider = createAIProvider({ provider: 'local', model: 'llama' });
    expect(provider.name).toBe('mock');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('local')
    );
  });

  it('should throw for unknown provider', () => {
    expect(() => {
      createAIProvider({ provider: 'invalid-provider' as any, model: 'test' });
    }).toThrow('Unknown AI provider');
  });
});
