(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Matrix background
  const canvas = $("#matrix");
  const ctx = canvas.getContext("2d", { alpha: true });

  const state = {
    fontSize: 16,
    columns: 0,
    drops: [],
    chars: "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*+-=<>?/\\",
    lastTime: 0,
    speed: 0.06,
    opacity: 0.08,
    running: true
  };

  function resizeCanvas(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.fontSize = window.innerWidth < 520 ? 14 : 16;
    state.columns = Math.floor(window.innerWidth / state.fontSize);
    state.drops = new Array(state.columns).fill(0).map(() => Math.random() * window.innerHeight / state.fontSize);
  }

  function randChar(){
    return state.chars[Math.floor(Math.random() * state.chars.length)];
  }

  function drawMatrix(dt){
    if(!state.running) return;

    ctx.fillStyle = `rgba(0, 0, 0, ${state.opacity})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = "rgba(0, 255, 102, 0.9)";
    ctx.font = `${state.fontSize}px Share Tech Mono, ui-monospace, monospace`;

    for(let i=0; i<state.drops.length; i++){
      const x = i * state.fontSize;
      const y = state.drops[i] * state.fontSize;

      ctx.fillText(randChar(), x, y);

      if(y > window.innerHeight && Math.random() > 0.975){
        state.drops[i] = 0;
      }
      state.drops[i] += (dt * state.speed) * (0.7 + Math.random() * 1.2);
    }
  }

  function loop(t){
    const dt = state.lastTime ? (t - state.lastTime) : 16;
    state.lastTime = t;
    drawMatrix(dt);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  requestAnimationFrame(loop);

  // Typed text
  const typedEl = $("#typed");
  const phrases = [
    "Étudiant BTS SIO • SLAM (2ᵉ année).",
    "Je développe des sites web et des projets applicatifs.",
    "WordPress, MySQL, Python, JavaScript.",
    "Bienvenue sur mon portfolio."
  ];
  let pi = 0, ci = 0, del = false, hold = 0;

  function tick(){
    if(!typedEl) return;
    const current = phrases[pi];

    if(!del){
      typedEl.textContent = current.slice(0, ci++);
      if(ci > current.length){ del = true; hold = 28; }
    } else {
      if(hold-- <= 0){
        typedEl.textContent = current.slice(0, ci--);
        if(ci < 0){ del = false; pi = (pi + 1) % phrases.length; ci = 0; }
      }
    }
    setTimeout(tick, del ? 18 : 26);
  }
  tick();

  // Reveal on scroll
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if(ent.isIntersecting){
        ent.target.classList.add("is-in");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Active nav
  const navLinks = $$(".nav__link").filter(a => a.getAttribute("href")?.startsWith("#"));
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const ioNav = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if(ent.isIntersecting){
        const id = "#" + ent.target.id;
        navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach(s => ioNav.observe(s));

  // Footer year
  const year = $("#year");
  if(year) year.textContent = new Date().getFullYear();

  // Contact form → mailto
  const form = $("#contactForm");
  const formHint = $("#formHint");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    const subject = encodeURIComponent(`[Portfolio] Message de ${name || "visiteur"}`);
    const body = encodeURIComponent(`Nom: ${name}
Email: ${email}

Message:
${message}`);

    window.location.href = `mailto:evanethevepro@gmail.com?subject=${subject}&body=${body}`;
    formHint.textContent = "Ouverture du client mail… ✅";
  });


  // Modal (project details)
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const modalOk = document.getElementById("modalOk");

  const projectDetails = {
    unity: {
      title: "WoodyCraft — E-commerce de puzzles en bois",
      body: `
        <p><span class="hi">WoodyCraft</span> est un site e-commerce développé avec <span class="hi">Laravel</span> (Laragon) et <span class="hi">Tailwind</span>.</p>
        <ul>
          <li><span class="hi">MVC</span> : séparation Modèle / Vue / Contrôleur.</li>
          <li><span class="hi">CRUD</span> : création, lecture, modification, suppression des produits.</li>
          <li><span class="hi">BDD</span> : MySQL (HeidiSQL) pour gérer les données.</li>
          <li><span class="hi">Tests unitaires</span> : vérification du bon fonctionnement de certaines fonctionnalités.</li>
        </ul>
      `
    },
    
    unity: {
      title: "Jeu vidéo (Unity) — Détails",
      body: `
        <p><span class="hi">Objectif</span> : créer un jeu vidéo sous <span class="hi">Unity</span> en <span class="hi">C#</span> pour appliquer la logique de programmation.</p>
        <ul>
          <li>Gestion des scènes, déplacements, collisions, UI.</li>
          <li>Organisation du code (scripts), logique de gameplay.</li>
        </ul>
        <p class="dim">👉 Tu peux ajouter : features, captures, lien de démo, difficultés rencontrées.</p>
      `
    },
    
    monopoly: {
      title: "Création d’un Monopoly (Python) — Détails",
      body: `
        <p><span class="hi">Objectif</span> : réinterpréter le Monopoly en version numérique.</p>
        <ul>
          <li>Règles : achats, loyers, tours, événements.</li>
          <li>Structuration du code (POO) et interface.</li>
        </ul>
      `
    }
  };

  function openModal(key){
    const d = projectDetails[key];
    if(!d || !modal) return;
    modalTitle.textContent = d.title;
    modalBody.innerHTML = d.body;
    modal.showModal();
  }
  function closeModal(){ if(modal?.open) modal.close(); }

  modalClose?.addEventListener("click", closeModal);
  modalOk?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    const inner = modal.querySelector(".modal__inner");
    if(inner && !inner.contains(e.target)) closeModal();
  });

  $$(".proj").forEach(card => {
    const key = card.dataset.modal;
    card.addEventListener("click", (e) => {
      if(e.target && e.target.closest("a")) return;
      openModal(key);
    });
    const btn = card.querySelector("button");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(key);
    });
  });
})();