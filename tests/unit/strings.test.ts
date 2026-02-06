/**
 * Tests for string utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toConstantCase,
  pluralize,
  indent,
  dedent,
} from '../../src/lib/strings.js';

describe('String Utilities', () => {
  describe('toPascalCase', () => {
    it('should convert kebab-case', () => {
      expect(toPascalCase('user-profile')).toBe('UserProfile');
    });

    it('should convert snake_case', () => {
      expect(toPascalCase('user_profile')).toBe('UserProfile');
    });

    it('should convert space-separated', () => {
      expect(toPascalCase('user profile')).toBe('UserProfile');
    });

    it('should handle single word', () => {
      expect(toPascalCase('user')).toBe('User');
    });
  });

  describe('toCamelCase', () => {
    it('should convert kebab-case', () => {
      expect(toCamelCase('user-profile')).toBe('userProfile');
    });

    it('should convert PascalCase', () => {
      expect(toCamelCase('UserProfile')).toBe('userProfile');
    });
  });

  describe('toKebabCase', () => {
    it('should convert PascalCase', () => {
      expect(toKebabCase('UserProfile')).toBe('user-profile');
    });

    it('should convert camelCase', () => {
      expect(toKebabCase('userProfile')).toBe('user-profile');
    });

    it('should convert snake_case', () => {
      expect(toKebabCase('user_profile')).toBe('user-profile');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert PascalCase', () => {
      expect(toSnakeCase('UserProfile')).toBe('user_profile');
    });

    it('should convert kebab-case', () => {
      expect(toSnakeCase('user-profile')).toBe('user_profile');
    });
  });

  describe('toConstantCase', () => {
    it('should convert PascalCase', () => {
      expect(toConstantCase('UserProfile')).toBe('USER_PROFILE');
    });
  });

  describe('pluralize', () => {
    it('should add s to regular words', () => {
      expect(pluralize('user')).toBe('users');
    });

    it('should add es to words ending in s', () => {
      expect(pluralize('bus')).toBe('buses');
    });

    it('should add es to words ending in x', () => {
      expect(pluralize('box')).toBe('boxes');
    });

    it('should handle words ending in y', () => {
      expect(pluralize('category')).toBe('categories');
    });

    it('should handle words ending in vowel+y', () => {
      expect(pluralize('key')).toBe('keys');
    });
  });

  describe('indent', () => {
    it('should indent each line', () => {
      expect(indent('a\nb', 2)).toBe('  a\n  b');
    });

    it('should not indent empty lines', () => {
      expect(indent('a\n\nb', 2)).toBe('  a\n\n  b');
    });
  });

  describe('dedent', () => {
    it('should remove common indentation', () => {
      const input = '    a\n    b\n      c';
      expect(dedent(input)).toBe('a\nb\n  c');
    });

    it('should handle empty strings', () => {
      expect(dedent('')).toBe('');
    });
  });
});
