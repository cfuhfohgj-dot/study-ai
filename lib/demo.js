export function demoLesson(lang, hint) {
  const ar = lang === 'ar';
  const topic = (hint || '').trim().slice(0, 60);
  return ar ? {
    demo: true,
    title: 'قانون نيوتن الثاني (نموذج تجريبي)',
    summary: topic ? `ده شرح تجريبي. لما تضيف مفتاح Gemini هيشرح لك: "${topic}" بالظبط.` : 'ده شرح تجريبي لحد ما نضيف مفتاح Gemini.',
    keyPoints: ['القوة = الكتلة × العجلة (F = m × a).', 'لو زودت القوة، العجلة بتزيد.', 'لو زودت الكتلة، العجلة بتقل.', 'وحدة القوة هي النيوتن (N).'],
    steps: [
      { title: 'الفكرة الأساسية', body: 'أي جسم بيتحرك أسرع أو أبطأ لما قوة تأثر عليه. القانون بيربط بين القوة والكتلة والعجلة.' },
      { title: 'المعادلة', body: 'F = m × a. القوة بالنيوتن، الكتلة بالكيلوجرام، والعجلة بالمتر لكل ثانية تربيع.' },
      { title: 'ليه مهم؟', body: 'بيفسر ليه العربية الفاضية بتتسارع أسرع من المحملة بنفس قوة المحرك.' }
    ],
    examples: [{ title: 'مثال محلول', body: 'جسم كتلته 2 كجم، اتأثر بقوة 10 نيوتن. العجلة = 10 ÷ 2 = 5 م/ث².' }],
    quiz: [
      { q: 'جسم كتلته 5 كجم وقوة 20 نيوتن. كام العجلة؟', options: ['2 م/ث²', '4 م/ث²', '25 م/ث²', '100 م/ث²'], answer: 1, why: '20 ÷ 5 = 4.' },
      { q: 'لو الكتلة زادت والقوة ثابتة، العجلة...', options: ['تزيد', 'تقل', 'ثابتة', 'صفر'], answer: 1, why: 'العجلة عكسية مع الكتلة.' }
    ],
    scenes: [
      { title: 'مقدمة', bullets: ['ليه الأجسام بتتحرك؟'], narration: 'إزاي بنفسر حركة الأجسام؟ النهارده هنفهم قانون نيوتن الثاني.' },
      { title: 'المعادلة', bullets: ['F = m × a', 'القوة = الكتلة × العجلة'], narration: 'القانون بيقول إن القوة بتساوي الكتلة مضروبة في العجلة.' },
      { title: 'مثال', bullets: ['m = 2 كجم', 'F = 10 N', 'a = 5 م/ث²'], narration: 'لو جسم كتلته اتنين كيلو وقوة عشرة نيوتن، العجلة بتبقى خمسة.' },
      { title: 'الخلاصة', bullets: ['قوة أكبر = عجلة أكبر', 'كتلة أكبر = عجلة أقل'], narration: 'الخلاصة: كل ما القوة زادت العجلة زادت، وكل ما الكتلة زادت العجلة قلت.' }
    ]
  } : {
    demo: true,
    title: "Newton's Second Law (demo sample)",
    summary: topic ? `This is a demo lesson. With a Gemini key it will explain "${topic}" for real.` : 'This is a demo lesson until a Gemini key is added.',
    keyPoints: ['Force = mass x acceleration (F = m x a).', 'More force means more acceleration.', 'More mass means less acceleration.', 'Force is measured in newtons (N).'],
    steps: [
      { title: 'The core idea', body: 'An object speeds up or slows down when a force acts on it. The law links force, mass and acceleration.' },
      { title: 'The equation', body: 'F = m x a. Force in newtons, mass in kilograms, acceleration in meters per second squared.' },
      { title: 'Why it matters', body: 'It explains why an empty car accelerates faster than a loaded one with the same engine force.' }
    ],
    examples: [{ title: 'Worked example', body: 'A 2 kg object is pushed with 10 N. Acceleration = 10 / 2 = 5 m/s2.' }],
    quiz: [
      { q: 'A 5 kg object gets 20 N. What is its acceleration?', options: ['2 m/s2', '4 m/s2', '25 m/s2', '100 m/s2'], answer: 1, why: '20 / 5 = 4.' },
      { q: 'If mass grows and force stays the same, acceleration...', options: ['grows', 'shrinks', 'stays', 'is zero'], answer: 1, why: 'Acceleration is inversely related to mass.' }
    ],
    scenes: [
      { title: 'Intro', bullets: ['Why do things move?'], narration: "How do we explain motion? Today we learn Newton's second law." },
      { title: 'The equation', bullets: ['F = m x a', 'Force = mass x acceleration'], narration: 'The law says force equals mass times acceleration.' },
      { title: 'Example', bullets: ['m = 2 kg', 'F = 10 N', 'a = 5 m/s2'], narration: 'A two kilogram object pushed with ten newtons accelerates at five meters per second squared.' },
      { title: 'Recap', bullets: ['More force, more acceleration', 'More mass, less acceleration'], narration: 'In short: more force gives more acceleration, more mass gives less.' }
    ]
  };
}
export function demoChat(lang) {
  return lang === 'ar' ? 'ده رد تجريبي. أول ما يتضاف مفتاح Gemini هرد عليك من الدرس نفسه بشكل حقيقي.' : 'This is a demo reply. Once a Gemini key is added I will answer from the lesson for real.';
}
