/**
 * @dcyfr/ai-code-gen - Configuration management
 */

import type { CodeGenConfig } from '../types/index.js';

/** Default configuration */
const DEFAULT_CONFIG: CodeGenConfig = {
  outputDir: './generated',
  templatePaths: ['./templates'],
  formatOutput: true,
  addJsdoc: true,
  generators: {},
};

/**
 * Load configuration from a partial config object, merging with defaults.
 */
export function loadConfig(partial: Partial<CodeGenConfig> = {}): CodeGenConfig {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    templatePaths: partial.templatePaths ?? DEFAULT_CONFIG.templatePaths,
    generators: {
      ...DEFAULT_CONFIG.generators,
      ...partial.generators,
    },
  };
}

/**
 * Validate configuration.
 */
export function validateConfig(config: CodeGenConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.outputDir) {
    errors.push('outputDir is required');
  }

  if (!config.templatePaths || config.templatePaths.length === 0) {
    errors.push('At least one templatePath is required');
  }

  if (config.ai) {
    if (!config.ai.provider) {
      errors.push('AI provider is required when ai config is provided');
    }
    if (!config.ai.model) {
      errors.push('AI model is required when ai config is provided');
    }
    if (config.ai.temperature !== undefined) {
      if (config.ai.temperature < 0 || config.ai.temperature > 1) {
        errors.push('AI temperature must be between 0 and 1');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
