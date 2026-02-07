# AI Integration - Intelligent Code Generation

**Target Audience:** Developers integrating AI providers for code generation  
**Prerequisites:** Understanding of AI/LLM APIs, async/await patterns

---

## Overview

The AI Integration module provides a pluggable provider system for incorporating AI-powered code generation, review, refactoring suggestions, and documentation generation into your workflows.

**Key Features:**
- Pluggable AI provider architecture (OpenAI, Anthropic, etc.)
- Structured prompts for code generation
- Code review with actionable feedback
- Refactoring suggestion engine
- Documentation generation
- Type-safe request/response handling
- Rate limiting and error handling

---

## Quick Start

### Basic AI Code Generation

```typescript
import { createAICodeGenerator } from '@dcyfr/ai-code-gen';

const ai = createAICodeGenerator({
  provider: 'openai',  // or 'anthropic', 'mock'
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
});

const result = await ai.generateCode({
  prompt: 'Create a TypeScript function that validates email addresses using regex',
  language: 'typescript',
  context: {
    framework: 'none',
    style: 'functional',
  },
});

console.log(result.code);
```

**Output:**
```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

---

## AI Providers

### OpenAI Provider

```typescript
import { OpenAIProvider } from '@dcyfr/ai-code-gen';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.2,  // Lower temperature for more deterministic code
  maxTokens: 2000,
});

const ai = createAICodeGenerator({ provider });
```

### Anthropic (Claude) Provider

```typescript
import { AnthropicProvider } from '@dcyfr/ai-code-gen';

const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229',
  temperature: 0.2,
  maxTokens: 4000,
});

const ai = createAICodeGenerator({ provider });
```

### Mock Provider (Testing)

```typescript
import { MockAIProvider } from '@dcyfr/ai-code-gen';

const provider = new MockAIProvider();

const ai = createAICodeGenerator({ provider });
// Returns predefined mock responses
```

---

## Code Generation

### Generate Function

```typescript
const result = await ai.generateCode({
  prompt: 'Create an async function that fetches user data from an API',
  language: 'typescript',
  context: {
    framework: 'none',
    style: 'async/await',
    includes: ['error handling', 'type safety'],
  },
});

console.log(result.code);
```

**Output:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

export async function fetchUser(userId: string): Promise<User> {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

### Generate Class

```typescript
const result = await ai.generateCode({
  prompt: 'Create a UserService class with CRUD operations using dependency injection',
  language: 'typescript',
  context: {
    framework: 'none',
    style: 'class-based',
    patterns: ['dependency injection', 'repository pattern'],
  },
});

console.log(result.code);
```

**Output:**
```typescript
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserService {
  constructor(private repository: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.repository.create(data);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    return this.repository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
```

### Generate with Constraints

```typescript
const result = await ai.generateCode({
  prompt: 'Create a function to calculate Fibonacci sequence',
  language: 'typescript',
  constraints: {
    maxLines: 20,
    complexity: 'low',
    dependencies: [],  // No external dependencies
  },
  context: {
    style: 'functional',
    performanceOptimized: true,
  },
});
```

---

## Code Review

### Review Code Quality

```typescript
const review = await ai.reviewCode({
  code: `
function processData(input: any) {
  console.log(input);
  if (input.a) {
    if (input.b) {
      if (input.c) {
        return true;
      }
    }
  }
  return false;
}
  `,
  language: 'typescript',
  focusAreas: ['type safety', 'complexity', 'best practices'],
});

console.log(review.issues);
```

**Output:**
```json
{
  "issues": [
    {
      "severity": "error",
      "type": "type-safety",
      "line": 1,
      "message": "Avoid using 'any' type",
      "suggestion": "Define a specific interface for the input parameter",
      "example": "interface Input { a?: boolean; b?: boolean; c?: boolean; }"
    },
    {
      "severity": "warning",
      "type": "code-smell",
      "line": 2,
      "message": "Avoid console.log in production code",
      "suggestion": "Use a proper logging library or remove"
    },
    {
      "severity": "warning",
      "type": "complexity",
      "line": 1,
      "message": "Deep nesting detected (complexity: 4)",
      "suggestion": "Flatten nested conditions: return input.a && input.b && input.c || false;"
    }
  ],
  "score": 6.5,
  "summary": "Code has type safety issues and high complexity. Refactoring recommended."
}
```

### Security Review

```typescript
const review = await ai.reviewCode({
  code: userInputHandlerCode,
  language: 'typescript',
  focusAreas: ['security', 'input validation'],
  securityLevel: 'strict',
});

console.log(review.securityIssues);
```

**Output:**
```json
{
  "securityIssues": [
    {
      "severity": "high",
      "type": "sql-injection",
      "line": 15,
      "message": "Potential SQL injection vulnerability",
      "suggestion": "Use parameterized queries or an ORM"
    },
    {
      "severity": "medium",
      "type": "input-validation",
      "line": 8,
      "message": "User input not validated",
      "suggestion": "Add input validation using Zod or similar"
    }
  ]
}
```

---

## Refactoring Suggestions

### Suggest Improvements

```typescript
const suggestions = await ai.suggestRefactoring({
  code: `
export class UserController {
  async getUser(req: Request, res: Response) {
    const id = req.params.id;
    const user = await db.users.findOne({ id });
    if (!user) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(user);
  }
}
  `,
  language: 'typescript',
  goals: ['separation of concerns', 'testability', 'error handling'],
});

console.log(suggestions.refactorings);
```

**Output:**
```json
{
  "refactorings": [
    {
      "type": "extract-service",
      "priority": "high",
      "description": "Extract database logic to UserService",
      "before": "const user = await db.users.findOne({ id });",
      "after": "const user = await this.userService.getUserById(id);",
      "benefits": ["Better testability", "Separation of concerns", "Reusability"]
    },
    {
      "type": "improve-error-handling",
      "priority": "medium",
      "description": "Use custom exception and error middleware",
      "before": "res.status(404).json({ error: 'Not found' });",
      "after": "throw new NotFoundException('User not found');",
      "benefits": ["Consistent error handling", "Cleaner code"]
    }
  ],
  "estimatedImpact": "Medium - improves testability and maintainability"
}
```

### Pattern Suggestions

```typescript
const suggestions = await ai.suggestRefactoring({
  code: oldCode,
  language: 'typescript',
  patterns: ['singleton', 'factory', 'observer'],
  context: {
    framework: 'none',
    designGoals: ['scalability', 'maintainability'],
  },
});

console.log(suggestions.patterns);
```

---

## Documentation Generation

### Generate JSDoc

```typescript
const docs = await ai.generateDocs({
  code: `
export function calculateTax(income: number, rate: number) {
  return income * (rate / 100);
}
  `,
  language: 'typescript',
  style: 'jsdoc',
});

console.log(docs.documentation);
```

**Output:**
```typescript
/**
 * Calculates tax amount based on income and tax rate
 * 
 * @param income - The income amount to calculate tax for
 * @param rate - The tax rate as a percentage (e.g., 15 for 15%)
 * @returns The calculated tax amount
 * 
 * @example
 * ```typescript
 * const tax = calculateTax(100000, 15);
 * console.log(tax); // 15000
 * ```
 */
export function calculateTax(income: number, rate: number) {
  return income * (rate / 100);
}
```

### Generate README

```typescript
const docs = await ai.generateDocs({
  code: moduleCode,
  language: 'typescript',
  style: 'markdown',
  sections: ['installation', 'usage', 'api', 'examples'],
});

console.log(docs.documentation);
```

---

## Custom AI Provider

### Implement AIProvider Interface

```typescript
import { AIProvider, GenerateCodeRequest, GenerateCodeResponse } from '@dcyfr/ai-code-gen';

export class CustomAIProvider implements AIProvider {
  constructor(private config: { apiKey: string; endpoint: string }) {}

  async generateCode(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    // Call your custom AI API
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: this.buildPrompt(request),
        language: request.language,
      }),
    });

    const data = await response.json();

    return {
      code: data.generatedCode,
      explanation: data.explanation,
      metadata: {
        tokensUsed: data.usage.totalTokens,
        model: data.model,
      },
    };
  }

  async reviewCode(request: ReviewCodeRequest): Promise<ReviewCodeResponse> {
    // Implement code review logic
    // ...
  }

  async suggestRefactoring(request: RefactoringRequest): Promise<RefactoringResponse> {
    // Implement refactoring suggestions
    // ...
  }

  async generateDocs(request: DocsRequest): Promise<DocsResponse> {
    // Implement documentation generation
    // ...
  }

  private buildPrompt(request: GenerateCodeRequest): string {
    return `
Language: ${request.language}
Task: ${request.prompt}
Context: ${JSON.stringify(request.context)}

Generate clean, type-safe, well-documented code.
    `.trim();
  }
}
```

### Use Custom Provider

```typescript
const customProvider = new CustomAIProvider({
  apiKey: process.env.CUSTOM_AI_KEY,
  endpoint: 'https://ai.example.com/generate',
});

const ai = createAICodeGenerator({ provider: customProvider });
```

---

## Prompt Engineering

### Structured Prompts

```typescript
import { buildCodeGenerationPrompt } from '@dcyfr/ai-code-gen';

const prompt = buildCodeGenerationPrompt({
  task: 'Create a user authentication service',
  language: 'typescript',
  framework: 'none',
  requirements: [
    'Use bcrypt for password hashing',
    'Generate JWT tokens',
    'Implement login and register methods',
    'Include proper error handling',
  ],
  constraints: [
    'No external dependencies except bcrypt and jsonwebtoken',
    'Maximum 100 lines',
    'Include JSDoc comments',
  ],
  examples: [
    {
      input: 'email: user@example.com, password: secret123',
      output: 'JWT token',
    },
  ],
});

const result = await ai.generateCode({ prompt, language: 'typescript' });
```

### Context-Aware Generation

```typescript
const result = await ai.generateCode({
  prompt: 'Add a deleteUser method to this service',
  language: 'typescript',
  context: {
    existingCode: userServiceCode,  // Provide existing code for context
    codeStyle: 'match existing',
    framework: 'none',
  },
});
```

---

## Advanced Workflows

### Generate → Review → Refactor Pipeline

```typescript
async function aiCodePipeline(prompt: string) {
  // 1. Generate initial code
  const generated = await ai.generateCode({
    prompt,
    language: 'typescript',
  });

  console.log('Generated code:', generated.code);

  // 2. Review generated code
  const review = await ai.reviewCode({
    code: generated.code,
    language: 'typescript',
  });

  console.log('Review score:', review.score);
  console.log('Issues found:', review.issues.length);

  // 3. If score is low, request refactoring
  if (review.score < 8.0) {
    const refactored = await ai.suggestRefactoring({
      code: generated.code,
      language: 'typescript',
      goals: review.issues.map(issue => issue.type),
    });

    console.log('Refactoring suggestions:', refactored.refactorings);
  }

  // 4. Generate documentation
  const docs = await ai.generateDocs({
    code: generated.code,
    language: 'typescript',
    style: 'jsdoc',
  });

  return {
    code: generated.code,
    review,
    documentation: docs.documentation,
  };
}
```

### Incremental Code Generation

```typescript
async function buildFeatureIncrementally(featureName: string) {
  const components = [];

  // 1. Generate interface
  const interfaceResult = await ai.generateCode({
    prompt: `Create TypeScript interface for ${featureName}`,
    language: 'typescript',
  });
  components.push({ type: 'interface', code: interfaceResult.code });

  // 2. Generate implementation (using interface as context)
  const implResult = await ai.generateCode({
    prompt: `Implement ${featureName} using this interface`,
    language: 'typescript',
    context: {
      existingCode: interfaceResult.code,
    },
  });
  components.push({ type: 'implementation', code: implResult.code });

  // 3. Generate tests (using implementation as context)
  const testResult = await ai.generateCode({
    prompt: `Write unit tests for ${featureName}`,
    language: 'typescript',
    context: {
      existingCode: implResult.code,
      framework: 'vitest',
    },
  });
  components.push({ type: 'tests', code: testResult.code });

  return components;
}
```

---

## Error Handling

### Rate Limiting

```typescript
import { createAICodeGenerator, RateLimitError } from '@dcyfr/ai-code-gen';

const ai = createAICodeGenerator({
  provider: 'openai',
  rateLimit: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
  },
});

try {
  const result = await ai.generateCode({ /* ... */ });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded. Retry after:', error.retryAfter);
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
  }
}
```

### Timeout Handling

```typescript
const ai = createAICodeGenerator({
  provider: 'openai',
  timeout: 30000,  // 30 seconds
});

try {
  const result = await ai.generateCode({ /* ... */ });
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out. Try with simpler prompt.');
  }
}
```

### Validation Errors

```typescript
try {
  const result = await ai.generateCode({
    prompt: 'Create a function',
    language: 'invalid-language',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Invalid request:', error.validationErrors);
  }
}
```

---

## Best Practices

1. **Use Specific Prompts**
   ```typescript
   // ❌ BAD - Too vague
   await ai.generateCode({ prompt: 'Create a function', language: 'typescript' });
   
   // ✅ GOOD - Specific requirements
   await ai.generateCode({
     prompt: 'Create an async function that validates email format using regex, returns boolean, includes error handling',
     language: 'typescript',
   });
   ```

2. **Provide Context**
   ```typescript
   // ✅ Include existing code for better results
   await ai.generateCode({
     prompt: 'Add a delete method',
     context: {
       existingCode: serviceCode,
       codeStyle: 'match existing',
     },
   });
   ```

3. **Review AI-Generated Code**
   ```typescript
   const generated = await ai.generateCode({ /* ... */ });
   const review = await ai.reviewCode({ code: generated.code, language: 'typescript' });
   
   if (review.score < 8.0) {
     console.warn('Generated code needs improvement');
   }
   ```

4. **Set Temperature Appropriately**
   ```typescript
   // Low temperature (0.0-0.3) for code generation - more deterministic
   const codeProvider = new OpenAIProvider({ temperature: 0.2 });
   
   // Higher temperature (0.7-1.0) for creative tasks like naming
   const namingProvider = new OpenAIProvider({ temperature: 0.8 });
   ```

5. **Handle Errors Gracefully**
   ```typescript
   try {
     const result = await ai.generateCode({ /* ... */ });
   } catch (error) {
     if (error instanceof RateLimitError) {
       // Retry with exponential backoff
     } else if (error instanceof ValidationError) {
       // Fix request parameters
     } else {
       // Log and fallback to manual coding
     }
   }
   ```

---

## Configuration

### Complete AI Configuration

```typescript
const ai = createAICodeGenerator({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  
  // Generation settings
  temperature: 0.2,
  maxTokens: 2000,
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
  },
  
  // Timeout
  timeout: 30000,
  
  // Retry policy
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    exponentialBackoff: true,
  },
  
  // Logging
  logger: console,
  logLevel: 'info',
});
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
