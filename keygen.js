#!/usr/bin/env node
/**
 * EDUMIND Privée — مولد مفاتيح التفعيل المخصص للمؤسسات التعليمية الخاصة
 * Dedicated License Key Generator for EDUMIND Privée (Écoles Privées)
 * Veloce Craft Security System
 */

const readline = require('readline');
const LicenseManager = require('./license_manager');

console.log('\n===============================================================');
console.log('   🏫 EDUMIND Privée — مولد تراخيص المؤسسات التعليمية الخاصة   ');
console.log('         (Private Schools License Key Generator)               ');
console.log('               Développé par Veloce Craft                      ');
console.log('===============================================================\n');

async function main() {
  const args = process.argv.slice(2);

  let hwid = args[0];
  let clientName = args[1];
  let type = args[2] || 'lifetime';
  let days = parseInt(args[3], 10) || 0;

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

    clientName = await question('2. اسم المدرسة الخاصة أو العميل [مثال: École Privée Les Élite]: ');
    clientName = clientName.trim() || 'Établissement Privé';

    console.log('\n3. نوع الترخيص :');
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
    console.log('💡 قم بنسخ المفتاح أعلاه وإرساله للمدير/المؤسسة لتفعيله داخل البرنامج.');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ فشل توليد الترخيص:', err.message);
    process.exit(1);
  }
}

main();
