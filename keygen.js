#!/usr/bin/env node
/**
 * EDUMIND Privée — مولد مفاتيح التفعيل وسجل المشتركين المخصص للمؤسسات التعليمية الخاصة
 * Dedicated License Key Generator & Subscribers Registry for EDUMIND Privée
 * Veloce Craft Security System
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const LicenseManager = require('./license_manager');

let xlsx = null;
try {
  xlsx = require('xlsx');
} catch (e) {
  // Optional if xlsx is not installed
}

const REGISTRY_FILE = path.join(__dirname, 'subscribers_registry.json');
const EXCEL_FILE = path.join(__dirname, 'subscribers.xlsx');

/**
 * Load subscribers registry from JSON file
 */
function loadSubscribers() {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error('⚠️ تحذير: تعذر قراءة سجل المشتركين:', err.message);
  }
  return [];
}

/**
 * Save subscribers registry to JSON file
 */
function saveSubscribers(list) {
  try {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('❌ خطأ في حفظ سجل المشتركين:', err.message);
    return false;
  }
}

/**
 * Sync subscribers to Excel (.xlsx) file
 */
function syncToExcel(list) {
  if (!xlsx) return false;
  try {
    const rows = list.map((sub, index) => {
      const isLifetime = sub.type === 'lifetime';
      let expiryStr = 'دائم (À vie)';
      let statusStr = 'نشط (Actif)';

      if (!isLifetime && sub.expiresAt) {
        const expDate = new Date(sub.expiresAt);
        expiryStr = expDate.toISOString().split('T')[0];
        if (expDate.getTime() < Date.now()) {
          statusStr = 'منتهي الصلاحية (Expiré)';
        }
      }

      return {
        '#': index + 1,
        'اسم المؤسسة / العميل': sub.clientName || 'Établissement',
        'معرف الجهاز (HWID)': sub.hwid || '',
        'نوع الترخيص': isLifetime ? 'دائم (À vie)' : sub.type === 'annual' ? 'سنوي (Annuel)' : `${sub.days} يوم`,
        'ملاحظات / هاتف': sub.note || '-',
        'تاريخ الإنشاء': sub.createdAt ? sub.createdAt.split('T')[0] : '-',
        'تاريخ الانتهاء': expiryStr,
        'الحالة': statusStr,
        'مفتاح التفعيل (License Key)': sub.licenseKey || ''
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'المشتركون (Abonnés)');
    xlsx.writeFile(workbook, EXCEL_FILE);
    return true;
  } catch (err) {
    console.error('⚠️ تحذير: تعذر تصدير ملف الإكسل:', err.message);
    return false;
  }
}

/**
 * Display interactive / formatted dashboard of all subscribers
 */
function displaySubscribers() {
  const list = loadSubscribers();

  console.log('\n========================================================================================');
  console.log('   📊 سجل المشتركين والتراخيص — EDUMIND Privée (Abonnés & Licences Actives)            ');
  console.log('========================================================================================\n');

  if (list.length === 0) {
    console.log('  📭 لا يوجد أي مشترك مسجل حتى الآن في السجل المحلي.');
    console.log('  💡 لتوليد ترخيص لمشترك جديد: نفّذ الأمر `npm run keygen`\n');
    console.log('========================================================================================\n');
    return;
  }

  let lifetimeCount = 0;
  let annualCount = 0;
  let customDaysCount = 0;
  let activeCount = 0;
  let expiredCount = 0;

  const now = Date.now();

  list.forEach(sub => {
    if (sub.type === 'lifetime') lifetimeCount++;
    else if (sub.type === 'annual') annualCount++;
    else customDaysCount++;

    if (sub.type === 'lifetime') {
      activeCount++;
    } else if (sub.expiresAt) {
      if (new Date(sub.expiresAt).getTime() >= now) activeCount++;
      else expiredCount++;
    } else {
      activeCount++;
    }
  });

  console.log(`  👥 إجمالي المشتركين المسجلين : \x1b[32m${list.length}\x1b[0m مؤسسة / عميل`);
  console.log(`  🟢 التراخيص النشطة             : \x1b[32m${activeCount}\x1b[0m`);
  if (expiredCount > 0) {
    console.log(`  🔴 التراخيص المنتهية           : \x1b[31m${expiredCount}\x1b[0m`);
  }
  console.log(`  ✨ تراخيص دائمة (À vie)        : ${lifetimeCount}`);
  console.log(`  📅 تراخيص سنوية (Annuelle)     : ${annualCount}`);
  if (customDaysCount > 0) {
    console.log(`  ⏳ تراخيص محددة بأيام (Jours)   : ${customDaysCount}`);
  }

  console.log('\n----------------------------------------------------------------------------------------');
  console.log(
    '#' .padEnd(4) +
    'اسم المؤسسة / العميل' .padEnd(28) +
    'نوع الترخيص' .padEnd(16) +
    'تاريخ الإنشاء' .padEnd(14) +
    'الحالة' .padEnd(12) +
    'معرف الجهاز (HWID)'
  );
  console.log('----------------------------------------------------------------------------------------');

  list.forEach((sub, i) => {
    let statusText = '\x1b[32m🟢 نشط\x1b[0m';
    if (sub.type !== 'lifetime' && sub.expiresAt) {
      if (new Date(sub.expiresAt).getTime() < now) {
        statusText = '\x1b[31m🔴 منتهي\x1b[0m';
      }
    }

    const typeLabel = sub.type === 'lifetime'
      ? 'دائم (À vie)'
      : sub.type === 'annual'
        ? 'سنوي (1 سنة)'
        : `${sub.days} يوم`;

    const createDate = sub.createdAt ? sub.createdAt.split('T')[0] : '-';
    const clientDisplay = (sub.clientName || 'Sans Nom').length > 24
      ? (sub.clientName.substring(0, 21) + '...')
      : sub.clientName;

    console.log(
      String(i + 1).padEnd(4) +
      clientDisplay.padEnd(28) +
      typeLabel.padEnd(16) +
      createDate.padEnd(14) +
      statusText.padEnd(20) +
      (sub.hwid || '-')
    );
  });

  console.log('----------------------------------------------------------------------------------------');
  console.log(`📁 ملف السجل: subscribers_registry.json`);
  if (fs.existsSync(EXCEL_FILE)) {
    console.log(`📊 تم تصدير وتحديث ملف الإكسل: subscribers.xlsx`);
  }
  console.log('========================================================================================\n');
}

async function main() {
  const args = process.argv.slice(2);

  // Command-line flag checks
  if (args.includes('--list') || args.includes('-l') || args.includes('--subscribers') || args.includes('-s')) {
    displaySubscribers();
    return;
  }

  if (args.includes('--count') || args.includes('-c')) {
    const list = loadSubscribers();
    console.log(`\n👥 إجمالي المشتركين المسجلين: ${list.length} مؤسسة.\n`);
    return;
  }

  if (args.includes('--export')) {
    const list = loadSubscribers();
    syncToExcel(list);
    console.log(`\n✅ تم تصدير بيانات ${list.length} مشترك بنجاح إلى ملف الإكسل:\n   ${EXCEL_FILE}\n`);
    return;
  }

  console.log('\n===============================================================');
  console.log('   🏫 EDUMIND Privée — مولد تراخيص المؤسسات التعليمية الخاصة   ');
  console.log('         (Private Schools License Key Generator)               ');
  console.log('               Développé par Veloce Craft                      ');
  console.log('===============================================================\n');

  let hwid = args[0];
  let clientName = args[1];
  let type = args[2] || 'lifetime';
  let days = parseInt(args[3], 10) || 0;
  let note = '';

  if (!hwid) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (q) => new Promise(res => rl.question(q, res));

    hwid = await question('1. أدخل معرّف الجهاز (HWID) الخاص بالمدرسة الخاصة (يبدأ بـ PRIV-): ');
    hwid = hwid.trim();

    if (!hwid) {
      console.error('❌ خطأ: معرّف الجهاز (HWID) إلزامي لتوليد الترخيص.');
      rl.close();
      process.exit(1);
    }

    clientName = await question('2. اسم المدرسة الخاصة أو العميل [مثال: École Privée Les Élites]: ');
    clientName = clientName.trim() || 'Établissement Privé';

    note = await question('3. ملاحظات إضافية أو رقم الهاتف (اختياري): ');
    note = note.trim();

    console.log('\n4. نوع الترخيص :');
    console.log('   [1] ترخيص دائم مدى الحياة (Permanent / À vie) [افتراضي]');
    console.log('   [2] ترخيص سنوي (365 يوم - Annuel)');
    console.log('   [3] ترخيص مخصص لعدد أيام محددة (Custom Days)');
    const choice = await question('   اختر [1 أو 2 أو 3]: ');

    if (choice.trim() === '2') {
      type = 'annual';
      days = 365;
    } else if (choice.trim() === '3') {
      type = 'days';
      const daysInput = await question('   أدخل عدد الأيام المصرح بها: ');
      days = parseInt(daysInput.trim(), 10) || 30;
    } else {
      type = 'lifetime';
      days = 0;
    }

    rl.close();
  }

  try {
    const cleanHwid = hwid.trim().toUpperCase();
    const licenseKey = LicenseManager.generateLicenseKey({
      hwid: cleanHwid,
      clientName: clientName || 'Établissement Scolaire',
      type: type,
      days: days
    });

    // Calculate expiry date if applicable
    let expiresAt = null;
    if (type === 'annual') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (type === 'days' && days > 0) {
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    // Update / Save in subscribers registry
    const subscribers = loadSubscribers();
    const existingIndex = subscribers.findIndex(s => s.hwid === cleanHwid);

    const subscriberRecord = {
      id: existingIndex >= 0 ? subscribers[existingIndex].id : subscribers.length + 1,
      clientName: clientName || 'Établissement Scolaire',
      hwid: cleanHwid,
      type: type,
      days: days,
      note: note || (existingIndex >= 0 ? subscribers[existingIndex].note : ''),
      createdAt: existingIndex >= 0 ? subscribers[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: expiresAt,
      licenseKey: licenseKey
    };

    if (existingIndex >= 0) {
      subscribers[existingIndex] = subscriberRecord;
    } else {
      subscribers.push(subscriberRecord);
    }

    saveSubscribers(subscribers);
    syncToExcel(subscribers);

    console.log('\n---------------------------------------------------------------');
    console.log('🎉 تم إنشاء كود الترخيص بنجاح (Clé Scolaire Générée) :');
    console.log('---------------------------------------------------------------');
    console.log(`📌 المؤسسة التعليمية : ${clientName}`);
    console.log(`💻 معرّف الجهاز (HWID) : ${cleanHwid}`);
    console.log(`🔑 نوع الترخيص       : ${type === 'lifetime' ? 'دائم مدى الحياة (À vie)' : type === 'annual' ? 'سنوي (1 سنة)' : `${days} يوم`}`);
    console.log('---------------------------------------------------------------');
    console.log('\nمفتاح التفعيل (License Key) :');
    console.log('\x1b[32m%s\x1b[0m', licenseKey);
    console.log('\n---------------------------------------------------------------');
    console.log(`💾 تم حفظ المشترك في السجل المحلي: subscribers_registry.json`);
    console.log(`📊 تم تحديث جدول الإكسل: subscribers.xlsx`);
    console.log(`👥 إجمالي المشتركين المسجلين الآن: \x1b[32m${subscribers.length}\x1b[0m مؤسسة.`);
    console.log('---------------------------------------------------------------');
    console.log('💡 قم بنسخ المفتاح أعلاه وإرساله للمدير/المؤسسة لتفعيله داخل البرنامج.');
    console.log('💡 لعرض قائمة وإحصائيات جميع المشتركين: نفّذ `npm run subscribers`');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ فشل توليد الترخيص:', err.message);
    process.exit(1);
  }
}

main();
