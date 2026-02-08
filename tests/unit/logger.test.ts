/**
 * @dcyfr/ai-code-gen - Logger tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogger, createSilentLogger } from '../../src/lib/logger.js';

describe('Logger', () => {
  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Mock console methods
  let logSpy: ReturnType<typeof vi.fn>;
  let warnSpy: ReturnType<typeof vi.fn>;
  let errorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create spies for each console method
    logSpy = vi.fn();
    warnSpy = vi.fn();
    errorSpy = vi.fn();

    console.log = logSpy;
    console.warn = warnSpy;
    console.error = errorSpy;
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('createLogger', () => {
    it('should create a logger with default info level', () => {
      const logger = createLogger();

      logger.info('Test message');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        ''
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        ''
      );
    });

    it('should filter out debug messages when level is info', () => {
      const logger = createLogger('info');

      logger.debug('Debug message');
      logger.info('Info message');

      expect(logSpy).toHaveBeenCalledTimes(1); // Only info message
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        ''
      );
    });

    it('should log debug messages when level is debug', () => {
      const logger = createLogger('debug');

      logger.debug('Debug message');

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG'),
        ''
      );
    });

    it('should use console.warn for warn level', () => {
      const logger = createLogger('debug');

      logger.warn('Warning message');

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        ''
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning message'),
        ''
      );
    });

    it('should use console.error for error level', () => {
      const logger = createLogger('debug');

      logger.error('Error message');

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        ''
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        ''
      );
    });

    it('should include prefix in log messages', () => {
      const logger = createLogger('info', 'MyApp');

      logger.info('Test message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MyApp]'),
        ''
      );
    });

    it('should include timestamp in log messages', () => {
      const logger = createLogger('info');

      logger.info('Test message');

      // Check that the log contains an ISO timestamp pattern
      const logCall = logSpy.mock.calls[0][0] as string;
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should log additional data as JSON', () => {
      const logger = createLogger('info');
      const data = { userId: 123, action: 'login' };

      logger.info('User action', data);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('User action'),
        JSON.stringify(data)
      );
    });

    it('should log without data when not provided', () => {
      const logger = createLogger('info');

      logger.info('Simple message');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Simple message'),
        ''
      );
    });

    it('should filter messages below warn threshold', () => {
      const logger = createLogger('warn');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should filter messages below error threshold', () => {
      const logger = createLogger('error');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should allow all messages when level is debug', () => {
      const logger = createLogger('debug');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(logSpy).toHaveBeenCalledTimes(2); // debug + info
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle empty prefix gracefully', () => {
      const logger = createLogger('info', '');

      logger.info('Test message');

      const logCall = logSpy.mock.calls[0][0] as string;
      expect(logCall).not.toContain('[]');
      expect(logCall).toContain('Test message');
    });

    it('should pad log level strings for alignment', () => {
      const logger = createLogger('debug');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      // All level strings should be 5 characters (padded)
      const debugCall = logSpy.mock.calls[0][0] as string;
      const infoCall = logSpy.mock.calls[1][0] as string;
      const warnCall = warnSpy.mock.calls[0][0] as string;
      const errorCall = errorSpy.mock.calls[0][0] as string;

      expect(debugCall).toContain('DEBUG');
      expect(infoCall).toContain('INFO '); // 'INFO' padded to 5 chars
      expect(warnCall).toContain('WARN '); // 'WARN' padded to 5 chars
      expect(errorCall).toContain('ERROR');
    });

    it('should handle complex data objects', () => {
      const logger = createLogger('info');
      const complexData = {
        user: { id: 1, name: 'John' },
        tags: ['tag1', 'tag2'],
        nested: { deep: { value: 'test' } },
      };

      logger.info('Complex data', complexData);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Complex data'),
        JSON.stringify(complexData)
      );
    });

    it('should create separate logger instances with independent state', () => {
      const logger1 = createLogger('debug', 'App1');
      const logger2 = createLogger('error', 'App2');

      logger1.debug('Debug from App1');
      logger2.debug('Debug from App2'); // Should be filtered

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[App1]'),
        ''
      );
    });
  });

  describe('createSilentLogger', () => {
    it('should create a logger that produces no output', () => {
      const logger = createSilentLogger();

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should handle messages with data without errors', () => {
      const logger = createSilentLogger();
      const data = { key: 'value' };

      expect(() => {
        logger.debug('Debug', data);
        logger.info('Info', data);
        logger.warn('Warn', data);
        logger.error('Error', data);
      }).not.toThrow();

      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should return logger interface with all required methods', () => {
      const logger = createSilentLogger();

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');

      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should be usable in test environments without console output', () => {
      const logger = createSilentLogger();

      // Simulate test scenario where we don't want logs
      for (let i = 0; i < 100; i++) {
        logger.info(`Iteration ${i}`, { count: i });
      }

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('Logger interface compliance', () => {
    it('should implement all required Logger methods', () => {
      const logger = createLogger('info');

      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });

    it('should accept messages without data parameter', () => {
      const logger = createLogger('debug');

      expect(() => {
        logger.debug('Message only');
        logger.info('Message only');
        logger.warn('Message only');
        logger.error('Message only');
      }).not.toThrow();
    });

    it('should accept messages with data parameter', () => {
      const logger = createLogger('debug');
      const data = { test: 'value' };

      expect(() => {
        logger.debug('Message with data', data);
        logger.info('Message with data', data);
        logger.warn('Message with data', data);
        logger.error('Message with data', data);
      }).not.toThrow();
    });
  });
});
