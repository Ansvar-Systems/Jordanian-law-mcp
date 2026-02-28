#!/usr/bin/env tsx
/**
 * Jordan Law MCP -- Census Script
 *
 * Enumerates key Jordanian laws. Jordan uses a civil law system.
 * The LOB (Legislation and Opinion Bureau) at lob.gov.jo is an Angular SPA
 * that cannot be scraped, and MOJ serves PDFs only.
 *
 * This census uses a curated list of core laws covering: constitution,
 * cybercrime, data privacy, commerce, banking, AML, labor, and public administration.
 *
 * Jordanian law references:
 *   - "قانون رقم XX لسنة YYYY" = Law No. XX of Year YYYY
 *   - "نظام رقم XX لسنة YYYY" = Regulation No. XX of Year YYYY
 *
 * Source: moj.gov.jo / lob.gov.jo (Legislation and Opinion Bureau)
 * License: Government Publication
 *
 * Usage:
 *   npx tsx scripts/census.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');

/* ---------- Types ---------- */

interface CensusLawEntry {
  id: string;
  title: string;
  identifier: string;
  url: string;
  status: 'in_force' | 'amended' | 'repealed';
  category: 'act';
  classification: 'ingestable' | 'excluded' | 'inaccessible';
  ingested: boolean;
  provision_count: number;
  ingestion_date: string | null;
}

interface CensusFile {
  schema_version: string;
  jurisdiction: string;
  jurisdiction_name: string;
  portal: string;
  census_date: string;
  agent: string;
  summary: {
    total_laws: number;
    ingestable: number;
    ocr_needed: number;
    inaccessible: number;
    excluded: number;
  };
  laws: CensusLawEntry[];
}

interface LawDescriptor {
  id: string;
  title: string;
  identifier: string;
  url: string;
  status: 'in_force' | 'amended' | 'repealed';
}

const JORDANIAN_LAWS: LawDescriptor[] = [
  {
    id: 'constitution',
    title: 'الدستور الأردني',
    identifier: 'constitution/1952',
    url: 'https://www.moj.gov.jo/AR/List/الدستور_الأردني',
    status: 'in_force',
  },
  {
    id: 'cybercrime-law-2015',
    title: 'قانون الجرائم الإلكترونية رقم 27 لسنة 2015',
    identifier: 'qanun/2015/27',
    url: 'https://www.moj.gov.jo/ebv4.0/root_storage/ar/eb_list_page/cybercrime-2015.pdf',
    status: 'amended',
  },
  {
    id: 'cybercrime-law-2023',
    title: 'قانون الجرائم الإلكترونية رقم 17 لسنة 2023',
    identifier: 'qanun/2023/17',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'electronic-transactions-2015',
    title: 'قانون المعاملات الإلكترونية رقم 15 لسنة 2015',
    identifier: 'qanun/2015/15',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'telecom-law-1995',
    title: 'قانون الاتصالات رقم 13 لسنة 1995',
    identifier: 'qanun/1995/13',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'access-to-information-2007',
    title: 'قانون ضمان حق الحصول على المعلومات رقم 47 لسنة 2007',
    identifier: 'qanun/2007/47',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'penal-code-1960',
    title: 'قانون العقوبات رقم 16 لسنة 1960',
    identifier: 'qanun/1960/16',
    url: 'https://www.moj.gov.jo/ebv4.0/root_storage/ar/eb_list_page/penal-code.pdf',
    status: 'amended',
  },
  {
    id: 'civil-code-1976',
    title: 'القانون المدني رقم 43 لسنة 1976',
    identifier: 'qanun/1976/43',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'commercial-code-1966',
    title: 'قانون التجارة رقم 12 لسنة 1966',
    identifier: 'qanun/1966/12',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'companies-law-1997',
    title: 'قانون الشركات رقم 22 لسنة 1997',
    identifier: 'qanun/1997/22',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'banking-law-2000',
    title: 'قانون البنوك رقم 28 لسنة 2000',
    identifier: 'qanun/2000/28',
    url: 'https://www.cbj.gov.jo',
    status: 'in_force',
  },
  {
    id: 'central-bank-law-1971',
    title: 'قانون البنك المركزي الأردني رقم 23 لسنة 1971',
    identifier: 'qanun/1971/23',
    url: 'https://www.cbj.gov.jo',
    status: 'amended',
  },
  {
    id: 'aml-cft-law-2007',
    title: 'قانون مكافحة غسل الأموال وتمويل الإرهاب رقم 46 لسنة 2007',
    identifier: 'qanun/2007/46',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'labor-law-1996',
    title: 'قانون العمل رقم 8 لسنة 1996',
    identifier: 'qanun/1996/8',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'consumer-protection-2017',
    title: 'قانون حماية المستهلك رقم 7 لسنة 2017',
    identifier: 'qanun/2017/7',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'competition-law-2004',
    title: 'قانون المنافسة رقم 33 لسنة 2004',
    identifier: 'qanun/2004/33',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'copyright-law-1992',
    title: 'قانون حماية حق المؤلف رقم 22 لسنة 1992',
    identifier: 'qanun/1992/22',
    url: 'https://lob.gov.jo',
    status: 'amended',
  },
  {
    id: 'investment-law-2014',
    title: 'قانون الاستثمار رقم 30 لسنة 2014',
    identifier: 'qanun/2014/30',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'procurement-law-2019',
    title: 'نظام الأشغال الحكومية رقم 71 لسنة 2019',
    identifier: 'nizam/2019/71',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'securities-law-2017',
    title: 'قانون الأوراق المالية رقم 18 لسنة 2017',
    identifier: 'qanun/2017/18',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'income-tax-law-2014',
    title: 'قانون ضريبة الدخل رقم 34 لسنة 2014',
    identifier: 'qanun/2014/34',
    url: 'https://www.istd.gov.jo',
    status: 'amended',
  },
  {
    id: 'social-security-law-2014',
    title: 'قانون الضمان الاجتماعي رقم 1 لسنة 2014',
    identifier: 'qanun/2014/1',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'environment-law-2017',
    title: 'قانون حماية البيئة رقم 6 لسنة 2017',
    identifier: 'qanun/2017/6',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'integrity-anticorruption-2006',
    title: 'قانون هيئة مكافحة الفساد رقم 62 لسنة 2006',
    identifier: 'qanun/2006/62',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
  {
    id: 'personal-status-law-2010',
    title: 'قانون الأحوال الشخصية رقم 36 لسنة 2010',
    identifier: 'qanun/2010/36',
    url: 'https://lob.gov.jo',
    status: 'in_force',
  },
];

/* ---------- Main ---------- */

async function main(): Promise<void> {
  console.log('Jordan Law MCP -- Census');
  console.log('========================\n');
  console.log('  Source: lob.gov.jo / moj.gov.jo (Legislation and Opinion Bureau)');
  console.log('  Method: Curated law list (LOB is Angular SPA, MOJ serves PDFs)');
  console.log(`  Laws: ${JORDANIAN_LAWS.length}\n`);

  const existingEntries = new Map<string, CensusLawEntry>();
  if (fs.existsSync(CENSUS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8')) as CensusFile;
      for (const law of data.laws) {
        if ('ingested' in law && 'url' in law) {
          existingEntries.set(law.id, law);
        }
      }
      console.log(`  Loaded ${existingEntries.size} existing entries from previous census\n`);
    } catch { /* Start fresh */ }
  }

  for (const law of JORDANIAN_LAWS) {
    const existing = existingEntries.get(law.id);
    existingEntries.set(law.id, {
      id: law.id,
      title: law.title,
      identifier: law.identifier,
      url: law.url,
      status: law.status,
      category: 'act',
      classification: 'ingestable',
      ingested: existing?.ingested ?? false,
      provision_count: existing?.provision_count ?? 0,
      ingestion_date: existing?.ingestion_date ?? null,
    });
  }

  const allLaws = Array.from(existingEntries.values()).sort((a, b) => a.title.localeCompare(b.title));
  const ingestable = allLaws.filter(l => l.classification === 'ingestable').length;
  const today = new Date().toISOString().split('T')[0];

  const census: CensusFile = {
    schema_version: '1.0',
    jurisdiction: 'JO',
    jurisdiction_name: 'Jordan',
    portal: 'https://lob.gov.jo',
    census_date: today,
    agent: 'claude-opus-4-6',
    summary: {
      total_laws: allLaws.length,
      ingestable,
      ocr_needed: 0,
      inaccessible: 0,
      excluded: 0,
    },
    laws: allLaws,
  };

  fs.mkdirSync(path.dirname(CENSUS_PATH), { recursive: true });
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));

  console.log('========================');
  console.log('Census Complete');
  console.log(`  Total laws:     ${allLaws.length}`);
  console.log(`  Ingestable:     ${ingestable}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => { console.error('Fatal error:', error); process.exit(1); });
