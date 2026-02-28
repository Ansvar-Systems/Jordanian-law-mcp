/**
 * list_sources — Return provenance metadata for all data sources.
 */

import type Database from '@ansvar/mcp-sqlite';
import { readDbMetadata } from '../capabilities.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface SourceInfo {
  name: string;
  authority: string;
  url: string;
  license: string;
  coverage: string;
  languages: string[];
}

export interface ListSourcesResult {
  sources: SourceInfo[];
  database: {
    tier: string;
    schema_version: string;
    built_at?: string;
    document_count: number;
    provision_count: number;
  };
}

function safeCount(db: InstanceType<typeof Database>, sql: string): number {
  try {
    const row = db.prepare(sql).get() as { count: number } | undefined;
    return row ? Number(row.count) : 0;
  } catch {
    return 0;
  }
}

export async function listSources(
  db: InstanceType<typeof Database>,
): Promise<ToolResponse<ListSourcesResult>> {
  const meta = readDbMetadata(db);

  return {
    results: {
      sources: [
        {
          name: 'jordan-lawyer.com',
          authority: 'Community legal portal (full-text Arabic legislation)',
          url: 'https://jordan-lawyer.com',
          license: 'Government Publication (public domain)',
          coverage:
            'Primary source: 54 Jordanian statutes including Civil Code, Penal Code, ' +
            'Commercial Code, Labor Law, Companies Law, Data Protection Law, ' +
            'Cybercrime Law, and other major legislation. Full Arabic text.',
          languages: ['ar'],
        },
        {
          name: 'jordanlaws.org',
          authority: 'Community legal portal (full-text Arabic legislation)',
          url: 'https://jordanlaws.org',
          license: 'Government Publication (public domain)',
          coverage:
            'Secondary source: Electronic Transactions Law, additional statutes ' +
            'not available on jordan-lawyer.com.',
          languages: ['ar'],
        },
        {
          name: 'constituteproject.org',
          authority: 'Comparative Constitutions Project',
          url: 'https://constituteproject.org',
          license: 'Creative Commons',
          coverage: 'Constitution of the Hashemite Kingdom of Jordan (1952, as amended).',
          languages: ['ar', 'en'],
        },
      ],
      database: {
        tier: meta.tier,
        schema_version: meta.schema_version,
        built_at: meta.built_at,
        document_count: safeCount(db, 'SELECT COUNT(*) as count FROM legal_documents'),
        provision_count: safeCount(db, 'SELECT COUNT(*) as count FROM legal_provisions'),
      },
    },
    _metadata: generateResponseMetadata(db),
  };
}
