import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

// 1. Auto-Typing Text Animation Component
const words = [
  "Class 6–10 Students",
  "Maths & Science",
  "Telugu Learners",
  "Hindi Learners",
  "School Success",
  "Daily Quiz Practice"
];

const TypingText = () => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 85);

    return () => clearTimeout(timeout);
  }, [subIndex, reverse, index]);

  useEffect(() => {
    setText(words[index].substring(0, subIndex));
  }, [subIndex, index]);

  return (
    <span className="typing-text-wrapper" style={{ color: '#a855f7', fontWeight: '800' }}>
      {text}
      <span className="typing-cursor">|</span>
    </span>
  );
};

// 2. Custom inline SVGs for Subjects (accents matching the core purple-blue-white premium theme)
const renderSubjectIcon = (subjectName) => {
  switch (subjectName.toLowerCase()) {
    case 'telugu':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="telCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="telShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#telCircleGrad)" filter="url(#telShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text 
            x="50" 
            y="50" 
            fontFamily="'Outfit', 'Noto Sans Telugu', sans-serif" 
            fontSize="38" 
            fontWeight="900" 
            fill="#ffffff" 
            textAnchor="middle" 
            dominantBaseline="central"
          >
            అ
          </text>
        </svg>
      );
    case 'hindi':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="hinCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="hinShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#hinCircleGrad)" filter="url(#hinShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text 
            x="50" 
            y="50" 
            fontFamily="'Outfit', 'Noto Sans Devanagari', sans-serif" 
            fontSize="38" 
            fontWeight="900" 
            fill="#ffffff" 
            textAnchor="middle" 
            dominantBaseline="central"
          >
            अ
          </text>
        </svg>
      );
    case 'english':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="engCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="engShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1e3a8a" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#engCircleGrad)" filter="url(#engShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text 
            x="50" 
            y="50" 
            fontFamily="'Outfit', 'DM Sans', 'Jost', sans-serif" 
            fontSize="42" 
            fontWeight="800" 
            fill="#ffffff" 
            textAnchor="middle" 
            dominantBaseline="central"
          >
            A
          </text>
        </svg>
      );
    case 'mathematics':
    case 'maths':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="matCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="matShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#matCircleGrad)" filter="url(#matShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <text x="50" y="52" fontFamily="'Outfit', sans-serif" fontSize="38" fontWeight="900" fill="#ffffff" textAnchor="middle" dominantBaseline="central">π</text>
          <text x="28" y="28" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" textAnchor="middle" dominantBaseline="central">+</text>
          <text x="72" y="28" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" textAnchor="middle" dominantBaseline="central">×</text>
          <text x="72" y="72" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" textAnchor="middle" dominantBaseline="central">÷</text>
          <text x="28" y="72" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="rgba(255,255,255,0.4)" textAnchor="middle" dominantBaseline="central">=</text>
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="phyCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <filter id="phyShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0891b2" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#phyCircleGrad)" filter="url(#phyShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(-30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="26" ry="8" fill="none" stroke="#ffffff" strokeWidth="2.5" transform="rotate(90, 50, 50)"/>
          <circle cx="50" cy="50" r="6" fill="#ffffff"/>
          <circle cx="28" cy="38" r="3" fill="#ffffff" opacity="0.8"/>
          <circle cx="72" cy="62" r="3" fill="#ffffff" opacity="0.8"/>
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="chCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="chShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#chCircleGrad)" filter="url(#chShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <path d="M40,28 H60 M45,28 V45 L32,68 C30,73 35,78 41,78 H59 C65,78 70,73 68,68 L55,45 V28" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="38" y1="62" x2="62" y2="62" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.5"/>
          <circle cx="44" cy="68" r="3" fill="#ffffff"/>
          <circle cx="56" cy="66" r="4" fill="rgba(255, 255, 255, 0.8)"/>
        </svg>
      );
    case 'biology':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="bioCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <filter id="bioShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#be123c" floodOpacity="0.25"/>
            </filter>
            <linearGradient id="dna1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
            <linearGradient id="dna2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#ffffff" opacity="0.8" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#bioCircleGrad)" filter="url(#bioShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          
          <g transform="translate(15, 15) scale(0.7)">
            <line x1="30" y1="28" x2="70" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeDasharray="1 3"/>
            <line x1="32" y1="38" x2="68" y2="38" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
            <line x1="38" y1="48" x2="62" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
            <line x1="42" y1="58" x2="58" y2="58" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeDasharray="1 3"/>
            <line x1="38" y1="68" x2="62" y2="68" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
            <line x1="32" y1="78" x2="68" y2="78" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
            <circle cx="36" cy="38" r="3.5" fill="#ffffff"/>
            <circle cx="64" cy="38" r="3.5" fill="#fbcfe8"/>
            <circle cx="42" cy="48" r="3.5" fill="#fbcfe8"/>
            <circle cx="58" cy="48" r="3.5" fill="#ffffff"/>
            <circle cx="42" cy="68" r="3.5" fill="#ffffff"/>
            <circle cx="58" cy="68" r="3.5" fill="#fbcfe8"/>
            <circle cx="36" cy="78" r="3.5" fill="#fbcfe8"/>
            <circle cx="64" cy="78" r="3.5" fill="#ffffff"/>
            <path d="M30,22 Q50,48 70,22 Q50,48 30,72 Q50,96 70,72" fill="none" stroke="url(#dna1)" strokeWidth="5" strokeLinecap="round"/>
            <path d="M70,22 Q50,48 30,22 Q50,48 70,72 Q50,96 30,72" fill="none" stroke="url(#dna2)" strokeWidth="4.5" strokeLinecap="round"/>
            <circle cx="30" cy="22" r="5" fill="#ffffff"/>
            <circle cx="70" cy="22" r="5" fill="#fbcfe8"/>
            <circle cx="30" cy="72" r="5" fill="#fbcfe8"/>
            <circle cx="70" cy="72" r="5" fill="#ffffff"/>
          </g>
        </svg>
      );
    case 'social studies':
    case 'social':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="socCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="socShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#d97706" floodOpacity="0.25"/>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#socCircleGrad)" filter="url(#socShadow)"/>
          <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.5"/>
          <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="3.5"/>
          <ellipse cx="50" cy="50" rx="24" ry="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" transform="rotate(90, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="24" ry="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
          <line x1="26" y1="50" x2="74" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="2"/>
          <path d="M40,36 L60,64" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
};

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filterable subjects list
  const subjects = [
    { name: 'Telugu', desc: 'Regional Telugu grammar, alphabets, prose readings, and cultural poetry modules.', color: '#6366f1' },
    { name: 'Hindi', desc: 'Devanagari scripts, essential vocabulary, sentence constructs, and stories.', color: '#ea580c' },
    { name: 'English', desc: 'Tenses, sentence analysis, reading comprehension, active voice, and dialogue.', color: '#2563eb' },
    { name: 'Maths', desc: 'Class 6-10 geometry equations, algebra constants, ratio divisions, and numbers.', color: '#4f46e5' },
    { name: 'Physics', desc: 'Laws of motion, sound speeds, gravity components, magnetism, and light optics.', color: '#06b6d4' },
    { name: 'Chemistry', desc: 'Periodic tables, molecular configurations, balancing chemical formulas, and gases.', color: '#059669' },
    { name: 'Biology', desc: 'Plant systems, animal cellular structures, genetics, and digestive pathways.', color: '#ec4899' },
    { name: 'Social Studies', desc: 'Geography grids, historical maps, civil constitutions, and economic indicators.', color: '#f59e0b' }
  ];

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    subject.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const element = document.getElementById('courses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      
      {/* Decorative gradient blobs */}
      <div className="gradient-blob blob-1"></div>
      <div className="gradient-blob blob-2"></div>
      <div className="gradient-blob blob-3"></div>

      {/* HERO SECTION */}
      <section className="hero-section" id="home">
        <div className="container">
          <div className="hero-grid">
            
            {/* Hero Left Content */}
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-sparkle">✨</span>
                <span>Class 6–10 Premium EdTech Portal</span>
              </div>
              <h1 className="hero-title">
                Learn Smarter For <br />
                <TypingText />
              </h1>
              <p className="hero-desc">
                Interactive video lessons, quizzes, study materials, and smart learning tools designed for school students. Boost your scores with regional language support.
              </p>

              {/* Dynamic Search Bar */}
              <form className="hero-search" onSubmit={handleSearchSubmit}>
                <div className="search-input-wrapper">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input 
                    type="text" 
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-search">Search</button>
              </form>

              <div className="hero-buttons">
                <Link to="/register" className="btn-cta btn-primary-gradient">Start Learning</Link>
                <a href="#courses" className="btn-cta btn-glass">Explore Courses</a>
              </div>
            </div>

            {/* Hero Right Visual Column */}
            <div className="hero-visual">
              <div className="image-animation-container">
                <img 
                  src="/assets/hero_illustration.png" 
                  alt="LearnoQube Students Studying Online" 
                  className="hero-main-illustration"
                />
              </div>

              {/* Floating Badge 1 */}
              <div className="hero-floating-card badge-left">
                <div className="floating-badge-icon color-indigo">
                  <i className="fa-solid fa-video"></i>
                </div>
                <div className="floating-badge-info">
                  <h5>Live Classes</h5>
                  <p>Daily Interactions</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="hero-floating-card badge-right">
                <div className="floating-badge-icon color-violet">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div className="floating-badge-info">
                  <h5>Daily Quizzes</h5>
                  <p>Test Your Knowledge</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="live-classes">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Value Proposition</span>
            <h2>Designed for <span>Exceptional Learning</span></h2>
            <p>Our gamified student-centered tools make standard middle school curriculums thoroughly engaging and extremely simple.</p>
          </div>

          <div className="features-grid">
            
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-box color-indigo">
                <i className="fa-solid fa-video"></i>
              </div>
              <h3>Live Video Classes</h3>
              <p>Attend daily teacher lectures with instant chat checkpoints and live concept assessments.</p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-box color-violet">
                <i className="fa-solid fa-language"></i>
              </div>
              <h3>Telugu Learning</h3>
              <p>Detailed math and science terms translated to Telugu medium for quick regional comprehension.</p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-box color-orange">
                <i className="fa-solid fa-book-open"></i>
              </div>
              <h3>Hindi Learning</h3>
              <p>Full curriculum structures explained in bilingual Hindi to reinforce basic grammar and equations.</p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-box color-blue">
                <i className="fa-solid fa-calculator"></i>
              </div>
              <h3>Maths Practice</h3>
              <p>Auto-generated coordinate questions, polynomial exercises, and algebra solvers.</p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card">
              <div className="feature-icon-box color-cyan">
                <i className="fa-solid fa-flask"></i>
              </div>
              <h3>Science Experiments</h3>
              <p>Virtual lab experiments, formula checklists, atom structures, and organic diagrams.</p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card" id="quizzes">
              <div className="feature-icon-box color-green">
                <i className="fa-solid fa-square-check"></i>
              </div>
              <h3>Smart Quizzes</h3>
              <p>Auto-graded weekly worksheets with step-by-step solutions to address mistakes immediately.</p>
            </div>

            {/* Feature 7 */}
            <div className="feature-card" id="materials">
              <div className="feature-icon-box color-pink">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <h3>Study Materials</h3>
              <p>Curated revision notes, chapter formulas, definition sheets, and PDF worksheets.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CURRICULUM SUBJECTS SECTION */}
      <section className="subjects-section" id="courses">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Explore Subjects</span>
            <h2>Core <span>Class 6–10 Curriculum</span></h2>
            <p>Master primary languages, natural sciences, and analytical studies through our custom curriculum paths.</p>
          </div>

          {searchQuery && (
            <div className="search-filter-indicator">
              Showing {filteredSubjects.length} subjects matching "{searchQuery}"
              {filteredSubjects.length === 0 && <button className="btn-clear-search" onClick={() => setSearchQuery('')}>Clear Search</button>}
            </div>
          )}

          <div className="subjects-grid grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
            {filteredSubjects.map((sub, idx) => (
              <div className="subject-card" key={idx} style={{ borderBottom: `4px solid ${sub.color}` }}>
                <div className="subject-card-top">
                  <div className="subject-icon-container">
                    {renderSubjectIcon(sub.name)}
                  </div>
                  <h3>{sub.name}</h3>
                  <p>{sub.desc}</p>
                </div>
                <div className="subject-card-bottom">
                  <Link to="/register" className="explore-subject-btn" style={{ color: sub.color, borderColor: `${sub.color}33` }}>
                    Explore Subject
                    <i className="fa-solid fa-arrow-right explore-arrow"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CALL TO ACTION (CTA) REGISTRATION */}
      <section className="cta-container" id="contact">
        <div className="container">
          <div className="cta-gradient-box">
            
            {/* Background circles */}
            <div className="cta-circle circle-left"></div>
            <div className="cta-circle circle-right"></div>

            <h2>Start Your Learning Journey Today</h2>
            <p>Join thousands of school students excelling in academic curriculum paths, climbing peer ranks, and maintaining daily study streaks. Setup your free student account now.</p>
            
            <div className="cta-btn-wrap">
              <Link to="/register" className="btn-cta btn-white">Create Account</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
