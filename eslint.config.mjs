// Extends shared workspace base config.
// See eslint.config.base.mjs at workspace root for common settings.
import { createLenientConfig } from '../eslint.config.base.mjs';

export default createLenientConfig({
  // Package-specific ignores (base already includes dist, node_modules, coverage, *.config.*)
  ignores: [],
  // Lenient mode: no-explicit-any is 'warn' (inherited from base)
  // no-unused-vars is 'warn' with argsIgnorePattern: '^_' (inherited from base)
});
