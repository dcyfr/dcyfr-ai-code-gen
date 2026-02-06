/**
 * Tests for configuration management
 */

import { describe, it, expect } from 'vitest';
import { loadConfig, validateConfig } from '../../src/lib/config.js';

describe('Configuration', () => {
  describe('loadConfig', () => {
    it('should return defaults when no config provided', () => {
      const config = loadConfig();
      expect(config.outputDir).toBe('./generated');
      expect(config.formatOutput).toBe(true);
      expect(config.addJsdoc).toBe(true);
      expect(config.templatePaths).toEqual(['./templates']);
    });

    it('should merge partial config with defaults', () => {
      const config = loadConfig({ outputDir: './out' });
      expect(config.outputDir).toBe('./out');
      expect(config.formatOutput).toBe(true);
    });

    it('should merge generator overrides', () => {
      const config = loadConfig({
        generators: { component: { useClient: true } },
      });
      expect(config.generators?.component).toEqual({ useClient: true });
    });
  });

  describe('validateConfig', () => {
    it('should pass valid config', () => {
      const config = loadConfig();
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail on empty outputDir', () => {
      const config = loadConfig({ outputDir: '' });
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('outputDir is required');
    });

    it('should fail on empty templatePaths', () => {
      const config = loadConfig({ templatePaths: [] });
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });

    it('should validate AI config temperature', () => {
      const config = loadConfig({
        ai: { provider: 'mock', model: 'test', temperature: 1.5 },
      });
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('temperature'))).toBe(true);
    });

    it('should require AI model when provider set', () => {
      const config = loadConfig({
        ai: { provider: 'mock', model: '' },
      });
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
    });
  });
});
