/**
 * @dcyfr/ai-code-gen - AI Prompt Templates
 *
 * Structured prompts for LLM-powered code generation, review, and refactoring.
 */

/** Prompt template for code generation */
export function generateCodePrompt(options: {
  description: string;
  language: string;
  framework?: string;
  constraints?: string[];
  context?: string;
}): string {
  const parts = [
    `Generate ${options.language} code for the following:`,
    '',
    `Description: ${options.description}`,
    '',
    `Language: ${options.language}`,
  ];

  if (options.framework) {
    parts.push(`Framework: ${options.framework}`);
  }

  if (options.constraints && options.constraints.length > 0) {
    parts.push('', 'Constraints:');
    for (const constraint of options.constraints) {
      parts.push(`- ${constraint}`);
    }
  }

  if (options.context) {
    parts.push('', 'Existing code context:', '```', options.context, '```');
  }

  parts.push(
    '',
    'Requirements:',
    '- Write clean, well-documented code',
    '- Include proper TypeScript types',
    '- Follow best practices for the specified language/framework',
    '- Include error handling where appropriate',
    '',
    'Return ONLY the code, no explanations.',
  );

  return parts.join('\n');
}

/** Prompt template for code review */
export function reviewCodePrompt(options: {
  code: string;
  language: string;
  focus?: string[];
}): string {
  const parts = [
    `Review the following ${options.language} code:`,
    '',
    '```',
    options.code,
    '```',
    '',
    'Analyze for:',
    '1. Security vulnerabilities',
    '2. Performance issues',
    '3. Code style and readability',
    '4. Correctness and edge cases',
    '5. Maintainability',
  ];

  if (options.focus && options.focus.length > 0) {
    parts.push('', 'Focus areas:');
    for (const area of options.focus) {
      parts.push(`- ${area}`);
    }
  }

  parts.push(
    '',
    'For each finding, provide:',
    '- Severity: error | warning | info | suggestion',
    '- Category: security | performance | style | correctness | maintainability',
    '- Message: description of the issue',
    '- Line: approximate line number',
    '- Suggested fix: how to resolve the issue',
    '',
    'Return findings as a JSON array.',
  );

  return parts.join('\n');
}

/** Prompt template for refactoring suggestions */
export function refactorCodePrompt(options: {
  code: string;
  language: string;
  goals?: string[];
}): string {
  const parts = [
    `Suggest refactoring for the following ${options.language} code:`,
    '',
    '```',
    options.code,
    '```',
  ];

  if (options.goals && options.goals.length > 0) {
    parts.push('', 'Refactoring goals:');
    for (const goal of options.goals) {
      parts.push(`- ${goal}`);
    }
  } else {
    parts.push(
      '',
      'Goals:',
      '- Reduce complexity',
      '- Improve readability',
      '- Extract reusable patterns',
      '- Apply SOLID principles',
    );
  }

  parts.push(
    '',
    'For each suggestion, provide:',
    '- Description: what to refactor',
    '- Original: the original code snippet',
    '- Refactored: the improved code',
    '- Rationale: why this improves the code',
    '- Impact: low | medium | high',
    '',
    'Return suggestions as a JSON array.',
  );

  return parts.join('\n');
}

/** Prompt template for documentation generation */
export function generateDocsPrompt(options: {
  code: string;
  language: string;
  style?: 'jsdoc' | 'tsdoc' | 'markdown';
}): string {
  const style = options.style ?? 'jsdoc';

  return [
    `Generate ${style} documentation for the following ${options.language} code:`,
    '',
    '```',
    options.code,
    '```',
    '',
    'Requirements:',
    `- Use ${style} format`,
    '- Document all exported functions, classes, and interfaces',
    '- Include @param, @returns, and @example tags',
    '- Be concise but thorough',
    '- Include edge cases in @example sections',
    '',
    'Return the documented code.',
  ].join('\n');
}
