const blogs = [
  {
    id: 1,
    title: 'How to Tailor Your Resume for Each Job',
    excerpt:
      'Customize your resume with targeted keywords and measurable achievements to stand out.',
    author: 'Alex Morgan',
    date: 'Nov 12, 2025',
    readTime: '5 min read',
    category: 'Resume & Interview',
    thumbnail: '/about-placeholder.svg',
    cover: '/team-placeholder.svg',
    content: {
      paragraphs: [
        'Tailoring your resume for each role significantly increases your chances of getting interviews.',
        'Focus on relevant accomplishments, mirror the job description language, and quantify results.',
      ],
      sections: [
        { heading: 'Analyze the Job Description', bullets: ['Identify key skills and keywords', 'Note required tools/technologies', 'Understand business outcomes needed'] },
        { heading: 'Map Your Experience', bullets: ['Prioritize most relevant roles/projects', 'Quantify with metrics (e.g., +32% conversion)', 'Keep it concise and impact-focused'] },
      ],
      tip: 'Use a master resume, then create role-specific versions tailored to each application.',
    },
  },
  {
    id: 2,
    title: '2025 Tech Trends That Impact Hiring',
    excerpt:
      'AI-assisted development, platform engineering, and data privacy skills are shaping hiring needs.',
    author: 'Priya Shah',
    date: 'Oct 30, 2025',
    readTime: '6 min read',
    category: 'Tech Trends',
    thumbnail: '/company-placeholder.svg',
    cover: '/hero-bg.svg',
    content: {
      paragraphs: [
        'Organizations are investing in platforms and automation, changing what skills are in demand.',
        'Security-by-design and AI literacy are becoming baseline expectations across roles.',
      ],
      sections: [
        { heading: 'Emerging Priorities', bullets: ['Platform engineering', 'MLOps and AI governance', 'Privacy-first architectures'] },
        { heading: 'Candidate Edge', bullets: ['Showcase real projects', 'Demonstrate system thinking', 'Highlight collaboration and communication'] },
      ],
      tip: 'Build a portfolio that demonstrates end-to-end thinking, not just isolated tasks.',
    },
  },
  {
    id: 3,
    title: 'Workplace Culture: What Candidates Should Look For',
    excerpt:
      'Culture fit means shared values, healthy feedback loops, and growth opportunities—not perks only.',
    author: 'Daniel Kim',
    date: 'Sep 21, 2025',
    readTime: '4 min read',
    category: 'Workplace Culture',
    thumbnail: '/team-placeholder.svg',
    cover: '/about-placeholder.svg',
    content: {
      paragraphs: [
        'Evaluate culture through how teams make decisions and learn from mistakes.',
        'Ask about feedback practices, mentoring, and how success is recognized.',
      ],
      sections: [
        { heading: 'Signals of Healthy Culture', bullets: ['Clear goals and autonomy', 'Psychological safety', 'Inclusive communication'] },
        { heading: 'Questions to Ask', bullets: ['How are decisions made?', 'What does onboarding look like?', 'How is growth supported?'] },
      ],
      tip: 'Speak to multiple team members to get a full picture of the environment.',
    },
  },
  {
    id: 4,
    title: 'Remote Jobs: Succeeding in Distributed Teams',
    excerpt:
      'Set clear routines, communicate async, and optimize your workspace for focus and wellbeing.',
    author: 'Sara Ali',
    date: 'Aug 15, 2025',
    readTime: '5 min read',
    category: 'Remote Jobs',
    thumbnail: '/hero-bg.svg',
    cover: '/hero-bg.svg',
    content: {
      paragraphs: [
        'Remote work thrives on clarity and trust. Document decisions and use async channels effectively.',
        'Balance deep work with collaboration windows to avoid constant context switching.',
      ],
      sections: [
        { heading: 'Core Practices', bullets: ['Written communication', 'Time blocking', 'Clear goals and outcomes'] },
        { heading: 'Tools That Help', bullets: ['Task managers', 'Focus timers', 'Quality audio/video setup'] },
      ],
      tip: 'Agree on team-wide guidelines for response times and meeting hygiene.',
    },
  },
  {
    id: 5,
    title: 'Career Tips for Early Professionals',
    excerpt:
      'Invest in learning, find mentors, and track impact to build strong career momentum.',
    author: 'Michael Green',
    date: 'Jul 05, 2025',
    readTime: '5 min read',
    category: 'Career Tips',
    thumbnail: '/vite.svg',
    cover: '/team-placeholder.svg',
    content: {
      paragraphs: [
        'Your first years set the tone. Aim for breadth, learn fast, and deliver reliably.',
        'Document wins and lessons—this becomes your portfolio and story.',
      ],
      sections: [
        { heading: 'Build Momentum', bullets: ['Find mentors', 'Ship small wins often', 'Keep learning plans'] },
        { heading: 'Communicate Value', bullets: ['Quantify outcomes', 'Present case studies', 'Ask for feedback regularly'] },
      ],
      tip: 'Schedule monthly retrospectives to reflect and adjust your growth plan.',
    },
  },
  {
    id: 6,
    title: 'Ace Your Next Remote Interview',
    excerpt:
      'Optimize your setup, prepare structured stories, and practice concise answers for remote formats.',
    author: 'Emma Lopez',
    date: 'Jun 18, 2025',
    readTime: '6 min read',
    category: 'Resume & Interview',
    thumbnail: '/about-placeholder.svg',
    cover: '/company-placeholder.svg',
    content: {
      paragraphs: [
        'Remote interviews emphasize clarity and signal. Keep answers tight and outcome-focused.',
        'Use STAR to structure stories and ensure your audio/video is reliable.',
      ],
      sections: [
        { heading: 'Preparation Checklist', bullets: ['Test tools early', 'Prepare role-aligned stories', 'Research the company deeply'] },
        { heading: 'During the Interview', bullets: ['Listen actively', 'Ask clarifying questions', 'Summarize key points'] },
      ],
      tip: 'Record mock interviews to detect filler words and improve delivery.',
    },
  },
  {
    id: 7,
    title: 'Time Management Frameworks for Busy Professionals',
    excerpt:
      'Try timeboxing, Pomodoro, and priority matrices to stay focused and deliver consistently.',
    author: 'Liam Turner',
    date: 'Mar 29, 2025',
    readTime: '5 min read',
    category: 'Productivity',
    thumbnail: '/hero-bg.svg',
    cover: '/team-placeholder.svg',
    content: {
      paragraphs: [
        'Effective time management reduces stress and increases quality. Pick one framework and stick with it.',
        'Use weekly planning and daily reviews to drive intent rather than reactiveness.',
      ],
      sections: [
        { heading: 'Popular Frameworks', bullets: ['Timeboxing', 'Pomodoro', 'Eisenhower Matrix'] },
        { heading: 'Keep It Simple', bullets: ['Limit WIP', 'Batch similar tasks', 'Review outcomes weekly'] },
      ],
      tip: 'Protect deep work blocks on your calendar and treat them as meetings with yourself.',
    },
  },
];

export default blogs;