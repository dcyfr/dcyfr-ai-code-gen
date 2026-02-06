/**
 * @dcyfr/ai-code-gen - AI Code Generator
 *
 * High-level AI-powered code generation combining prompts with providers.
 */

import type {
  AICodeRequest,
  AICodeResponse,
  ReviewResult,
  ReviewFinding,
  RefactorSuggestion,
  AIProviderConfig,
} from '../types/index.js';
import { type AIProvider, createAIProvider, MockAIProvider } from './provider.js';
import { reviewCodePrompt, refactorCodePrompt, generateDocsPrompt } from './prompts.js';

/** AI code generation service */
export class AICodeGenerator {
  private readonly provider: AIProvider;

  constructor(config?: AIProviderConfig) {
    this.provider = config ? createAIProvider(config) : new MockAIProvider();
  }

  /**
   * Generate code from a request.
   */
  async generateCode(request: AICodeRequest): Promise<AICodeResponse> {
    return this.provider.generate(request);
  }

  /**
   * Review code and return findings.
   */
  async reviewCode(options: {
    code: string;
    language: string;
    focus?: string[];
  }): Promise<ReviewResult> {
    const start = Date.now();
    const prompt = reviewCodePrompt(options);
    const response = await this.provider.complete(prompt);

    // For mock provider, return sample findings
    const findings = this.parseFindingsOrDefault(response, options.code);

    const score = this.calculateScore(findings);

    return {
      findings,
      summary: `Found ${findings.length} issues (score: ${score}/100)`,
      score,
      durationMs: Date.now() - start,
    };
  }

  /**
   * Suggest refactorings for code.
   */
  async suggestRefactoring(options: {
    code: string;
    language: string;
    goals?: string[];
  }): Promise<RefactorSuggestion[]> {
    const prompt = refactorCodePrompt(options);
    const response = await this.provider.complete(prompt);

    return this.parseSuggestionsOrDefault(response, options.code);
  }

  /**
   * Generate documentation for code.
   */
  async generateDocs(options: {
    code: string;
    language: string;
    style?: 'jsdoc' | 'tsdoc' | 'markdown';
  }): Promise<string> {
    const prompt = generateDocsPrompt(options);
    return this.provider.complete(prompt);
  }

  /**
   * Parse findings from AI response, or return heuristic defaults.
   */
  private parseFindingsOrDefault(response: string, code: string): ReviewFinding[] {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed as ReviewFinding[];
    } catch {
      // If response isn't valid JSON, generate heuristic findings
    }

    return this.generateHeuristicFindings(code);
  }

  /**
   * Generate basic heuristic findings from code patterns.
   */
  private generateHeuristicFindings(code: string): ReviewFinding[] {
    const findings: ReviewFinding[] = [];

    // Check for console.log
    const consoleMatches = code.match(/console\.(log|warn|error)/g);
    if (consoleMatches) {
      findings.push({
        severity: 'info',
        message: `Found ${consoleMatches.length} console statement(s). Consider using a structured logger.`,
        category: 'style',
      });
    }

    // Check for any type
    if (code.includes(': any') || code.includes('<any>')) {
      findings.push({
        severity: 'warning',
        message: 'Usage of "any" type detected. Consider using more specific types.',
        category: 'correctness',
      });
    }

    // Check for TODO comments
    const todoMatches = code.match(/\/\/\s*TODO/gi);
    if (todoMatches) {
      findings.push({
        severity: 'info',
        message: `Found ${todoMatches.length} TODO comment(s).`,
        category: 'maintainability',
      });
    }

    // Check for long lines
    const longLines = code.split('\n').filter((l) => l.length > 120);
    if (longLines.length > 0) {
      findings.push({
        severity: 'info',
        message: `${longLines.length} line(s) exceed 120 characters.`,
        category: 'style',
      });
    }

    return findings;
  }

  /**
   * Parse refactoring suggestions from AI response, or return defaults.
   */
  private parseSuggestionsOrDefault(response: string, code: string): RefactorSuggestion[] {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed as RefactorSuggestion[];
    } catch {
      // Return default suggestions
    }

    const suggestions: RefactorSuggestion[] = [];

    // Check for long functions
    const fnMatches = code.match(/function\s+\w+/g);
    if (fnMatches && fnMatches.length > 5) {
      suggestions.push({
        description: 'Consider extracting related functions into separate modules',
        original: `${fnMatches.length} functions in single file`,
        refactored: 'Split into focused modules',
        rationale: 'Smaller modules are easier to test and maintain',
        impact: 'medium',
      });
    }

    return suggestions;
  }

  /**
   * Calculate a quality score from findings.
   */
  private calculateScore(findings: ReviewFinding[]): number {
    let score = 100;
    for (const finding of findings) {
      switch (finding.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
        case 'suggestion':
          score -= 0;
          break;
      }
    }
    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Create an AI code generator with configuration.
 */
export function createAICodeGenerator(config?: AIProviderConfig): AICodeGenerator {
  return new AICodeGenerator(config);
}
