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
            <linearGradient id="telGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="telBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f7ff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#telBg)"/>
          <path d="M25,65 H75 V70 H25 Z" fill="url(#telGrad)" opacity="0.3"/>
          <path d="M30,55 C30,45 50,45 50,55 C50,45 70,45 70,55 V72 C70,62 50,62 50,72 C50,62 30,62 30,72 Z" fill="none" stroke="url(#telGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="50" y1="52" x2="50" y2="72" stroke="url(#telGrad)" strokeWidth="3"/>
          <text x="50" y="38" fontFamily="'Outfit', 'Noto Sans Telugu', sans-serif" fontSize="28" fontWeight="900" fill="url(#telGrad)" textAnchor="middle" alignmentBaseline="middle">అ</text>
        </svg>
      );
    case 'hindi':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="hinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="hinBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#ffedd5" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#hinBg)"/>
          <path d="M65,30 L70,35 L45,60 L38,62 L40,55 Z" fill="url(#hinGrad)" opacity="0.95"/>
          <line x1="32" y1="68" x2="68" y2="68" stroke="#ea580c" strokeWidth="4.5" strokeLinecap="round"/>
          <text x="46" y="44" fontFamily="'Outfit', 'Devanagari', sans-serif" fontSize="30" fontWeight="900" fill="url(#hinGrad)" textAnchor="middle" alignmentBaseline="middle">अ</text>
        </svg>
      );
    case 'english':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="engGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="engBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eff6ff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#engBg)"/>
          <path d="M25,35 C25,25 75,25 75,35 C75,45 65,55 50,55 C45,55 40,58 35,62 V55 C25,55 25,45 25,35 Z" fill="none" stroke="url(#engGrad)" strokeWidth="4.5" strokeLinejoin="round"/>
          <text x="50" y="38" fontFamily="'Outfit', sans-serif" fontSize="28" fontWeight="900" fill="url(#engGrad)" textAnchor="middle" alignmentBaseline="middle">A</text>
          <line x1="25" y1="75" x2="75" y2="75" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
        </svg>
      );
    case 'mathematics':
    case 'maths':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="matGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="matBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f7ff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#matBg)"/>
          <text x="50" y="52" fontFamily="'Outfit', sans-serif" fontSize="34" fontWeight="900" fill="url(#matGrad)" textAnchor="middle" alignmentBaseline="middle">π</text>
          <text x="25" y="32" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="#a5b4fc" textAnchor="middle" alignmentBaseline="middle">+</text>
          <text x="75" y="32" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="#a5b4fc" textAnchor="middle" alignmentBaseline="middle">×</text>
          <text x="75" y="72" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="#a5b4fc" textAnchor="middle" alignmentBaseline="middle">÷</text>
          <text x="25" y="72" fontFamily="'Outfit', sans-serif" fontSize="18" fontWeight="900" fill="#a5b4fc" textAnchor="middle" alignmentBaseline="middle">=</text>
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="phyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="phyBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="100%" stopColor="#cffafe" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#phyBg)"/>
          <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#phyGrad)" strokeWidth="3" transform="rotate(30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#phyGrad)" strokeWidth="3" transform="rotate(-30, 50, 50)"/>
          <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#phyGrad)" strokeWidth="3" transform="rotate(90, 50, 50)"/>
          <circle cx="50" cy="50" r="7" fill="#0891b2"/>
          <circle cx="24" cy="35" r="3.5" fill="#22d3ee"/>
          <circle cx="76" cy="65" r="3.5" fill="#22d3ee"/>
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="chGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="chBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#chBg)"/>
          <path d="M40,25 H60 M45,25 V45 L32,70 C30,75 35,80 42,80 H58 C65,80 70,75 68,70 L55,45 V25" fill="none" stroke="url(#chGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="38" y1="62" x2="62" y2="62" stroke="#a7f3d0" strokeWidth="3"/>
          <circle cx="44" cy="70" r="3" fill="#10b981"/>
          <circle cx="56" cy="68" r="4.5" fill="#047857"/>
        </svg>
      );
    case 'biology':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="bioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <linearGradient id="bioBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="100%" stopColor="#fce7f3" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#bioBg)"/>
          <path d="M35,25 C45,35 55,35 65,25 M35,45 C45,55 55,55 65,45 M35,65 C45,75 55,75 65,65" fill="none" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round"/>
          <path d="M65,35 C55,45 45,45 35,35 M65,55 C55,65 45,65 35,55 M65,75 C55,85 45,85 35,75" fill="none" stroke="url(#bioGrad)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="43" y1="33" x2="57" y2="33" stroke="#f472b6" strokeWidth="2.5"/>
          <line x1="43" y1="53" x2="57" y2="53" stroke="#f472b6" strokeWidth="2.5"/>
          <line x1="43" y1="73" x2="57" y2="73" stroke="#db2777" strokeWidth="2.5"/>
        </svg>
      );
    case 'social studies':
    case 'social':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="socGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="socBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#socBg)"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="url(#socGrad)" strokeWidth="4.5"/>
          <ellipse cx="50" cy="50" rx="28" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.6"/>
          <ellipse cx="50" cy="50" rx="14" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.6"/>
          <line x1="22" y1="50" x2="78" y2="50" stroke="#f59e0b" strokeWidth="2.5" opacity="0.6"/>
          <path d="M38,32 L62,68" stroke="url(#socGrad)" strokeWidth="3" strokeLinecap="round"/>
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
    { name: 'Mathematics', desc: 'Class 6-10 geometry equations, algebra constants, ratio divisions, and numbers.', color: '#4f46e5' },
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
                    placeholder="Search subjects, lessons, quizzes..."
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
                  alt="EduMasterPro Students Studying Online" 
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

          <div className="subjects-grid">
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



      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Student Reviews</span>
            <h2>Loved by <span>Students & Parents</span></h2>
            <p>Real feedback from middle schoolers mastering science constants and regional languages seamlessly.</p>
          </div>

          <div className="testimonials-grid">
            
            {/* Testimonial 1 */}
            <div className="testimonial-card">
              <div className="quote-sign">“</div>
              <p className="testimonial-text">
                Studying Class 9 Physics constants in my native tongue, Telugu, helped clear up standard kinematics equations. The visual illustrations and quiz streak maps completely transformed my learning habits!
              </p>
              <div className="testimonial-profile">
                <div className="profile-avatar color-purple-avatar">PM</div>
                <div className="profile-info">
                  <h4>Prasanth Meka</h4>
                  <p>Class 9 Student</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card">
              <div className="quote-sign">“</div>
              <p className="testimonial-text">
                The bilingually structured Hindi explanations for cell structures in Biology saved us hours of study before class exams. The auto-graded worksheets offer immediate explanations for incorrect selections!
              </p>
              <div className="testimonial-profile">
                <div className="profile-avatar color-blue-avatar">SS</div>
                <div className="profile-info">
                  <h4>Surat S.</h4>
                  <p>Parent of Class 8 Student</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card">
              <div className="quote-sign">“</div>
              <p className="testimonial-text">
                Having access to detailed math chapter checklists and physics formula reference notes right inside my dashboard has saved so much prep time. Scoring a full 10/10 in coordinate geometry has never felt easier!
              </p>
              <div className="testimonial-profile">
                <div className="profile-avatar color-emerald-avatar">AR</div>
                <div className="profile-info">
                  <h4>Ananya Rao</h4>
                  <p>Class 10 Student</p>
                </div>
              </div>
            </div>

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
              <Link to="/register" className="btn-cta btn-white">Create Free Account</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
