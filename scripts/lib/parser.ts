/**
 * Jordan Law HTML Parser
 *
 * Parses legislation pages from Jordanian legal sources:
 *   - jordan-lawyer.com (WordPress pages with <strong>المادة N</strong> pattern)
 *   - jordanlaws.org (similar WordPress structure)
 *   - constituteproject.org (structured constitution HTML)
 *
 * Jordan uses standard Arabic legal conventions:
 *   - "المادة" (al-madda) for articles
 *   - "الباب" (al-bab) for parts
 *   - "الفصل" (al-fasl) for chapters
 *   - "الفرع" (al-far') for sections/branches
 *
 * Source: jordan-lawyer.com / jordanlaws.org
 */

export interface ActIndexEntry {
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  status: 'in_force' | 'amended' | 'repealed' | 'not_yet_in_force';
  issuedDate: string;
  inForceDate: string;
  url: string;
  aknYear?: string;
  aknNumber?: string;
  description?: string;
  source?: string;
}

export interface ParsedProvision {
  provision_ref: string;
  chapter?: string;
  section: string;
  title: string;
  content: string;
}

export interface ParsedDefinition {
  term: string;
  definition: string;
  source_provision?: string;
}

export interface ParsedAct {
  id: string;
  type: 'statute';
  title: string;
  title_en: string;
  short_name: string;
  status: string;
  issued_date: string;
  in_force_date: string;
  url: string;
  description?: string;
  provisions: ParsedProvision[];
  definitions: ParsedDefinition[];
}

/* ---------- Helpers ---------- */

function toAsciiDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, ch => String(ch.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, ch => String(ch.charCodeAt(0) - 1776));
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, ' ');
}

function normalizeWhitespace(input: string): string {
  return input
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/\u0640/g, '') // Remove Arabic tatweel/kashida
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize whitespace while preserving newlines.
 * This is critical for article splitting which uses \n as a delimiter.
 */
function normalizePreservingNewlines(input: string): string {
  return input
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .replace(/\u0640/g, '') // Remove Arabic tatweel/kashida
    .replace(/[^\S\n]+/g, ' ')  // Collapse horizontal whitespace only (not \n)
    .replace(/\n{3,}/g, '\n\n') // Cap consecutive newlines at 2
    .replace(/ *\n */g, '\n')   // Trim spaces around newlines
    .trim();
}

function htmlToText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n');
  return normalizePreservingNewlines(stripTags(decodeHtmlEntities(withBreaks)));
}

/**
 * Extract the WordPress entry-content from HTML.
 * This filters out navigation, headers, footers, sidebars.
 */
function extractEntryContent(html: string): string {
  // Find the start of the entry-content div (WordPress standard)
  // The class attribute may contain additional classes like "clear"
  // and the tag may span multiple lines
  const startPattern = /<div[^>]*class\s*=\s*"[^"]*entry-content[^"]*"[^>]*>/is;
  const startMatch = startPattern.exec(html);
  if (startMatch) {
    const contentStart = startMatch.index + startMatch[0].length;
    // Find the corresponding closing div by tracking nesting depth
    let depth = 1;
    let pos = contentStart;
    while (depth > 0 && pos < html.length) {
      const openDiv = html.indexOf('<div', pos);
      const closeDiv = html.indexOf('</div>', pos);
      if (closeDiv === -1) break;
      if (openDiv !== -1 && openDiv < closeDiv) {
        depth++;
        pos = openDiv + 4;
      } else {
        depth--;
        if (depth === 0) return html.substring(contentStart, closeDiv);
        pos = closeDiv + 6;
      }
    }
    // If nesting tracking fails, return everything from start to end
    return html.substring(contentStart);
  }

  // Fallback: try article tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) return articleMatch[1];

  // Last resort: return everything between body tags
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function parseArticleNumber(heading: string, fallbackIndex: number): string {
  const ascii = toAsciiDigits(heading);
  // Match digits, potentially with bis/ter suffix
  const numericMatch = ascii.match(/(\d+)/);
  if (numericMatch) return String(parseInt(numericMatch[1], 10));
  return String(fallbackIndex);
}

/**
 * Parse Jordanian legislation HTML from WordPress-based legal sources.
 *
 * The HTML structure on jordan-lawyer.com / jordanlaws.org follows:
 *   <p><strong>المادة N</strong> content text</p>
 *   <p>continuation of article content</p>
 *
 * Articles are delimited by "المادة" (al-madda) which is the standard
 * Arabic convention used across Jordan and the broader Levant region.
 */
export function parseJordanLawHtml(html: string, act: ActIndexEntry): ParsedAct {
  const provisions: ParsedProvision[] = [];
  const definitions: ParsedDefinition[] = [];

  // Extract main content area (skip nav/sidebar/footer)
  const contentHtml = extractEntryContent(html);
  const fullText = htmlToText(contentHtml);

  // Split on المادة (article) delimiters
  // Matches: المادة 1, المادة (1), المادة ١, المادة الأولى, etc.
  // The pattern anchors to start-of-string or newline since htmlToText preserves \n.
  // Two alternatives after المادة:
  //   1. Numeric: optional parens around digits (Arabic or ASCII)
  //   2. Ordinal Arabic words (e.g. الأولى, الثانية) — limited to 2-30 Arabic chars
  const articlePattern = /(?:^|\n) *(المادة\s*(?:\(?\s*(?:\d+|[٠-٩]+)\s*\)?|[\u0600-\u06FF]{2,30}))\s*[:\-–—]?\s*/g;
  const articleStarts: { heading: string; index: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = articlePattern.exec(fullText)) !== null) {
    articleStarts.push({ heading: normalizeWhitespace(match[1]), index: match.index });
  }

  // If no articles found with standard pattern, try alternative patterns
  if (articleStarts.length === 0) {
    // Try "مادة" without "ال" prefix
    const altPattern = /(?:^|\n) *(مادة\s*(?:\(?\s*(?:\d+|[٠-٩]+)\s*\)?|[\u0600-\u06FF]{2,30}))\s*[:\-–—]?\s*/g;
    while ((match = altPattern.exec(fullText)) !== null) {
      articleStarts.push({ heading: normalizeWhitespace(match[1]), index: match.index });
    }
  }

  // Extract chapter/part/section positions
  let currentChapter: string | undefined;
  const chapterPattern = /(?:^|\n) *((?:الباب|الفصل|الفرع|القسم)\s+(?:\d+|[٠-٩]+|[\u0600-\u06FF\s]{2,40}))\s*[:\-–—]?\s*/g;
  const chapterPositions: { chapter: string; index: number }[] = [];

  while ((match = chapterPattern.exec(fullText)) !== null) {
    const ch = normalizeWhitespace(match[1]);
    // Filter out false positives (too long = probably not a chapter heading)
    if (ch.length < 80) {
      chapterPositions.push({ chapter: ch, index: match.index });
    }
  }

  const seenRefs = new Set<string>();

  for (let i = 0; i < articleStarts.length; i++) {
    const start = articleStarts[i];
    const endIndex = i + 1 < articleStarts.length ? articleStarts[i + 1].index : fullText.length;
    const articleText = fullText.substring(start.index, endIndex).trim();
    const articleNum = parseArticleNumber(start.heading, i + 1);

    // Update current chapter based on positions
    for (const cp of chapterPositions) {
      if (cp.index <= start.index) currentChapter = cp.chapter;
    }

    // Extract content after the heading
    const headingEnd = articleText.indexOf('\n');
    let content: string;
    if (headingEnd > 0) {
      // First line might contain inline content after heading
      const firstLine = normalizeWhitespace(articleText.substring(0, headingEnd).replace(start.heading, ''));
      const rest = normalizeWhitespace(articleText.substring(headingEnd));
      content = (firstLine + ' ' + rest).trim();
    } else {
      content = normalizeWhitespace(articleText.replace(start.heading, ''));
    }

    // Skip very short or empty content
    if (content.length < 5) continue;

    // Dedupe: if we already have this article number, keep the longer version
    const ref = `art${articleNum}`;
    if (seenRefs.has(ref)) {
      const existing = provisions.find(p => p.provision_ref === ref);
      if (existing && existing.content.length >= content.length) continue;
      // Replace with longer version
      const idx = provisions.findIndex(p => p.provision_ref === ref);
      if (idx >= 0) provisions.splice(idx, 1);
    }
    seenRefs.add(ref);

    provisions.push({
      provision_ref: ref,
      chapter: currentChapter,
      section: articleNum,
      title: start.heading,
      content: content.substring(0, 12000), // Cap at 12KB per provision
    });

    // Extract definitions from early articles (typically art 1-3)
    if (parseInt(articleNum) <= 3) {
      extractDefinitions(content, ref, definitions);
    }
  }

  return {
    id: act.id,
    type: 'statute',
    title: act.title,
    title_en: act.titleEn,
    short_name: act.shortName,
    status: act.status,
    issued_date: act.issuedDate,
    in_force_date: act.inForceDate,
    url: act.url,
    description: act.description,
    provisions,
    definitions,
  };
}

/**
 * Parse Constitution from constituteproject.org HTML.
 * Uses different structure than WordPress law pages.
 */
export function parseConstitutionHtml(html: string, act: ActIndexEntry): ParsedAct {
  // constituteproject pages have structured content
  // Fall back to the general parser which handles المادة patterns
  return parseJordanLawHtml(html, act);
}

function extractDefinitions(text: string, sourceProvision: string, definitions: ParsedDefinition[]): void {
  const seenTerms = new Set<string>();
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;

    // Arabic definition patterns: term: definition or term - definition
    const sepIndex = trimmed.indexOf(':');
    const dashIndex = trimmed.indexOf(' - ');
    const colonAr = trimmed.indexOf(':-');
    const idx = colonAr > 0 && colonAr < 80 ? colonAr
      : sepIndex > 0 && sepIndex < 80 ? sepIndex
      : dashIndex > 0 && dashIndex < 80 ? dashIndex
      : -1;
    if (idx < 0) continue;

    const term = normalizeWhitespace(trimmed.substring(0, idx).replace(/^[-\u2022\u2013\u2014*\d+\.]/g, ''));
    const definition = normalizeWhitespace(trimmed.substring(idx + 1));

    if (term.length < 2 || term.length > 120 || definition.length < 8) continue;
    if (seenTerms.has(term.toLowerCase())) continue;
    seenTerms.add(term.toLowerCase());

    definitions.push({ term, definition, source_provision: sourceProvision });
  }
}
