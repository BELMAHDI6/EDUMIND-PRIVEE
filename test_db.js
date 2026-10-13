const DB = require('./database');

async function test() {
  console.log('Testing manual add & batch import...');
  const activeYear = '2026-2027';

  // Check counts
  const teachersCount = DB.queryOne('SELECT COUNT(*) as c FROM teachers').c;
  const groupsCount = DB.queryOne('SELECT COUNT(*) as c FROM groups').c;
  const subjectsCount = DB.queryOne('SELECT COUNT(*) as c FROM subjects').c;
  const levelsCount = DB.queryOne('SELECT COUNT(*) as c FROM levels').c;
  console.log({ teachersCount, groupsCount, subjectsCount, levelsCount });

  // 1. Test group creation with default teacher
  try {
    const defaultSub = DB.queryOne("SELECT id FROM subjects LIMIT 1")?.id || 1;
    const defaultTeach = DB.queryOne("SELECT id FROM teachers LIMIT 1")?.id || 1;
    const defaultRm = DB.queryOne("SELECT id FROM rooms LIMIT 1")?.id || 1;
    console.log({ defaultSub, defaultTeach, defaultRm });

    DB.run("INSERT INTO groups (name, level_id, subject_id, teacher_id, room_id, school_year, max_students, active) VALUES (?, ?, ?, ?, ?, ?, 35, 1)",
      ['Test Group', 1, defaultSub, defaultTeach, defaultRm, activeYear]);
    console.log('Group created successfully!');
  } catch (err) {
    console.error('Group creation failed:', err.message);
  }
}

test();
