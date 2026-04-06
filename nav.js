(function () {
  function detectFallbackContext() {
    const path = String(window.location.pathname || '').toLowerCase();
    const nested = /\/(about|contacts|docs|gallery)\//.test(path);
    const relativeRoot = nested ? '../' : '';

    if (path.includes('mathematicx')) {
      return {
        id: 'mathematicx',
        name: 'MathematicX',
        science: 'Mathematics',
        base: '/MathematicX',
        relativeRoot,
        logoPath: `${relativeRoot}assets/icon/logo.png`,
        route: (page) => `/MathematicX/${String(page || '').replace(/^\/+/, '')}`,
        brandHtml: 'Mathematic<span>X</span>'
      };
    }

    if (path.includes('chemistry')) {
      return {
        id: 'chemistry',
        name: 'ChemistrY',
        science: 'Chemistry',
        base: '/ChemistrY',
        relativeRoot,
        logoPath: `${relativeRoot}assets/icon/logo.png`,
        route: (page) => `/ChemistrY/${String(page || '').replace(/^\/+/, '')}`,
        brandHtml: 'Chemistr<span>Y</span>'
      };
    }

    return {
      id: 'physicx',
      name: 'PhysicX',
      science: 'Physics',
      base: '/PhysicX',
      relativeRoot,
      logoPath: `${relativeRoot}assets/icon/logo.png`,
      route: (page) => `/PhysicX/${String(page || '').replace(/^\/+/, '')}`,
      brandHtml: 'Physic<span>X</span>'
    };
  }

  const app = window.APP_CONTEXT || detectFallbackContext();
  const route = app.route;
  const TOKEN_KEY = `${app.id}_jwt`;
  const EMAIL_KEY = `${app.id}_user_email`;
  const ecosystemLinks = Object.freeze({
    rudrax: 'https://kesab333.github.io/RudraX_Official/',
    feedback: 'https://kesab333.github.io/Feedback_form-for-RudraX/',
    community: 'https://kesab333.github.io/RudraX_community/'
  });
  const hoverSelector = 'a, button, input, textarea, select, .btn, .card, .feature-card, .preview-card, .suite-card, .req-card, .why-item, .mv-card, .pricing-card, .pricing-meta-card, .auth-card-panel, .auth-showcase, .dashboard-panel, .site-quick-panel__btn';

  function canonicalPath(pathname) {
    const trimmed = String(pathname || '').replace(/\/+$/, '');
    if (!trimmed || trimmed.toLowerCase() === app.base.toLowerCase()) {
      return route('index.html');
    }
    if (trimmed.toLowerCase() === route('docs/documentation.html').toLowerCase()) {
      return route('docs/index.html');
    }
    if (trimmed.toLowerCase() === `${app.base.toLowerCase()}/docs`) {
      return route('docs/index.html');
    }
    return trimmed;
  }

  function createAnchor(className, href, label) {
    const link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = label;
    return link;
  }

  function createMobileItem(node) {
    const item = document.createElement('li');
    item.className = 'nav-mobile-auth';
    item.appendChild(node);
    return item;
  }

  function rewriteHref(rawHref) {
    if (!rawHref || rawHref === '#') return rawHref;
    if (/^(https?:|mailto:|tel:|javascript:)/i.test(rawHref)) return rawHref;
    if (/^\/(PhysicX|ChemistrY|MathematicX)\//.test(rawHref)) {
      return rawHref.replace(/^\/(PhysicX|ChemistrY|MathematicX)\//, `${app.base}/`);
    }
    return rawHref;
  }

  function pageLinks() {
    return {
      home: `${app.relativeRoot}index.html`,
      pricing: `${app.relativeRoot}pricing.html`,
      gallery: `${app.relativeRoot}gallery/gallery.html`,
      features: `${app.relativeRoot}index.html#features`,
      docs: `${app.relativeRoot}docs/documentation.html`,
      about: `${app.relativeRoot}about/about.html`,
      contact: `${app.relativeRoot}contacts/contact.html`,
      download: `${app.relativeRoot}index.html#download-section`,
      success: `${app.relativeRoot}success.html`,
      verify: `${app.relativeRoot}verify-otp.html`,
      reset: `${app.relativeRoot}reset-password.html`,
      register: `${app.relativeRoot}register.html`,
      login: `${app.relativeRoot}login.html`,
      dashboard: `${app.relativeRoot}dashboard.html`,
      forgot: `${app.relativeRoot}forgot-password.html`,
      rudrax: ecosystemLinks.rudrax,
      feedback: ecosystemLinks.feedback,
      community: ecosystemLinks.community
    };
  }

  function isHomePage() {
    const path = String(window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    return /(?:^|\/)index\.html$/.test(path) || path.endsWith(app.base.toLowerCase()) || path.endsWith(`${app.id}-main`);
  }

  function renderPrimaryNavigation() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const links = pageLinks();
    const items = [
      { label: 'Main', href: links.rudrax, external: true },
      { label: 'Pricing', href: links.pricing },
      { label: 'Gallery', href: links.gallery },
      { label: 'Features', href: links.features },
      { label: 'Documentation', href: links.docs },
      { label: 'About', href: links.about },
      { label: 'Contact', href: links.contact }
    ];

    navLinks.replaceChildren();
    items.forEach((item) => {
      const listItem = document.createElement('li');
      const link = createAnchor(item.className || '', item.href, item.label);
      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      listItem.appendChild(link);
      navLinks.appendChild(listItem);
    });
  }

  function syncBranding() {
    const links = pageLinks();

    document.querySelectorAll('.nav-logo').forEach((logo) => {
      logo.setAttribute('href', links.home);
      logo.setAttribute('aria-label', `${app.name} Home`);
    });

    document.querySelectorAll('.nav-logo img').forEach((img) => {
      img.setAttribute('src', app.logoPath);
      img.setAttribute('alt', `${app.name} Logo`);
    });

    document.querySelectorAll('.nav-logo-text').forEach((node) => {
      node.innerHTML = app.brandHtml;
    });

    document.querySelectorAll('a[href]').forEach((anchor) => {
      const href = anchor.getAttribute('href');
      const rewritten = rewriteHref(href);
      if (rewritten !== href) {
        anchor.setAttribute('href', rewritten);
      }
    });

    const labelMap = {
      home: links.home,
      main: links.rudrax,
      pricing: links.pricing,
      gallery: links.gallery,
      features: links.features,
      documentation: links.docs,
      about: links.about,
      contact: links.contact,
      community: links.community,
      feedback: links.feedback,
      rudrax: links.rudrax,
      download: links.download,
      success: links.success,
      'verify otp': links.verify,
      'reset password': links.reset,
      'create account': links.register,
      login: links.login,
      dashboard: links.dashboard,
      'forgot password': links.forgot,
      'open dashboard': links.dashboard
    };

    renderPrimaryNavigation();

    document.querySelectorAll('.nav-links a, footer a').forEach((anchor) => {
      const key = anchor.textContent.trim().toLowerCase();
      if (labelMap[key]) {
        anchor.setAttribute('href', labelMap[key]);
        if (key === 'main' || key === 'community' || key === 'feedback' || key === 'rudrax') {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener');
        }
      }
    });

    if (document.title.includes('PhysicX') && app.name !== 'PhysicX') {
      document.title = document.title.replace(/PhysicX/g, app.name);
    }
  }

  function addAuthActions() {
    const navInner = document.querySelector('.nav-inner');
    const navLinks = document.getElementById('nav-links');
    if (!navInner || !navLinks) return;

    navInner.querySelectorAll('.nav-actions').forEach((node) => node.remove());
    navLinks.querySelectorAll('.nav-mobile-auth').forEach((node) => node.remove());

    const token = localStorage.getItem(TOKEN_KEY) || '';
    const storedEmail = localStorage.getItem(EMAIL_KEY) || '';
    const navActions = document.createElement('div');
    navActions.className = 'nav-actions';
    const links = pageLinks();

    if (token) {
      const chip = document.createElement('span');
      chip.className = 'nav-auth-chip';
      chip.textContent = storedEmail || 'Authenticated';

      const dashboardLink = createAnchor('nav-auth-link', links.dashboard, 'Dashboard');
      const logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.className = 'nav-auth-button';
      logoutButton.textContent = 'Logout';
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        window.location.href = links.login;
      });

      navActions.append(chip, dashboardLink, logoutButton);
      navLinks.append(
        createMobileItem(createAnchor('', links.dashboard, 'Dashboard')),
        createMobileItem((() => {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = 'Logout';
          button.addEventListener('click', () => {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(EMAIL_KEY);
            window.location.href = links.login;
          });
          return button;
        })())
      );
    } else {
      navActions.append(
        createAnchor('nav-auth-link', links.login, 'Login'),
        createAnchor('nav-auth-button', links.register, 'Start Free Trial')
      );

      navLinks.append(
        createMobileItem(createAnchor('', links.login, 'Login')),
        createMobileItem(createAnchor('', links.register, 'Start Free Trial'))
      );
    }

    const hamburger = document.getElementById('nav-hamburger');
    navInner.insertBefore(navActions, hamburger || null);
  }

  function ensureFooterEcosystem() {
    const links = pageLinks();
    document.querySelectorAll('footer').forEach((footer) => {
      if (footer.querySelector('.footer-ecosystem')) return;

      const row = document.createElement('div');
      row.className = 'footer-ecosystem';
      row.innerHTML = `
        <span class="footer-ecosystem-label">RudraX Ecosystem</span>
        <div class="footer-ecosystem-links">
          <a href="${links.rudrax}" target="_blank" rel="noopener">RudraX</a>
          <a href="${links.community}" target="_blank" rel="noopener">Community</a>
          <a href="${links.feedback}" target="_blank" rel="noopener">Feedback</a>
        </div>
      `;

      const container = footer.querySelector('.container') || footer;
      const footerBottom = footer.querySelector('.footer-bottom');
      if (footerBottom && footerBottom.parentElement === container) {
        container.insertBefore(row, footerBottom);
      } else {
        container.appendChild(row);
      }
    });
  }

  function ensureQuickPanel() {
    if (document.querySelector('.site-quick-panel')) return;

    const links = pageLinks();
    const iconMarkup = {
      download: `
        <svg class="site-quick-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v10"></path>
          <path d="m8 10 4 4 4-4"></path>
          <path d="M5 18h14"></path>
        </svg>
      `,
      community: `
        <svg class="site-quick-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="10" cy="7" r="3"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 4.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      `,
      feedback: `
        <svg class="site-quick-panel__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 9h8"></path>
          <path d="M8 13h5"></path>
        </svg>
      `
    };

    const items = [
      { label: 'Download', href: links.download, icon: iconMarkup.download, className: 'is-download' },
      { divider: true },
      { label: 'Community', href: links.community, icon: iconMarkup.community, external: true },
      { label: 'Feedback', href: links.feedback, icon: iconMarkup.feedback, external: true }
    ];

    const panel = document.createElement('div');
    panel.className = 'site-quick-panel';
    panel.setAttribute('aria-label', `${app.name} quick links`);

    items.forEach((item) => {
      if (item.divider) {
        const divider = document.createElement('div');
        divider.className = 'site-quick-panel__divider';
        divider.setAttribute('aria-hidden', 'true');
        panel.appendChild(divider);
        return;
      }

      const anchor = document.createElement('a');
      anchor.className = `site-quick-panel__btn ${item.className || ''}`.trim();
      anchor.href = item.href;
      anchor.setAttribute('aria-label', item.label);
      anchor.innerHTML = `${item.icon}<span class="site-quick-panel__tooltip">${item.label}</span>`;
      if (item.external) {
        anchor.target = '_blank';
        anchor.rel = 'noopener';
      }
      panel.appendChild(anchor);
    });

    document.body.appendChild(panel);
  }

  function normalizeTextArtifacts() {
    const replacements = [
      [/â€”/g, ' - '],
      [/â€“/g, '-'],
      [/â€¦/g, '...'],
      [/â†’/g, '->'],
      [/Â·/g, ' · '],
      [/Â©/g, '©'],
      [/Î±/g, 'alpha'],
      [/ðŸ“–\s*/g, ''],
      [/ðŸ”§\s*/g, ''],
      [/ðŸ“š|ðŸ“Š|ðŸŽ¨/g, ''],
      [/â“\s*/g, ''],
      [/âœ•/g, 'x'],
      [/â—Ž|â—ˆ|â—‡/g, 'o'],
      [/Â/g, '']
    ];

    function clean(text, trimEdges) {
      let next = String(text || '');
      replacements.forEach(([pattern, value]) => {
        next = next.replace(pattern, value);
      });
      next = next.replace(/[ \t]{2,}/g, ' ');
      return trimEdges ? next.trim() : next;
    }

    document.title = clean(document.title, true);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let current = walker.nextNode();
    while (current) {
      const cleaned = clean(current.nodeValue, false);
      if (cleaned !== current.nodeValue) {
        current.nodeValue = cleaned;
      }
      current = walker.nextNode();
    }

    document.querySelectorAll('[title], [placeholder], [aria-label], [alt], [value]').forEach((node) => {
      ['title', 'placeholder', 'aria-label', 'alt', 'value'].forEach((attribute) => {
        if (!node.hasAttribute(attribute)) return;
        const cleaned = clean(node.getAttribute(attribute), true);
        if (cleaned !== node.getAttribute(attribute)) {
          node.setAttribute(attribute, cleaned);
        }
      });
    });
  }

  function ensureIndexLoader() {
    if (!isHomePage() || document.getElementById('site-loader')) return;

    const loader = document.createElement('div');
    loader.className = 'site-loader';
    loader.id = 'site-loader';
    loader.style.backgroundImage = `url("${app.logoPath}")`;
    loader.innerHTML = `
      <div class="site-loader__panel">
        <div class="site-loader__brand">${app.brandHtml}</div>
        <div class="site-loader__bar-wrap">
          <div class="site-loader__bar" id="site-loader-bar"></div>
        </div>
        <div class="site-loader__text">INITIALIZING ${app.name.toUpperCase()}<span class="site-loader__blink">_</span></div>
      </div>
    `;
    document.body.prepend(loader);

    const bar = loader.querySelector('#site-loader-bar');
    let progress = 0;
    const timer = window.setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) {
        progress = 100;
        window.clearInterval(timer);
        window.setTimeout(() => loader.classList.add('is-hidden'), 260);
        window.setTimeout(() => loader.remove(), 920);
      }
      if (bar) {
        bar.style.width = `${progress}%`;
      }
    }, 110);
  }

  function highlightActiveLink() {
    const currentPage = canonicalPath(window.location.pathname);
    document.querySelectorAll('.nav-links a').forEach((anchor) => {
      const href = (anchor.getAttribute('href') || '').split('#')[0];
      if (!href || href === '#') return;

      const targetPath = canonicalPath(new URL(anchor.href, window.location.origin).pathname);
      if (targetPath === currentPage) {
        anchor.classList.add('active');
      }
    });
  }

  function bindNavigation() {
    const nav = document.querySelector('.site-nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(open));
      });

      navLinks.querySelectorAll('a, button').forEach((node) => {
        node.addEventListener('click', () => navLinks.classList.remove('open'));
      });

      document.addEventListener('click', (event) => {
        if (!hamburger.contains(event.target) && !navLinks.contains(event.target)) {
          navLinks.classList.remove('open');
        }
      });
    }
  }

  function bindReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  function ensureThemeShell() {
    document.body.classList.add('theme-ready');
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (coarsePointer) {
      document.body.classList.add('cursor-native');
    }

    if (!document.querySelector('.theme-shell')) {
      const shell = document.createElement('div');
      shell.className = 'theme-shell';
      shell.setAttribute('aria-hidden', 'true');
      shell.innerHTML = `
        <canvas class="theme-particles" id="theme-particles"></canvas>
        <div class="theme-grid-overlay"></div>
        <div class="theme-logo-wrap"><img class="theme-logo-bg" src="${app.logoPath}" alt=""></div>
      `;
      document.body.prepend(shell);
    }

    if (!coarsePointer) {
      if (!document.getElementById('cur-dot')) {
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.id = 'cur-dot';
        document.body.appendChild(dot);
      }
      if (!document.getElementById('cur-ring')) {
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        ring.id = 'cur-ring';
        document.body.appendChild(ring);
      }
    }

    if (!prefersReducedMotion) {
      initParticles();
      initCounters();
      initRoadmapBounces();
    }
    if (!coarsePointer) {
      initCursor();
    }
    initTiltCards(prefersReducedMotion);
  }

  function initCursor() {
    const dot = document.getElementById('cur-dot');
    const ring = document.getElementById('cur-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    document.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }, { passive: true });

    document.addEventListener('mousedown', () => dot.classList.add('clicking'));
    document.addEventListener('mouseup', () => dot.classList.remove('clicking'));

    function bindHoverState(node) {
      node.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      node.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    }

    document.querySelectorAll(hoverSelector).forEach(bindHoverState);

    function animate() {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      window.requestAnimationFrame(animate);
    }

    animate();
  }

  function initParticles() {
    const canvas = document.getElementById('theme-particles');
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let width = 0;
    let height = 0;
    let particles = [];
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue('--particle-primary-rgb').trim() || '37,99,235';
    const secondary = styles.getPropertyValue('--particle-secondary-rgb').trim() || '6,182,212';

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const count = Math.min(110, Math.max(36, Math.floor((width * height) / 14500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 2 + 0.8,
        a: Math.random() * 0.45 + 0.12,
        color: Math.random() > 0.45 ? primary : secondary
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -20) particle.x = width + 20;
        if (particle.x > width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = height + 20;
        if (particle.y > height + 20) particle.y = -20;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color}, ${particle.a})`;
        context.fill();
      });

      for (let index = 0; index < particles.length; index += 1) {
        for (let inner = index + 1; inner < particles.length; inner += 1) {
          const dx = particles[index].x - particles[inner].x;
          const dy = particles[index].y - particles[inner].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 128) {
            context.beginPath();
            context.moveTo(particles[index].x, particles[index].y);
            context.lineTo(particles[inner].x, particles[inner].y);
            context.strokeStyle = `rgba(${primary}, ${0.06 * (1 - dist / 128)})`;
            context.lineWidth = 0.6;
            context.stroke();
          }
        }
      }

      window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  function initTiltCards(reducedMotion) {
    const selector = [
      '.card',
      '.feature-card',
      '.preview-card',
      '.suite-card',
      '.req-card',
      '.why-item',
      '.mv-card',
      '.pricing-card',
      '.pricing-meta-card',
      '.auth-card-panel',
      '.auth-showcase',
      '.dashboard-panel'
    ].join(',');

    document.querySelectorAll(selector).forEach((card) => {
      if (card.closest('.contact-grid') || card.closest('.support-inner')) return;
      card.classList.add('theme-tilt-target');
      if (card.dataset.tiltBound === '1' || reducedMotion) return;
      card.dataset.tiltBound = '1';
      const tiltAmount = 6;

      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -tiltAmount;
        const rotateY = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * tiltAmount;
        card.style.transform = `perspective(960px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.01)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    function countUp(node, target, suffix) {
      let current = 0;
      const step = target / 56;
      const timer = window.setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          window.clearInterval(timer);
        }
        node.textContent = `${Math.floor(current)}${suffix}`;
      }, 16);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const value = entry.target.querySelector('.hero-metric-val');
        if (!value || value.dataset.counted) return;
        value.dataset.counted = '1';
        const raw = value.textContent.trim();
        const number = parseInt(raw, 10);
        if (!Number.isNaN(number) && number > 1) {
          countUp(value, number, raw.replace(String(number), ''));
        }
      });
    }, { threshold: 0.45 });

    document.querySelectorAll('.hero-metric').forEach((node) => observer.observe(node));
  }

  function initRoadmapBounces() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target.querySelector('.rm-node');
        if (node) {
          node.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
          node.style.transform = 'scale(1.16)';
          window.setTimeout(() => { node.style.transform = ''; }, 420);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.rm-item').forEach((item) => observer.observe(item));
  }

  document.addEventListener('DOMContentLoaded', () => {
    normalizeTextArtifacts();
    syncBranding();
    addAuthActions();
    ensureFooterEcosystem();
    ensureQuickPanel();
    highlightActiveLink();
    bindNavigation();
    bindReveal();
    ensureThemeShell();
    ensureIndexLoader();
  });
})();
