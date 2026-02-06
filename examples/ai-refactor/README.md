# Example: AI-Assisted Refactoring

This example shows how to use the AI and AST modules together for intelligent code analysis and refactoring.

## Usage

```typescript
import {
  parseSource,
  analyzeCode,
  compareStructure,
  transform,
  createAICodeGenerator,
  formatTypeScript,
} from '@dcyfr/ai-code-gen';

const sourceCode = `
function processUserData(data: any) {
  console.log("Processing:", data);
  let result = [];
  for (let i = 0; i < data.items.length; i++) {
    if (data.items[i].active) {
      if (data.items[i].verified) {
        if (data.items[i].age > 18) {
          result.push(data.items[i]);
        }
      }
    }
  }
  return result;
}
`;

// Step 1: Parse and analyze
const ast = parseSource(sourceCode);
console.log(`Functions: ${ast.functions.length}`);
console.log(`Complexity: ${ast.metrics.cyclomaticComplexity}`);

const analysis = analyzeCode(sourceCode);
console.log(`\nIssues found: ${analysis.issues.length}`);
for (const issue of analysis.issues) {
  console.log(`  [${issue.severity}] ${issue.type}: ${issue.message}`);
}

// Step 2: AI review
const ai = createAICodeGenerator({ provider: 'mock', model: 'gpt-4' });
const review = await ai.reviewCode({ code: sourceCode, language: 'TypeScript' });
console.log(`\nReview score: ${review.score}/100`);
for (const finding of review.findings) {
  console.log(`  [${finding.severity}] ${finding.message}`);
}

// Step 3: Apply automated transformations
const transformed = transform(sourceCode, [
  { type: 'add-import', moduleSpecifier: './types.js', namedImports: ['UserData', 'ActiveUser'] },
  { type: 'rename', oldName: 'processUserData', newName: 'filterActiveAdultUsers' },
]);

if (transformed.success) {
  console.log(`\nTransformed (${transformed.appliedOperations} operations applied)`);
}

// Step 4: Compare before/after
const diff = compareStructure(sourceCode, transformed.source);
console.log(`\nStructural changes:`);
console.log(`  Added: ${diff.added.length}`);
console.log(`  Removed: ${diff.removed.length}`);

// Step 5: Format output
const formatted = formatTypeScript(transformed.source, { singleQuote: true, tabWidth: 2 });
console.log(`\nFormatted output:\n${formatted}`);
```

## Workflow

1. **Parse** — Extract AST structure and metrics
2. **Analyze** — Detect code quality issues automatically
3. **Review** — Get AI-powered code review with scoring
4. **Transform** — Apply safe AST-based refactoring
5. **Compare** — Verify structural changes
6. **Format** — Clean up output
