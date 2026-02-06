/**
 * @dcyfr/ai-code-gen - Built-in template definitions
 *
 * Pre-configured templates for common code generation patterns.
 */

import type { TemplateDefinition } from '../types/index.js';

// ─── React Component Template ───────────────────────────────────────

export const REACT_COMPONENT_TEMPLATE: TemplateDefinition = {
  id: 'react-component',
  name: 'React Component',
  description: 'Generate a React functional component with TypeScript',
  outputExtension: '.tsx',
  variables: [
    { name: 'name', type: 'string', description: 'Component name', required: true },
    { name: 'props', type: 'array', description: 'Component props', required: false, defaultValue: [] },
    { name: 'hasChildren', type: 'boolean', description: 'Include children prop', required: false, defaultValue: false },
    { name: 'useClient', type: 'boolean', description: 'Add "use client" directive', required: false, defaultValue: false },
    { name: 'description', type: 'string', description: 'Component description', required: false },
  ],
  source: `{{#if useClient}}'use client';

{{/if}}/**
 * {{pascalCase name}} component
{{#if description}} * {{description}}
{{/if}} */

{{#if props.length}}interface {{pascalCase name}}Props {
{{#each props}}  {{this.name}}{{#unless this.required}}?{{/unless}}: {{this.type}};
{{/each}}{{#if hasChildren}}  children?: React.ReactNode;
{{/if}}
}
{{else}}{{#if hasChildren}}interface {{pascalCase name}}Props {
  children?: React.ReactNode;
}
{{/if}}{{/if}}
export function {{pascalCase name}}({{#if props.length}}{ {{#each props}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}}{{#if hasChildren}}, children{{/if}} }: {{pascalCase name}}Props{{else}}{{#if hasChildren}}{ children }: {{pascalCase name}}Props{{/if}}{{/if}}) {
  return (
    <div>
      <h2>{{pascalCase name}}</h2>
{{#if hasChildren}}      {children}
{{/if}}    </div>
  );
}
`,
};

// ─── API Route Template ─────────────────────────────────────────────

export const API_ROUTE_TEMPLATE: TemplateDefinition = {
  id: 'api-route',
  name: 'API Route',
  description: 'Generate a Next.js API route handler',
  outputExtension: '.ts',
  variables: [
    { name: 'name', type: 'string', description: 'Route name', required: true },
    { name: 'methods', type: 'array', description: 'HTTP methods', required: false, defaultValue: ['GET'] },
    { name: 'hasAuth', type: 'boolean', description: 'Include auth middleware', required: false, defaultValue: false },
    { name: 'description', type: 'string', description: 'Route description', required: false },
  ],
  source: `/**
 * {{pascalCase name}} API Route
{{#if description}} * {{description}}
{{/if}} */

import { NextRequest, NextResponse } from 'next/server';
{{#if hasAuth}}
// import { requireAuth } from '@/lib/auth';
{{/if}}

{{#each methods}}
{{#if (eq this "GET")}}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // TODO: Implement {{../name}} GET logic
    const data = { id, message: '{{../name}} GET endpoint' };

    return NextResponse.json(data);
  } catch (error) {
    console.error('{{../name}} GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
{{/if}}

{{#if (eq this "POST")}}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    // TODO: Implement {{../name}} POST logic
    const result = { success: true, data: body };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('{{../name}} POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
{{/if}}

{{#if (eq this "PUT")}}
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // TODO: Implement {{../name}} PUT logic
    const result = { success: true, id, data: body };

    return NextResponse.json(result);
  } catch (error) {
    console.error('{{../name}} PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
{{/if}}

{{#if (eq this "DELETE")}}
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // TODO: Implement {{../name}} DELETE logic

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('{{../name}} DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
{{/if}}
{{/each}}
`,
};

// ─── Data Model Template ────────────────────────────────────────────

export const DATA_MODEL_TEMPLATE: TemplateDefinition = {
  id: 'data-model',
  name: 'Data Model',
  description: 'Generate a TypeScript data model with Zod schema validation',
  outputExtension: '.ts',
  variables: [
    { name: 'name', type: 'string', description: 'Model name', required: true },
    { name: 'fields', type: 'array', description: 'Model fields', required: true },
    { name: 'hasTimestamps', type: 'boolean', description: 'Include createdAt/updatedAt', required: false, defaultValue: true },
    { name: 'description', type: 'string', description: 'Model description', required: false },
  ],
  source: `/**
 * {{pascalCase name}} data model
{{#if description}} * {{description}}
{{/if}} */

import { z } from 'zod';

// ─── Zod Schema ─────────────────────────────────────────────────────

export const {{camelCase name}}Schema = z.object({
  id: z.string().uuid(),
{{#each fields}}  {{this.name}}: z.{{this.zodType}}(){{#if this.optional}}.optional(){{/if}},
{{/each}}{{#if hasTimestamps}}  createdAt: z.date(),
  updatedAt: z.date(),
{{/if}}
});

export const create{{pascalCase name}}Schema = {{camelCase name}}Schema.omit({
  id: true,
{{#if hasTimestamps}}  createdAt: true,
  updatedAt: true,
{{/if}}
});

export const update{{pascalCase name}}Schema = create{{pascalCase name}}Schema.partial();

// ─── Types ──────────────────────────────────────────────────────────

export type {{pascalCase name}} = z.infer<typeof {{camelCase name}}Schema>;
export type Create{{pascalCase name}} = z.infer<typeof create{{pascalCase name}}Schema>;
export type Update{{pascalCase name}} = z.infer<typeof update{{pascalCase name}}Schema>;

// ─── Factory ────────────────────────────────────────────────────────

export function create{{pascalCase name}}(data: Create{{pascalCase name}}): {{pascalCase name}} {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    ...data,
{{#if hasTimestamps}}    createdAt: now,
    updatedAt: now,
{{/if}}  };
}
`,
};

// ─── Test File Template ─────────────────────────────────────────────

export const TEST_FILE_TEMPLATE: TemplateDefinition = {
  id: 'test-file',
  name: 'Test File',
  description: 'Generate a Vitest test file',
  outputExtension: '.test.ts',
  variables: [
    { name: 'name', type: 'string', description: 'Module name to test', required: true },
    { name: 'importPath', type: 'string', description: 'Import path', required: true },
    { name: 'functions', type: 'array', description: 'Functions to test', required: false, defaultValue: [] },
    { name: 'description', type: 'string', description: 'Test description', required: false },
  ],
  source: `/**
 * Tests for {{pascalCase name}}
 */

import { describe, it, expect, beforeEach } from 'vitest';
{{#if functions.length}}import { {{#each functions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from '{{importPath}}';
{{else}}// import { ... } from '{{importPath}}';
{{/if}}

describe('{{pascalCase name}}', () => {
{{#each functions}}
  describe('{{this}}', () => {
    it('should exist', () => {
      expect({{this}}).toBeDefined();
    });

    it('should work correctly', () => {
      // TODO: Implement test for {{this}}
    });
  });

{{/each}}{{#unless functions.length}}
  it('should be implemented', () => {
    // TODO: Add tests for {{pascalCase name}}
    expect(true).toBe(true);
  });
{{/unless}}
});
`,
};

// ─── Barrel Export Template ─────────────────────────────────────────

export const BARREL_EXPORT_TEMPLATE: TemplateDefinition = {
  id: 'barrel-export',
  name: 'Barrel Export',
  description: 'Generate an index.ts barrel export file',
  outputExtension: '.ts',
  variables: [
    { name: 'exports', type: 'array', description: 'Modules to export', required: true },
    { name: 'description', type: 'string', description: 'Module description', required: false },
  ],
  source: `/**
 * {{#if description}}{{description}}{{else}}Barrel exports{{/if}}
 */

{{#each exports}}export { {{#each this.names}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} } from './{{../exports.[0]}}';
{{/each}}
`,
};

// ─── Export all built-in templates ──────────────────────────────────

export const BUILTIN_TEMPLATES: TemplateDefinition[] = [
  REACT_COMPONENT_TEMPLATE,
  API_ROUTE_TEMPLATE,
  DATA_MODEL_TEMPLATE,
  TEST_FILE_TEMPLATE,
  BARREL_EXPORT_TEMPLATE,
];
