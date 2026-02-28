#!/usr/bin/env tsx
/**
 * Jordan Law MCP -- Seed Generator
 *
 * Generates seed JSON files for key Jordanian laws from known legal text.
 * Jordan uses "المادة" for articles (standard Arabic convention).
 *
 * Usage: npx tsx scripts/generate-seeds.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_DIR = path.resolve(__dirname, '../data/seed');
const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');

interface Provision { provision_ref: string; chapter?: string; section: string; title: string; content: string; }
interface Definition { term: string; definition: string; source_provision?: string; }
interface SeedFile { id: string; type: 'statute'; title: string; title_en: string; short_name: string; status: 'in_force' | 'amended' | 'repealed'; issued_date: string; in_force_date: string; url: string; description: string; provisions: Provision[]; definitions: Definition[]; }

function writeSeed(seed: SeedFile): void {
  fs.writeFileSync(path.join(SEED_DIR, `${seed.id}.json`), JSON.stringify(seed, null, 2));
  console.log(`  ${seed.id}: ${seed.provisions.length} provisions, ${seed.definitions.length} definitions`);
}

function main(): void {
  console.log('Jordan Law MCP -- Seed Generator\n');
  fs.mkdirSync(SEED_DIR, { recursive: true });

  // 1. Constitution
  writeSeed({
    id: 'constitution', type: 'statute',
    title: 'الدستور الأردني', title_en: 'Constitution of the Hashemite Kingdom of Jordan',
    short_name: 'Constitution', status: 'in_force',
    issued_date: '1952-01-01', in_force_date: '1952-01-01',
    url: 'https://www.moj.gov.jo/AR/List/الدستور_الأردني',
    description: 'Constitution of Jordan, amended multiple times, most recently in 2022',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'المملكة الأردنية الهاشمية دولة عربية مستقلة ذات سيادة ملكها لا يتجزأ ولا ينزل عن شيء منه. والشعب الأردني جزء من الأمة العربية ونظام الحكم فيها نيابي ملكي وراثي.', chapter: 'الفصل الأول - الدولة ونظام الحكم' },
      { provision_ref: 'art6', section: '6', title: 'المادة 6', content: 'الأردنيون أمام القانون سواء لا تمييز بينهم في الحقوق والواجبات وإن اختلفوا في العرق أو اللغة أو الدين.', chapter: 'الفصل الثاني - حقوق الأردنيين وواجباتهم' },
      { provision_ref: 'art7', section: '7', title: 'المادة 7', content: 'الحرية الشخصية مصونة. كل اعتداء على الحقوق والحريات العامة أو حرمة الحياة الخاصة للأردنيين جريمة يعاقب عليها القانون.', chapter: 'الفصل الثاني - حقوق الأردنيين وواجباتهم' },
      { provision_ref: 'art8', section: '8', title: 'المادة 8', content: 'لا يجوز أن يقبض على أحد أو يوقف أو يحبس أو تقيد حريته إلا وفق أحكام القانون.', chapter: 'الفصل الثاني - حقوق الأردنيين وواجباتهم' },
      { provision_ref: 'art15', section: '15', title: 'المادة 15', content: 'تكفل الدولة حرية الرأي. ولكل أردني أن يعرب بحرية عن رأيه بالقول والكتابة والتصوير وسائر وسائل التعبير بشرط أن لا يتجاوز حدود القانون.', chapter: 'الفصل الثاني - حقوق الأردنيين وواجباتهم' },
      { provision_ref: 'art18', section: '18', title: 'المادة 18', content: 'تعتبر جميع المراسلات البريدية والبرقية والمخاطبات الهاتفية وغيرها من وسائل الاتصال سرية لا تخضع للمراقبة أو الاطلاع أو التوقيف أو المصادرة إلا بأمر قضائي وفق أحكام القانون.', chapter: 'الفصل الثاني - حقوق الأردنيين وواجباتهم' },
      { provision_ref: 'art25', section: '25', title: 'المادة 25', content: 'تناط السلطة التشريعية بمجلس الأمة والملك ويتألف مجلس الأمة من مجلسي الأعيان والنواب.', chapter: 'الفصل الثالث - السلطات' },
      { provision_ref: 'art97', section: '97', title: 'المادة 97', content: 'القضاة مستقلون لا سلطان عليهم في قضائهم لغير القانون.', chapter: 'الفصل الخامس - السلطة القضائية' },
    ],
    definitions: [],
  });

  // 2. Cybercrime Law 2023
  writeSeed({
    id: 'cybercrime-law-2023', type: 'statute',
    title: 'قانون الجرائم الإلكترونية رقم 17 لسنة 2023', title_en: 'Cybercrime Law No. 17 of 2023',
    short_name: 'Cybercrime Law 2023', status: 'in_force',
    issued_date: '2023-08-12', in_force_date: '2023-09-12',
    url: 'https://lob.gov.jo',
    description: 'Comprehensive cybercrime law replacing the 2015 law, criminalizing online offenses including hacking, fraud, and content crimes',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون الجرائم الإلكترونية لسنة 2023) ويعمل به بعد ثلاثين يوما من تاريخ نشره في الجريدة الرسمية.', chapter: 'الفصل الأول - تعريفات' },
      { provision_ref: 'art2', section: '2', title: 'المادة 2', content: 'يكون للكلمات والعبارات التالية المعاني المخصصة لها: نظام المعلومات: مجموعة البرامج والأدوات المعدة لإنشاء البيانات أو المعلومات إلكترونيا أو إرسالها أو تسلمها أو تخزينها أو إدارتها أو معالجتها. الشبكة المعلوماتية: ارتباط بين أكثر من نظام معلومات للحصول على البيانات وتبادلها. البيانات: الأرقام أو الحروف أو الرموز أو الأشكال أو الأصوات أو الصور.', chapter: 'الفصل الأول - تعريفات' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'يعاقب بالحبس مدة لا تقل عن ثلاثة أشهر وبغرامة لا تقل عن 5000 دينار ولا تزيد على 25000 دينار كل من دخل قصدا إلى الشبكة المعلوماتية أو نظام معلومات بأي وسيلة دون تصريح أو بما يجاوز التصريح.', chapter: 'الفصل الثاني - الجرائم والعقوبات' },
      { provision_ref: 'art4', section: '4', title: 'المادة 4', content: 'يعاقب بالحبس مدة لا تقل عن ثلاثة أشهر وبغرامة لا تقل عن 5000 دينار ولا تزيد على 25000 دينار كل من أعاق أو عطل الوصول إلى الشبكة المعلوماتية أو نظام المعلومات.', chapter: 'الفصل الثاني - الجرائم والعقوبات' },
      { provision_ref: 'art5', section: '5', title: 'المادة 5', content: 'يعاقب بالحبس مدة لا تقل عن ستة أشهر وبغرامة لا تقل عن 10000 دينار ولا تزيد على 50000 دينار كل من التقط أو اعترض أو نسخ أو أفشى بيانات أو معلومات بدون تصريح.', chapter: 'الفصل الثاني - الجرائم والعقوبات' },
      { provision_ref: 'art11', section: '11', title: 'المادة 11', content: 'يعاقب بالحبس مدة لا تقل عن ثلاثة أشهر كل من قام قصدا بإرسال أو إعادة إرسال بيانات أو معلومات عبر الشبكة المعلوماتية تنطوي على أخبار كاذبة.', chapter: 'الفصل الثاني - الجرائم والعقوبات' },
      { provision_ref: 'art15', section: '15', title: 'المادة 15', content: 'يعاقب بالحبس مدة لا تقل عن سنة وبغرامة لا تقل عن 15000 دينار كل من استخدم الشبكة المعلوماتية لترويج أو تسهيل الاتجار بالمخدرات أو المؤثرات العقلية.', chapter: 'الفصل الثاني - الجرائم والعقوبات' },
      { provision_ref: 'art25', section: '25', title: 'المادة 25', content: 'يلتزم مقدمو الخدمات بالاحتفاظ ببيانات حركة الاتصالات لمدة لا تقل عن ثلاث سنوات وتقديمها عند الطلب للجهات المختصة.', chapter: 'الفصل الثالث - التزامات مقدمي الخدمات' },
    ],
    definitions: [
      { term: 'نظام المعلومات', definition: 'مجموعة البرامج والأدوات المعدة لإنشاء البيانات أو المعلومات إلكترونيا أو إرسالها أو تسلمها أو تخزينها', source_provision: 'art2' },
      { term: 'الشبكة المعلوماتية', definition: 'ارتباط بين أكثر من نظام معلومات للحصول على البيانات وتبادلها', source_provision: 'art2' },
      { term: 'البيانات', definition: 'الأرقام أو الحروف أو الرموز أو الأشكال أو الأصوات أو الصور', source_provision: 'art2' },
    ],
  });

  // 3. Electronic Transactions Law 2015
  writeSeed({
    id: 'electronic-transactions-2015', type: 'statute',
    title: 'قانون المعاملات الإلكترونية رقم 15 لسنة 2015', title_en: 'Electronic Transactions Law No. 15 of 2015',
    short_name: 'E-Transactions Law 2015', status: 'in_force',
    issued_date: '2015-05-17', in_force_date: '2015-05-17',
    url: 'https://lob.gov.jo',
    description: 'Law governing electronic transactions, signatures, and records in Jordan',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون المعاملات الإلكترونية لسنة 2015) ويعمل به من تاريخ نشره في الجريدة الرسمية.', chapter: 'الفصل الأول - أحكام عامة' },
      { provision_ref: 'art2', section: '2', title: 'المادة 2', content: 'يكون للكلمات والعبارات التالية المعاني المخصصة لها: المعاملة الإلكترونية: أي تصرف قانوني يتم بوسائل إلكترونية. التوقيع الإلكتروني: بيانات في شكل إلكتروني مدرجة في معاملة إلكترونية أو مضافة إليها أو مرتبطة بها لغرض إثبات هوية الموقع.', chapter: 'الفصل الأول - أحكام عامة' },
      { provision_ref: 'art5', section: '5', title: 'المادة 5', content: 'يعتبر العقد الإلكتروني صحيحا ومنتجا لآثاره القانونية إذا توافرت فيه أركان العقد وشروطه المنصوص عليها في التشريعات النافذة.', chapter: 'الفصل الثاني - العقود الإلكترونية' },
      { provision_ref: 'art7', section: '7', title: 'المادة 7', content: 'يعتبر التوقيع الإلكتروني المعتمد بمنزلة التوقيع الخطي وينتج الأثر القانوني ذاته.', chapter: 'الفصل الثالث - التوقيع الإلكتروني' },
      { provision_ref: 'art10', section: '10', title: 'المادة 10', content: 'للسجل الإلكتروني حجية الإثبات المقررة للوثائق والمستندات الخطية في التشريعات النافذة.', chapter: 'الفصل الرابع - السجلات الإلكترونية' },
      { provision_ref: 'art17', section: '17', title: 'المادة 17', content: 'يحظر على أي شخص استخدام التوقيع الإلكتروني لشخص آخر أو الشهادة الإلكترونية دون تفويض.', chapter: 'الفصل الخامس - أحكام جزائية' },
    ],
    definitions: [
      { term: 'المعاملة الإلكترونية', definition: 'أي تصرف قانوني يتم بوسائل إلكترونية', source_provision: 'art2' },
      { term: 'التوقيع الإلكتروني', definition: 'بيانات في شكل إلكتروني مدرجة في معاملة إلكترونية أو مضافة إليها لغرض إثبات هوية الموقع', source_provision: 'art2' },
    ],
  });

  // 4. AML/CTF Law 2007
  writeSeed({
    id: 'aml-cft-law-2007', type: 'statute',
    title: 'قانون مكافحة غسل الأموال وتمويل الإرهاب رقم 46 لسنة 2007', title_en: 'Anti-Money Laundering and Counter-Terrorism Financing Law No. 46 of 2007',
    short_name: 'AML/CTF Law 2007', status: 'in_force',
    issued_date: '2007-06-17', in_force_date: '2007-06-17',
    url: 'https://lob.gov.jo',
    description: 'Comprehensive anti-money laundering and counter-terrorism financing legislation',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون مكافحة غسل الأموال وتمويل الإرهاب لسنة 2007).', chapter: 'الفصل الأول - أحكام عامة' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'يعتبر مرتكبا لجريمة غسل الأموال كل من قام بأي عملية لإخفاء أو تمويه مصدر الأموال غير المشروعة أو طبيعتها أو مكانها أو حركتها أو ملكيتها.', chapter: 'الفصل الثاني - جرائم غسل الأموال' },
      { provision_ref: 'art8', section: '8', title: 'المادة 8', content: 'تنشأ وحدة تسمى (وحدة مكافحة غسل الأموال وتمويل الإرهاب) تتمتع بالاستقلال المالي والإداري وتتولى تلقي الإخطارات بالعمليات المشتبه بها وتحليلها.', chapter: 'الفصل الثالث - وحدة مكافحة غسل الأموال' },
      { provision_ref: 'art13', section: '13', title: 'المادة 13', content: 'تلتزم الجهات الخاضعة لأحكام هذا القانون بالتعرف على هوية العملاء والتحقق منها وتطبيق إجراءات العناية الواجبة.', chapter: 'الفصل الرابع - الالتزامات' },
      { provision_ref: 'art24', section: '24', title: 'المادة 24', content: 'يعاقب بالأشغال المؤقتة مدة لا تقل عن ثلاث سنوات وبغرامة لا تقل عن 100000 دينار كل من ارتكب جريمة غسل أموال.', chapter: 'الفصل الخامس - العقوبات' },
    ],
    definitions: [
      { term: 'غسل الأموال', definition: 'أي عملية لإخفاء أو تمويه مصدر الأموال غير المشروعة أو طبيعتها أو مكانها أو حركتها', source_provision: 'art3' },
    ],
  });

  // 5. Banking Law 2000
  writeSeed({
    id: 'banking-law-2000', type: 'statute',
    title: 'قانون البنوك رقم 28 لسنة 2000', title_en: 'Banking Law No. 28 of 2000',
    short_name: 'Banking Law 2000', status: 'in_force',
    issued_date: '2000-07-30', in_force_date: '2000-07-30',
    url: 'https://www.cbj.gov.jo',
    description: 'Law regulating banking activities and institutions in Jordan',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون البنوك لسنة 2000) ويعمل به من تاريخ نشره في الجريدة الرسمية.', chapter: 'الفصل الأول - أحكام عامة' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'البنك هو كل شخص اعتباري يمارس الأعمال المصرفية الرئيسية من قبول الودائع ومنح التسهيلات الائتمانية وأي أعمال مصرفية أخرى.', chapter: 'الفصل الأول - أحكام عامة' },
      { provision_ref: 'art7', section: '7', title: 'المادة 7', content: 'لا يجوز لأي شخص ممارسة الأعمال المصرفية في المملكة إلا بعد الحصول على ترخيص من البنك المركزي.', chapter: 'الفصل الثاني - الترخيص' },
      { provision_ref: 'art42', section: '42', title: 'المادة 42', content: 'تلتزم البنوك بالمحافظة على سرية حسابات العملاء وودائعهم وأماناتهم وخزائنهم لديها ولا يجوز إعطاء أي معلومات عنها إلا بموافقة خطية من العميل أو بقرار قضائي.', chapter: 'الفصل الخامس - السرية المصرفية' },
      { provision_ref: 'art58', section: '58', title: 'المادة 58', content: 'يتولى البنك المركزي الرقابة والتفتيش على البنوك للتأكد من التزامها بأحكام هذا القانون والأنظمة والتعليمات الصادرة بمقتضاه.', chapter: 'الفصل السادس - الرقابة' },
    ],
    definitions: [
      { term: 'البنك', definition: 'كل شخص اعتباري يمارس الأعمال المصرفية الرئيسية من قبول الودائع ومنح التسهيلات الائتمانية', source_provision: 'art3' },
    ],
  });

  // 6. Access to Information Law 2007
  writeSeed({
    id: 'access-to-information-2007', type: 'statute',
    title: 'قانون ضمان حق الحصول على المعلومات رقم 47 لسنة 2007', title_en: 'Access to Information Law No. 47 of 2007',
    short_name: 'Access to Information 2007', status: 'in_force',
    issued_date: '2007-06-17', in_force_date: '2007-06-17',
    url: 'https://lob.gov.jo',
    description: 'Law guaranteeing the right of access to information held by public bodies',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون ضمان حق الحصول على المعلومات لسنة 2007).', chapter: 'أحكام عامة' },
      { provision_ref: 'art2', section: '2', title: 'المادة 2', content: 'لكل أردني الحق في الحصول على المعلومات التي يطلبها وفقا لأحكام هذا القانون.', chapter: 'أحكام عامة' },
      { provision_ref: 'art7', section: '7', title: 'المادة 7', content: 'يقدم طلب الحصول على المعلومات إلى المسؤول المعني خطيا متضمنا اسم مقدم الطلب وعنوانه وموضوع المعلومات المطلوبة.', chapter: 'إجراءات الحصول على المعلومات' },
      { provision_ref: 'art10', section: '10', title: 'المادة 10', content: 'لا تشمل المعلومات التي يحق للمواطن الحصول عليها: الأسرار المحمية بالتشريعات النافذة والوثائق المصنفة سرية والمعلومات المتعلقة بالحياة الخاصة.', chapter: 'الاستثناءات' },
      { provision_ref: 'art17', section: '17', title: 'المادة 17', content: 'ينشأ مجلس يسمى (مجلس المعلومات) يتولى النظر في الشكاوى المقدمة من أي شخص رفض طلبه في الحصول على المعلومات.', chapter: 'مجلس المعلومات' },
    ],
    definitions: [],
  });

  // 7. Consumer Protection Law 2017
  writeSeed({
    id: 'consumer-protection-2017', type: 'statute',
    title: 'قانون حماية المستهلك رقم 7 لسنة 2017', title_en: 'Consumer Protection Law No. 7 of 2017',
    short_name: 'Consumer Protection 2017', status: 'in_force',
    issued_date: '2017-03-16', in_force_date: '2017-03-16',
    url: 'https://lob.gov.jo',
    description: 'Consumer protection law establishing rights and safeguards for Jordanian consumers',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون حماية المستهلك لسنة 2017) ويعمل به بعد ستين يوما من تاريخ نشره في الجريدة الرسمية.', chapter: 'أحكام عامة' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'يهدف هذا القانون إلى حماية المستهلك من الغش والخداع والممارسات التجارية غير العادلة وضمان جودة السلع والخدمات.', chapter: 'أحكام عامة' },
      { provision_ref: 'art5', section: '5', title: 'المادة 5', content: 'يلتزم المزود بتقديم معلومات صحيحة ودقيقة عن السلعة أو الخدمة تشمل: المواصفات والسعر والضمان وطريقة الاستعمال.', chapter: 'التزامات المزود' },
      { provision_ref: 'art12', section: '12', title: 'المادة 12', content: 'للمستهلك الحق في استبدال أو إرجاع أي سلعة معيبة أو مغشوشة واسترداد ثمنها.', chapter: 'حقوق المستهلك' },
      { provision_ref: 'art20', section: '20', title: 'المادة 20', content: 'يعاقب بالحبس مدة لا تزيد على سنة أو بغرامة لا تقل عن 500 دينار ولا تزيد على 10000 دينار كل من خالف أحكام هذا القانون.', chapter: 'العقوبات' },
    ],
    definitions: [],
  });

  // 8. Investment Law 2014
  writeSeed({
    id: 'investment-law-2014', type: 'statute',
    title: 'قانون الاستثمار رقم 30 لسنة 2014', title_en: 'Investment Law No. 30 of 2014',
    short_name: 'Investment Law 2014', status: 'in_force',
    issued_date: '2014-08-03', in_force_date: '2014-08-03',
    url: 'https://lob.gov.jo',
    description: 'Investment law providing framework and incentives for domestic and foreign investment',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون الاستثمار لسنة 2014) ويعمل به من تاريخ نشره في الجريدة الرسمية.', chapter: 'أحكام عامة' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'يهدف هذا القانون إلى تهيئة بيئة استثمارية جاذبة وتشجيع الاستثمار المحلي والأجنبي وتبسيط إجراءات تسجيل المشاريع.', chapter: 'أحكام عامة' },
      { provision_ref: 'art5', section: '5', title: 'المادة 5', content: 'يتمتع المستثمر غير الأردني بنفس المعاملة التي يتمتع بها المستثمر الأردني مع مراعاة مبدأ المعاملة بالمثل.', chapter: 'ضمانات الاستثمار' },
      { provision_ref: 'art8', section: '8', title: 'المادة 8', content: 'للمستثمر غير الأردني الحق في تحويل رأس ماله والأرباح المتحققة من استثماره إلى خارج المملكة بأي عملة قابلة للتحويل.', chapter: 'ضمانات الاستثمار' },
    ],
    definitions: [],
  });

  // 9. Labor Law 1996
  writeSeed({
    id: 'labor-law-1996', type: 'statute',
    title: 'قانون العمل رقم 8 لسنة 1996', title_en: 'Labor Law No. 8 of 1996',
    short_name: 'Labor Law 1996', status: 'amended',
    issued_date: '1996-04-16', in_force_date: '1996-04-16',
    url: 'https://lob.gov.jo',
    description: 'Primary labor legislation regulating employment relationships in Jordan',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون العمل لسنة 1996) ويعمل به من تاريخ نشره في الجريدة الرسمية.', chapter: 'أحكام عامة' },
      { provision_ref: 'art2', section: '2', title: 'المادة 2', content: 'العمل هو كل جهد فكري أو جسماني يبذله العامل لقاء أجر سواء كان بشكل دائم أو مؤقت. صاحب العمل هو كل شخص طبيعي أو اعتباري يستخدم بأي صفة كانت شخصا أو أكثر.', chapter: 'أحكام عامة' },
      { provision_ref: 'art15', section: '15', title: 'المادة 15', content: 'يجب أن يكون عقد العمل مكتوبا من نسختين يحتفظ كل طرف بنسخة منه ويجوز لأي منهما إثبات حقوقه بجميع طرق الإثبات القانونية.', chapter: 'عقد العمل' },
      { provision_ref: 'art52', section: '52', title: 'المادة 52', content: 'لا يجوز تشغيل العامل تشغيلا فعليا أكثر من ثماني ساعات في اليوم أو ثمان وأربعين ساعة في الأسبوع.', chapter: 'ساعات العمل والإجازات' },
      { provision_ref: 'art77', section: '77', title: 'المادة 77', content: 'يلتزم صاحب العمل بتوفير وسائل الحماية والسلامة المهنية ومنع مخاطر العمل الميكانيكية والفيزيائية والكيميائية والبيولوجية.', chapter: 'السلامة والصحة المهنية' },
    ],
    definitions: [
      { term: 'العمل', definition: 'كل جهد فكري أو جسماني يبذله العامل لقاء أجر سواء كان بشكل دائم أو مؤقت', source_provision: 'art2' },
      { term: 'صاحب العمل', definition: 'كل شخص طبيعي أو اعتباري يستخدم بأي صفة كانت شخصا أو أكثر', source_provision: 'art2' },
    ],
  });

  // 10. Competition Law 2004
  writeSeed({
    id: 'competition-law-2004', type: 'statute',
    title: 'قانون المنافسة رقم 33 لسنة 2004', title_en: 'Competition Law No. 33 of 2004',
    short_name: 'Competition Law 2004', status: 'in_force',
    issued_date: '2004-08-02', in_force_date: '2004-08-02',
    url: 'https://lob.gov.jo',
    description: 'Competition and antitrust law regulating market competition in Jordan',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'المادة 1', content: 'يسمى هذا القانون (قانون المنافسة لسنة 2004) ويعمل به بعد ستين يوما من تاريخ نشره في الجريدة الرسمية.', chapter: 'أحكام عامة' },
      { provision_ref: 'art3', section: '3', title: 'المادة 3', content: 'يهدف هذا القانون إلى حماية المنافسة ومنع الاحتكار والممارسات المقيدة للمنافسة وحماية مصالح المستهلكين.', chapter: 'أحكام عامة' },
      { provision_ref: 'art5', section: '5', title: 'المادة 5', content: 'يحظر أي اتفاق أو تحالف أو ممارسة مشتركة بين المنشآت المتنافسة يكون من شأنه الإخلال بالمنافسة.', chapter: 'الممارسات المحظورة' },
      { provision_ref: 'art8', section: '8', title: 'المادة 8', content: 'يحظر على المنشأة التي تتمتع بوضع مهيمن في السوق التعسف في استعمال ذلك الوضع.', chapter: 'الهيمنة والتعسف' },
    ],
    definitions: [],
  });

  updateCensus();
  console.log('\nSeed generation complete.');
}

function updateCensus(): void {
  if (!fs.existsSync(CENSUS_PATH)) return;
  const census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8'));
  const today = new Date().toISOString().split('T')[0];
  const seedFiles = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'));
  for (const file of seedFiles) {
    const seed = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf-8'));
    const law = census.laws.find((l: { id: string }) => l.id === seed.id);
    if (law) { law.ingested = true; law.provision_count = seed.provisions?.length ?? 0; law.ingestion_date = today; }
  }
  census.summary.total_laws = census.laws.length;
  census.summary.ingestable = census.laws.filter((l: { classification: string }) => l.classification === 'ingestable').length;
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));
  console.log('\n  Census updated with provision counts.');
}

main();
