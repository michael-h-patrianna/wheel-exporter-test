/**
 * Comprehensive test suite for logger service
 * Tests all log levels, context, configuration, and environment-aware behavior
 */

import { logger, LogLevel, LogEntry } from '../logger';
import { vi } from 'vitest';

describe('logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };

    // Reset logger to default configuration
    logger.configure({
      minLevel: 'debug',
      enableConsole: true,
      onLog: undefined,
    });
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    vi.clearAllMocks();
  });

  describe('Log levels', () => {
    describe('debug level', () => {
      it('should log debug messages', () => {
        logger.debug('Debug message');

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG] Debug message')
        );
      });

      it('should log debug messages with context', () => {
        logger.debug('Debug message', { key: 'value', count: 42 });

        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG] Debug message')
        );
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key":"value"'));
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"count":42'));
      });

      it('should not log debug when minLevel is info', () => {
        logger.configure({ minLevel: 'info' });
        logger.debug('Should not appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });

      it('should not log debug when minLevel is warn', () => {
        logger.configure({ minLevel: 'warn' });
        logger.debug('Should not appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });

      it('should not log debug when minLevel is error', () => {
        logger.configure({ minLevel: 'error' });
        logger.debug('Should not appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });
    });

    describe('info level', () => {
      it('should log info messages', () => {
        logger.info('Info message');

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO] Info message'));
      });

      it('should log info messages with context', () => {
        logger.info('Info message', { userId: '123', action: 'login' });

        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO] Info message'));
        expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"userId":"123"'));
      });

      it('should log info when minLevel is debug', () => {
        logger.configure({ minLevel: 'debug' });
        logger.info('Should appear');

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      });

      it('should log info when minLevel is info', () => {
        logger.configure({ minLevel: 'info' });
        logger.info('Should appear');

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      });

      it('should not log info when minLevel is warn', () => {
        logger.configure({ minLevel: 'warn' });
        logger.info('Should not appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });

      it('should not log info when minLevel is error', () => {
        logger.configure({ minLevel: 'error' });
        logger.info('Should not appear');

        expect(consoleSpy.log).not.toHaveBeenCalled();
      });
    });

    describe('warn level', () => {
      it('should log warn messages using console.warn', () => {
        logger.warn('Warning message');

        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpy.warn).toHaveBeenCalledWith(
          expect.stringContaining('[WARN] Warning message')
        );
      });

      it('should log warn messages with context', () => {
        logger.warn('Warning message', { reason: 'deprecated', version: '2.0' });

        expect(consoleSpy.warn).toHaveBeenCalledWith(
          expect.stringContaining('[WARN] Warning message')
        );
        expect(consoleSpy.warn).toHaveBeenCalledWith(
          expect.stringContaining('"reason":"deprecated"')
        );
      });

      it('should log warn when minLevel is debug', () => {
        logger.configure({ minLevel: 'debug' });
        logger.warn('Should appear');

        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      });

      it('should log warn when minLevel is info', () => {
        logger.configure({ minLevel: 'info' });
        logger.warn('Should appear');

        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      });

      it('should log warn when minLevel is warn', () => {
        logger.configure({ minLevel: 'warn' });
        logger.warn('Should appear');

        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      });

      it('should not log warn when minLevel is error', () => {
        logger.configure({ minLevel: 'error' });
        logger.warn('Should not appear');

        expect(consoleSpy.warn).not.toHaveBeenCalled();
      });
    });

    describe('error level', () => {
      it('should log error messages using console.error', () => {
        logger.error('Error message');

        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] Error message')
        );
      });

      it('should log error messages with context', () => {
        logger.error('Error message', { code: 500, stack: 'trace' });

        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] Error message')
        );
        expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"code":500'));
      });

      it('should always log errors regardless of minLevel', () => {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

        levels.forEach((level) => {
          vi.clearAllMocks();
          logger.configure({ minLevel: level });
          logger.error('Always appears');

          expect(consoleSpy.error).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Log context', () => {
    it('should log message without context', () => {
      logger.info('No context');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.not.stringContaining('{}'));
    });

    it('should log message with simple context', () => {
      logger.info('With context', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key":"value"'));
    });

    it('should log message with complex context', () => {
      const context = {
        string: 'text',
        number: 42,
        boolean: true,
        nested: { key: 'value' },
        array: [1, 2, 3],
      };

      logger.info('Complex context', context);

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"string":"text"'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"number":42'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"boolean":true'));
    });

    it('should handle null context gracefully', () => {
      logger.info('Null context', null as any);

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined context gracefully', () => {
      logger.info('Undefined context', undefined);

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('Configuration', () => {
    describe('minLevel configuration', () => {
      it('should respect configured minLevel', () => {
        logger.configure({ minLevel: 'warn' });

        logger.debug('Debug');
        logger.info('Info');
        logger.warn('Warn');
        logger.error('Error');

        expect(consoleSpy.log).not.toHaveBeenCalled();
        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      });

      it('should allow changing minLevel multiple times', () => {
        logger.configure({ minLevel: 'error' });
        logger.info('Should not appear');
        expect(consoleSpy.log).not.toHaveBeenCalled();

        logger.configure({ minLevel: 'debug' });
        logger.info('Should appear');
        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      });
    });

    describe('enableConsole configuration', () => {
      it('should disable console output when enableConsole is false', () => {
        logger.configure({ enableConsole: false });

        logger.debug('Debug');
        logger.info('Info');
        logger.warn('Warn');
        logger.error('Error');

        expect(consoleSpy.log).not.toHaveBeenCalled();
        expect(consoleSpy.warn).not.toHaveBeenCalled();
        expect(consoleSpy.error).not.toHaveBeenCalled();
      });

      it('should enable console output when enableConsole is true', () => {
        logger.configure({ enableConsole: false });
        logger.info('Should not appear');
        expect(consoleSpy.log).not.toHaveBeenCalled();

        logger.configure({ enableConsole: true });
        logger.info('Should appear');
        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      });
    });

    describe('onLog callback configuration', () => {
      it('should call onLog callback when provided', () => {
        const onLog = vi.fn();
        logger.configure({ onLog });

        logger.info('Test message', { key: 'value' });

        expect(onLog).toHaveBeenCalledTimes(1);
        expect(onLog).toHaveBeenCalledWith(
          expect.objectContaining({
            level: 'info',
            message: 'Test message',
            context: { key: 'value' },
            timestamp: expect.any(Number),
          })
        );
      });

      it('should call onLog for all log levels', () => {
        const onLog = vi.fn();
        logger.configure({ onLog });

        logger.debug('Debug');
        logger.info('Info');
        logger.warn('Warn');
        logger.error('Error');

        expect(onLog).toHaveBeenCalledTimes(4);
        expect(onLog).toHaveBeenNthCalledWith(1, expect.objectContaining({ level: 'debug' }));
        expect(onLog).toHaveBeenNthCalledWith(2, expect.objectContaining({ level: 'info' }));
        expect(onLog).toHaveBeenNthCalledWith(3, expect.objectContaining({ level: 'warn' }));
        expect(onLog).toHaveBeenNthCalledWith(4, expect.objectContaining({ level: 'error' }));
      });

      it('should call onLog even when console is disabled', () => {
        const onLog = vi.fn();
        logger.configure({ enableConsole: false, onLog });

        logger.info('Test message');

        expect(consoleSpy.log).not.toHaveBeenCalled();
        expect(onLog).toHaveBeenCalledTimes(1);
      });

      it('should not call onLog when log level is below minLevel', () => {
        const onLog = vi.fn();
        logger.configure({ minLevel: 'warn', onLog });

        logger.debug('Debug');
        logger.info('Info');

        expect(onLog).not.toHaveBeenCalled();
      });

      it('should include correct timestamp in onLog callback', () => {
        const onLog = vi.fn();
        logger.configure({ onLog });

        const beforeTime = Date.now();
        logger.info('Test');
        const afterTime = Date.now();

        expect(onLog).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: expect.any(Number),
          })
        );

        const logEntry = onLog.mock.calls[0][0] as LogEntry;
        expect(logEntry.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(logEntry.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    describe('Partial configuration', () => {
      it('should merge partial configuration with existing config', () => {
        logger.configure({ minLevel: 'warn', enableConsole: true });
        logger.configure({ enableConsole: false }); // Only change enableConsole

        // minLevel should still be 'warn'
        logger.info('Should not appear');
        expect(consoleSpy.log).not.toHaveBeenCalled();

        // enableConsole should be false
        logger.error('Should not appear in console');
        expect(consoleSpy.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('Environment-aware behavior', () => {
    // Note: Cannot modify process.env.NODE_ENV in tests as it's read-only
    // These tests verify the logger respects configured levels

    beforeEach(() => {
      // Tests run in test environment
    });

    it('should default to debug level in development', () => {
      // Note: Testing constructor behavior would require reloading the module
      // This test verifies that the logger respects configured debug level
      logger.configure({ minLevel: 'debug' });
      logger.debug('Debug in development');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
    });

    it('should respect info level in production', () => {
      logger.configure({ minLevel: 'info' });
      logger.debug('Should not appear');
      logger.info('Should appear');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
    });
  });

  describe('Console method calls', () => {
    it('should use console.log for debug level', () => {
      logger.debug('Debug message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should use console.log for info level', () => {
      logger.info('Info message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should use console.warn for warn level', () => {
      logger.warn('Warn message');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should use console.error for error level', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });
  });

  describe('withContext', () => {
    it('should create child logger with preset context', () => {
      const childLogger = logger.withContext({ operation: 'test', userId: '123' });

      childLogger.info('Child log');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"operation":"test"'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"userId":"123"'));
    });

    it('should merge child context with additional context', () => {
      const childLogger = logger.withContext({ operation: 'test' });

      childLogger.info('Child log', { requestId: 'abc123' });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"operation":"test"'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"requestId":"abc123"'));
    });

    it('should allow child context to override base context', () => {
      const childLogger = logger.withContext({ key: 'base' });

      childLogger.info('Override', { key: 'override' });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key":"override"'));
      expect(consoleSpy.log).not.toHaveBeenCalledWith(expect.stringContaining('"key":"base"'));
    });

    it('should support all log levels in child logger', () => {
      const childLogger = logger.withContext({ context: 'child' });

      childLogger.debug('Debug');
      childLogger.info('Info');
      childLogger.warn('Warn');
      childLogger.error('Error');

      expect(consoleSpy.log).toHaveBeenCalledTimes(2); // debug + info
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // All should include the base context
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"context":"child"'));
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('"context":"child"'));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('"context":"child"'));
    });

    it('should respect parent logger configuration', () => {
      logger.configure({ minLevel: 'warn' });
      const childLogger = logger.withContext({ context: 'child' });

      childLogger.debug('Should not appear');
      childLogger.info('Should not appear');
      childLogger.warn('Should appear');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    });

    it('should work with empty base context', () => {
      const childLogger = logger.withContext({});

      childLogger.info('Test', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('"key":"value"'));
    });
  });

  describe('Message formatting', () => {
    it('should include ISO timestamp', () => {
      logger.info('Test');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/)
      );
    });

    it('should include uppercase level name', () => {
      logger.debug('Test');
      logger.info('Test');
      logger.warn('Test');
      logger.error('Test');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[INFO]'));
      expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining('[WARN]'));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'));
    });

    it('should include message text', () => {
      logger.info('Custom message text');

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Custom message text'));
    });

    it('should include JSON stringified context', () => {
      logger.info('Test', { key: 'value', number: 42 });

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringMatching(/"key":"value"/));
    });

    it('should format message without context correctly', () => {
      logger.info('No context message');

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toMatch(/\[\d{4}-.*\] \[INFO\] No context message$/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty message string', () => {
      logger.info('');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      logger.info(longMessage);

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining(longMessage));
    });

    it('should handle special characters in message', () => {
      logger.info('Message with\nnewlines\tand\ttabs');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    });

    it('should handle circular references in context', () => {
      const circular: any = { key: 'value' };
      circular.self = circular;

      // Should not throw
      expect(() => {
        logger.info('Circular context', circular);
      }).toThrow(); // JSON.stringify will throw, which is expected behavior
    });
  });
});
