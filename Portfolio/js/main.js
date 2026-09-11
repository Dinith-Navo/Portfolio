/**
 * DINITH NAVODYA - PERSONAL PORTFOLIO INTERACTIVE LOGIC
 * Role: Intern Project Manager / IT Undergraduate
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 0. Audio Feedback System (Web Audio API Synthesizer)
  // --------------------------------------------------------------------------
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('dinith_sound_fx') === 'true';
      this.updateIcons();
    }

    initCtx() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playClick(freq = 600, duration = 0.03, type = 'sine') {
      if (!this.enabled) return;
      try {
        this.initCtx();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {}
    }

    playSuccess() {
      if (!this.enabled) return;
      this.playClick(659, 0.05, 'triangle');
      setTimeout(() => this.playClick(880, 0.08, 'triangle'), 60);
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('dinith_sound_fx', this.enabled ? 'true' : 'false');
      this.updateIcons();
      if (this.enabled) {
        this.playSuccess();
        showToast('Audio Feedback Enabled', 'info');
      } else {
        showToast('Audio Feedback Muted', 'info');
      }
      return this.enabled;
    }

    updateIcons() {
      const soundToggleBtn = document.getElementById('sound-toggle');
      if (!soundToggleBtn) return;
      const offIcon = soundToggleBtn.querySelector('.fa-volume-xmark');
      const onIcon = soundToggleBtn.querySelector('.fa-volume-high');

      if (this.enabled) {
        if (offIcon) offIcon.style.display = 'none';
        if (onIcon) onIcon.style.display = 'block';
        soundToggleBtn.classList.add('sound-active');
      } else {
        if (offIcon) offIcon.style.display = 'block';
        if (onIcon) onIcon.style.display = 'none';
        soundToggleBtn.classList.remove('sound-active');
      }
    }
  }

  const sfx = new SoundFX();
  const soundToggleBtn = document.getElementById('sound-toggle');
  if (soundToggleBtn) soundToggleBtn.addEventListener('click', () => sfx.toggle());

  // --------------------------------------------------------------------------
  // 1. Theme Management (Dark / Light Mode)
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('dinith_portfolio_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      sfx.playClick(540, 0.04);
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
    });
  }

  function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('dinith_portfolio_theme', theme);
  }

  // --------------------------------------------------------------------------
  // 2. Reading Progress Bar & Header Scroll Styling
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');
  const siteHeader = document.getElementById('header');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (siteHeader) {
      if (scrollTop > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    highlightActiveNavLink();
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 3. Scroll Spy Navigation Highlight
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightActiveNavLink() {
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. Mobile Navigation Menu Toggle
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. Dynamic Typewriter Effect for Hero
  // --------------------------------------------------------------------------
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const phrases = JSON.parse(typingElement.getAttribute('data-phrases') || '[]');
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 90;
    const deleteSpeed = 45;
    const holdTime = 1800;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        speed = holdTime;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 300;
      }

      setTimeout(typeLoop, speed);
    }

    if (phrases.length > 0) {
      setTimeout(typeLoop, 500);
    }
  }

  // --------------------------------------------------------------------------
  // 6. Metrics Animated Counters
  // --------------------------------------------------------------------------
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500;
          const frameDuration = 1000 / 60;
          const totalFrames = Math.round(duration / frameDuration);
          let frame = 0;

          const counterInterval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentVal = Math.round(target * easeOutQuad(progress));

            counter.textContent = currentVal;

            if (frame === totalFrames) {
              counter.textContent = target;
              clearInterval(counterInterval);
            }
          }, frameDuration);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  const metricsSection = document.querySelector('.hero-metrics-container');
  if (metricsSection) {
    counterObserver.observe(metricsSection);
  }

  function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  // --------------------------------------------------------------------------
  // 7. Project Category Filtering
  // --------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 8. Project Details Modal (Agile Case Studies)
  // --------------------------------------------------------------------------
  const projectModal = document.getElementById('project-modal');
  const projectModalContent = document.getElementById('project-modal-content');
  const closeProjectModalBtn = document.getElementById('close-project-modal');

  // Rich Case Study Details for the 4 Academic Projects
  const projectData = {
    hotel: {
      title: 'Hotel Booking Management System',
      subtitle: 'Hospitality Operations & Guest Reservation Portal',
      role: 'Project Manager / Full Stack Developer',
      duration: 'Oct 2025 – Present (Active)',
      image: 'assets/images/hotel.jpg',
      summary: 'An enterprise-grade hotel management application built to automate reservation scheduling, room inventory availability matrices, customer billing, and live occupancy analytics.',
      pmOverview: [
        { label: 'Methodology', value: 'Agile Scrum (2-week sprint cadence)' },
        { label: 'Backlog & Governance', value: 'Jira board with User Stories, epics & acceptance criteria' },
        { label: 'Architecture', value: 'Full Stack Web Architecture & REST APIs' },
        { label: 'Core Tools', value: 'Jira, Microsoft Excel, Git, Full Stack Web' }
      ],
      deliverables: [
        'Structured 8 core user epics covering Guest Onboarding, Room Calendar, Reservation Engine, and Invoicing.',
        'Facilitated sprint planning, daily progress tracking, and burndown reviews across developer team members.',
        'Engineered an interactive room matrix displaying live occupancy status (Available, Occupied, Maintenance).',
        'Maintained structured sprint documentation and stakeholder demonstration presentations.'
      ]
    },
    vehicle: {
      title: 'Vehicle Rental Management System',
      subtitle: 'Fleet Scheduling & Customer Reservation Platform',
      role: 'Project Manager / Full Stack Developer',
      duration: 'Feb 2025 – May 2025',
      image: 'assets/images/vehicle.jpg',
      summary: 'A unified logistics and fleet management platform delivering real-time vehicle booking, dynamic pricing calculations, driver assignments, and vehicle maintenance monitoring.',
      pmOverview: [
        { label: 'Methodology', value: 'Agile & Milestone-Driven Delivery' },
        { label: 'Tracking Tool', value: 'ClickUp for tasks, subtasks & Gantt timeline charts' },
        { label: 'System Type', value: 'Enterprise CRUD & Database Management' },
        { label: 'Key Outcome', value: 'Delivered all functional modules on schedule with 100% test coverage' }
      ],
      deliverables: [
        'Coordinated project work breakdown structure (WBS) and allocated deliverables between frontend and backend modules.',
        'Tracked project dependencies, roadmaps, and milestones through ClickUp sprint dashboards.',
        'Designed database schema and relational tables for vehicle catalogs, pricing tiers, and client contracts.',
        'Produced comprehensive user manual and system administration technical documentation.'
      ]
    },
    foodie: {
      title: 'Social Media Platform for Food Enthusiasts',
      subtitle: 'Culinary Community & Interactive Recipe Platform',
      role: 'Project Manager / Full Stack Developer',
      duration: 'Feb 2025 – May 2025',
      image: 'assets/images/foodie.jpg',
      summary: 'A vibrant social platform tailored for passionate home cooks and culinary creators to share step-by-step recipes, engage via nested comments and community reviews, and bookmark curated meal plans.',
      pmOverview: [
        { label: 'Methodology', value: 'User-Centered Agile Development' },
        { label: 'Task Management', value: 'Jira Software & Confluence project documentation' },
        { label: 'Focus Area', value: 'High-responsiveness UI/UX & real-time user engagement' },
        { label: 'PM Rigor', value: 'Prioritized feature backlog based on MoSCoW prioritization' }
      ],
      deliverables: [
        'Spearheaded user story mapping to define high-impact features (recipe cards, search tags, chef follow system).',
        'Bridged UI design and full-stack implementation, ensuring cross-device consistency and responsive fidelity.',
        'Conducted sprint retrospective meetings to identify code bottlenecks and improve delivery throughput.',
        'Monitored risk register to ensure timely media storage integration and reliable database queries.'
      ]
    },
    cinema: {
      title: 'Cinema Management System',
      subtitle: 'Box Office Administration & Seating Allocation Engine',
      role: 'Project Manager / Full Stack Developer',
      duration: 'July 2024 – Nov 2024',
      image: 'assets/images/cinema.jpg',
      summary: 'A comprehensive cinema ticketing system featuring real-time theater seat reservation grids, multi-hall movie schedule coordinators, dynamic ticket pricing, and box office sales analytics.',
      pmOverview: [
        { label: 'Methodology', value: 'Iterative SDLC & Agile Ceremonies' },
        { label: 'Project Tracking', value: 'ClickUp & Microsoft Excel progress trackers' },
        { label: 'Key Feature', value: 'Interactive Hall Map with real-time seat lock state' },
        { label: 'Documentation', value: 'Comprehensive SRS (Software Requirements Specification) & MoMs' }
      ],
      deliverables: [
        'Formulated Software Requirements Specification (SRS) and architecture diagrams during project inception.',
        'Organized weekly stand-ups, maintained Minutes of Meeting (MoMs), and resolved team blockers.',
        'Implemented the interactive theater seat selection layout with intuitive booking status indicators.',
        'Delivered final system demonstration to academic evaluators with full technical and PM documentation.'
      ]
    }
  };

  const projectKeys = ['hotel', 'vehicle', 'foodie', 'cinema'];
  let activeProjectKey = 'hotel';

  function renderProjectModal(projKey) {
    activeProjectKey = projKey;
    const data = projectData[projKey];
    if (!data || !projectModalContent) return;

    const currentIndex = projectKeys.indexOf(projKey);
    const prevKey = projectKeys[(currentIndex - 1 + projectKeys.length) % projectKeys.length];
    const nextKey = projectKeys[(currentIndex + 1) % projectKeys.length];

    projectModalContent.innerHTML = `
      <div class="modal-project-view">
        <!-- Top Carousel Navigation Bar -->
        <div class="modal-proj-nav-bar">
          <button type="button" class="modal-proj-nav-btn btn-proj-nav" data-target="${prevKey}" title="Previous Project: ${projectData[prevKey].title}">
            <i class="fa-solid fa-chevron-left"></i> <span>Previous</span>
          </button>
          <div class="modal-proj-counter">
            <span>Project ${currentIndex + 1} of ${projectKeys.length}</span>
          </div>
          <button type="button" class="modal-proj-nav-btn btn-proj-nav" data-target="${nextKey}" title="Next Project: ${projectData[nextKey].title}">
            <span>Next</span> <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div class="modal-proj-hero">
          <img src="${data.image}" alt="${data.title}">
        </div>

        <div class="modal-proj-header">
          <div>
            <h3 class="modal-proj-title" id="modal-project-title">${data.title}</h3>
            <p class="modal-proj-desc" style="color: var(--primary); font-weight: 600;">${data.subtitle}</p>
          </div>
          <span class="modal-proj-role"><i class="fa-solid fa-user-tie"></i> ${data.role}</span>
        </div>

        <p class="modal-proj-desc">${data.summary}</p>

        <div class="modal-pm-grid">
          ${data.pmOverview.map(item => `
            <div class="modal-pm-item">
              <h5>${item.label}</h5>
              <p><strong>${item.value}</strong></p>
            </div>
          `).join('')}
        </div>

        <div>
          <h4 class="modal-section-title"><i class="fa-solid fa-clipboard-check" style="color: var(--primary);"></i> Project Manager Key Deliverables:</h4>
          <ul class="modal-proj-bullets">
            ${data.deliverables.map(d => `
              <li><i class="fa-solid fa-circle-chevron-right"></i> <span>${d}</span></li>
            `).join('')}
          </ul>
        </div>

        <!-- Project Switcher Dot Indicator -->
        <div class="modal-proj-pills" role="tablist" aria-label="Project switcher indicators">
          ${projectKeys.map((k, idx) => `
            <button type="button" class="modal-proj-pill btn-proj-nav ${k === projKey ? 'active' : ''}" data-target="${k}" title="${projectData[k].title}" aria-label="Go to project ${idx + 1}"></button>
          `).join('')}
        </div>
      </div>
    `;

    // Wire up carousel navigation buttons
    projectModalContent.querySelectorAll('.btn-proj-nav').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-target');
        if (target) {
          sfx.playClick(680, 0.03);
          renderProjectModal(target);
        }
      });
    });
  }

  document.querySelectorAll('.project-modal-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      sfx.playClick(600, 0.03);
      const projKey = btn.getAttribute('data-project') || 'hotel';
      renderProjectModal(projKey);
      openModal(projectModal);
    });
  });

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', () => {
      sfx.playClick(480, 0.03);
      closeModal(projectModal);
    });
  }

  // Keyboard navigation for project carousel (Left / Right arrow keys)
  document.addEventListener('keydown', (e) => {
    if (projectModal && projectModal.classList.contains('open')) {
      if (e.key === 'ArrowLeft') {
        const curIdx = projectKeys.indexOf(activeProjectKey);
        const prevKey = projectKeys[(curIdx - 1 + projectKeys.length) % projectKeys.length];
        sfx.playClick(620, 0.03);
        renderProjectModal(prevKey);
      } else if (e.key === 'ArrowRight') {
        const curIdx = projectKeys.indexOf(activeProjectKey);
        const nextKey = projectKeys[(curIdx + 1) % projectKeys.length];
        sfx.playClick(720, 0.03);
        renderProjectModal(nextKey);
      }
    }
  });

  // --------------------------------------------------------------------------
  // 9. References Request Modal
  // --------------------------------------------------------------------------
  const refModal = document.getElementById('reference-modal');
  const closeRefModalBtn = document.getElementById('close-ref-modal');
  const modalRefName = document.getElementById('modal-ref-name');
  const refMailtoLink = document.getElementById('ref-mailto-link');

  document.querySelectorAll('.request-ref-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const refName = btn.getAttribute('data-ref-name') || 'the referee';
      if (modalRefName) modalRefName.textContent = refName;

      if (refMailtoLink) {
        const subject = encodeURIComponent(`Reference Contact Request — Dinith Navodya (${refName})`);
        const body = encodeURIComponent(`Dear Dinith,\n\nI am reviewing your profile for an opportunity and would like to request the direct contact details and endorsement for ${refName}.\n\nBest regards,\n[Your Name]\n[Your Company / Organization]`);
        refMailtoLink.setAttribute('href', `mailto:dinithnavodya12@gmail.com?subject=${subject}&body=${body}`);
      }

      openModal(refModal);
    });
  });

  if (closeRefModalBtn) {
    closeRefModalBtn.addEventListener('click', () => closeModal(refModal));
  }

  // --------------------------------------------------------------------------
  // 10. Resume / CV Preview Modal & Printing
  // --------------------------------------------------------------------------
  const cvModal = document.getElementById('cv-modal');
  const closeCvModalBtn = document.getElementById('close-cv-modal');
  const printCvBtn = document.getElementById('cv-print-btn');

  const cvTriggers = [
    document.getElementById('nav-cv-btn'),
    document.getElementById('hero-preview-cv'),
    document.getElementById('contact-view-cv-btn')
  ];

  cvTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(cvModal);
      });
    }
  });

  // CV Tabs: Official PDF View vs Printable Sheet
  const tabPdfBtn = document.getElementById('tab-pdf-btn');
  const tabSheetBtn = document.getElementById('tab-sheet-btn');
  const cvPdfContainer = document.getElementById('cv-pdf-container');
  const cvPrintableContent = document.getElementById('cv-printable-content');

  if (tabPdfBtn && tabSheetBtn && cvPdfContainer && cvPrintableContent) {
    tabPdfBtn.addEventListener('click', () => {
      tabPdfBtn.classList.add('active');
      tabPdfBtn.setAttribute('aria-selected', 'true');
      tabSheetBtn.classList.remove('active');
      tabSheetBtn.setAttribute('aria-selected', 'false');
      cvPdfContainer.style.display = 'block';
      cvPrintableContent.style.display = 'none';
    });

    tabSheetBtn.addEventListener('click', () => {
      tabSheetBtn.classList.add('active');
      tabSheetBtn.setAttribute('aria-selected', 'true');
      tabPdfBtn.classList.remove('active');
      tabPdfBtn.setAttribute('aria-selected', 'false');
      cvPdfContainer.style.display = 'none';
      cvPrintableContent.style.display = 'block';
    });
  }

  if (closeCvModalBtn) {
    closeCvModalBtn.addEventListener('click', () => closeModal(cvModal));
  }

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => {
      if (cvPrintableContent) cvPrintableContent.style.display = 'block';
      window.print();
    });
  }

  // Modal Generic Helpers
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Close modals on backdrop click or ESC key
  [projectModal, refModal, cvModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [projectModal, refModal, cvModal].forEach(modal => {
        if (modal && modal.classList.contains('open')) {
          closeModal(modal);
        }
      });
    }
  });

  // --------------------------------------------------------------------------
  // 11. Copy to Clipboard Functionality
  // --------------------------------------------------------------------------
  const copyElements = document.querySelectorAll('[data-copy]');

  copyElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const textToCopy = el.getAttribute('data-copy');
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        sfx.playClick(840, 0.04);
        showToast(`Copied to clipboard: ${textToCopy}`, 'success');
      }).catch(() => {
        // Fallback for clipboard API
        const tempInput = document.createElement('input');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        sfx.playClick(840, 0.04);
        showToast(`Copied: ${textToCopy}`, 'success');
      });
    });
  });

  // --------------------------------------------------------------------------
  // 12. Contact Form Handling & Validation
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-current');
  const submitBtn = document.getElementById('submit-btn');

  // Character Counter
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = messageInput.value.length;
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');

      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const subjectError = document.getElementById('subject-error');
      const messageError = document.getElementById('message-error');

      // Reset errors
      [nameError, emailError, subjectError, messageError].forEach(err => {
        if (err) err.textContent = '';
      });

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        nameError.textContent = 'Please provide your full name (at least 2 characters).';
        isValid = false;
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please provide a valid email address.';
        isValid = false;
      }

      // Validate Subject
      if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
        subjectError.textContent = 'Please enter a subject.';
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        messageError.textContent = 'Message should be at least 10 characters long.';
        isValid = false;
      }

      if (!isValid) return;

      // Simulate sending state
      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
          contactForm.reset();
          if (charCounter) charCounter.textContent = '0';
          sfx.playSuccess();
          showToast('Thank you! Your message has been sent successfully. Dinith will reply promptly.', 'success');
        }, 1200);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 13. Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${icon} toast-icon"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3800);
  }

  // --------------------------------------------------------------------------
  // 14. Current Year in Footer
  // --------------------------------------------------------------------------
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 16. Interactive Particle Canvas Background
  // --------------------------------------------------------------------------
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const particleCount = Math.min(Math.floor(window.innerWidth / 24), 60);
    const particles = [];
    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = (Math.random() - 0.5) * 0.6;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        // Mouse avoidance
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * 2;
            this.y -= (dy / distance) * force * 2;
          }
        }
      }

      draw() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? 'rgba(45, 212, 191, 0.45)' : 'rgba(15, 118, 110, 0.35)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const lineColor = isDark ? 'rgba(45, 212, 191,' : 'rgba(15, 118, 110,';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            const opacity = 1 - distance / 110;
            ctx.strokeStyle = `${lineColor} ${opacity * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // --------------------------------------------------------------------------
  // 17. Interactive Agile Kanban Workbench Simulator
  // --------------------------------------------------------------------------
  const kanbanCards = document.querySelectorAll('.kanban-task-card');
  const kanbanColumns = document.querySelectorAll('.kanban-column');
  const burnedPtsEl = document.getElementById('wb-burned-pts');
  const velocityEl = document.getElementById('wb-velocity');
  const sprintProjectSelect = document.getElementById('sprint-project-select');
  const columnStatuses = ['backlog', 'progress', 'review', 'done'];
  let draggedCard = null;

  function initKanbanControls() {
    // 1. Drag & Drop Handlers
    document.querySelectorAll('.kanban-task-card').forEach(card => {
      card.setAttribute('draggable', 'true');

      card.ondragstart = () => {
        draggedCard = card;
        setTimeout(() => (card.style.opacity = '0.5'), 0);
      };

      card.ondragend = () => {
        if (draggedCard) draggedCard.style.opacity = '1';
        draggedCard = null;
        updateKanbanCountsAndVelocity();
        updateShiftButtonsState();
      };
    });

    kanbanColumns.forEach(column => {
      column.ondragover = (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
      };

      column.ondragleave = () => {
        column.classList.remove('drag-over');
      };

      column.ondrop = (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');
        if (draggedCard) {
          const list = column.querySelector('.kanban-cards-list');
          if (list) {
            list.appendChild(draggedCard);
            draggedCard.classList.remove('card-shifted');
            void draggedCard.offsetWidth;
            draggedCard.classList.add('card-shifted');
            sfx.playClick(720, 0.04);
            updateKanbanCountsAndVelocity();
            updateShiftButtonsState();
            const colTitle = column.querySelector('.col-title')?.textContent || 'column';
            showToast(`Task moved to ${colTitle}`, 'info');
          }
        }
      };
    });

    // 2. Click-to-Shift Arrow Button Handlers
    document.querySelectorAll('.btn-shift-col').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const card = btn.closest('.kanban-task-card');
        const currentCol = card?.closest('.kanban-column');
        if (!card || !currentCol) return;

        const currentStatus = currentCol.getAttribute('data-status');
        const currentIndex = columnStatuses.indexOf(currentStatus);
        const isNext = btn.classList.contains('btn-shift-next');

        const targetIndex = isNext ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= columnStatuses.length) return;

        const targetStatus = columnStatuses[targetIndex];
        const targetCol = document.querySelector(`.kanban-column[data-status="${targetStatus}"]`);
        const targetList = targetCol?.querySelector('.kanban-cards-list');

        if (targetList) {
          targetList.appendChild(card);
          card.classList.remove('card-shifted');
          void card.offsetWidth;
          card.classList.add('card-shifted');
          sfx.playClick(isNext ? 750 : 580, 0.04);
          updateKanbanCountsAndVelocity();
          updateShiftButtonsState();
          const targetTitle = targetCol.querySelector('.col-title')?.textContent || targetStatus;
          showToast(`Task moved to ${targetTitle}`, 'info');
        }
      };
    });

    updateShiftButtonsState();
  }

  function updateShiftButtonsState() {
    kanbanColumns.forEach(col => {
      const status = col.getAttribute('data-status');
      const isFirst = status === 'backlog';
      const isLast = status === 'done';

      col.querySelectorAll('.kanban-task-card').forEach(card => {
        const prevBtn = card.querySelector('.btn-shift-prev');
        const nextBtn = card.querySelector('.btn-shift-next');
        if (prevBtn) prevBtn.disabled = isFirst;
        if (nextBtn) nextBtn.disabled = isLast;
      });
    });
  }

  function updateKanbanCountsAndVelocity() {
    let burnedPoints = 0;
    const totalPoints = 42;

    kanbanColumns.forEach(col => {
      const status = col.getAttribute('data-status');
      const cards = col.querySelectorAll('.kanban-task-card');
      const countEl = document.getElementById(`count-${status}`);
      if (countEl) countEl.textContent = cards.length;

      if (status === 'done') {
        cards.forEach(card => {
          burnedPoints += parseInt(card.getAttribute('data-pts') || '0', 10);
        });
      }
    });

    if (burnedPtsEl) burnedPtsEl.textContent = burnedPoints;
    if (velocityEl) {
      const percent = Math.min(100, Math.round((burnedPoints / totalPoints) * 100));
      velocityEl.textContent = `${percent}% (${percent >= 80 ? 'On Schedule' : 'Needs Focus'})`;
      velocityEl.className = percent >= 80 ? 'wb-kpi-value success' : 'wb-kpi-value highlight';
    }
  }

  initKanbanControls();

  // Project Switcher for Kanban
  if (sprintProjectSelect) {
    sprintProjectSelect.addEventListener('change', () => {
      sfx.playClick(620, 0.03);
      const proj = sprintProjectSelect.value;
      const sprintGoal = document.getElementById('wb-sprint-goal');

      if (proj === 'vehicle') {
        if (sprintGoal) sprintGoal.textContent = 'Fleet Pricing Engine & Dynamic Booking Schedule';
        loadVehicleTasks();
      } else {
        if (sprintGoal) sprintGoal.textContent = 'Room Availability Engine & Live Calendar Sync';
        loadHotelTasks();
      }
      initKanbanControls();
      updateKanbanCountsAndVelocity();
    });
  }

  function loadHotelTasks() {
    const listBacklog = document.getElementById('list-backlog');
    const listProgress = document.getElementById('list-progress');
    const listReview = document.getElementById('list-review');
    const listDone = document.getElementById('list-done');

    if (listBacklog) {
      listBacklog.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-1" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-104</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Payment gateway webhook reconciliation</h5>
          <div class="task-bottom"><span class="task-priority priority-med">Medium</span><span class="task-assignee">FullStack</span></div>
        </div>
        <div class="kanban-task-card" draggable="true" data-id="task-2" data-pts="3">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-105</span><span class="task-pts">3 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Automated booking cancellation invoice flow</h5>
          <div class="task-bottom"><span class="task-priority priority-low">Low</span><span class="task-assignee">Backend</span></div>
        </div>
      `;
    }
    if (listProgress) {
      listProgress.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-3" data-pts="8">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-102</span><span class="task-pts">8 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Real-time room availability matrix grid</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Dinith / Dev</span></div>
        </div>
        <div class="kanban-task-card" draggable="true" data-id="task-4" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-103</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Reservation conflict lock mechanism</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Database</span></div>
        </div>
      `;
    }
    if (listReview) {
      listReview.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-5" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-101</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Guest multi-step checkout form validation</h5>
          <div class="task-bottom"><span class="task-priority priority-med">Medium</span><span class="task-assignee">QA Squad</span></div>
        </div>
      `;
    }
    if (listDone) {
      listDone.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-6" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-098</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">User authentication & role authorization</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Complete</span></div>
        </div>
        <div class="kanban-task-card" draggable="true" data-id="task-7" data-pts="8">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-099</span><span class="task-pts">8 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Jira sprint workflow and team backlog setup</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Dinith (PM)</span></div>
        </div>
        <div class="kanban-task-card" draggable="true" data-id="task-8" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">HOTEL-100</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Relational database schema for room suites</h5>
          <div class="task-bottom"><span class="task-priority priority-med">Medium</span><span class="task-assignee">Complete</span></div>
        </div>
      `;
    }
  }

  function loadVehicleTasks() {
    const listBacklog = document.getElementById('list-backlog');
    const listProgress = document.getElementById('list-progress');
    const listReview = document.getElementById('list-review');
    const listDone = document.getElementById('list-done');

    if (listBacklog) {
      listBacklog.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-v1" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">FLEET-401</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">GPS telematics data sync pipeline</h5>
          <div class="task-bottom"><span class="task-priority priority-low">Low</span><span class="task-assignee">IoT Team</span></div>
        </div>
      `;
    }
    if (listProgress) {
      listProgress.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-v2" data-pts="8">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">FLEET-388</span><span class="task-pts">8 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Dynamic seasonal pricing algorithm</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Dinith / Eng</span></div>
        </div>
      `;
    }
    if (listReview) {
      listReview.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-v3" data-pts="5">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">FLEET-385</span><span class="task-pts">5 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Driver license OCR verification module</h5>
          <div class="task-bottom"><span class="task-priority priority-med">Medium</span><span class="task-assignee">QA Review</span></div>
        </div>
      `;
    }
    if (listDone) {
      listDone.innerHTML = `
        <div class="kanban-task-card" draggable="true" data-id="task-v4" data-pts="8">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">FLEET-370</span><span class="task-pts">8 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">Fleet maintenance schedule & alerts</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Complete</span></div>
        </div>
        <div class="kanban-task-card" draggable="true" data-id="task-v5" data-pts="8">
          <div class="task-top">
            <div class="task-key-group"><span class="task-key">FLEET-372</span><span class="task-pts">8 SP</span></div>
            <div class="task-col-shifts">
              <button type="button" class="btn-shift-col btn-shift-prev" title="Move task left" aria-label="Move left"><i class="fa-solid fa-chevron-left"></i></button>
              <button type="button" class="btn-shift-col btn-shift-next" title="Move task right" aria-label="Move right"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
          <h5 class="task-title">ClickUp sprint milestone roadmapping</h5>
          <div class="task-bottom"><span class="task-priority priority-high">High</span><span class="task-assignee">Dinith (PM)</span></div>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 18. Skills Category Filtering
  // --------------------------------------------------------------------------
  const quickFilterBtns = document.querySelectorAll('.quick-filter-btn');
  const skillCards = document.querySelectorAll('.bento-card, .skill-category-card');
  const skillsMatrixGrid = document.getElementById('skills-matrix-grid');

  quickFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playClick(620, 0.03);
      quickFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const cat = btn.getAttribute('data-filter');

      if (skillsMatrixGrid) {
        if (cat === 'all') {
          skillsMatrixGrid.classList.remove('single-col');
        } else {
          skillsMatrixGrid.classList.add('single-col');
        }
      }

      skillCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 19. Command Palette (Ctrl + K) Modal System
  // --------------------------------------------------------------------------
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdResultsList = document.getElementById('cmd-results-list');
  const cmdPaletteBtn = document.getElementById('cmd-palette-btn');

  const commands = [
    { title: 'Download Official Resume PDF', group: 'Actions', icon: 'fa-file-arrow-down', shortcut: 'PDF', action: () => {
      const a = document.createElement('a');
      a.href = 'assets/resume.pdf';
      a.download = 'Dinith_Navodya_Resume.pdf';
      a.click();
      showToast('Downloading Dinith Navodya Resume...', 'success');
    }},
    { title: 'Preview Resume Modal', group: 'Actions', icon: 'fa-eye', shortcut: 'CV', action: () => openModal(cvModal) },
    { title: 'Toggle Dark / Light Theme', group: 'Actions', icon: 'fa-circle-half-stroke', shortcut: 'T', action: () => themeToggleBtn?.click() },
    { title: 'Copy Email Address', group: 'Actions', icon: 'fa-envelope', shortcut: 'COPY', action: () => {
      navigator.clipboard.writeText('dinithnavodya12@gmail.com');
      showToast('Email copied to clipboard!', 'success');
    }},
    { title: 'Copy Phone Number', group: 'Actions', icon: 'fa-phone', shortcut: 'COPY', action: () => {
      navigator.clipboard.writeText('+94711609534');
      showToast('Phone number copied to clipboard!', 'success');
    }},
    { title: 'Jump to About Profile', group: 'Navigation', icon: 'fa-user', shortcut: 'G A', action: () => scrollToId('about') },
    { title: 'Jump to Experience Timeline', group: 'Navigation', icon: 'fa-briefcase', shortcut: 'G E', action: () => scrollToId('experience') },
    { title: 'Jump to Projects & Agile Kanban', group: 'Navigation', icon: 'fa-cubes', shortcut: 'G P', action: () => scrollToId('projects') },
    { title: 'Jump to Skills Matrix', group: 'Navigation', icon: 'fa-sliders', shortcut: 'G S', action: () => scrollToId('skills') },
    { title: 'Jump to Scrum Ceremonies & Certifications', group: 'Navigation', icon: 'fa-award', shortcut: 'G C', action: () => scrollToId('certifications') },
    { title: 'Jump to References', group: 'Navigation', icon: 'fa-user-check', shortcut: 'G R', action: () => scrollToId('references') },
    { title: 'Toggle Audio Sound Effects', group: 'Actions', icon: 'fa-volume-high', shortcut: 'S', action: () => sfx.toggle() },
    { title: 'View Official References & Contacts', group: 'Actions', icon: 'fa-shield-halved', shortcut: 'REF', action: () => openModal(refModal) },
    { title: 'Hotel Booking System Case Study', group: 'Case Studies', icon: 'fa-hotel', shortcut: 'CASE', action: () => {
      renderProjectModal('hotel');
      openModal(projectModal);
    }},
    { title: 'Vehicle Rental System Case Study', group: 'Case Studies', icon: 'fa-car', shortcut: 'CASE', action: () => {
      renderProjectModal('vehicle');
      openModal(projectModal);
    }},
    { title: 'Food Enthusiasts Social App Case Study', group: 'Case Studies', icon: 'fa-utensils', shortcut: 'CASE', action: () => {
      renderProjectModal('foodie');
      openModal(projectModal);
    }},
    { title: 'Cinema Management System Case Study', group: 'Case Studies', icon: 'fa-film', shortcut: 'CASE', action: () => {
      renderProjectModal('cinema');
      openModal(projectModal);
    }},
    { title: 'Open LinkedIn Profile', group: 'External', icon: 'fa-brands fa-linkedin', shortcut: 'LINK', action: () => window.open('https://www.linkedin.com/in/dinith-navo/', '_blank') },
    { title: 'Open GitHub Profile', group: 'External', icon: 'fa-brands fa-github', shortcut: 'LINK', action: () => window.open('https://github.com/Dinith-Navo', '_blank') }
  ];

  function renderCommands(filter = '') {
    if (!cmdResultsList) return;
    const query = filter.toLowerCase().trim();
    const filtered = commands.filter(c => c.title.toLowerCase().includes(query) || c.group.toLowerCase().includes(query));

    if (filtered.length === 0) {
      cmdResultsList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No matching commands found.</div>';
      return;
    }

    const groups = {};
    filtered.forEach(c => {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push(c);
    });

    let html = '';
    let globalIndex = 0;

    Object.keys(groups).forEach(grp => {
      html += `<div class="cmd-group-title">${grp}</div>`;
      groups[grp].forEach(item => {
        html += `
          <div class="cmd-item ${globalIndex === 0 ? 'selected' : ''}" data-index="${globalIndex}">
            <div class="cmd-item-left">
              <i class="fa-solid ${item.icon}"></i>
              <span>${item.title}</span>
            </div>
            <span class="cmd-shortcut-tag">${item.shortcut}</span>
          </div>
        `;
        globalIndex++;
      });
    });

    cmdResultsList.innerHTML = html;

    // Attach click handlers
    cmdResultsList.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.addEventListener('click', () => {
        closeModal(cmdModal);
        filtered[idx].action();
      });
    });
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }

  function openCmdPalette() {
    openModal(cmdModal);
    renderCommands('');
    if (cmdSearchInput) {
      cmdSearchInput.value = '';
      setTimeout(() => cmdSearchInput.focus(), 50);
    }
  }

  if (cmdPaletteBtn) cmdPaletteBtn.addEventListener('click', openCmdPalette);

  // Global Ctrl + K / Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal && cmdModal.classList.contains('open')) {
        closeModal(cmdModal);
      } else {
        openCmdPalette();
      }
    }
  });

  if (cmdSearchInput) {
    cmdSearchInput.addEventListener('input', () => {
      renderCommands(cmdSearchInput.value);
    });

    cmdSearchInput.addEventListener('keydown', (e) => {
      const items = cmdResultsList?.querySelectorAll('.cmd-item');
      if (!items || items.length === 0) return;

      let currentIndex = Array.from(items).findIndex(i => i.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        items.forEach(i => i.classList.remove('selected'));
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        items.forEach(i => i.classList.remove('selected'));
        items[currentIndex].classList.add('selected');
        items[currentIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex >= 0 && items[currentIndex]) {
          items[currentIndex].click();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 19. Interactive 3D Perspective Tilt for Hero Portrait
  // --------------------------------------------------------------------------
  const portraitCard = document.querySelector('.portrait-card-wrapper');
  if (portraitCard) {
    portraitCard.addEventListener('mousemove', (e) => {
      const rect = portraitCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / (rect.height / 2)) * 7;
      const rotY = (x / (rect.width / 2)) * 7;
      portraitCard.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    portraitCard.addEventListener('mouseleave', () => {
      portraitCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      portraitCard.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });

    portraitCard.addEventListener('mouseenter', () => {
      portraitCard.style.transition = 'transform 0.1s ease-out';
    });
  }

  // --------------------------------------------------------------------------
  // 20. Card Spotlight Glow Effect
  // --------------------------------------------------------------------------
  const spotlightCards = document.querySelectorAll('.project-card, .skill-category-card, .timeline-card, .education-card, .agile-workbench-card, .ceremony-item');

  spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const glowColor = isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(15, 118, 110, 0.08)';

      card.style.background = `radial-gradient(400px circle at ${x}px ${y}px, ${glowColor}, var(--card-gradient))`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // --------------------------------------------------------------------------
  // 15. Keyframe Animation Injection for Transitions
  // --------------------------------------------------------------------------
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(styleSheet);
});
