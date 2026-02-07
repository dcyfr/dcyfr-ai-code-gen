/**
 * AST Refactoring Example - Complex Code Transformation Workflows
 * 
 * This example demonstrates:
 * - Class-to-function component migration (React)
 * - Adding dependency injection decorators
 * - Modernizing async patterns (callbacks → promises → async/await)
 * - Batch refactoring multiple files
 * - Code quality improvements (removing any types, adding error handling)
 */

import {
  parseSource,
  applyTransformations,
  analyzeCode,
  formatTypeScript,
  type ASTStructure,
  type CodeTransformation,
} from '@dcyfr/ai-code-gen';

// ============================================================================
// 1. Class-to-Function Component Migration
// ============================================================================

const classComponentCode = `
import React, { Component } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

interface UserProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

class UserProfile extends Component<UserProfileProps, UserProfileState> {
  constructor(props: UserProfileProps) {
    super(props);
    this.state = {
      user: null,
      loading: false,
      error: null,
    };
  }

  async componentDidMount() {
    await this.fetchUser();
  }

  async componentDidUpdate(prevProps: UserProfileProps) {
    if (prevProps.userId !== this.props.userId) {
      await this.fetchUser();
    }
  }

  fetchUser = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch(\`/api/users/\${this.props.userId}\`);
      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  handleUpdate = () => {
    if (this.state.user && this.props.onUpdate) {
      this.props.onUpdate(this.state.user);
    }
  };

  render() {
    const { user, loading, error } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!user) return null;

    return (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <button onClick={this.handleUpdate}>Update</button>
      </div>
    );
  }
}

export default UserProfile;
`;

async function migrateClassToFunction(code: string): Promise<string> {
  const ast = parseSource(code);
  
  // Extract class information
  const classInfo = ast.classes[0];
  if (!classInfo) {
    throw new Error('No class found to migrate');
  }
  
  // Build function component
  const { name, methods, properties } = classInfo;
  
  // Convert class methods to hooks and handlers
  const hookCode: string[] = [];
  const handlerCode: string[] = [];
  
  // Map lifecycle methods to hooks
  if (methods.some(m => m.name === 'componentDidMount')) {
    hookCode.push(`
  useEffect(() => {
    fetchUser();
  }, []);
    `);
  }
  
  if (methods.some(m => m.name === 'componentDidUpdate')) {
    hookCode.push(`
  useEffect(() => {
    fetchUser();
  }, [userId]);
    `);
  }
  
  // Convert state to useState hooks
  hookCode.push(`
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  `);
  
  // Convert methods to functions
  handlerCode.push(`
  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(\`/api/users/\${userId}\`);
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    if (user && onUpdate) {
      onUpdate(user);
    }
  };
  `);
  
  // Generate function component
  const functionComponent = `
'use client';

import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  ${hookCode.join('\n')}
  ${handlerCode.join('\n')}

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
  `;
  
  return formatTypeScript(functionComponent);
}

// ============================================================================
// 2. Add Dependency Injection Decorators
// ============================================================================

const serviceCode = `
export class UserService {
  constructor(private userRepository: UserRepository, private logger: Logger) {}

  async getUser(id: string): Promise<User> {
    this.logger.info(\`Fetching user: \${id}\`);
    return this.userRepository.findById(id);
  }
}
`;

async function addDependencyInjection(code: string): Promise<string> {
  const transformations: CodeTransformation[] = [
    // Add imports
    {
      type: 'add-import',
      moduleSpecifier: 'tsyringe',
      namedImports: ['injectable', 'inject'],
    },
    // Add @injectable decorator to class
    {
      type: 'add-decorator',
      className: 'UserService',
      decorator: '@injectable()',
    },
    // Add @inject decorators to constructor parameters
    {
      type: 'add-constructor-parameter-decorator',
      className: 'UserService',
      parameterName: 'userRepository',
      decorator: "@inject('UserRepository')",
    },
    {
      type: 'add-constructor-parameter-decorator',
      className: 'UserService',
      parameterName: 'logger',
      decorator: "@inject('Logger')",
    },
  ];
  
  return applyTransformations(code, transformations);
}

// ============================================================================
// 3. Modernize Async Patterns
// ============================================================================

const callbackCode = `
function fetchUserData(userId: string, callback: (err: Error | null, data?: any) => void) {
  getUserFromDB(userId, (err, user) => {
    if (err) {
      callback(err);
      return;
    }
    
    getPermissions(user.id, (err, permissions) => {
      if (err) {
        callback(err);
        return;
      }
      
      getPreferences(user.id, (err, preferences) => {
        if (err) {
          callback(err);
          return;
        }
        
        callback(null, { user, permissions, preferences });
      });
    });
  });
}
`;

async function modernizeAsync(code: string): Promise<string> {
  // Transform callback hell to async/await
  const modernCode = `
async function fetchUserData(userId: string): Promise<{
  user: User;
  permissions: Permission[];
  preferences: Preferences;
}> {
  try {
    const user = await getUserFromDB(userId);
    const [permissions, preferences] = await Promise.all([
      getPermissions(user.id),
      getPreferences(user.id),
    ]);
    
    return { user, permissions, preferences };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}
  `;
  
  return formatTypeScript(modernCode);
}

// ============================================================================
// 4. Remove 'any' Types and Add Error Handling
// ============================================================================

const unsafeCode = `
export function processData(data: any) {
  console.log(data);
  return data.items.map((item: any) => ({
    id: item.id,
    value: item.value * 2,
  }));
}
`;

async function improveTypeSafety(code: string): Promise<string> {
  const analysis = analyzeCode(code);
  
  console.log('Code quality issues found:');
  analysis.issues.forEach(issue => {
    console.log(`  - ${issue.type} at line ${issue.line}: ${issue.message}`);
  });
  
  // Improved version with proper types and error handling
  const improvedCode = `
interface DataItem {
  id: string;
  value: number;
}

interface ProcessedItem {
  id: string;
  value: number;
}

interface DataPayload {
  items: DataItem[];
}

export function processData(data: DataPayload): ProcessedItem[] {
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Invalid data format');
  }
  
  return data.items.map((item) => {
    if (!item.id || typeof item.value !== 'number') {
      throw new Error(\`Invalid item format: \${JSON.stringify(item)}\`);
    }
    
    return {
      id: item.id,
      value: item.value * 2,
    };
  });
}
  `;
  
  return formatTypeScript(improvedCode);
}

// ============================================================================
// 5. Batch Refactoring Workflow
// ============================================================================

interface RefactoringTask {
  name: string;
  input: string;
  transform: (code: string) => Promise<string>;
}

async function batchRefactor(tasks: RefactoringTask[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const task of tasks) {
    console.log(`\n--- Refactoring: ${task.name} ---`);
    
    try {
      const before = task.input;
      const after = await task.transform(before);
      
      // Analyze improvements
      const beforeAnalysis = analyzeCode(before);
      const afterAnalysis = analyzeCode(after);
      
      console.log(`Issues before: ${beforeAnalysis.issues.length}`);
      console.log(`Issues after: ${afterAnalysis.issues.length}`);
      console.log(`Improvement: ${beforeAnalysis.issues.length - afterAnalysis.issues.length} issues fixed`);
      
      results.set(task.name, after);
    } catch (error) {
      console.error(`Failed to refactor ${task.name}:`, error);
    }
  }
  
  return results;
}

// ============================================================================
// 6. Advanced: Extract Interface from Class
// ============================================================================

const concreteServiceCode = `
export class EmailService {
  constructor(private smtpClient: SMTPClient) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.smtpClient.send({ to, subject, body });
  }

  async sendBulkEmail(recipients: string[], subject: string, body: string): Promise<void> {
    await Promise.all(
      recipients.map(to => this.sendEmail(to, subject, body))
    );
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
`;

async function extractInterface(code: string): Promise<string> {
  const ast = parseSource(code);
  const classInfo = ast.classes[0];
  
  if (!classInfo) {
    throw new Error('No class found');
  }
  
  // Generate interface from public methods
  const { name, methods } = classInfo;
  const interfaceName = `I${name}`;
  
  const methodSignatures = methods
    .filter(m => !m.name.startsWith('_')) // Exclude private methods
    .map(m => {
      const params = m.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
      return `  ${m.name}(${params}): ${m.returnType};`;
    })
    .join('\n');
  
  const interfaceCode = `
export interface ${interfaceName} {
${methodSignatures}
}

${code.replace(`export class ${name}`, `export class ${name} implements ${interfaceName}`)}
  `;
  
  return formatTypeScript(interfaceCode);
}

// ============================================================================
// 7. Main Example Runner
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('AST Refactoring Examples');
  console.log('='.repeat(80));
  
  // Example 1: Class to Function Component
  console.log('\n1. Migrate Class Component to Function Component\n');
  const functionalComponent = await migrateClassToFunction(classComponentCode);
  console.log(functionalComponent.split('\n').slice(0, 20).join('\n'));
  console.log('... (truncated)\n');
  
  // Example 2: Add Dependency Injection
  console.log('\n2. Add Dependency Injection Decorators\n');
  const injectedService = await addDependencyInjection(serviceCode);
  console.log(injectedService);
  
  // Example 3: Modernize Async Patterns
  console.log('\n3. Modernize Callback Hell to Async/Await\n');
  const modernAsync = await modernizeAsync(callbackCode);
  console.log(modernAsync);
  
  // Example 4: Improve Type Safety
  console.log('\n4. Remove Any Types and Add Error Handling\n');
  const typeSafe = await improveTypeSafety(unsafeCode);
  console.log(typeSafe);
  
  // Example 5: Extract Interface
  console.log('\n5. Extract Interface from Class\n');
  const withInterface = await extractInterface(concreteServiceCode);
  console.log(withInterface.split('\n').slice(0, 15).join('\n'));
  console.log('... (truncated)\n');
  
  // Example 6: Batch Refactoring
  console.log('\n6. Batch Refactoring Multiple Files\n');
  
  const tasks: RefactoringTask[] = [
    {
      name: 'Class to Function',
      input: classComponentCode,
      transform: migrateClassToFunction,
    },
    {
      name: 'Type Safety',
      input: unsafeCode,
      transform: improveTypeSafety,
    },
    {
      name: 'Async Modernization',
      input: callbackCode,
      transform: modernizeAsync,
    },
  ];
  
  const results = await batchRefactor(tasks);
  
  console.log(`\n✅ Batch refactoring complete. Processed ${results.size} files.`);
  
  // Example 7: Complex Transformation Chain
  console.log('\n7. Complex Transformation Chain\n');
  
  let transformedCode = concreteServiceCode;
  
  // Chain multiple transformations
  transformedCode = await extractInterface(transformedCode);
  transformedCode = await addDependencyInjection(transformedCode);
  transformedCode = formatTypeScript(transformedCode, {
    singleQuote: true,
    semi: true,
    tabWidth: 2,
  });
  
  console.log(transformedCode.split('\n').slice(0, 25).join('\n'));
  console.log('... (truncated)\n');
  
  console.log('\n' + '='.repeat(80));
  console.log('All refactoring examples completed successfully!');
  console.log('='.repeat(80));
}

// Run examples
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  migrateClassToFunction,
  addDependencyInjection,
  modernizeAsync,
  improveTypeSafety,
  extractInterface,
  batchRefactor,
};
