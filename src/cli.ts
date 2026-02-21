#!/usr/bin/env node

/**
 * @dcyfr/ai-code-gen CLI
 *
 * Command-line interface for the code generation toolkit.
 *
 * Usage:
 *   dcyfr-codegen generate component MyButton --output src/components
 *   dcyfr-codegen generate api-route users --output src/app/api --methods GET,POST
 *   dcyfr-codegen generate model Product --output src/models --fields name:string,price:number
 *   dcyfr-codegen analyze src/lib/utils.ts
 *   dcyfr-codegen list
 */

import { createGeneratorRegistry } from './generators/index.js';
import { analyzeCode } from './ast/index.js';
import { createAICodeGenerator } from './ai/index.js';
import { readFileContents } from './lib/file-system.js';
import { loadConfig } from './lib/config.js';
import { createLogger } from './lib/logger.js';

interface ParsedArgs {
  command: string;
  subcommand?: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

/**
 * Parse CLI arguments into a structured format.
 */
function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2); // skip node and script path
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let command = '';
  let subcommand: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];

      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (!command) {
      command = arg;
    } else if (!subcommand && command === 'generate') {
      subcommand = arg;
    } else {
      positional.push(arg);
    }
  }

  return { command, subcommand, positional, flags };
}

/**
 * Display help information.
 */
function showHelp(): void {
  console.log(`
@dcyfr/ai-code-gen - AI-powered code generation toolkit

USAGE:
  dcyfr-codegen <command> [options]

COMMANDS:
  generate <generator> <name>  Generate code using a generator
  analyze <file>               Analyze a TypeScript file
  review <file>                AI-powered code review
  list                         List available generators
  help                         Show this help message

GENERATORS:
  component    React functional component with TypeScript
  api-route    Next.js API route handler
  model        Data model with Zod schema validation
  test         Vitest test file

OPTIONS:
  --output <dir>       Output directory (default: ./generated)
  --template <name>    Template override
  --dry-run            Preview without writing files
  --force              Overwrite existing files
  --verbose            Verbose output
  --methods <list>     HTTP methods (api-route: GET,POST,PUT,DELETE)
  --fields <list>      Model fields (model: name:type,name:type)
  --with-test          Generate companion test file
  --use-client         Add 'use client' directive (component)

EXAMPLES:
  dcyfr-codegen generate component UserProfile --output src/components --with-test
  dcyfr-codegen generate api-route users --output src/app/api --methods GET,POST
  dcyfr-codegen generate model Product --output src/models --fields name:string,price:number
  dcyfr-codegen analyze src/lib/utils.ts
  dcyfr-codegen list
`);
}

function buildGenerateOptions(flags: Record<string, unknown>): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  if (flags.methods) {
    options.methods = (flags.methods as string).split(',');
  }
  if (flags.fields) {
    options.fields = (flags.fields as string).split(',').map((f) => {
      const [fieldName, zodType] = f.split(':');
      return { name: fieldName, zodType: zodType ?? 'string' };
    });
  }
  if (flags['with-test']) options.withTest = true;
  if (flags['use-client']) options.useClient = true;
  if (flags['has-children']) options.hasChildren = true;
  if (flags['has-auth']) options.hasAuth = true;
  return options;
}

function getSeverityIcon(severity: string): string {
  if (severity === 'error') return '✗';
  if (severity === 'warning') return '⚠';
  if (severity === 'suggestion') return '💡';
  return 'ℹ';
}

/**
 * Handle the 'generate' command.
 */
async function handleGenerate(parsed: ParsedArgs): Promise<void> {
  const logger = createLogger(parsed.flags.verbose ? 'debug' : 'info', 'codegen');
  const config = loadConfig({
    outputDir: (parsed.flags.output as string) ?? './generated',
  });

  const registry = createGeneratorRegistry();

  const generatorName = parsed.subcommand;
  if (!generatorName) {
    console.error('Error: Generator name is required. Use "dcyfr-codegen list" to see available generators.');
    process.exit(1);
  }

  const name = parsed.positional[0];
  if (!name) {
    console.error('Error: Name is required for code generation.');
    process.exit(1);
  }

  // Build options from flags
  const options = buildGenerateOptions(parsed.flags);

  logger.info(`Generating ${generatorName}: ${name}`);

  const result = await registry.run(generatorName, {
    name,
    outputDir: config.outputDir,
    template: parsed.flags.template as string | undefined,
    options,
  });

  if (!result.success) {
    console.error('Generation failed:');
    for (const error of result.errors) {
      console.error(`  - ${error.message}`);
    }
    process.exit(1);
  }

  if (parsed.flags['dry-run']) {
    console.log('\nDry run - files that would be created:');
    for (const file of result.files) {
      console.log(`  ${file.path}`);
      if (parsed.flags.verbose) {
        console.log('  ---');
        console.log(file.content);
        console.log('  ---');
      }
    }
  } else {
    console.log(`\nGenerated ${result.files.length} file(s):`);
    for (const file of result.files) {
      console.log(`  ✓ ${file.path}`);
    }
  }

  console.log(`\nDone in ${result.durationMs}ms`);
}

/**
 * Handle the 'analyze' command.
 */
async function handleAnalyze(parsed: ParsedArgs): Promise<void> {
  const filePath = parsed.positional[0] ?? parsed.subcommand;
  if (!filePath) {
    console.error('Error: File path is required for analysis.');
    process.exit(1);
  }

  const source = readFileContents(filePath);
  const report = analyzeCode(source, filePath);

  console.log(`\nAnalysis: ${filePath}`);
  console.log(`  ${report.summary}`);

  if (report.issues.length > 0) {
    console.log('\nIssues:');
    for (const issue of report.issues) {
      const prefix = issue.severity === 'error' ? '✗' : issue.severity === 'warning' ? '⚠' : 'ℹ';
      const location = issue.line ? `:${issue.line}` : '';
      console.log(`  ${prefix} [${issue.type}] ${issue.message}${location}`);
    }
  } else {
    console.log('\n  No issues found.');
  }
}

/**
 * Handle the 'review' command.
 */
async function handleReview(parsed: ParsedArgs): Promise<void> {
  const filePath = parsed.positional[0] ?? parsed.subcommand;
  if (!filePath) {
    console.error('Error: File path is required for review.');
    process.exit(1);
  }

  const source = readFileContents(filePath);
  const reviewer = createAICodeGenerator();
  const result = await reviewer.reviewCode({
    code: source,
    language: 'typescript',
  });

  console.log(`\nCode Review: ${filePath}`);
  console.log(`  Score: ${result.score}/100`);
  console.log(`  ${result.summary}`);

  if (result.findings.length > 0) {
    console.log('\nFindings:');
    for (const finding of result.findings) {
      const icon = getSeverityIcon(finding.severity);
      console.log(`  ${icon} [${finding.category}] ${finding.message}`);
      if (finding.suggestedFix) {
        console.log(`    Fix: ${finding.suggestedFix}`);
      }
    }
  }
}

/**
 * Handle the 'list' command.
 */
function handleList(): void {
  const registry = createGeneratorRegistry();
  const generators = registry.list();

  console.log('\nAvailable Generators:\n');
  for (const gen of generators) {
    console.log(`  ${gen.name.padEnd(15)} ${gen.description} (v${gen.version})`);
  }
  console.log('');
}

/**
 * Main CLI entry point.
 */
async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  switch (parsed.command) {
    case 'generate':
    case 'gen':
    case 'g':
      await handleGenerate(parsed);
      break;
    case 'analyze':
    case 'a':
      await handleAnalyze(parsed);
      break;
    case 'review':
    case 'r':
      await handleReview(parsed);
      break;
    case 'list':
    case 'ls':
    case 'l':
      handleList();
      break;
    case 'help':
    case '--help':
    case '-h':
    case '':
    case undefined:
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
