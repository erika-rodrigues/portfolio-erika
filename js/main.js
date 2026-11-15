/* =========================================================
   Erika · Portfólio — scripts gerais
   Funciona em todas as páginas. Se o JavaScript falhar,
   o site continua funcionando normalmente, só sem as animações.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* sem armazenamento */ }
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var body = document.body;

  /* ---------- 1. Transições de página (View Transitions, quando o navegador suporta) ---------- */
  var supportsViewTransitions = 'startViewTransition' in document;
  if (!reduceMotion && supportsViewTransitions) {
    var navStyle = document.createElement('style');
    navStyle.textContent = [
      '@view-transition { navigation: auto; }',
      '::view-transition-old(root) { animation: vt-out 0.45s cubic-bezier(.4,0,.2,1) both; }',
      '::view-transition-new(root) { animation: vt-in 0.7s cubic-bezier(.2,.7,.2,1) both; }',
      '@keyframes vt-out { to { opacity: 0; transform: translateY(-14px) scale(0.99); } }',
      '@keyframes vt-in { from { opacity: 0; transform: translateY(22px) scale(0.99); } }'
    ].join('\n');
    document.head.appendChild(navStyle);
  } else if (!reduceMotion) {
    // Alternativa para navegadores sem View Transitions
    body.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    body.style.opacity = '0';
    body.style.transform = 'translateY(18px)';
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        body.style.opacity = '1';
        body.style.transform = 'translateY(0)';
      });
    });

    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#' || link.target === '_blank') return;
      if (link.hostname && link.hostname !== window.location.hostname) return;
      if (!/\.html(#.*)?$/.test(href)) return;
      event.preventDefault();
      body.style.opacity = '0';
      body.style.transform = 'translateY(-14px)';
      window.setTimeout(function () { window.location.href = href; }, 420);
    });
  }

  /* ---------- 2. Modo claro e escuro ---------- */
  function currentTheme() {
    var saved = safeGet('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  var savedTheme = safeGet('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') applyTheme(savedTheme);

  var themeButton = document.querySelector('.theme-toggle');
  if (themeButton) {
    themeButton.addEventListener('click', function (event) {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      var rect = themeButton.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      if (!reduceMotion && supportsViewTransitions) {
        // Círculo que se espalha a partir do botão
        var transition = document.startViewTransition(function () {
          applyTheme(next);
          safeSet('theme', next);
        });
        transition.ready.then(function () {
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
          );
        });
      } else {
        // Alternativa: as cores mudam suavemente
        root.classList.add('theme-switching');
        applyTheme(next);
        safeSet('theme', next);
        window.setTimeout(function () { root.classList.remove('theme-switching'); }, 700);
      }
    });
  }

  /* ---------- 3. Animações ao passar o mouse e ao clicar ---------- */
  if (!reduceMotion) {
    var hoverCss = [
      /* Cores mudam suavemente quando o tema troca (alternativa) */
      'html.theme-switching, html.theme-switching * {',
      '  transition: background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease, fill 0.6s ease, stroke 0.6s ease !important;',
      '}',

      /* Projetos: a imagem dá zoom leve e o card sobe */
      '.project-card { transition: transform 0.5s cubic-bezier(.2,.7,.2,1), box-shadow 0.5s ease, border-color 0.4s ease; }',
      '.project-card:hover { transform: translateY(-8px) !important; box-shadow: 0 30px 50px -28px rgba(37,99,235,0.4) !important; border-color: var(--blue-light) !important; }',
      '.project-card .project-img { transition: transform 0.7s cubic-bezier(.2,.7,.2,1); }',
      '.project-card:hover .project-img { transform: scale(1.05); }',

      /* Conhecimentos: uma barra azul cresce na lateral */
      '.skill-card { transition: transform 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease; }',
      '.skill-card:hover { transform: translateX(4px) !important; box-shadow: 0 24px 40px -26px rgba(37,99,235,0.35) !important; }',
      '.skill-card:not(.skill-dark)::before { content: ""; position: absolute; left: 0; top: 24px; bottom: 24px; width: 3px; border-radius: 3px; background: var(--blue); transform: scaleY(0); transition: transform 0.4s ease; }',
      '.skill-card:not(.skill-dark):hover::before { transform: scaleY(1); }',

      /* Linha do tempo: o card desliza para o lado de fora */
      '.tl-card { transition: transform 0.45s cubic-bezier(.2,.7,.2,1), box-shadow 0.45s ease, border-color 0.4s ease; }',
      '.tl-left .tl-card:hover { transform: translateX(-8px) !important; }',
      '.tl-right .tl-card:hover { transform: translateX(8px) !important; }',
      '.tl-card:hover { box-shadow: 0 26px 46px -26px rgba(37,99,235,0.35) !important; border-color: var(--blue-light) !important; }',

      /* Profissões: inclinam levemente em 3D */
      '.top-jobs li { transition: transform 0.45s ease, box-shadow 0.45s ease; transform-style: preserve-3d; }',
      '.top-jobs li:hover { transform: perspective(600px) rotateX(6deg) translateY(-6px) !important; box-shadow: 0 26px 46px -26px rgba(37,99,235,0.4) !important; }',

      /* Cards do Bradesco e da FIAP: a foto de fundo dá zoom */
      '.mini-card { transition: transform 0.5s ease, box-shadow 0.5s ease; background-color: transparent; }',
      '.mini-card:hover { transform: translateY(-5px) !important; box-shadow: 0 26px 46px -26px rgba(37,99,235,0.4) !important; }',
      '.mini-card-bradesco, .mini-card-fiap { transition: transform 0.5s ease, box-shadow 0.5s ease, border-color 0.4s ease; }',
      '.mini-card-bradesco:hover, .mini-card-fiap:hover { border-color: var(--blue-light) !important; }',

      /* Participação e aprendizados: faixa de cor sobe por trás do card */
      '.learn-card { transition: transform 0.45s ease, box-shadow 0.45s ease, border-color 0.4s ease; }',
      '.learn-card:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 40px -26px rgba(37,99,235,0.35) !important; border-color: var(--blue-light) !important; }',

      /* Como funciona: a foto da parte dá zoom */
      '.part-card { transition: transform 0.45s ease, box-shadow 0.45s ease; }',
      '.part-card:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 40px -26px rgba(37,99,235,0.35) !important; }',
      '.part-photo { transition: transform 0.6s ease; }',
      '.part-row:hover .part-photo { transform: scale(1.02); }',

      /* Formação: o card ganha uma faixa azul no topo */
      '.edu-card { position: relative; overflow: hidden; transition: transform 0.45s ease, box-shadow 0.45s ease; }',
      '.edu-card::after { content: ""; position: absolute; left: 0; top: 0; height: 3px; width: 100%; background: var(--blue); transform: scaleX(0); transform-origin: left; transition: transform 0.5s ease; }',
      '.edu-card:hover { transform: translateY(-4px) !important; }',
      '.edu-card:hover::after { transform: scaleX(1); }',

      /* Cursos e certificados: o botão ganha brilho */
      '.btn-cert { transition: transform 0.25s ease, box-shadow 0.25s ease; }',

      /* Botões: sobem e a seta anda */
      '.btn { transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease; }',
      '.btn:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -14px rgba(37,99,235,0.55); }',
      '.btn-outline:hover, .btn-ghost:hover { border-color: var(--blue); color: var(--blue); }',
      '.btn svg { transition: transform 0.25s ease; }',
      '.btn:hover svg { transform: translate(2px, -2px); }',

      /* Tags e pílulas: mudam para azul */
      '.tags li, .tags-mono li, .info-pill, .skill-items li { transition: transform 0.25s ease, border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease; }',
      '.tags li:hover, .tags-mono li:hover, .info-pill:hover { transform: translateY(-2px); border-color: var(--blue-light); color: var(--blue); }',

      /* Redes sociais */
      '.social-pill { transition: transform 0.25s ease, border-color 0.25s ease, color 0.25s ease; }',
      '.social-pill:hover { transform: translateY(-2px); border-color: var(--blue); color: var(--blue); }',

      /* Menu e links */
      '.site-nav a { transition: color 0.25s ease, transform 0.25s ease; }',
      '.site-nav a:hover { transform: translateY(-1px); }',
      '.brand-mark { transition: transform 0.4s ease; }',
      '.brand:hover .brand-mark { transform: rotate(-8deg) scale(1.06); }',
      '.project-nav a { transition: color 0.25s ease, transform 0.25s ease; }',
      '.project-nav a:hover { transform: translateX(4px); }',
      '.footer-nav a, .back-link { transition: color 0.25s ease, transform 0.25s ease; }',
      '.footer-nav a:hover { transform: translateX(3px); }',
      '.back-link:hover { transform: translateX(-4px); }',

      /* Faixa de tecnologias */
      '.ticker-item { transition: color 0.25s ease, transform 0.25s ease; }',
      '.ticker-item:hover { color: var(--blue); transform: scale(1.06); }',

      /* Botão de tema gira */
      '.theme-toggle { transition: transform 0.4s ease, border-color 0.25s ease; }',
      '.theme-toggle:hover { transform: rotate(25deg); }'
    ].join('\n');

    var hoverStyle = document.createElement('style');
    hoverStyle.textContent = hoverCss;
    document.head.appendChild(hoverStyle);

    // Botões diminuem levemente ao clicar
    document.addEventListener('pointerdown', function (event) {
      var button = event.target.closest && event.target.closest('.btn, .filter-chip, .theme-toggle');
      if (button) button.style.transform = 'scale(0.97)';
    });
    document.addEventListener('pointerup', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.btn, .filter-chip, .theme-toggle'), function (b) {
        b.style.transform = '';
      });
    });
  }

  /* ---------- 3b. Menu hambúrguer (celular) ---------- */
  var menuButton = document.querySelector('.menu-toggle');
  var siteNav = document.getElementById('site-nav');
  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      menuButton.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
  }

  /* ---------- 3c. Celular: rótulo do card fica abaixo da imagem ---------- */
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
    document.querySelectorAll('.project-card').forEach(function (card) {
      var pill = card.querySelector('.project-visual .tag-pill');
      var body = card.querySelector('.project-body');
      if (!pill || !body) return;
      var kicker = body.querySelector('.project-kicker');
      if (!kicker) {
        kicker = document.createElement('p');
        kicker.className = 'project-kicker';
        body.insertBefore(kicker, body.firstChild);
      }
      kicker.textContent = pill.textContent;
      pill.style.display = 'none';
    });
  }

  /* ---------- 4. Blocos que aparecem ao rolar a página ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealSelectors = [
      '.section-head', '.pj-section', '.project-card', '.skill-card', '.tl-item',
      '.edu-card', '.cta', '.mini-card', '.part-card', '.learn-card', '.closing',
      '.facts', '.about-grid', '.split', '.cheguei-grid', '.principle', '.project-meta'
    ];
    var revealItems = document.querySelectorAll(revealSelectors.join(','));

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    Array.prototype.forEach.call(revealItems, function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      revealObserver.observe(el);
    });
  }

  /* ---------- 5. Faixa de tecnologias em loop (home) ---------- */
  var track = document.getElementById('ticker-track');
  if (track) {
    var techs = [
      'JavaScript', 'Python', 'C', 'Node.js',
      'HTML', 'CSS', 'Figma',
      'Arduino', 'ESP32', 'ESP32-CAM',
      'MySQL', 'Firebase'
    ];
    // Lista repetida duas vezes para o loop ficar contínuo.
    // Entre um item e outro entra um losango; a cada três itens, um nome fica em azul.
    var fragment = document.createDocumentFragment();
    for (var pass = 0; pass < 2; pass++) {
      techs.forEach(function (name, index) {
        var item = document.createElement('span');
        item.className = 'ticker-item' + (index % 3 === 2 ? ' is-blue' : '');
        item.textContent = name;
        if (pass === 1) item.setAttribute('aria-hidden', 'true');
        fragment.appendChild(item);

        var sep = document.createElement('span');
        sep.className = 'ticker-sep';
        sep.textContent = '◆';
        sep.setAttribute('aria-hidden', 'true');
        fragment.appendChild(sep);
      });
    }
    track.appendChild(fragment);
  }

  /* ---------- 6. Filtros da página Projetos ---------- */
  var filterButtons = document.querySelectorAll('.filter-chip[data-filter]');
  if (filterButtons.length) {
    var countLabel = document.querySelector('.filters-count');
    var cards = document.querySelectorAll('[data-category]');

    Array.prototype.forEach.call(filterButtons, function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        Array.prototype.forEach.call(filterButtons, function (b) {
          b.classList.toggle('is-active', b === button);
        });
        var visible = 0;
        Array.prototype.forEach.call(cards, function (card) {
          var show = filter === 'todos' || card.getAttribute('data-category') === filter;
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (countLabel) countLabel.textContent = visible + (visible === 1 ? ' projeto' : ' projetos');
      });
    });
  }

  /* ---------- 7. Destaque do item atual no menu lateral (Readapt) ---------- */
  var projectNav = document.querySelector('.project-nav');
  if (projectNav && 'IntersectionObserver' in window) {
    var navLinks = projectNav.querySelectorAll('a[href^="#"]');
    var sections = [];
    Array.prototype.forEach.call(navLinks, function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) sections.push({ link: link, section: section });
    });

    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (item) {
          var active = item.section === entry.target;
          item.link.style.color = active ? 'var(--blue)' : '';
          item.link.setAttribute('aria-current', active ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (item) { navObserver.observe(item.section); });
  }

})();
