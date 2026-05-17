import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      baseCurrency: "INR",
      displayCurrency: "EUR",
      theme: "dark",
      weekStartsOn: 1,
      targetCountries: ["DE", "ES", "SE", "FI", "NL"],
      germanLevel: "A1",
      spanishLevel: "A1",
      englishLevel: "C1",
      dreamListMode: "companies",
    },
    update: {},
  });

  const TRAJ_AGGRESSIVE_ID = "seed-trajectory-aggressive-v1";
  const TRAJ_STEADY_ID = "seed-trajectory-steady-v1";

  const aggressive = await prisma.trajectory.upsert({
    where: { id: TRAJ_AGGRESSIVE_ID },
    create: {
      id: TRAJ_AGGRESSIVE_ID,
      name: "Aggressive Pivot (6 mo)",
      description: "High-intensity path to EU Audio/ML",
      isActive: true,
      color: "#7c3aed",
      startDate: new Date("2026-06-01"),
      targetDate: new Date("2026-12-01"),
    },
    update: {
      name: "Aggressive Pivot (6 mo)",
      description: "High-intensity path to EU Audio/ML",
      isActive: true,
      color: "#7c3aed",
      startDate: new Date("2026-06-01"),
      targetDate: new Date("2026-12-01"),
    },
  });

  const steady = await prisma.trajectory.upsert({
    where: { id: TRAJ_STEADY_ID },
    create: {
      id: TRAJ_STEADY_ID,
      name: "Steady Pivot (12 mo)",
      description: "Sustainable pace with buffer",
      isActive: false,
      color: "#06b6d4",
      startDate: new Date("2026-06-01"),
      targetDate: new Date("2027-06-01"),
    },
    update: {
      name: "Steady Pivot (12 mo)",
      description: "Sustainable pace with buffer",
      isActive: false,
      color: "#06b6d4",
      startDate: new Date("2026-06-01"),
      targetDate: new Date("2027-06-01"),
    },
  });

  const milestoneTitles = [
    { title: "CV & LinkedIn ready", category: "career", days: 14 },
    { title: "Project #1 shipped (portfolio)", category: "project", days: 45 },
    { title: "Project #2 shipped", category: "project", days: 90 },
    { title: "50 applications sent", category: "career", days: 120 },
    { title: "5 warm referrals", category: "career", days: 150 },
    { title: "3 onsites completed", category: "interview", days: 165 },
    { title: "Offer signed", category: "career", days: 175 },
    { title: "Visa filed", category: "visa", days: 185 },
    { title: "Relocation booked", category: "personal", days: 200 },
  ];

  let order = 0;
  for (const m of milestoneTitles) {
    const d = new Date("2026-06-01");
    d.setDate(d.getDate() + m.days);
    const status =
      order < 2 ? "done" : order === 2 ? "in_progress" : "planned";
    const completedAt = order < 2 ? d : null;
    const mid = `seed-mile-aggressive-${order}`;
    await prisma.milestone.upsert({
      where: { id: mid },
      create: {
        id: mid,
        trajectoryId: aggressive.id,
        title: m.title,
        category: m.category,
        status,
        targetDate: d,
        order,
        completedAt,
        bucket: m.days <= 30 ? "now" : m.days <= 90 ? "next" : "later",
      },
      update: {
        title: m.title,
        category: m.category,
        status,
        targetDate: d,
        order,
        completedAt,
        bucket: m.days <= 30 ? "now" : m.days <= 90 ? "next" : "later",
      },
    });
    order += 1;
  }

  order = 0;
  for (const m of milestoneTitles) {
    const d = new Date("2026-06-01");
    d.setDate(d.getDate() + m.days * 2);
    const mid = `seed-mile-steady-${order}`;
    await prisma.milestone.upsert({
      where: { id: mid },
      create: {
        id: mid,
        trajectoryId: steady.id,
        title: m.title,
        category: m.category,
        status: "planned",
        targetDate: d,
        order,
        bucket: m.days <= 60 ? "now" : m.days <= 150 ? "next" : "later",
      },
      update: {
        title: m.title,
        category: m.category,
        status: "planned",
        targetDate: d,
        order,
        bucket: m.days <= 60 ? "now" : m.days <= 150 ? "next" : "later",
      },
    });
    order += 1;
  }

  const habits = [
    { name: "ML study 60 min", cadence: "DAILY", emoji: "🧠", color: "#7c3aed" },
    { name: "Audio/DSP 30 min", cadence: "DAILY", emoji: "🎛️", color: "#06b6d4" },
    { name: "Apply to 2 jobs", cadence: "WEEKDAYS", emoji: "📨", color: "#10b981" },
    { name: "3 outreach messages", cadence: "WEEKDAYS", emoji: "🤝", color: "#f59e0b" },
    { name: "Music practice 20 min", cadence: "DAILY", emoji: "🎻", color: "#ec4899" },
    { name: "Spanish Duolingo 15 min", cadence: "DAILY", emoji: "🇪🇸", color: "#f97316" },
    { name: "Read 1 paper/article", cadence: "WEEKLY:3", emoji: "📄", color: "#8b5cf6" },
    { name: "Workout 30 min", cadence: "DAILY", emoji: "💪", color: "#22c55e" },
  ];
  const createdHabits = [];
  for (const h of habits) {
    createdHabits.push(await prisma.habit.create({ data: h }));
  }

  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(12, 0, 0, 0);
    for (const h of createdHabits.slice(0, 5)) {
      await prisma.habitLog.upsert({
        where: {
          habitId_date: { habitId: h.id, date: d },
        },
        create: {
          habitId: h.id,
          date: d,
          done: i % 5 !== 1,
          minutes: 20 + (i % 3) * 10,
        },
        update: {},
      });
    }
  }

  const blocks = [
    { dayOfWeek: 1, startMin: 390, endMin: 450, label: "Exercise", category: "exercise", color: "#22c55e" },
    { dayOfWeek: 1, startMin: 480, endMin: 540, label: "Audio/ML study", category: "learning", color: "#7c3aed" },
    { dayOfWeek: 1, startMin: 570, endMin: 1110, label: "Day job", category: "work", color: "#64748b" },
    { dayOfWeek: 1, startMin: 1140, endMin: 1260, label: "Deep work — projects", category: "deep-work", color: "#06b6d4" },
    { dayOfWeek: 1, startMin: 1260, endMin: 1290, label: "Networking", category: "rest", color: "#f59e0b" },
  ];
  for (const b of blocks) {
    await prisma.routineBlock.create({ data: b });
    await prisma.routineBlock.create({
      data: { ...b, dayOfWeek: 2 },
    });
    await prisma.routineBlock.create({
      data: { ...b, dayOfWeek: 3 },
    });
    await prisma.routineBlock.create({
      data: { ...b, dayOfWeek: 4 },
    });
    await prisma.routineBlock.create({
      data: { ...b, dayOfWeek: 5 },
    });
  }

  await prisma.task.createMany({
    data: [
      {
        title: "Tailor CV for Spotify Audio ML",
        status: "doing",
        priority: "high",
        category: "applications",
        tags: ["band-a", "spotify"],
        dueDate: new Date(Date.now() + 86400000),
      },
      {
        title: "Finish EarTikl demo deployment",
        status: "todo",
        priority: "urgent",
        category: "portfolio",
        tags: ["audio", "ship"],
        dueDate: new Date(Date.now() + 3 * 86400000),
      },
      {
        title: "Follow up — Dolby recruiter",
        status: "todo",
        priority: "med",
        category: "outreach",
        tags: ["follow-up"],
        dueDate: new Date(),
      },
      {
        title: "Review system design: ASR pipeline",
        status: "todo",
        priority: "med",
        category: "interview",
        tags: ["system-design"],
      },
    ],
  });

  await prisma.job.createMany({
    data: [
      {
        company: "Spotify",
        role: "Senior ML Engineer — Audio Understanding",
        location: "Berlin",
        country: "DE",
        band: "A",
        source: "linkedin",
        status: "tech",
        visaSponsor: "yes",
        salaryMin: 120000,
        salaryMax: 150000,
        currency: "EUR",
        appliedAt: new Date(Date.now() - 10 * 86400000),
        tags: ["audio", "ml"],
      },
      {
        company: "Native Instruments",
        role: "Audio Software Engineer",
        location: "Berlin",
        country: "DE",
        band: "A",
        source: "company",
        status: "applied",
        visaSponsor: "likely",
        salaryMin: 90000,
        salaryMax: 110000,
        currency: "EUR",
        appliedAt: new Date(Date.now() - 3 * 86400000),
        tags: ["audio", "dsp"],
      },
      {
        company: "SoundCloud",
        role: "Backend Engineer — Recommendations",
        location: "Berlin",
        country: "DE",
        band: "B",
        source: "referral",
        status: "screening",
        visaSponsor: "unknown",
        tags: ["reco", "streaming"],
      },
    ],
  });

  const c = await prisma.contact.create({
    data: {
      name: "Alex Müller",
      company: "ElevenLabs",
      role: "Research Engineer",
      location: "Remote EU",
      type: "engineer",
      warmth: 4,
      lastTouch: new Date(Date.now() - 5 * 86400000),
      nextTouch: new Date(Date.now() + 2 * 86400000),
      tags: ["audio", "referral-potential"],
    },
  });

  await prisma.touch.create({
    data: {
      contactId: c.id,
      channel: "linkedin",
      outcome: "replied",
      bodyMd: "Discussed EU hiring and team fit.",
    },
  });

  await prisma.outreachTemplate.createMany({
    data: [
      {
        name: "Researcher cold DM",
        audience: "researcher",
        bodyMd: "Hi {{Name}}, I loved your work on {{Company}}…",
        variables: ["{{Name}}", "{{Company}}", "{{Project}}"],
      },
      {
        name: "Recruiter intro",
        audience: "recruiter",
        bodyMd: "Hi {{Name}}, I'm a senior backend engineer pivoting to Audio/ML…",
        variables: ["{{Name}}", "{{Role}}", "{{Country}}"],
      },
      {
        name: "Engineer coffee chat",
        audience: "engineer",
        bodyMd: "Hey {{Name}} — big fan of {{Company}}'s stack. Would you have 15m for…",
        variables: ["{{Name}}", "{{Company}}"],
      },
    ],
  });

  await prisma.systemDesignCase.createMany({
    data: [
      {
        title: "Music Recommendation Engine",
        domain: "recsys",
        promptMd: "Design a real-time music recommendation system for 400M+ users…",
        tags: ["reco", "streaming"],
      },
      {
        title: "Real-time ASR Pipeline",
        domain: "streaming",
        promptMd: "Low-latency speech-to-text for live captions…",
        tags: ["asr", "latency"],
      },
      {
        title: "Audio Feature Extraction Service",
        domain: "feature-store",
        promptMd: "Batch + streaming features for ML models on audio…",
        tags: ["dsp", "ml"],
      },
      {
        title: "Audio Content Moderation",
        domain: "moderation",
        promptMd: "Detect harmful audio at scale with human review loop…",
        tags: ["safety", "ml"],
      },
    ],
  });

  const mlTopics = [
    "Bias-variance tradeoff",
    "Cross-validation strategies",
    "Gradient boosting vs random forests",
    "Neural network regularization",
    "Attention mechanism intuition",
    "Transformer complexity",
    "Evaluation metrics for imbalanced data",
    "Online learning vs batch",
    "Feature importance",
    "Embeddings for categorical data",
  ];
  for (const p of mlTopics) {
    await prisma.interviewQuestion.create({
      data: {
        topic: "ml",
        prompt: p,
        difficulty: 3,
        confidence: 2,
      },
    });
  }

  const audioTopics = [
    "STFT vs Mel spectrogram",
    "MFCC pipeline",
    "Phase reconstruction",
    "Sample rate & Nyquist",
    "Dynamic range compression",
    "Convolution reverb basics",
    "Pitch shifting approaches",
  ];
  for (const p of audioTopics) {
    await prisma.interviewQuestion.create({
      data: {
        topic: "audio",
        prompt: p,
        difficulty: 3,
        confidence: 2,
      },
    });
  }

  for (const country of ["DE", "ES"]) {
    const vt = await prisma.visaTrack.create({
      data: {
        country,
        pathway: country === "DE" ? "blue-card" : "hqp",
        status: "docs",
        notesMd: "Parallel track — gather apostilled degree.",
      },
    });
    for (const doc of [
      "Passport",
      "Degree certificate",
      "Transcripts",
      "Apostille",
      "Employment contract",
      "Health insurance",
    ]) {
      await prisma.visaDocument.create({
        data: {
          trackId: vt.id,
          name: doc,
          status: doc === "Passport" ? "obtained" : "missing",
        },
      });
    }
  }

  await prisma.relocationChecklist.createMany({
    data: [
      { country: "DE", item: "Anmeldung appointment", category: "arrival", done: false },
      { country: "DE", item: "Bank account (N26/Revolut)", category: "first-30d", done: false },
      { country: "ES", item: "NIE / TIE appointment", category: "arrival", done: false },
    ],
  });

  const cities = [
    { city: "Berlin", country: "DE", rentMin: 900, rentMax: 1600, groceriesMin: 250, groceriesMax: 400, transport: 60, utilities: 150, internet: 35, fitness: 40, diningPerMeal: 15, totalMin: 1800, totalMax: 2800, source: "2026 estimate" },
    { city: "Munich", country: "DE", rentMin: 1200, rentMax: 2200, groceriesMin: 280, groceriesMax: 450, transport: 65, utilities: 160, internet: 40, fitness: 50, diningPerMeal: 18, totalMin: 2400, totalMax: 3600, source: "2026 estimate" },
    { city: "Barcelona", country: "ES", rentMin: 800, rentMax: 1400, groceriesMin: 200, groceriesMax: 350, transport: 45, utilities: 120, internet: 30, fitness: 35, diningPerMeal: 14, totalMin: 1500, totalMax: 2500, source: "2026 estimate" },
    { city: "Amsterdam", country: "NL", rentMin: 1100, rentMax: 2000, groceriesMin: 260, groceriesMax: 420, transport: 90, utilities: 140, internet: 40, fitness: 45, diningPerMeal: 17, totalMin: 2200, totalMax: 3400, source: "2026 estimate" },
    { city: "Stockholm", country: "SE", rentMin: 950, rentMax: 1700, groceriesMin: 270, groceriesMax: 430, transport: 95, utilities: 130, internet: 35, fitness: 45, diningPerMeal: 16, totalMin: 2000, totalMax: 3100, source: "2026 estimate" },
  ];
  for (const row of cities) {
    await prisma.cityCOL.upsert({
      where: { city_country: { city: row.city, country: row.country } },
      create: { ...row, currency: "EUR" },
      update: { ...row, currency: "EUR" },
    });
  }

  const acc = await prisma.account.create({
    data: { name: "HDFC Savings (INR)", kind: "savings", currency: "INR", openingBalance: 450000 },
  });

  await prisma.savingsGoal.create({
    data: {
      name: "EU Runway 6mo",
      targetAmount: 18000,
      currency: "EUR",
      targetDate: new Date("2026-12-31"),
      currentAmount: 9200,
      notesMd: "Target liquid EUR buffer before move.",
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        accountId: acc.id,
        date: new Date(),
        amount: -45000,
        currency: "INR",
        type: "expense",
        category: "Rent",
        merchant: "Landlord",
      },
      {
        accountId: acc.id,
        date: new Date(Date.now() - 28 * 86400000),
        amount: 280000,
        currency: "INR",
        type: "income",
        category: "Salary",
        merchant: "Employer",
      },
    ],
  });

  await prisma.blogPost.createMany({
    skipDuplicates: true,
    data: [
      { title: "From Spring Boot to Spectrograms", slug: "spring-to-spectrograms", status: "idea", audience: "audio-ml" },
      { title: "Building EarTikl: lessons learned", slug: "eartikl-lessons", status: "drafting", audience: "backend" },
      { title: "Why I want EU Audio roles", slug: "eu-audio-why", status: "idea", audience: "recruiters" },
    ],
  });

  await prisma.readingItem.createMany({
    data: [
      { title: "Audio ML primer (Google)", kind: "article", url: "https://research.google/pubs/", status: "queue" },
      { title: "ISMIR proceedings highlights", kind: "paper", status: "reading" },
      { title: "Spotify Research blog — recommendations", kind: "article", url: "https://research.spotify.com/", status: "queue" },
    ],
  });

  await prisma.event.createMany({
    data: [
      { name: "ISMIR 2026", kind: "conference", city: "Daejeon", country: "KR", startDate: new Date("2026-09-20"), attending: false },
      { name: "ICASSP 2026", kind: "conference", city: "Hyderabad", country: "IN", startDate: new Date("2026-04-06"), attending: false },
      { name: "AES Europe", kind: "conference", city: "Milan", country: "IT", startDate: new Date("2026-05-18"), attending: false },
    ],
  });

  await prisma.learningItem.createMany({
    data: [
      { title: "Fast.ai Practical Deep Learning", kind: "course", provider: "fast.ai", topic: ["ml"], status: "active", progressPct: 35 },
      { title: "Audio Signal Processing — Coursera", kind: "course", topic: ["audio", "dsp"], status: "active", progressPct: 20 },
      { title: "Speech and Language Processing (Jurafsky)", kind: "book", topic: ["nlp", "asr"], status: "backlog" },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        name: "EarTikl",
        tagline: "Ear training + TikTok-style discovery",
        status: "building",
        stack: ["Next.js", "Python", "PyTorch"],
        audioMl: true,
        hours: 120,
      },
      {
        name: "Personal audio feature CLI",
        tagline: "Batch extract MFCCs / mel bands",
        status: "idea",
        stack: ["Rust", "DSP"],
        audioMl: true,
        hours: 8,
      },
    ],
  });

  await prisma.resume.create({
    data: {
      name: "Master CV",
      contentJson: {
        header: {
          name: "Utkarsh",
          label: "Senior Backend Engineer → Audio/ML",
          location: "Bangalore, India — open to EU relocation",
          openTo: ["Remote EU", "Hybrid Berlin", "Hybrid Amsterdam"],
          email: "you@example.com",
          phone: "+91 …",
          links: { linkedin: "https://linkedin.com/in/…", github: "https://github.com/…", portfolio: "" },
        },
        summary: "Java/Spring Boot at scale; pivoting to audio ML with shipped side projects and strong fundamentals.",
        skills: [
          { group: "Backend", items: ["Java", "Spring Boot", "Kafka", "PostgreSQL"] },
          { group: "ML/Audio", items: ["PyTorch", "librosa", "DSP basics", "Python"] },
        ],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        languages: [
          { name: "English", level: "C1" },
          { name: "Spanish", level: "A1" },
          { name: "German", level: "A1" },
        ],
        other: [],
      },
    },
  });

  const dreamCompanies = [
    {
      id: "seed-dream-co-spotify",
      name: "Spotify",
      country: "SE",
      city: "Stockholm",
      sortOrder: 0,
      url: "https://www.lifeatspotify.com/",
    },
    {
      id: "seed-dream-co-ni",
      name: "Native Instruments",
      country: "DE",
      city: "Berlin",
      sortOrder: 1,
      url: "https://www.native-instruments.com/en/careers/",
    },
    {
      id: "seed-dream-co-ableton",
      name: "Ableton",
      country: "DE",
      city: "Berlin",
      sortOrder: 2,
      url: "https://www.ableton.com/en/jobs/",
    },
  ];
  for (const d of dreamCompanies) {
    await prisma.dreamCompany.upsert({
      where: { id: d.id },
      create: d,
      update: {
        name: d.name,
        country: d.country,
        city: d.city,
        url: d.url,
        sortOrder: d.sortOrder,
      },
    });
  }

  const dreamColleges = [
    {
      id: "seed-dream-uni-upf",
      name: "Universitat Pompeu Fabra (UPF)",
      country: "ES",
      city: "Barcelona",
      sortOrder: 0,
      url: "https://www.upf.edu/web/smc/",
      notes:
        "MSc Sound and Music Computing (SMC). 1-year program (60 ECTS). Core focus on DSP, Machine Learning for Audio, and Music Information Retrieval. Prepares for R&D in audio tech.",
    },
    {
      id: "seed-dream-uni-upc",
      name: "Universitat Politècnica de Catalunya (UPC · BarcelonaTech)",
      country: "ES",
      city: "Barcelona",
      sortOrder: 1,
      url: "https://www.upc.edu/en/study",
      notes: "Top technical university. No dedicated audio master, but allows for audio/signal processing specializations within Informatics or Telecom engineering.",
    },
    {
      id: "seed-dream-uni-tum",
      name: "Technical University of Munich (TUM)",
      country: "DE",
      city: "Munich",
      sortOrder: 2,
      url: "https://www.tum.de/en/studies",
      notes: "M.Sc. in Electrical Engineering or Informatics. Can tailor the curriculum heavily towards Audio Information Processing, Machine Learning, and Psychoacoustics.",
    },
    {
      id: "seed-dream-uni-tudelft",
      name: "Delft University of Technology (TU Delft)",
      country: "NL",
      city: "Delft",
      sortOrder: 3,
      url: "https://www.tudelft.nl/en/education",
      notes: "MSc Electrical Engineering (Signals & Sensing Track). Focuses on acoustic signal processing, array processing, speech enhancement, and machine learning for audio.",
    },
    {
      id: "seed-dream-uni-kth",
      name: "KTH Royal Institute of Technology",
      country: "SE",
      city: "Stockholm",
      sortOrder: 4,
      url: "https://www.kth.se/en/studies",
      notes: "MSc Interactive Media Technology. Offers a specialized focus area in Sound and Music Computing, including sonification, sound design, and musical expression interfaces.",
    },
    {
      id: "seed-dream-uni-aalto",
      name: "Aalto University",
      country: "FI",
      city: "Espoo",
      sortOrder: 5,
      url: "https://www.aalto.fi/en/study-options",
      notes: "MSc Computer, Communication and Info Sciences (Acoustics & Audio Tech major). World-class acoustic labs. Focus on audio signal processing, room acoustics, and perception.",
    },
  ];
  for (const d of dreamColleges) {
    await prisma.dreamCollege.upsert({
      where: { id: d.id },
      create: d,
      update: {
        name: d.name,
        country: d.country,
        city: d.city,
        url: d.url,
        notes: d.notes ?? null,
        sortOrder: d.sortOrder,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
