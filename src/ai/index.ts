/**
 * @dcyfr/ai-code-gen - AI module exports
 */

export { AICodeGenerator, createAICodeGenerator } from './code-gen.js';
export { MockAIProvider, createAIProvider } from './provider.js';
export type { AIProvider } from './provider.js';
export {
  generateCodePrompt,
  reviewCodePrompt,
  refactorCodePrompt,
  generateDocsPrompt,
} from './prompts.js';
