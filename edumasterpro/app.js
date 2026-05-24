document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Animate hamburger spans
      const spans = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile menu on clicking links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans.forEach(s => s.style.transform = 'none');
        spans[1].style.opacity = '1';
      });
    });
  }

  // 2. Interactive Search & Real-Time Filter for Subject Cards
  const searchInput = document.getElementById('subjectSearch');
  const searchBtn = document.getElementById('searchBtn');
  const subjectCards = document.querySelectorAll('.subject-card');

  function filterSubjects() {
    const query = searchInput.value.toLowerCase().trim();
    
    subjectCards.forEach(card => {
      const subjectName = card.querySelector('h3').textContent.toLowerCase();
      const subjectDesc = card.querySelector('p').textContent.toLowerCase();
      
      if (subjectName.includes(query) || subjectDesc.includes(query)) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        // Set timeout to hide element after transition completes
        setTimeout(() => {
          if (searchInput.value.toLowerCase().trim() === query && !subjectName.includes(query) && !subjectDesc.includes(query)) {
            card.style.display = 'none';
          }
        }, 150);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterSubjects);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      filterSubjects();
    });
  }

  // 3. Leaderboard Dataset Toggle Simulation
  const mockTabs = document.querySelectorAll('.mock-tab');
  const leaderItems = document.querySelectorAll('.leader-item');

  const leaderboardData = {
    weekly: [
      { name: 'Prasanth Meka', score: '2,840 XP', rank: 1 },
      { name: 'Surat S.', score: '2,610 XP', rank: 2 },
      { name: 'Ananya Rao', score: '2,490 XP', rank: 3 }
    ],
    monthly: [
      { name: 'Suhas Reddy', score: '12,450 XP', rank: 1 },
      { name: 'Prasanth Meka', score: '11,890 XP', rank: 2 },
      { name: 'Surat S.', score: '10,950 XP', rank: 3 }
    ],
    overall: [
      { name: 'Karthik N.', score: '84,300 XP', rank: 1 },
      { name: 'Suhas Reddy', score: '79,150 XP', rank: 2 },
      { name: 'Prasanth Meka', score: '76,400 XP', rank: 3 }
    ]
  };

  mockTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active classes
      mockTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterType = tab.getAttribute('data-tab');
      const selectedData = leaderboardData[filterType];

      // Update leaderboard list items dynamically with nice fade-out-in animation
      leaderItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(4px)';

        setTimeout(() => {
          if (selectedData && selectedData[index]) {
            const data = selectedData[index];
            item.querySelector('.leader-name').textContent = `${data.rank}. ${data.name}`;
            item.querySelector('.leader-score').textContent = data.score;
            
            // Re-fade in
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }
        }, 150);
      });
    });
  });

  // 4. Animate Dashboard Progress Circles on Scroll Entrance
  const progressCircles = document.querySelectorAll('.progress-circle-fill');
  if (progressCircles.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const targetOffset = circle.getAttribute('data-target-offset') || '66';
          circle.style.strokeDashoffset = targetOffset;
          observer.unobserve(circle);
        }
      });
    }, { threshold: 0.5 });
    
    progressCircles.forEach(circle => {
      // Store the initial offset as the target offset, then set to 220 (empty)
      const currentOffset = circle.style.strokeDashoffset || '66';
      circle.setAttribute('data-target-offset', currentOffset);
      circle.style.strokeDashoffset = '220';
      observer.observe(circle);
    });
  }
});
