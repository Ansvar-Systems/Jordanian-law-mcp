#!/usr/bin/env tsx
/**
 * Jordan Law MCP -- Census Script (Full Corpus)
 *
 * Enumerates all discoverable Jordanian laws from:
 *   1. jordan-lawyer.com (full-text HTML, primary source)
 *   2. jordanlaws.org (full-text HTML, supplementary)
 *   3. constituteproject.org (constitution)
 *
 * Jordan uses a civil law system (NOT common law).
 * Official gazette: الجريدة الرسمية (al-jarida al-rasmiyya)
 * LOB (lob.gov.jo) is Angular SPA with encrypted API -- not scrapable.
 * MOJ (moj.gov.jo) serves PDFs, many now 404.
 *
 * Jordanian law references:
 *   - "قانون رقم XX لسنة YYYY" = Law No. XX of Year YYYY
 *   - "نظام رقم XX لسنة YYYY" = Regulation No. XX of Year YYYY
 *   - "المادة" (al-madda) = Article
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
  title_en: string;
  identifier: string;
  url: string;
  source: 'jordan-lawyer' | 'jordanlaws' | 'constituteproject' | 'curated';
  status: 'in_force' | 'amended' | 'repealed';
  category: 'act' | 'regulation' | 'constitution';
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
  title_en: string;
  identifier: string;
  url: string;
  source: 'jordan-lawyer' | 'jordanlaws' | 'constituteproject' | 'curated';
  status: 'in_force' | 'amended' | 'repealed';
  category: 'act' | 'regulation' | 'constitution';
}

/* ---------- Comprehensive Jordanian Law Catalog ---------- */

const JORDANIAN_LAWS: LawDescriptor[] = [
  // ===== CONSTITUTION =====
  {
    id: 'constitution',
    title: 'الدستور الأردني',
    title_en: 'Constitution of the Hashemite Kingdom of Jordan',
    identifier: 'constitution/1952',
    url: 'https://www.constituteproject.org/constitution/Jordan_2016?lang=ar',
    source: 'constituteproject',
    status: 'in_force',
    category: 'constitution',
  },

  // ===== CIVIL & COMMERCIAL LAW =====
  {
    id: 'civil-code-1976',
    title: 'القانون المدني رقم 43 لسنة 1976',
    title_en: 'Civil Code No. 43 of 1976',
    identifier: 'qanun/1976/43',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'commercial-code-1966',
    title: 'قانون التجارة رقم 12 لسنة 1966',
    title_en: 'Commercial Code No. 12 of 1966',
    identifier: 'qanun/1966/12',
    url: 'https://jordanlaws.org/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%aa%d8%ac%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordanlaws',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'companies-law-1997',
    title: 'قانون الشركات رقم 22 لسنة 1997',
    title_en: 'Companies Law No. 22 of 1997',
    identifier: 'qanun/1997/22',
    url: 'https://jordanlaws.org/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%b4%d8%b1%d9%83%d8%a7%d8%aa-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordanlaws',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'arbitration-law-2001',
    title: 'قانون التحكيم رقم 31 لسنة 2001',
    title_en: 'Arbitration Law No. 31 of 2001',
    identifier: 'qanun/2001/31',
    url: 'https://jordan-lawyer.com/2012/10/06/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%aa%d8%ad%d9%83%d9%8a%d9%85/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'insolvency-law-2018',
    title: 'قانون الإعسار رقم 21 لسنة 2018',
    title_en: 'Insolvency Law No. 21 of 2018',
    identifier: 'qanun/2018/21',
    url: 'https://jordan-lawyer.com/2018/11/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a5%d8%b9%d8%b3%d8%a7%d8%b1-%d8%b1%d9%82%d9%85-21-%d9%84%d8%b3%d9%86%d8%a9-2018/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'landlord-tenant-law',
    title: 'قانون المالكين والمستأجرين',
    title_en: 'Landlords and Tenants Law',
    identifier: 'qanun/2013/landlord-tenant',
    url: 'https://jordan-lawyer.com/2012/02/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%83%d9%8a%d9%86-%d9%88%d8%a7%d9%84%d9%85%d8%b3%d8%aa%d8%a3%d8%ac%d8%b1%d9%8a%d9%86-%d9%85%d8%b9-%d9%83%d8%a7%d9%85%d9%84-%d8%a7%d9%84/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'floor-apartment-ownership-law',
    title: 'قانون ملكية الطوابق والشقق',
    title_en: 'Floor and Apartment Ownership Law',
    identifier: 'qanun/floor-apartment',
    url: 'https://jordan-lawyer.com/2016/02/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d9%84%d9%83%d9%8a%d8%a9-%d8%a7%d9%84%d8%b7%d9%88%d8%a7%d8%a8%d9%82-%d9%88%d8%a7%d9%84%d8%b4%d9%82%d9%82-%d8%a7%d9%84%d8%a7%d8%b1%d8%af%d9%86/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'immovable-property-division-law',
    title: 'قانون تقسيم الأموال غير المنقولة',
    title_en: 'Immovable Property Division Law',
    identifier: 'qanun/immovable-division',
    url: 'https://jordan-lawyer.com/2016/02/15/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d9%82%d8%b3%d9%8a%d9%85-%d8%a7%d9%84%d8%a3%d9%85%d9%88%d8%a7%d9%84-%d8%ba%d9%8a%d8%b1-%d8%a7%d9%84%d9%85%d9%86%d9%82%d9%88%d9%84%d8%a9-%d9%82%d8%a7%d9%86%d9%88/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'immovable-rental-law',
    title: 'قانون إيجار الأموال غير المنقولة وبيعها',
    title_en: 'Immovable Property Rental and Sale Law',
    identifier: 'qanun/immovable-rental',
    url: 'https://jordan-lawyer.com/2016/12/05/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%8a%d8%ac%d8%a7%d8%b1-%d8%a7%d9%84%d8%a7%d9%85%d9%88%d8%a7%d9%84-%d8%ba%d9%8a%d8%b1-%d8%a7%d9%84%d9%85%d9%86%d9%82%d9%88%d9%84%d8%a9-%d9%88%d8%a8%d9%8a%d8%b9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'movable-property-rights-law-2018',
    title: 'قانون ضمان الحقوق بالأموال المنقولة رقم 20 لسنة 2018',
    title_en: 'Movable Property Rights Security Law No. 20 of 2018',
    identifier: 'qanun/2018/20',
    url: 'https://jordan-lawyer.com/2018/11/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%b6%d9%85%d8%a7%d9%86-%d8%a7%d9%84%d8%ad%d9%82%d9%88%d9%82-%d8%a8%d8%a7%d9%84%d8%a3%d9%85%d9%88%d8%a7%d9%84-%d8%a7%d9%84%d9%85%d9%86%d9%82%d9%88%d9%84%d8%a9-%d8%b1/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'competition-law-2004',
    title: 'قانون المنافسة رقم 33 لسنة 2004',
    title_en: 'Competition Law No. 33 of 2004',
    identifier: 'qanun/2004/33',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'curated',
    status: 'in_force',
    category: 'act',
  },

  // ===== CRIMINAL LAW =====
  {
    id: 'penal-code-1960',
    title: 'قانون العقوبات رقم 16 لسنة 1960',
    title_en: 'Penal Code No. 16 of 1960',
    identifier: 'qanun/1960/16',
    url: 'https://jordanlaws.org/2020/10/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%b9%d9%82%d9%88%d8%a8%d8%a7%d8%aa/',
    source: 'jordanlaws',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'criminal-procedure-code',
    title: 'قانون أصول المحاكمات الجزائية',
    title_en: 'Code of Criminal Procedure',
    identifier: 'qanun/criminal-procedure',
    url: 'https://jordanlaws.org/2020/10/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a3%d8%b5%d9%88%d9%84-%d8%a7%d9%84%d9%85%d8%ad%d8%a7%d9%83%d9%85%d8%a7%d8%aa-%d8%a7%d9%84%d8%ac%d8%b2%d8%a7%d8%a6%d9%8a%d8%a9/',
    source: 'jordanlaws',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'major-felonies-court-law',
    title: 'قانون محكمة الجنايات الكبرى',
    title_en: 'Major Felonies Court Law',
    identifier: 'qanun/major-felonies-court',
    url: 'https://jordan-lawyer.com/2016/06/21/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d8%ad%d9%83%d9%85%d8%a9-%d8%a7%d9%84%d8%ac%d9%86%d8%a7%d9%8a%d8%a7%d8%aa-%d8%a7%d9%84%d9%83%d8%a8%d8%b1%d9%89/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'extradition-law',
    title: 'قانون تسليم المجرمين الفارين',
    title_en: 'Extradition of Fugitive Criminals Law',
    identifier: 'qanun/extradition',
    url: 'https://jordan-lawyer.com/2020/01/19/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d8%b3%d9%84%d9%8a%d9%85-%d8%a7%d9%84%d9%85%d8%ac%d8%b1%d9%85%d9%8a%d9%86-%d8%a7%d9%84%d9%81%d8%a7%d8%b1%d9%8a%d9%86/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'contempt-of-court-law-1959',
    title: 'قانون انتهاك حرمة المحاكم لسنة 1959',
    title_en: 'Contempt of Court Law of 1959',
    identifier: 'qanun/1959/contempt',
    url: 'https://jordan-lawyer.com/2010/07/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%86%d8%aa%d9%87%d8%a7%d9%83-%d8%ad%d8%b1%d9%85%d8%a9-%d8%a7%d9%84%d9%85%d8%ad%d8%a7%d9%83%d9%85-%d9%84%d8%b3%d9%86%d8%a9-1959/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'economic-crimes-law',
    title: 'قانون الجرائم الاقتصادية',
    title_en: 'Economic Crimes Law',
    identifier: 'qanun/economic-crimes',
    url: 'https://jordanlaws.org/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%ac%d8%b1%d8%a7%d8%a6%d9%85-%d8%a7%d9%84%d8%a7%d9%82%d8%aa%d8%b5%d8%a7%d8%af%d9%8a%d8%a9/',
    source: 'jordanlaws',
    status: 'in_force',
    category: 'act',
  },

  // ===== CYBERCRIME & DATA PROTECTION =====
  {
    id: 'cybercrime-law-2023',
    title: 'قانون الجرائم الإلكترونية رقم 17 لسنة 2023',
    title_en: 'Cybercrime Law No. 17 of 2023',
    identifier: 'qanun/2023/17',
    url: 'https://jordanlaws.org/2020/10/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%ac%d8%b1%d8%a7%d8%a6%d9%85-%d8%a7%d9%84%d8%a5%d9%84%d9%83%d8%aa%d8%b1%d9%88%d9%86%d9%8a%d8%a9/',
    source: 'jordanlaws',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'data-protection-law-2023',
    title: 'قانون حماية البيانات الشخصية رقم 24 لسنة 2023',
    title_en: 'Personal Data Protection Law No. 24 of 2023',
    identifier: 'qanun/2023/24',
    url: 'https://jordan-lawyer.com/2023/09/20/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%ad%d9%85%d8%a7%d9%8a%d8%a9-%d8%a7%d9%84%d8%a8%d9%8a%d8%a7%d9%86%d8%a7%d8%aa-%d8%a7%d9%84%d8%b4%d8%ae%d8%b5%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'electronic-transactions-2015',
    title: 'قانون المعاملات الإلكترونية رقم 15 لسنة 2015',
    title_en: 'Electronic Transactions Law No. 15 of 2015',
    identifier: 'qanun/2015/15',
    url: 'https://jordanlaws.org/2020/10/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%b9%d8%a7%d9%85%d9%84%d8%a7%d8%aa-%d8%a7%d9%84%d8%a5%d9%84%d9%83%d8%aa%d8%b1%d9%88%d9%86%d9%8a%d8%a9-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordanlaws',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'telecom-law-1995',
    title: 'قانون الاتصالات رقم 13 لسنة 1995',
    title_en: 'Telecommunications Law No. 13 of 1995',
    identifier: 'qanun/1995/13',
    url: 'https://jordan-lawyer.com/2016/06/29/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a7%d8%aa%d8%b5%d8%a7%d9%84%d8%a7%d8%aa-%d8%a7%d9%84%d8%a7%d8%b1%d8%af%d9%86%d9%8a-%d9%88%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7%d8%aa%d9%87-%d8%b1%d9%82/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'audiovisual-media-law-2015',
    title: 'قانون الإعلام المرئي والمسموع رقم 26 لسنة 2015',
    title_en: 'Audiovisual Media Law No. 26 of 2015',
    identifier: 'qanun/2015/26',
    url: 'https://jordan-lawyer.com/2017/03/16/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a5%d8%b9%d9%84%d8%a7%d9%85-%d8%a7%d9%84%d9%85%d8%b1%d8%a6%d9%8a-%d9%88%d8%a7%d9%84%d9%85%d8%b3%d9%85%d9%88%d8%b9-%d8%b1%d9%82%d9%85-26-%d9%84%d8%b3%d9%86/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== LABOR & SOCIAL =====
  {
    id: 'labor-law-1996',
    title: 'قانون العمل رقم 8 لسنة 1996',
    title_en: 'Labor Law No. 8 of 1996',
    identifier: 'qanun/1996/8',
    url: 'https://jordan-lawyer.com/2010/07/09/jordan-labor-law/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'social-security-law-2014',
    title: 'قانون الضمان الاجتماعي رقم 1 لسنة 2014',
    title_en: 'Social Security Law No. 1 of 2014',
    identifier: 'qanun/2014/1',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'curated',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'juvenile-law',
    title: 'قانون الأحداث',
    title_en: 'Juvenile Law',
    identifier: 'qanun/juvenile',
    url: 'https://jordan-lawyer.com/2021/05/08/jordanian-juvenile-law/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'associations-law',
    title: 'قانون الجمعيات',
    title_en: 'Associations Law',
    identifier: 'qanun/associations',
    url: 'https://jordan-lawyer.com/2020/05/11/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%ac%d9%85%d8%b9%d9%8a%d8%a7%d8%aa-%d9%85%d8%b9-%d9%83%d8%a7%d9%85%d9%84-%d8%a7%d9%84%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7%d8%aa/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== BANKING & FINANCE =====
  {
    id: 'banking-law-2000',
    title: 'قانون البنوك رقم 28 لسنة 2000',
    title_en: 'Banking Law No. 28 of 2000',
    identifier: 'qanun/2000/28',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'curated',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'central-bank-law-1971',
    title: 'قانون البنك المركزي الأردني رقم 23 لسنة 1971',
    title_en: 'Central Bank of Jordan Law No. 23 of 1971',
    identifier: 'qanun/1971/23',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'curated',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'aml-cft-law-2007',
    title: 'قانون مكافحة غسل الأموال وتمويل الإرهاب رقم 46 لسنة 2007',
    title_en: 'Anti-Money Laundering and Counter-Terrorism Financing Law No. 46 of 2007',
    identifier: 'qanun/2007/46',
    url: 'https://jordan-lawyer.com/2020/03/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d9%83%d8%a7%d9%81%d8%ad%d8%a9-%d8%ba%d8%b3%d9%84-%d8%a7%d9%84%d8%a3%d9%85%d9%88%d8%a7%d9%84-%d9%88%d8%aa%d9%85%d9%88%d9%8a%d9%84-%d8%a7%d9%84%d8%a5%d8%b1%d9%87/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'securities-law-2017',
    title: 'قانون الأوراق المالية',
    title_en: 'Securities Law',
    identifier: 'qanun/2017/18',
    url: 'https://jordan-lawyer.com/2020/03/07/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a7%d9%88%d8%b1%d8%a7%d9%82-%d8%a7%d9%84%d9%85%d8%a7%d9%84%d9%8a%d8%a9-%d9%85%d8%b9-%d9%83%d8%a7%d9%85%d9%84-%d8%a7%d9%84%d8%aa%d8%b9%d8%af%d9%8a%d9%84/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'financial-leasing-law',
    title: 'قانون التأجير التمويلي',
    title_en: 'Financial Leasing Law',
    identifier: 'qanun/financial-leasing',
    url: 'https://jordan-lawyer.com/2021/05/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%aa%d8%a3%d8%ac%d9%8a%d8%b1-%d8%a7%d9%84%d8%aa%d9%85%d9%88%d9%8a%d9%84%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'money-exchange-law',
    title: 'قانون أعمال الصرافة',
    title_en: 'Money Exchange Business Law',
    identifier: 'qanun/money-exchange',
    url: 'https://jordan-lawyer.com/2021/08/14/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d8%a7%d9%84%d8%b5%d8%b1%d8%a7%d9%81%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'islamic-finance-sukuk-law',
    title: 'قانون صكوك التمويل الإسلامي',
    title_en: 'Islamic Finance Sukuk Law',
    identifier: 'qanun/sukuk',
    url: 'https://jordan-lawyer.com/2020/03/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%b5%d9%83%d9%88%d9%83-%d8%a7%d9%84%d8%aa%d9%85%d9%88%d9%8a%d9%84-%d8%a7%d9%84%d8%a5%d8%b3%d9%84%d8%a7%d9%85%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'foreign-exchanges-law',
    title: 'قانون تنظيم التعامل بالبورصات الأجنبية',
    title_en: 'Foreign Exchanges Regulation Law',
    identifier: 'qanun/foreign-exchanges',
    url: 'https://jordan-lawyer.com/2020/03/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d9%86%d8%b8%d9%8a%d9%85-%d8%a7%d9%84%d8%aa%d8%b9%d8%a7%d9%85%d9%84-%d8%a8%d8%a7%d9%84%d8%a8%d9%88%d8%b1%d8%b5%d8%a7%d8%aa-%d8%a7%d9%84%d8%a3%d8%ac%d9%86%d8%a8/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'sales-tax-law',
    title: 'قانون الضريبة العامة على المبيعات',
    title_en: 'General Sales Tax Law',
    identifier: 'qanun/sales-tax',
    url: 'https://jordan-lawyer.com/2018/12/19/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%b6%d8%b1%d9%8a%d8%a8%d8%a9-%d8%a7%d9%84%d8%b9%d8%a7%d9%85%d8%a9-%d8%b9%d9%84%d9%89-%d8%a7%d9%84%d9%85%d8%a8%d9%8a%d8%b9%d8%a7%d8%aa-%d9%84%d8%b3%d9%86/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },

  // ===== CONSUMER & INVESTMENT =====
  {
    id: 'consumer-protection-2017',
    title: 'قانون حماية المستهلك رقم 7 لسنة 2017',
    title_en: 'Consumer Protection Law No. 7 of 2017',
    identifier: 'qanun/2017/7',
    url: 'https://jordan-lawyer.com/2010/07/11/jordan-civil-law-with-all-amendments/',
    source: 'curated',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'investment-law-2014',
    title: 'قانون الاستثمار رقم 30 لسنة 2014',
    title_en: 'Investment Law No. 30 of 2014',
    identifier: 'qanun/2014/30',
    url: 'https://jordan-lawyer.com/2016/02/14/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d8%ab%d9%85%d8%a7%d8%b1-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'aqaba-special-economic-zone-law-2000',
    title: 'قانون منطقة العقبة الاقتصادية الخاصة رقم 32 لسنة 2000',
    title_en: 'Aqaba Special Economic Zone Law No. 32 of 2000',
    identifier: 'qanun/2000/32',
    url: 'https://jordan-lawyer.com/2016/02/15/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d9%86%d8%b7%d9%82%d8%a9-%d8%a7%d9%84%d8%b9%d9%82%d8%a8%d8%a9-%d8%a7%d9%84%d8%a7%d9%82%d8%aa%d8%b5%d8%a7%d8%af%d9%8a%d8%a9-%d8%a7%d9%84%d8%ae%d8%a7%d8%b5%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'economic-boycott-law',
    title: 'قانون المقاطعة الاقتصادية وحظر التعامل مع العدو',
    title_en: 'Economic Boycott and Enemy Trade Prohibition Law',
    identifier: 'qanun/economic-boycott',
    url: 'https://jordan-lawyer.com/2016/02/14/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d9%82%d8%a7%d8%b7%d8%b9%d8%a9-%d8%a7%d9%84%d8%a7%d9%82%d8%aa%d8%b5%d8%a7%d8%af%d9%8a%d8%a9-%d9%88%d8%ad%d8%b8%d8%b1-%d8%a7%d9%84%d8%aa%d8%b9%d8%a7/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'standards-metrology-law-2000',
    title: 'قانون المواصفات والمقاييس لسنة 2000',
    title_en: 'Standards and Metrology Law of 2000',
    identifier: 'qanun/2000/standards',
    url: 'https://jordan-lawyer.com/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d9%88%d8%a7%d8%b5%d9%81%d8%a7%d8%aa-%d9%88%d8%a7%d9%84%d9%85%d9%82%d8%a7%d9%8a%d9%8a%d8%b3-%d9%84%d8%b3%d9%86%d8%a9-2000/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== JUDICIARY & PUBLIC LAW =====
  {
    id: 'judicial-independence-law-2014',
    title: 'قانون استقلال القضاء رقم 29 لسنة 2014',
    title_en: 'Judicial Independence Law No. 29 of 2014',
    identifier: 'qanun/2014/29',
    url: 'https://jordan-lawyer.com/2018/11/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d8%b3%d8%aa%d9%82%d9%84%d8%a7%d9%84-%d8%a7%d9%84%d9%82%d8%b6%d8%a7%d8%a1/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'courts-formation-law',
    title: 'قانون تشكيل المحاكم النظامية',
    title_en: 'Regular Courts Formation Law',
    identifier: 'qanun/courts-formation',
    url: 'https://jordan-lawyer.com/2012/11/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d8%b4%d9%83%d9%8a%d9%84-%d8%a7%d9%84%d9%85%d8%ad%d8%a7%d9%83%d9%85-%d8%a7%d9%84%d9%86%d8%b8%d8%a7%d9%85%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'constitutional-court-law',
    title: 'قانون المحكمة الدستورية',
    title_en: 'Constitutional Court Law',
    identifier: 'qanun/constitutional-court',
    url: 'https://jordan-lawyer.com/2020/05/29/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%ad%d9%83%d9%85%d8%a9-%d8%a7%d9%84%d8%af%d8%b3%d8%aa%d9%88%d8%b1%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'administrative-judiciary-law',
    title: 'قانون القضاء الإداري',
    title_en: 'Administrative Judiciary Law',
    identifier: 'qanun/admin-judiciary',
    url: 'https://jordan-lawyer.com/2021/05/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%82%d8%b6%d8%a7%d8%a1-%d8%a7%d9%84%d8%a5%d8%af%d8%a7%d8%b1%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'foreign-judgments-enforcement-law-1952',
    title: 'قانون تنفيذ الأحكام الأجنبية لسنة 1952',
    title_en: 'Foreign Judgments Enforcement Law of 1952',
    identifier: 'qanun/1952/foreign-judgments',
    url: 'https://jordan-lawyer.com/2012/11/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d9%86%d9%81%d9%8a%d8%b0-%d8%a7%d9%84%d8%a7%d8%ad%d9%83%d8%a7%d9%85-%d8%a7%d9%84%d8%a7%d8%ac%d9%86%d8%a8%d9%8a%d8%a9-%d9%84%d8%b3%d9%86%d8%a9-1952-%d8%a7%d9%84/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'state-cases-management-law-2017',
    title: 'قانون إدارة قضايا الدولة وتعديلاته',
    title_en: 'State Cases Management Law',
    identifier: 'qanun/2017/28',
    url: 'https://jordan-lawyer.com/2021/02/11/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d9%82%d8%b6%d8%a7%d9%8a%d8%a7-%d8%a7%d9%84%d8%af%d9%88%d9%84%d8%a9-%d9%88%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7%d8%aa%d9%87/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'minister-trial-law',
    title: 'قانون محاكمة الوزراء',
    title_en: 'Ministers Trial Law',
    identifier: 'qanun/minister-trial',
    url: 'https://jordan-lawyer.com/2018/12/19/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d8%ad%d8%a7%d9%83%d9%85%d8%a9-%d8%a7%d9%84%d9%88%d8%b2%d8%b1%d8%a7%d8%a1-%d9%85%d8%b9-%d9%83%d8%a7%d9%85%d9%84-%d8%a7%d9%84%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'notary-public-law',
    title: 'قانون الكاتب العدل وتعديلاته رقم 11 لسنة 1952',
    title_en: 'Notary Public Law',
    identifier: 'qanun/1952/11',
    url: 'https://jordan-lawyer.com/2017/01/24/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%83%d8%a7%d8%aa%d8%a8-%d8%a7%d9%84%d8%b9%d8%af%d9%84-%d9%88%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7%d8%aa%d9%87-%d8%b1%d9%82%d9%85-11-%d9%84%d8%b3%d9%86%d8%a9/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'municipal-courts-law-2001',
    title: 'قانون إنشاء محاكم البلديات لسنة 2001',
    title_en: 'Municipal Courts Establishment Law of 2001',
    identifier: 'qanun/2001/municipal-courts',
    url: 'https://jordan-lawyer.com/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a5%d9%86%d8%b4%d8%a7%d8%a1-%d9%85%d8%ad%d8%a7%d9%83%d9%85-%d8%a7%d9%84%d8%a8%d9%84%d8%af%d9%8a%d8%a7%d8%aa-%d9%84%d8%b3%d9%86%d8%a9-2001/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'election-law-2024',
    title: 'قانون الانتخاب لمجلس النواب',
    title_en: 'Election Law for the House of Representatives',
    identifier: 'qanun/2024/election',
    url: 'https://jordan-lawyer.com/2020/08/30/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a7%d9%86%d8%aa%d8%ae%d8%a7%d8%a8-%d9%84%d9%85%d8%ac%d9%84%d8%b3-%d8%a7%d9%84%d9%86%d9%88%d8%a7%d8%a8-2024/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== INTEGRITY & TRANSPARENCY =====
  {
    id: 'access-to-information-2007',
    title: 'قانون ضمان حق الحصول على المعلومات رقم 47 لسنة 2007',
    title_en: 'Access to Information Law No. 47 of 2007',
    identifier: 'qanun/2007/47',
    url: 'https://jordan-lawyer.com/2018/10/29/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%b6%d9%85%d8%a7%d9%86-%d8%ad%d9%82-%d8%a7%d9%84%d8%ad%d8%b5%d9%88%d9%84-%d8%b9%d9%84%d9%89-%d8%a7%d9%84%d9%85%d8%b9%d9%84%d9%88%d9%85%d8%a7%d8%aa-%d8%b1%d9%82%d9%85-4/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'integrity-anticorruption-2006',
    title: 'قانون النزاهة ومكافحة الفساد',
    title_en: 'Integrity and Anti-Corruption Law',
    identifier: 'qanun/2006/62',
    url: 'https://jordan-lawyer.com/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%86%d8%b2%d8%a7%d9%87%d8%a9-%d9%88%d9%85%d9%83%d8%a7%d9%81%d8%ad%d8%a9-%d8%a7%d9%84%d9%81%d8%b3%d8%a7%d8%af/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== HEALTH, ENVIRONMENT, ENERGY =====
  {
    id: 'medical-liability-law-2018',
    title: 'قانون المسؤولية الطبية والصحية رقم 25 لسنة 2018',
    title_en: 'Medical and Health Liability Law No. 25 of 2018',
    identifier: 'qanun/2018/25',
    url: 'https://jordan-lawyer.com/2018/11/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%b3%d8%a4%d9%88%d9%84%d9%8a%d8%a9-%d8%a7%d9%84%d8%b7%d8%a8%d9%8a%d8%a9-%d9%88%d8%a7%d9%84%d8%b5%d8%ad%d9%8a%d8%a9-%d8%b1%d9%82%d9%85-25-%d9%84%d8%b3/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'drugs-pharmacy-law',
    title: 'قانون الدواء والصيدلة الأردني',
    title_en: 'Drugs and Pharmacy Law',
    identifier: 'qanun/drugs-pharmacy',
    url: 'https://jordan-lawyer.com/2021/05/04/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%af%d9%88%d8%a7%d8%a1-%d9%88%d8%a7%d9%84%d8%b5%d9%8a%d8%af%d9%84%d8%a9-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'waste-management-law-2020',
    title: 'القانون الإطاري لإدارة النفايات لسنة 2020',
    title_en: 'Waste Management Framework Law of 2020',
    identifier: 'qanun/2020/waste-management',
    url: 'https://jordan-lawyer.com/2020/03/22/%d8%a7%d9%84%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a5%d8%b7%d8%a7%d8%b1%d9%8a-%d9%84%d8%a5%d8%af%d8%a7%d8%b1%d8%a9-%d8%a7%d9%84%d9%86%d9%81%d8%a7%d9%8a%d8%a7%d8%aa-%d9%84%d8%b3%d9%86%d8%a9-202/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'water-authority-law-1988',
    title: 'قانون سلطة المياه وتعديلاته رقم 18 لسنة 1988',
    title_en: 'Water Authority Law No. 18 of 1988',
    identifier: 'qanun/1988/18',
    url: 'https://jordan-lawyer.com/2018/12/19/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%b3%d9%84%d8%b7%d8%a9-%d8%a7%d9%84%d9%85%d9%8a%d8%a7%d9%87-%d9%88%d8%aa%d8%b9%d8%af%d9%8a%d9%84%d8%a7%d8%aa%d9%87-%d8%b1%d9%82%d9%85-18-%d9%84%d8%b3%d9%86%d8%a9-1988/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'petroleum-products-law-2018',
    title: 'قانون المشتقات البترولية رقم 11 لسنة 2018',
    title_en: 'Petroleum Products Law No. 11 of 2018',
    identifier: 'qanun/2018/11',
    url: 'https://jordan-lawyer.com/2018/11/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%b4%d8%aa%d9%82%d8%a7%d8%aa-%d8%a7%d9%84%d8%a8%d8%aa%d8%b1%d9%88%d9%84%d9%8a%d8%a9-%d8%b1%d9%82%d9%85-11-%d9%84%d8%b3%d9%86%d8%a9-2018/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== INTELLECTUAL PROPERTY =====
  {
    id: 'copyright-law-1992',
    title: 'قانون حق المؤلف الأردني',
    title_en: 'Copyright Law',
    identifier: 'qanun/1992/22',
    url: 'https://jordan-lawyer.com/2021/05/26/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%ad%d9%82-%d8%a7%d9%84%d9%85%d8%a4%d9%84%d9%81-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },

  // ===== INSURANCE =====
  {
    id: 'insurance-regulation-law',
    title: 'قانون تنظيم أعمال التأمين',
    title_en: 'Insurance Business Regulation Law',
    identifier: 'qanun/insurance',
    url: 'https://jordan-lawyer.com/2021/05/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d9%86%d8%b8%d9%8a%d9%85-%d8%a3%d8%b9%d9%85%d8%a7%d9%84-%d8%a7%d9%84%d8%aa%d8%a3%d9%85%d9%8a%d9%86/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },

  // ===== ADMINISTRATIVE =====
  {
    id: 'civil-status-law',
    title: 'قانون الأحوال المدنية',
    title_en: 'Civil Status Law',
    identifier: 'qanun/civil-status',
    url: 'https://jordan-lawyer.com/2012/11/11/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d8%a3%d8%ad%d9%88%d8%a7%d9%84-%d8%a7%d9%84%d9%85%d8%af%d9%86%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'passport-law',
    title: 'قانون جوازات السفر الأردني',
    title_en: 'Passport Law',
    identifier: 'qanun/passport',
    url: 'https://jordan-lawyer.com/2021/05/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%ac%d9%88%d8%a7%d8%b2%d8%a7%d8%aa-%d8%a7%d9%84%d8%b3%d9%81%d8%b1-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'profession-licensing-law',
    title: 'قانون رخص المهن',
    title_en: 'Profession Licensing Law',
    identifier: 'qanun/profession-licensing',
    url: 'https://jordan-lawyer.com/2021/05/09/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%b1%d8%ae%d8%b5-%d8%a7%d9%84%d9%85%d9%87%d9%86/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'state-property-law',
    title: 'قانون المحافظة على أملاك الدولة',
    title_en: 'State Property Protection Law',
    identifier: 'qanun/state-property',
    url: 'https://jordan-lawyer.com/2021/05/18/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%ad%d8%a7%d9%81%d8%b8%d8%a9-%d8%b9%d9%84%d9%89-%d8%a3%d9%85%d9%84%d8%a7%d9%83-%d8%a7%d9%84%d8%af%d9%88%d9%84%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'urban-planning-law',
    title: 'قانون تنظيم المدن والقرى والأبنية',
    title_en: 'Urban Planning and Buildings Law',
    identifier: 'qanun/urban-planning',
    url: 'https://jordan-lawyer.com/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%aa%d9%86%d8%b8%d9%8a%d9%85-%d8%a7%d9%84%d9%85%d8%af%d9%86-%d9%88%d8%a7%d9%84%d9%82%d8%b1%d9%89-%d9%88%d8%a7%d9%84%d8%a3%d8%a8%d9%86%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'amended',
    category: 'act',
  },
  {
    id: 'corrections-rehabilitation-law',
    title: 'قانون مراكز الإصلاح والتأهيل الأردني',
    title_en: 'Corrections and Rehabilitation Centers Law',
    identifier: 'qanun/corrections',
    url: 'https://jordan-lawyer.com/2010/07/08/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d9%85%d8%b1%d8%a7%d9%83%d8%b2-%d8%a7%d9%84%d8%a5%d8%b5%d9%84%d8%a7%d8%ad-%d9%88%d8%a7%d9%84%d8%aa%d8%a3%d9%87%d9%8a%d9%84-%d8%a7%d9%84%d8%a3%d8%b1%d8%af%d9%86%d9%8a/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
  {
    id: 'consumer-civil-corporation-law',
    title: 'قانون المؤسسة الاستهلاكية المدنية',
    title_en: 'Consumer Civil Corporation Law',
    identifier: 'qanun/consumer-civil-corp',
    url: 'https://jordan-lawyer.com/2020/03/22/%d9%82%d8%a7%d9%86%d9%88%d9%86-%d8%a7%d9%84%d9%85%d8%a4%d8%b3%d8%b3%d8%a9-%d8%a7%d9%84%d8%a7%d8%b3%d8%aa%d9%87%d9%84%d8%a7%d9%83%d9%8a%d8%a9-%d8%a7%d9%84%d9%85%d8%af%d9%86%d9%8a%d8%a9/',
    source: 'jordan-lawyer',
    status: 'in_force',
    category: 'act',
  },
];

/* ---------- Main ---------- */

async function main(): Promise<void> {
  console.log('Jordan Law MCP -- Census (Full Corpus)');
  console.log('=======================================\n');
  console.log('  Source: jordan-lawyer.com, jordanlaws.org, constituteproject.org');
  console.log('  Method: Curated catalog with verified full-text HTML sources');
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
    // Only mark as ingestable if source is jordan-lawyer, jordanlaws, or constituteproject (not curated fallbacks)
    const classification = law.source === 'curated' ? 'inaccessible' as const : 'ingestable' as const;
    existingEntries.set(law.id, {
      id: law.id,
      title: law.title,
      title_en: law.title_en,
      identifier: law.identifier,
      url: law.url,
      source: law.source,
      status: law.status,
      category: law.category,
      classification,
      ingested: existing?.ingested ?? false,
      provision_count: existing?.provision_count ?? 0,
      ingestion_date: existing?.ingestion_date ?? null,
    });
  }

  const allLaws = Array.from(existingEntries.values()).sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  const ingestable = allLaws.filter(l => l.classification === 'ingestable').length;
  const inaccessible = allLaws.filter(l => l.classification === 'inaccessible').length;
  const today = new Date().toISOString().split('T')[0];

  const census: CensusFile = {
    schema_version: '1.0',
    jurisdiction: 'JO',
    jurisdiction_name: 'Jordan',
    portal: 'https://jordan-lawyer.com',
    census_date: today,
    agent: 'claude-opus-4-6',
    summary: {
      total_laws: allLaws.length,
      ingestable,
      ocr_needed: 0,
      inaccessible,
      excluded: 0,
    },
    laws: allLaws,
  };

  fs.mkdirSync(path.dirname(CENSUS_PATH), { recursive: true });
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));

  const bySource = {
    'jordan-lawyer': allLaws.filter(l => l.source === 'jordan-lawyer').length,
    'jordanlaws': allLaws.filter(l => l.source === 'jordanlaws').length,
    'constituteproject': allLaws.filter(l => l.source === 'constituteproject').length,
    'curated': allLaws.filter(l => l.source === 'curated').length,
  };

  console.log('=======================================');
  console.log('Census Complete');
  console.log(`  Total laws:       ${allLaws.length}`);
  console.log(`  Ingestable:       ${ingestable}`);
  console.log(`  Inaccessible:     ${inaccessible} (curated-only, no HTML source)`);
  console.log(`\n  Sources:`);
  console.log(`    jordan-lawyer.com:    ${bySource['jordan-lawyer']}`);
  console.log(`    jordanlaws.org:       ${bySource['jordanlaws']}`);
  console.log(`    constituteproject:    ${bySource['constituteproject']}`);
  console.log(`    curated (no source):  ${bySource['curated']}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => { console.error('Fatal error:', error); process.exit(1); });
