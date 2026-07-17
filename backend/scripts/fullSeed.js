/**
 * Full Data Seeder — runs once after initial setup
 * node scripts/fullSeed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Class    = require('../models/Class');
const Subject  = require('../models/Subject');
const Chapter  = require('../models/Chapter');
const Note     = require('../models/Note');
const Video    = require('../models/Video');
const Test     = require('../models/Test');
const Admin    = require('../models/Admin');
const Announcement = require('../models/Announcement');

/* ─── Chapter templates ─────────────────────────────── */
const CHAPS = {
  Mathematics:       ['Number Systems','Polynomials','Linear Equations in Two Variables','Triangles','Coordinate Geometry','Introduction to Trigonometry','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability','Quadratic Equations','Arithmetic Progressions'],
  Science:           ['Chemical Reactions and Equations','Acids Bases and Salts','Metals and Non-metals','Carbon and its Compounds','Periodic Classification of Elements','Life Processes','Control and Coordination','How Do Organisms Reproduce','Heredity and Evolution','Light – Reflection and Refraction','Human Eye and the Colourful World','Electricity','Magnetic Effects of Electric Current','Sources of Energy','Our Environment'],
  Physics:           ['Physical World and Measurement','Kinematics','Laws of Motion','Work Energy and Power','Motion of System of Particles','Gravitation','Properties of Bulk Matter','Thermodynamics','Behaviour of Perfect Gas and Kinetic Theory','Oscillations and Waves'],
  Chemistry:         ['Some Basic Concepts of Chemistry','Structure of Atom','Classification of Elements','Chemical Bonding and Molecular Structure','States of Matter','Thermodynamics','Equilibrium','Redox Reactions','Hydrogen','The s-Block Elements','The p-Block Elements','Organic Chemistry – Basic Principles','Hydrocarbons','Environmental Chemistry'],
  Biology:           ['The Living World','Biological Classification','Plant Kingdom','Animal Kingdom','Morphology of Flowering Plants','Anatomy of Flowering Plants','Structural Organisation in Animals','Cell: The Unit of Life','Biomolecules','Cell Cycle and Cell Division','Transport in Plants','Mineral Nutrition','Photosynthesis','Respiration in Plants','Plant Growth and Development'],
  English:           ['A Letter to God','Nelson Mandela – Long Walk to Freedom','Two Stories about Flying','From the Diary of Anne Frank','Glimpses of India','Mijbil the Otter','Madam Rides the Bus','The Sermon at Benares','The Proposal','His First Flight','Black Aeroplane','How to Tell Wild Animals'],
  Hindi:             ['सूरदास के पद','तुलसीदास के दोहे','देव – सवैये','जयशंकर प्रसाद','सूर्यकांत त्रिपाठी निराला','नागार्जुन','गिरिजाकुमार माथुर','ऋतुराज','मंगलेश डबराल','स्वयं प्रकाश'],
  'Social Science':  ['The Rise of Nationalism in Europe','Nationalism in India','The Making of a Global World','The Age of Industrialisation','Print Culture and the Modern World','Resources and Development','Forest and Wildlife Resources','Water Resources','Agriculture','Minerals and Energy Resources','Manufacturing Industries','Lifelines of National Economy','Power Sharing','Federalism','Democracy and Diversity','Gender Religion and Caste','Political Parties','Outcomes of Democracy'],
  'Computer Science':['Getting Started with Python','Data Types Variables and Operators','Flow of Control','Functions','Strings','Lists','Tuples and Dictionaries','File Handling','Exception Handling','Object Oriented Programming','Database Concepts and SQL','Computer Networks','Web Technologies','Cybersecurity'],
  Computer:          ['Introduction to Computers','Components of a Computer','Input Output Devices','Storage Devices','Operating System','MS Word','MS Excel','MS PowerPoint','Internet and Email','Introduction to HTML','CSS Basics','Cybersafety and Ethics'],
  EVS:               ['Our Environment','Plants in Our Life','Animals Around Us','Water and Air','Our Body','Our Food','Shelter','Means of Transport','Family and Community','Festivals and Traditions'],
  'EVS/Science':     ['Living and Non-living Things','Plants and Animals','Food and Nutrition','Water Cycle','Our Body','Simple Machines','Light and Sound','Soil and Rocks','Air and Weather','Conservation of Nature'],
  Sanskrit:          ['अपठित गद्यांश','व्याकरण परिचय','संज्ञा और सर्वनाम','क्रिया और काल','अव्यय','समास','संधि','पत्र लेखन','निबंध लेखन','नाटक'],
  default:           ['Introduction','Basic Concepts','Fundamental Principles','Advanced Topics','Application of Concepts','Practice Problems','Solved Examples','Previous Year Questions'],
};

/* ─── YouTube video bank ────────────────────────────── */
const VID_BANK = [
  { title: 'Real Numbers – Full Chapter NCERT Class 10', youtubeId: 'mSNdnFVAMuE', dur: '48:22', subj: 'Mathematics' },
  { title: 'Polynomials Class 10 – Complete Explanation', youtubeId: 'R3mSGEhBtnA', dur: '38:15', subj: 'Mathematics' },
  { title: 'Chemical Reactions – Class 10 Science', youtubeId: 'Xdb0Xm25p_U', dur: '41:30', subj: 'Science' },
  { title: 'Light – Reflection and Refraction Class 10', youtubeId: '9RIxYyaU1hA', dur: '55:10', subj: 'Science' },
  { title: 'Electricity – Full Chapter Class 10 Science', youtubeId: 'mc979OhitAg', dur: '52:00', subj: 'Science' },
  { title: 'Trigonometry Introduction Class 10', youtubeId: 'vZRRHPpQbhg', dur: '44:20', subj: 'Mathematics' },
  { title: 'Heredity and Evolution – Class 10 Biology', youtubeId: 'K3yHqnHrmPQ', dur: '47:15', subj: 'Science' },
  { title: 'Nationalism in India – Class 10 History', youtubeId: 'tExjGy5D7ds', dur: '35:40', subj: 'Social Science' },
  { title: 'Carbon and its Compounds – NCERT Class 10', youtubeId: 'fFG7rR6sczA', dur: '49:55', subj: 'Science' },
  { title: 'Statistics and Probability – Class 10 Math', youtubeId: '1J2xWnf1r5c', dur: '40:30', subj: 'Mathematics' },
  { title: 'Laws of Motion – Class 11 Physics', youtubeId: 'CQYgn-MkBfI', dur: '58:00', subj: 'Physics' },
  { title: 'Organic Chemistry Basics – Class 11 Chem', youtubeId: 'bhnNOJMVvDA', dur: '55:20', subj: 'Chemistry' },
  { title: 'Cell – The Unit of Life – Class 11 Biology', youtubeId: 'rv2KVTsijzU', dur: '50:10', subj: 'Biology' },
  { title: 'Python Programming Basics – Class 11 CS', youtubeId: 'rfscVS0vtbw', dur: '45:00', subj: 'Computer Science' },
  { title: 'Electric Charges and Fields – Class 12 Physics', youtubeId: 'x1-SibwIPM4', dur: '62:30', subj: 'Physics' },
  { title: 'Solid State – Class 12 Chemistry', youtubeId: 'hVKCB-INXDM', dur: '53:40', subj: 'Chemistry' },
  { title: 'Reproduction in Organisms – Class 12 Bio', youtubeId: 'RlHBGSwGCKc', dur: '48:20', subj: 'Biology' },
  { title: 'Integration – Class 12 Maths Full Chapter', youtubeId: 'o75AqTInKDU', dur: '70:15', subj: 'Mathematics' },
  { title: 'Computer Networks – Class 12 CS', youtubeId: 'qiQR5rTSshw', dur: '44:00', subj: 'Computer Science' },
  { title: 'Power Sharing – Class 10 Political Science', youtubeId: 'uHEhFBJFPvg', dur: '32:15', subj: 'Social Science' },
];

/* ─── MCQ bank ──────────────────────────────────────── */
const MCQ_BANK = {
  Mathematics: [
    { q: 'HCF of 96 and 404 is:', opts:['4','8','12','24'], a:0, e:'Using Euclid\'s division: HCF(404, 96) = 4' },
    { q: 'The decimal expansion of 17/8 is:', opts:['Terminating','Non-terminating repeating','Non-terminating non-repeating','None'], a:0, e:'8 = 2³, denominator has only factor 2, so it terminates.' },
    { q: 'If p(x) = x³ - 3x + 5, then p(1) =', opts:['3','5','1','7'], a:0, e:'p(1) = 1 - 3 + 5 = 3' },
    { q: 'The pair x + y = 5 and 2x + 2y = 10 has:', opts:['Unique solution','No solution','Infinite solutions','Two solutions'], a:2, e:'Both equations represent the same line → infinitely many solutions.' },
    { q: 'Discriminant of x² - 4x + 4 = 0 is:', opts:['0','4','8','16'], a:0, e:'D = b² - 4ac = 16 - 16 = 0' },
    { q: 'Sum of first 10 natural numbers is:', opts:['45','55','50','65'], a:1, e:'S = n(n+1)/2 = 10×11/2 = 55' },
    { q: 'Value of sin²A + cos²A is:', opts:['0','2','1','–1'], a:2, e:'Pythagorean identity: sin²A + cos²A = 1' },
    { q: 'Area of a circle with radius r is:', opts:['2πr','πr²','πr','2πr²'], a:1, e:'Area = πr²' },
  ],
  Science: [
    { q: 'The chemical formula of baking soda is:', opts:['NaCl','NaHCO₃','Na₂CO₃','NaOH'], a:1, e:'Baking soda is Sodium Hydrogen Carbonate = NaHCO₃' },
    { q: 'Which gas is evolved when zinc reacts with dilute H₂SO₄?', opts:['O₂','CO₂','H₂','SO₂'], a:2, e:'Zn + H₂SO₄ → ZnSO₄ + H₂↑' },
    { q: 'The process of photosynthesis occurs in:', opts:['Mitochondria','Chloroplast','Nucleus','Cell wall'], a:1, e:'Chloroplasts contain chlorophyll needed for photosynthesis.' },
    { q: 'Ohm\'s law states that V = :', opts:['I/R','IR','I+R','I-R'], a:1, e:'Ohm\'s Law: V = IR (Voltage = Current × Resistance)' },
    { q: 'SI unit of electric resistance is:', opts:['Volt','Ampere','Ohm','Watt'], a:2, e:'Resistance is measured in Ohms (Ω).' },
    { q: 'DNA replication is:', opts:['Conservative','Semi-conservative','Dispersive','None'], a:1, e:'DNA replication is semi-conservative – each new DNA has one old and one new strand.' },
    { q: 'The image formed by a plane mirror is:', opts:['Real and inverted','Virtual and erect','Real and erect','Virtual and inverted'], a:1, e:'Plane mirror forms a virtual, erect image behind the mirror.' },
    { q: 'pH of pure water at 25°C is:', opts:['0','7','14','5'], a:1, e:'Pure water has equal H⁺ and OH⁻ concentrations, so pH = 7 (neutral).' },
  ],
  default: [
    { q: 'Who is known as the Father of the Nation in India?', opts:['Nehru','Bose','Gandhi','Patel'], a:2, e:'Mahatma Gandhi is known as the Father of the Nation.' },
    { q: 'The speed of light is approximately:', opts:['3×10⁸ m/s','3×10⁶ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], a:0, e:'Speed of light c ≈ 3×10⁸ m/s in vacuum.' },
    { q: 'Which planet is known as the Red Planet?', opts:['Venus','Jupiter','Saturn','Mars'], a:3, e:'Mars appears red due to iron oxide on its surface.' },
    { q: 'Largest ocean in the world is:', opts:['Atlantic','Indian','Arctic','Pacific'], a:3, e:'The Pacific Ocean is the largest and deepest ocean.' },
    { q: 'National animal of India is:', opts:['Lion','Elephant','Tiger','Peacock'], a:2, e:'The Bengal Tiger is the national animal of India.' },
    { q: 'Water boils at ___°C at standard pressure:', opts:['90','95','100','105'], a:2, e:'Water boils at 100°C (212°F) at standard atmospheric pressure.' },
  ],
};

/* ─── helper ──────────────────────────────────────── */
const makeQuestions = (subjectName) => {
  const bank = MCQ_BANK[subjectName] || MCQ_BANK.default;
  return bank.map(q => ({
    questionText: q.q,
    options: q.opts.map((o, i) => ({ text: o, isCorrect: i === q.a })),
    explanation: q.e,
    marks: 1,
  }));
};

/* ─── main ──────────────────────────────────────────── */
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  const admin = await Admin.findOne();
  if (!admin) { console.error('❌ No admin found'); process.exit(1); }

  /* ── 1. Chapters ─────────────────────────────── */
  const subjects = await Subject.find().populate('classId', 'grade name');
  let chapCount  = 0;
  for (const sub of subjects) {
    const list = CHAPS[sub.name] || CHAPS.default;
    for (let i = 0; i < list.length; i++) {
      const exists = await Chapter.findOne({ name: list[i], subjectId: sub._id });
      if (!exists) {
        await Chapter.create({
          name: list[i], subjectId: sub._id,
          classId: sub.classId._id,
          chapterNumber: i + 1, order: i + 1,
        });
        chapCount++;
      }
    }
  }
  console.log(`✅ Created ${chapCount} chapters`);

  /* ── 2. Rich-text notes ──────────────────────── */
  const chapters  = await Chapter.find().populate('subjectId classId');
  let noteCount   = 0;
  const existNotes = await Note.countDocuments();
  if (existNotes < 20) {
    for (const ch of chapters.slice(0, 30)) {
      const alreadyExists = await Note.findOne({ title: { $regex: ch.name, $options: 'i' }, subjectId: ch.subjectId._id });
      if (alreadyExists) continue;
      await Note.create({
        title: `${ch.name} – Complete Study Notes`,
        content: `# ${ch.name}\n\n**Subject:** ${ch.subjectId.name}  |  **Class:** ${ch.classId.name}\n\n---\n\n## 📚 Overview\nThis chapter covers all the key concepts of **${ch.name}** as per the latest NCERT curriculum.\n\n## 🔑 Key Concepts\n1. **Introduction** — Understanding the basics of ${ch.name}\n2. **Core Theory** — Detailed explanation with diagrams\n3. **Important Formulas** — All formulas at a glance\n4. **Solved Examples** — Step-by-step solutions\n5. **Common Mistakes** — Points to remember during exams\n\n## 📝 Important Questions\n- Define ${ch.name} and explain its significance.\n- Explain the main concepts with real-world examples.\n- Solve NCERT exercise problems step by step.\n- State and prove the important theorems related to this chapter.\n\n## ✅ Summary\nStudy this chapter thoroughly. Focus on understanding the concepts rather than memorising. Practice problems daily for best results.\n\n> **Pro Tip:** Revise this chapter at least 3 times before the exam and solve previous year questions!`,
        chapterId:    ch._id,
        subjectId:    ch.subjectId._id,
        classId:      ch.classId._id,
        type:         'rich-text',
        tags:         [ch.name.split(' ')[0].toLowerCase(), ch.subjectId.name.toLowerCase(), 'ncert', 'revision'],
        isDownloadable: true,
        isFeatured:   noteCount < 5,
        uploadedBy:   admin._id,
      });
      noteCount++;
    }
    console.log(`✅ Created ${noteCount} notes`);
  }

  /* ── 3. YouTube videos ───────────────────────── */
  let vidCount   = 0;
  const existVids = await Video.countDocuments();
  if (existVids < 10) {
    for (const v of VID_BANK) {
      // find a matching subject
      const sub = subjects.find(s => s.name === v.subj);
      if (!sub) continue;
      const ch  = await Chapter.findOne({ subjectId: sub._id });
      if (!ch) continue;
      const exists = await Video.findOne({ youtubeId: v.youtubeId });
      if (exists) continue;
      await Video.create({
        title:        v.title,
        description:  `Detailed lecture on ${v.title} — NCERT based with full explanation and solved examples.`,
        chapterId:    ch._id,
        subjectId:    sub._id,
        classId:      sub.classId._id,
        type:         'youtube',
        youtubeUrl:   `https://www.youtube.com/watch?v=${v.youtubeId}`,
        youtubeId:    v.youtubeId,
        thumbnailUrl: `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`,
        duration:     v.dur,
        isActive:     true,
        isFeatured:   vidCount < 6,
        uploadedBy:   admin._id,
      });
      vidCount++;
    }
    console.log(`✅ Created ${vidCount} videos`);
  }

  /* ── 4. MCQ Tests ────────────────────────────── */
  let testCount   = 0;
  const existTests = await Test.countDocuments();
  if (existTests < 10) {
    const testSubs = subjects.filter(s => ['Mathematics','Science','Physics','Chemistry','Biology','Social Science'].includes(s.name));
    for (const sub of testSubs.slice(0, 8)) {
      const ch = await Chapter.findOne({ subjectId: sub._id }).sort('order');
      if (!ch) continue;
      const exists = await Test.findOne({ title: { $regex: ch.name, $options: 'i' }, subjectId: sub._id });
      if (exists) continue;
      await Test.create({
        title:       `${ch.name} – MCQ Practice Test`,
        description: `Test your knowledge of "${ch.name}" from ${sub.name} (${sub.classId.name})`,
        chapterId:   ch._id,
        subjectId:   sub._id,
        classId:     sub.classId._id,
        questions:   makeQuestions(sub.name),
        timeLimit:   15,
        isPublished: true,
        createdBy:   admin._id,
      });
      testCount++;
    }
    console.log(`✅ Created ${testCount} tests`);
  }

  /* ── 5. Announcements ────────────────────────── */
  const existAnn = await Announcement.countDocuments();
  if (existAnn < 2) {
    await Announcement.insertMany([
      {
        title: '🎉 Welcome to StudyPlatform!',
        content: 'We are excited to have you here. Explore chapters, watch videos, take MCQ tests and track your progress. Happy learning!',
        type: 'general', isGlobal: true, createdBy: admin._id,
      },
      {
        title: '📝 New Tests Available for Class 10',
        content: 'Chapter-wise MCQ tests for Class 10 Mathematics and Science are now live. Start practicing now to boost your exam preparation!',
        type: 'test', isGlobal: true, createdBy: admin._id,
      },
      {
        title: '📚 Study Notes Updated',
        content: 'Notes for all chapters of Class 9 and Class 10 have been uploaded. Download them for offline study.',
        type: 'general', isGlobal: true, createdBy: admin._id,
      },
    ]);
    console.log('✅ Created 3 announcements');
  }

  await mongoose.disconnect();

  console.log('\n🎉 Full seed complete!');
  console.log('════════════════════════════════════════');
  console.log('  Admin    : hn878283@gmil.com / admin123');
  console.log('  Frontend : http://localhost:3000');
  console.log('  Backend  : http://localhost:5000/api');
  console.log('════════════════════════════════════════');
}

main().catch(e => { console.error(e); process.exit(1); });
