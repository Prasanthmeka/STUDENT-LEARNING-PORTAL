import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ServicesPage.css';
// Helper function to render modern minimal educational vector SVG icons
const renderSubjectIcon = (subjectName) => {
  switch (subjectName.toLowerCase()) {
    case 'telugu':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="teluguGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="teluguBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f7ff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#teluguBg)"/>
          <path d="M25,65 C35,62 45,65 50,70 C55,65 65,62 75,65 L75,35 C65,32 55,35 50,40 C45,35 35,32 25,35 Z" fill="none" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M50,40 L50,70" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round"/>
          <text x="50" y="58" fontFamily="'Outfit', 'Noto Sans Telugu', sans-serif" fontSize="28" fontWeight="bold" fill="url(#teluguGrad)" textAnchor="middle" alignmentBaseline="middle">అ</text>
        </svg>
      );
    case 'hindi':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="hindiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="hindiBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5f5" />
              <stop offset="100%" stopColor="#ffe3e3" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#hindiBg)"/>
          <path d="M25,65 C35,62 45,65 50,70 C55,65 65,62 75,65 L75,35 C65,32 55,35 50,40 C45,35 35,32 25,35 Z" fill="none" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M50,40 L50,70" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round"/>
          <path d="M68,26 L74,32 L60,46 L54,40 Z" fill="#fca5a5"/>
          <path d="M54,40 L52,44 L56,42 Z" fill="#b91c1c"/>
          <text x="50" y="59" fontFamily="'Outfit', 'Noto Sans Devanagari', sans-serif" fontSize="28" fontWeight="bold" fill="url(#hindiGrad)" textAnchor="middle" alignmentBaseline="middle">अ</text>
        </svg>
      );
    case 'english':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="englishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <linearGradient id="englishBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eef2ff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#englishBg)"/>
          <path d="M30,35 H70 C73,35 75,37 75,40 V60 C75,63 73,65 70,65 H42 L30,73 V65 C27,65 25,63 25,60 V40 C25,37 27,35 30,35 Z" fill="none" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="50" y="55" fontFamily="'Outfit', sans-serif" fontSize="30" fontWeight="800" fill="url(#englishGrad)" textAnchor="middle" alignmentBaseline="middle">A</text>
          <circle cx="62" cy="45" r="2.5" fill="#818cf8"/>
          <circle cx="68" cy="45" r="2.5" fill="#818cf8"/>
        </svg>
      );
    case 'maths':
    case 'mathematics':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="mathsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="mathsBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#mathsBg)"/>
          <line x1="50" y1="20" x2="50" y2="80" stroke="#bae6fd" strokeWidth="2.5" strokeDasharray="4,4" />
          <line x1="20" y1="50" x2="80" y2="50" stroke="#bae6fd" strokeWidth="2.5" strokeDasharray="4,4" />
          <text x="35" y="40" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800" fill="url(#mathsGrad)" textAnchor="middle" alignmentBaseline="middle">+</text>
          <text x="65" y="40" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800" fill="url(#mathsGrad)" textAnchor="middle" alignmentBaseline="middle">×</text>
          <text x="35" y="66" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800" fill="url(#mathsGrad)" textAnchor="middle" alignmentBaseline="middle">÷</text>
          <text x="65" y="66" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800" fill="url(#mathsGrad)" textAnchor="middle" alignmentBaseline="middle">=</text>
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="physicsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#891b79" />
            </linearGradient>
            <linearGradient id="physicsBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faf5ff" />
              <stop offset="100%" stopColor="#f3e8ff" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#physicsBg)"/>
          <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#e9d5ff" strokeWidth="2.5" transform="rotate(30, 50, 50)" />
          <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#e9d5ff" strokeWidth="2.5" transform="rotate(-30, 50, 50)" />
          <ellipse cx="50" cy="50" rx="35" ry="12" fill="none" stroke="#c084fc" strokeWidth="2" transform="rotate(90, 50, 50)" />
          <circle cx="21" cy="33" r="3.5" fill="#a855f7" />
          <circle cx="79" cy="33" r="3.5" fill="#a855f7" />
          <circle cx="50" cy="15" r="3.5" fill="#a855f7" />
          <circle cx="50" cy="50" r="8" fill="url(#physicsGrad)" />
          <circle cx="47" cy="47" r="4" fill="#f3e8ff" opacity="0.3"/>
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="chemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="chemBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="100%" stopColor="#ffedd5" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#chemBg)"/>
          <path d="M44,25 H56 V38 L72,66 C75,71 71,76 65,76 H35 C29,76 25,71 28,66 L44,38 Z" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M31.2,66 L41,49 H59 L68.8,66 C70.2,68.5 68.4,71.5 65.5,71.5 H34.5 C31.6,71.5 29.8,68.5 31.2,66 Z" fill="url(#chemGrad)"/>
          <circle cx="50" cy="35" r="3" fill="#fb923c"/>
          <circle cx="45" cy="28" r="2.5" fill="#f97316"/>
          <circle cx="56" cy="30" r="2" fill="#fb923c"/>
          <circle cx="48" cy="58" r="2.5" fill="#ffffff" opacity="0.7"/>
          <circle cx="53" cy="63" r="3.5" fill="#ffffff" opacity="0.6"/>
        </svg>
      );
    case 'biology':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="bioGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="bioBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#bioBg)"/>
          <path d="M35,25 C45,35 55,35 65,25 M35,45 C45,55 55,55 65,45 M35,65 C45,75 55,75 65,65" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round"/>
          <path d="M65,35 C55,45 45,45 35,35 M65,55 C55,65 45,65 35,55 M65,75 C55,85 45,85 35,75" fill="none" stroke="url(#bioGrad)" strokeWidth="3" strokeLinecap="round"/>
          <line x1="43" y1="33" x2="57" y2="33" stroke="#34d399" strokeWidth="2.5"/>
          <line x1="43" y1="53" x2="57" y2="53" stroke="#34d399" strokeWidth="2.5"/>
          <line x1="43" y1="73" x2="57" y2="73" stroke="#059669" strokeWidth="2.5"/>
        </svg>
      );
    case 'social studies':
    case 'social':
      return (
        <svg viewBox="0 0 100 100" width="80" height="80" style={{ display: 'inline-block' }}>
          <defs>
            <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="socialBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdfa" />
              <stop offset="100%" stopColor="#ccfbf1" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="24" fill="url(#socialBg)"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="#99f6e4" strokeWidth="3"/>
          <path d="M22,50 H78" stroke="#99f6e4" stroke-width="2.5"/>
          <path d="M50,22 V78" stroke="#99f6e4" stroke-width="2.5"/>
          <path d="M28,34 C40,40 40,60 28,66" fill="none" stroke="#99f6e4" stroke-width="2.5"/>
          <path d="M72,34 C60,40 60,60 72,66" fill="none" stroke="#99f6e4" stroke-width="2.5"/>
          <path d="M50,30 C45,30 42,33 42,37 C42,42 50,49 50,49 C50,49 58,42 58,37 C58,33 55,30 50,30 Z" fill="url(#socialGrad)"/>
          <circle cx="50" cy="36" r="2.5" fill="#ffffff"/>
        </svg>
      );
    default:
      return null;
  }
};

function ServicesPage() {
  const subjects = [
    {
      id: 1,
      name: 'Telugu',
      icon: '📖',
      description: 'Master Telugu grammar, prose, poetry readings, and comprehensive textual analysis.',
      color: '#525fe1'
    },
    {
      id: 2,
      name: 'Hindi',
      icon: '🗣️',
      description: 'Excel in Hindi communication, vocabulary, essential grammar rules, and text lessons.',
      color: '#f26b65'
    },
    {
      id: 3,
      name: 'English',
      icon: '🇬🇧',
      description: 'Strengthen reading comprehension, creative writing tasks, grammar, and literary works.',
      color: '#57216c'
    },
    {
      id: 4,
      name: 'Maths',
      icon: '🔢',
      description: 'Explore algebraic equations, complex arithmetic, coordinate systems, and geometry.',
      color: '#448bb7'
    },
    {
      id: 5,
      name: 'Physics',
      icon: '⚛️',
      description: 'Dive deep into mechanics, light refraction, electrical currents, and structural forces.',
      color: '#525fe1'
    },
    {
      id: 6,
      name: 'Chemistry',
      icon: '🧪',
      description: 'Examine chemical formulas, atomic compounds, state equations, and periodic tables.',
      color: '#f26b65'
    },
    {
      id: 7,
      name: 'Biology',
      icon: '🧬',
      description: 'Understand bio-cell structures, human physiology, plant systems, and genetic codes.',
      color: '#57216c'
    },
    {
      id: 8,
      name: 'Social Studies',
      icon: '🌍',
      description: 'Navigate global geography, ancient and modern world history, civic rules, and economics.',
      color: '#448bb7'
    }
  ];

  return (
    <div className="services-page-wrapper">
      
      {/* Premium Header Banner using Eduleb's section-top style */}
      <section className="section-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1 col-12 text-center">
              <div className="section-top-title">
                <h1 style={{ color: '#ffffff', fontSize: '48px', fontWeight: '800', fontFamily: '"Jost", sans-serif' }}>
                  Our Syllabus & Subjects
                </h1>
                <p style={{ color: '#ebecff', fontSize: '18px', marginTop: '15px', fontWeight: '500', lineHeight: '28px', maxWidth: '650px', margin: '15px auto 0' }}>
                  We offer a complete, thoroughly structured digital syllabus for Classes 6-10 mapped to state board and CBSE guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Subjects Showcase Section */}
      <section className="services-list-section section-padding" style={{ background: '#f8f9fc' }}>
        <div className="container">
          <div className="section-title text-center">
            <h2>Select a <b>Subject</b> to Begin</h2>
            <p>Each subject contains byte-sized video explanations, chapter resources, study notes, and self-assessments.</p>
          </div>

          <div className="row mt-5">
            {subjects.map((subject) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={subject.id}>
                <div className="single_tp text-center h-100 d-flex flex-column justify-content-between p-4" style={{ borderTop: `4px solid ${subject.color}` }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      {renderSubjectIcon(subject.name)}
                    </div>
                    <span className="badge-class" style={{ background: '#eef1ff', color: '#525fe1', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block', marginBottom: '15px' }}>
                      Class 6-10
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#0b104a', marginBottom: '15px' }}>
                      {subject.name}
                    </h3>
                    <p style={{ fontSize: '15px', color: '#6d7193', lineHeight: '24px', marginBottom: '25px' }}>
                      {subject.description}
                    </p>
                  </div>
                  
                  <div className="service-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <Link 
                      to="/login" 
                      className="btn_one flex-fill text-center" 
                      style={{ fontSize: '13px', padding: '12px 10px', textDecoration: 'none', background: subject.color, borderColor: subject.color }}
                    >
                      Study Videos
                    </Link>
                    <Link 
                      to="/login" 
                      className="btn_one flex-fill text-center" 
                      style={{ fontSize: '13px', padding: '12px 10px', textDecoration: 'none', background: '#0b104a', borderColor: '#0b104a', boxShadow: 'none' }}
                    >
                      Materials
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="section-padding" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-12">
              <div className="newsletter-form text-center" style={{ background: '#525fe1', padding: '60px 30px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '32px', color: '#ffffff', marginBottom: '15px', fontWeight: '700' }}>
                  Unlock Full Academic Support
                </h4>
                <p style={{ color: '#ebecff', fontSize: '18px', marginBottom: '35px' }}>
                  Register a free account now to access all interactive worksheets and track your course score on the Leaderboard.
                </p>
                <Link 
                  to="/register" 
                  className="btn_one" 
                  style={{ background: '#ffffff', color: '#525fe1', border: 'none', padding: '16px 45px', fontSize: '18px', borderRadius: '100px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
                >
                  Create Student Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default ServicesPage;
