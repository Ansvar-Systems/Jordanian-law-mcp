/**
 * Response metadata utilities for Jordan Law MCP.
 */

import type Database from '@ansvar/mcp-sqlite';

export interface ResponseMetadata {
  data_source: string;
  jurisdiction: string;
  disclaimer: string;
  freshness?: string;
}

export interface ToolResponse<T> {
  results: T;
  _metadata: ResponseMetadata;
}

export function generateResponseMetadata(
  db: InstanceType<typeof Database>,
): ResponseMetadata {
  let freshness: string | undefined;
  try {
    const row = db.prepare(
      "SELECT value FROM db_metadata WHERE key = 'built_at'"
    ).get() as { value: string } | undefined;
    if (row) freshness = row.value;
  } catch {
    // Ignore
  }

  return {
    data_source: 'Jordanian Legislation (jordan-lawyer.com, jordanlaws.org, constituteproject.org)',
    jurisdiction: 'JO',
    disclaimer:
      'This data is sourced from publicly available Jordanian legal texts. ' +
      'The authoritative versions are published in the Official Gazette (الجريدة الرسمية). ' +
      'Content is in Arabic. Always verify with the official Legislation and Opinion Bureau (lob.gov.jo).',
    freshness,
  };
}
