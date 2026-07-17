/**
 * Complete Database Seeder
 * Run: node scripts/seedData.js
 * Seeds: Chapters for all classes, Sample Notes, Sample Videos, Sample MCQ Tests
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

// ── Chapter data per subject name ─────────────────────────────────────────────
const CHAPTERS = {
  'Mathematics': [
    'Number Systems', 'Polynomials', 'Linear Equations', 'Quadratic Equations',
    'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry',
    'Introduction to Trigonometry', 'Circles', 'Areas Related to Circles',
    'Surface Areas and Volumes', 'Statistics', 'Probability'
  ],
  'Science': [
    'Chemical Reactions and Equations', 'Acids Bases and Salts',
    'Metals and Non-metals', 'Carbon and its Compounds',
    'Life Processes', 'Control and Coordination',
    'How Do Organisms Reproduce', 'Heredity and Evolution',
    'Light – Reflection and Refraction', 'Human Eye and Colourful World',
    'Electricity', 'Magnetic Effects of Electric Current',
    'Our Environment', 'Management of Natural Resources'
  ],
  'Physics': [
    'Physical World', 'Units and Measurements', 'Motion in a Straight Line',
    'Motion in a Plane', 'Laws of Motion', 'Work Energy and Power',
    'System of Particles and Rotational Motion', 'Gravitation',
    'Mechanical Properties of Solids', 'Mechanical Properties of Fluids',
    'Thermal Properties of Matter', 'Thermodynamics',
    'Kinetic Theory', 'Oscillations', 'Waves'
  ],
  'Chemistry': [
    'Some Basic Concepts of Chemistry', 'Structure of Atom',
    'Classification of Elements and Periodicity', 'Chemical Bonding',
    'States of Matter', 'Thermodynamics', 'Equilibrium',
    'Redox Reactions', 'Hydrogen', 'The s-Block Elements',
    'The p-Block Elements', 'Organic Chemistry', 'Hydrocarbons', 'Environmental Chemistry'
  ],
  'Biology': [
    'The Living World', 'Biological Classification', 'Plant Kingdom',
    'Animal Kingdom', 'Morphology of Flowering Plants', 'Anatomy of Flowering Plants',
    'Structural Organisation in Animals', 'Cell: The Unit of Life',
    'Biomolecules', 'Cell Cycle and Cell Division', 'Transport in Plants',
    'Mineral Nutrition', 'Photosynthesis in Higher Plants',
    'Respiration in Plants', 'Plant Growth and Development'
  ],
  'English': [
    'A Letter to God', 'Long Walk to Freedom', 'Two Stories about Flying',
    'From the Diary of Anne Frank', 'Glimpses of India', 'Mijbil the Otter',
    'Madam Rides the Bus', 'The Sermon at Benares', 'The Proposal',
    'A Triumph of Surgery', 'The Thief Story', 'The Midnight Visitor'
  ],
  'Hindi': [
    'सूरदास', 'तुलसीदास', 'देव', 'जयशंकर प्रसाद',
    'सूर्यकान्त त्रिपाठी निराला', 'नागार्जुन', 'गिरिजाकुमार माथुर',
    'ऋतुराज', 'मंगलेश डबराल', 'गोपीनाथ महंती'
  ],
  'Social Science': [
    'The Rise of Nationalism in Europe', 'Nationalism in India',
    'The Making of a Global World', 'Age of Industrialisation',
    'Print Culture and the Modern World', 'Resources and Development',
    'Forest and Wildlife Resources', 'Water Resources',
    'Agriculture', 'Minerals and Energy Resources',
    'Power Sharing', 'Federalism', 'Democracy and Diversity',
    'Gender Religion and Caste', 'Political Parties', 'Outcomes of Democracy'
  ],
  'Computer Science': [
    'Introduction to Python', 'Data Types and Variables', 'Control Structures',
    'Functions', 'Lists Tuples and Dictionaries', 'File Handling',
    'Exception Handling', 'Object Oriented Programming',
    'SQL and Databases', 'Web Technologies', 'Computer Networks', 'Cybersecurity'
  ],
  'Computer': [
    'Introduction to Computers', 'Hardware and Software',
    'Operating Systems', 'MS Office – Word', 'MS Office – Excel',
    'MS Office – PowerPoint', 'Internet and Email', 'HTML Basics',
    'Introduction to Programming', 'Cybersafety'
  ],
  'EVS': [
    'Our Environment', 'Plants and Animals', 'Food and Nutrition',
    'Water and Air', 'Our Body', 'Family and Community',
    'Transport and Communication', 'Our Earth', 'Conservation of Nature'
  ],
  'Sanskrit': [
    'अपठित गद्यांश', 'व्याकरण', 'रचनात्मक लेखन',
    'पद्य सौंदर्य', 'गद्य साहित्य', 'नाटक', 'निबंध लेखन'
  ],
  'EVS/Science': [
    'Our Environment', 'Plants and Animals', 'Food and Nutrition',
    'Water Cycle', 'Our Body', 'Simple Machines', 'Light and Sound', 'Soil and Rocks'
  ],
};

// Default 8 chapters for any subject not in map
const DEFAULT_CHAPTERS = [
  'Introduction', 'Basic Concepts', 'Core Principles',
  'Advanced Topics', 'Problem Solving', 'Applications',
  'Revision – Part 1', 'Revision – Part 2'
];

// ── Sample YouTube videos ──────────────────────────────────────────────────────
const SAMPLE_VIDEOS = [
  { title: 'Real Numbers – Complete Chapter', youtubeId: 'LrKFWUB-WnA', duration: '45:22' },
  { title: 'Polynomials – All Concepts', youtubeId: 'R3mSGEhBtnA', duration: '38:15' },
  { title: 'Trigonometry Introduction', youtubeId: 'vZRRHPpQbhg', duration: '52:10' },
  { title: 'Chemical Reactions Explained', youtubeId: 'Xdb0Xm25p_U', duration: '41:30' },
  { title: 'Electricity – Full Chapter', youtubeId: 'mc979OhitAg', duration: '55:00' },
  { title: 'Light – Reflection and Refraction', youtubeId: '9RIxYyaU1hA', duration: '49:20' },
  { title: 'Heredity and Evolution', youtubeId: 'K3yHqnHrmPQ', duration: '44:15' },
  { title: 'Nationalism in India', youtubeId: 'tExjGy5D7ds', duration: '35:40' },
  { title: 'Carbon and its Compounds', youtubeId: 'fFG7rR6sczA', duration: '47:55' },
  { title: 'Probability – Complete Chapter', youtubeId: '1J2xWnf1r5c', duration: '40:30' },
];

// ── Sample MCQ questions per subject ──────────────────────────────────────────
const SAMPLE_MCQ = {
  'Mathematics': [
    { q: 'The decimal expansion of 1/3 is:', opts: ['0.33...', '0.30', '0.3', '1.3'], ans: 0, exp: '1/3 = 0.333... (non-terminating repeating)' },
    { q: 'A polynomial of degree 2 is called:', opts: ['Linear', 'Quadratic', 'Cubic', 'Biquadratic'], ans: 1, exp: 'Degree 2 polynomial is quadratic.' },
    { q: 'Sum of zeroes of x² - 5x + 6 is:', opts: ['6', '-6', '5', '-5'], ans: 2, exp: 'Sum of zeroes = -b/a = 5.' },
    { q: 'The value of sin 30° is:', opts: ['1/2', '√3/2', '1', '0'], ans: 0, exp: 'sin 30° = 1/2' },
    { q: 'Probability of a sure event is:', opts: ['0', '0.5', '1', '-1'], ans: 2, exp: 'Probability of a sure event is always 1.' },
  ],
  'Science': [
    { q: 'Chemical formula of water is:', opts: ['H2O', 'HO2', 'H2O2', 'H3O'], ans: 0, exp: 'Water is composed of 2 hydrogen and 1 oxygen atom.' },
    { q: 'Which acid is present in vinegar?', opts: ['Citric acid', 'Acetic acid', 'Tartaric acid', 'Oxalic acid'], ans: 1, exp: 'Acetic acid (CH3COOH) is present in vinegar.' },
    { q: 'The unit of electric current is:', opts: ['Volt', 'Watt', 'Ampere', 'Ohm'], ans: 2, exp: 'Electric current is measured in Amperes (A).' },
    { q: 'Photosynthesis takes place in:', opts: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], ans: 2, exp: 'Chloroplasts contain chlorophyll needed for photosynthesis.' },
    { q: 'DNA stands for:', opts: ['Deoxyribose Nucleic Acid', 'Di-Nucleic Acid', 'Deoxy Nitrogen Acid', 'None'], ans: 0, exp: 'DNA = Deoxyribonucleic Acid' },
  ],
  'default': [
    { q: 'Which is the largest planet in our solar system?', opts: ['Earth', 'Saturn', 'Jupiter', 'Mars'], ans: 2, exp: 'Jupiter is the largest planet in our solar system.' },
    { q: 'The speed of light in vacuum is approximately:', opts: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'], ans: 0, exp: 'Speed of light c = 3×10⁸ m/s' },
    { q: 'What is the capital of India?', opts: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], ans: 2, exp: 'New Delhi is the capital of India.' },
    { q: 'Which gas is most abundant in Earth\'s atmosphere?', opts: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], ans: 2, exp: 'Nitrogen makes up about 78% of Earth\'s atmosphere.' },
    { q: 'Who wrote the national anthem of India?', opts: ['Bankim Chandra', 'Rabindranath Tagore', 'Sarojini Naidu', 'Subhash Chandra Bose'], ans: 1, exp: 'Jana Gana Mana was written by Rabindranath Tagore.' },
  ]
};

// ── Main seeder ───────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const admin = await Admin.findOne();

  const classes  = await Class.find().sort('grade');
  const subjects = await Subject.find().populate('classId', 'grade name');

  // ── 1. Seed Chapters ────────────────────────────────────────────────────────
  const existingChapters = await Chapter.countDocuments();
  if (existingChapters < 10) {
    let chapCreated = 0;
    for (const sub of subjects) {
      const chapterNames = CHAPTERS[sub.name] || DEFAULT_CHAPTERS;
      for (let i = 0; i < chapterNames.length; i++) {
        const exists = await Chapter.findOne({ name: chapterNames[i], subjectId: sub._id });
        if (!exists) {
          await Chapter.create({
            name: chapterNames[i],
            subjectId: sub._id,
            classId: sub.classId._id,
            chapterNumber: i + 1,
            order: i + 1
          });
          chapCreated++;
        }
      }
    }
    console.log(`✅ Created ${chapCreated} chapters`);
  } else {
    console.log(`ℹ️  Chapters already seeded (${existingChapters})`);
  }

  // ── 2. Seed Sample Notes ────────────────────────────────────────────────────
  const existingNotes = await Note.countDocuments();
  if (existingNotes < 5) {
    const chapters = await Chapter.find().populate('subjectId classId').limit(20);
    let notesCreated = 0;

    for (const ch of chapters.slice(0, 12)) {
      await Note.create({
        title: `${ch.name} – Complete Notes`,
        content: `# ${ch.name}\n\n## Overview\nThis chapter covers all key concepts related to ${ch.name} as per the NCERT curriculum.\n\n## Key Topics\n1. Introduction and Definitions\n2. Important Formulas and Theorems\n3. Solved Examples\n4. Practice Problems\n\n## Summary\nStudy this chapter carefully and practice the problems at the end. Focus on understanding the concepts rather than just memorizing formulas.\n\n## Important Questions\n- Define ${ch.name} in your own words.\n- Explain the main concepts with examples.\n- Solve the NCERT exercises at the end of the chapter.`,
        chapterId: ch._id,
        subjectId: ch.subjectId._id,
        classId: ch.classId._id,
        type: 'rich-text',
        tags: [ch.name.toLowerCase().split(' ')[0], ch.subjectId.name.toLowerCase(), 'ncert'],
        isDownloadable: true,
        uploadedBy: admin._id
      });
      notesCreated++;
    }
    console.log(`✅ Created ${notesCreated} sample notes`);
  } else {
    console.log(`ℹ️  Notes already seeded (${existingNotes})`);
  }

  // ── 3. Seed Sample Videos ───────────────────────────────────────────────────
  const existingVideos = await Video.countDocuments();
  if (existingVideos < 5) {
    const chapters = await Chapter.find().populate('subjectId classId').limit(10);
    let vidsCreated = 0;

    for (let i = 0; i < Math.min(SAMPLE_VIDEOS.length, chapters.length); i++) {
      const ch  = chapters[i];
      const vid = SAMPLE_VIDEOS[i];
      await Video.create({
        title: vid.title,
        description: `Complete lecture on ${vid.title} – NCERT based explanation with solved examples.`,
        chapterId: ch._id,
        subjectId: ch.subjectId._id,
        classId: ch.classId._id,
        type: 'youtube',
        youtubeUrl: `https://www.youtube.com/watch?v=${vid.youtubeId}`,
        youtubeId: vid.youtubeId,
        thumbnailUrl: `https://img.youtube.com/vi/${vid.youtubeId}/maxresdefault.jpg`,
        duration: vid.duration,
        uploadedBy: admin._id,
        isActive: true
      });
      vidsCreated++;
    }
    console.log(`✅ Created ${vidsCreated} sample videos`);
  } else {
    console.log(`ℹ️  Videos already seeded (${existingVideos})`);
  }

  // ── 4. Seed Sample MCQ Tests ────────────────────────────────────────────────
  const existingTests = await Test.countDocuments();
  if (existingTests < 3) {
    const chapters = await Chapter.find().populate('subjectId classId').limit(6);
    let testsCreated = 0;

    for (const ch of chapters.slice(0, 4)) {
      const mcqSet = SAMPLE_MCQ[ch.subjectId.name] || SAMPLE_MCQ['default'];
      const questions = mcqSet.map(q => ({
        questionText: q.q,
        options: q.opts.map((o, idx) => ({ text: o, isCorrect: idx === q.ans })),
        explanation: q.exp,
        marks: 1
      }));

      await Test.create({
        title: `${ch.name} – Practice Test`,
        description: `Test your knowledge of ${ch.name} from ${ch.subjectId.name}`,
        chapterId: ch._id,
        subjectId: ch.subjectId._id,
        classId: ch.classId._id,
        questions,
        timeLimit: 15,
        isPublished: true,
        createdBy: admin._id
      });
      testsCreated++;
    }
    console.log(`✅ Created ${testsCreated} sample tests`);
  } else {
    console.log(`ℹ️  Tests already seeded (${existingTests})`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Database seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin Email    : admin@studyplatform.com');
  console.log('Admin Password : Admin@123');
  console.log('Frontend       : http://localhost:3000');
  console.log('Backend API    : http://localhost:5000/api');
  console.log('─────────────────────────────────────────');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
