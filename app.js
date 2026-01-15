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


  // ==========================================================================
  // MODAL AVANCÉE (Carousel + Détails E5)
  // ==========================================================================
  
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const modalOk = document.getElementById("modalOk");

const projectDetails = {
    woody: {
      title: "WoodyCraft — E-commerce (Laravel)",
      images: [
        "img/woody_accueil.jpg",
        "img/woody_produit.jpg",
        "img/woody_admin.jpg"
      ],
      desc: "Site e-commerce complet de vente de puzzles en bois, avec gestion catalogue et panier.",
      tech: ["Laravel", "Tailwind CSS", "MySQL", "MVC"],
      role: "Développeur Full Stack (Projet scolaire)",
      objective: "Comprendre l'architecture MVC et réaliser un CRUD complet sécurisé.",
      results: "Site fonctionnel avec authentification, back-office administrateur et panier persistant.",
      difficulties: "La gestion des relations Eloquent (ORM) entre les tables Produits et Catégories a été complexe au début."
    },
    
    unity: {
      title: "Certification Unity — Jeu de Course",
      images: [
        "img/unity_setup.jpg",
        "img/unity_game.jpg"
      ],
      desc: "Projet réalisé en autonomie via un parcours de certification en ligne. Création d'un jeu de course simple (voiture sur ligne droite devant éviter des obstacles).",
      tech: ["Unity", "C#", "Virtual Machine", "Visual Studio"],
      role: "Autodidacte / Apprenant",
      objective: "Passer de la logique 'Drag & Drop' au développement scripté en C# et découvrir l'environnement Unity.",
      results: "Compréhension de la physique du moteur et du scripting, malgré un environnement technique très contraint.",
      difficulties: "Environnement bloquant au lycée (installation interdite). Solution : utilisation d'une VM qui a causé d'énormes lenteurs et un manque d'espace disque, entraînant malheureusement la perte d'une partie des sources."
    },
    
    monopoly: {
      title: "Monopoly — Version Console (Python)",
      images: [
        "img/python_code.jpg",
        "img/python_run.jpg"
      ],
      desc: "Réimplémentation des règles du Monopoly en ligne de commande.",
      tech: ["Python", "POO", "Algorithmique"],
      role: "Développeur Backend",
      objective: "Structurer un programme complexe avec des classes (Joueur, Plateau, Case).",
      results: "Partie jouable en local à 4 joueurs avec gestion de l'argent et des propriétés.",
      difficulties: "La gestion des tours de jeu et des cas particuliers (prison, doubles) a demandé une machine à états rigoureuse."
    },

    // --- MISE À JOUR DES STAGES ---

    stage1: {
      title: "Stage 1 : Découverte & Intégration Web",
      images: [
        "img/stage_figma.jpg", 
        "img/stage_wp_admin.jpg",
        "img/stage_resultat.jpg"
      ],
      desc: "Ma toute première expérience en entreprise. J'ai découvert le métier d'intégrateur web au sein de l'agence Innolive.",
      tech: ["WordPress", "Elementor", "Figma", "Relation Client"],
      role: "Stagiaire Intégrateur (Apprentissage 'From Scratch')",
      objective: "Apprendre à construire un site professionnel de A à Z en suivant un processus strict (Wireframe > Maquette > Site).",
      results: "J'ai appris WordPress en partant de zéro grâce à d'excellents maîtres de stage. Le site 'competences-changements.fr' a été livré au client.",
      difficulties: "La réalité du terrain : un projet est beaucoup plus long qu'on ne le pense. Le plus dur a été de devoir refaire entièrement une maquette que je pensais finie, car la cliente ne s'y retrouvait plus. Il a fallu s'adapter et recommencer."
    },

    stage2: {
      title: "Stage 2 : Autonomie & Perfectionnisme",
      images: [
        "img/stage_marquet_shop.jpg", 
        "img/stage_marquet_responsive.jpg",
        "img/stage_equipe.jpg"
      ],
      desc: "Retour chez Innolive avec de nouveaux collègues. Une intégration humaine réussie (je faisais partie de l'équipe), mais un défi technique plus solitaire.",
      tech: ["WooCommerce", "CSS Responsive", "Maintenance", "Travail d'équipe"],
      role: "Développeur Web (Semi-Autonome)",
      objective: "Gérer des tâches complexes sur des sites existants (boutique en ligne, responsive design) et participer à la refonte du site de l'agence.",
      results: "Pour Marquet & Fils : création de pages, gestion de la boutique et réalisation intégrale du Responsive Design. Le site de l'agence est lui toujours en maintenance, témoin de l'exigence de perfection.",
      difficulties: "Le paradoxe de l'autonomie : je me suis senti intégré humainement, mais plus 'perdu' techniquement car moins aidé. Le rythme était parfois frustrant : on voulait que tout soit parfait, ce qui ralentissait considérablement la mise en production."
    }
  };
  let currentSlideIndex = 0;

  function buildModalContent(key) {
    const p = projectDetails[key];
    if (!p) return "<p>Projet introuvable.</p>";

    const slidesHtml = p.images.map((src, i) => `
      <img src="${src}" class="carousel__slide ${i === 0 ? 'active' : ''}" alt="Slide ${i+1}" onerror="this.style.display='none'">
    `).join("");

    const dotsHtml = p.images.map((_, i) => `
      <div class="carousel__dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
    `).join("");

    const techTags = p.tech.map(t => `<span class="tag">${t}</span>`).join("");

    return `
      <div class="modal__grid">
        <div class="carousel">
          ${p.images.length > 1 ? '<button class="carousel__btn carousel__btn--prev" onclick="moveSlide(-1)">&#10094;</button>' : ''}
          <div class="carousel__slides">${slidesHtml || '<div style="padding:20px; text-align:center; color:#fff;">Aucune image</div>'}</div>
          ${p.images.length > 1 ? '<button class="carousel__btn carousel__btn--next" onclick="moveSlide(1)">&#10095;</button>' : ''}
          <div class="carousel__dots">${dotsHtml}</div>
        </div>

        <div>
          <div class="details__section">
            <h4 class="details__title"> Présentation</h4>
            <p class="details__text">${p.desc}</p>
            <div class="tech-tags">${techTags}</div>
          </div>

          <div class="grid grid--2">
             <div class="details__section">
                <h4 class="details__title"> Rôle & Objectif</h4>
                <p class="details__text"><strong>Rôle :</strong> <span class="dim">${p.role}</span></p>
                <p class="details__text" style="margin-top:5px;"><strong>Objectif :</strong> <span class="dim">${p.objective}</span></p>
             </div>
             <div class="details__section">
                <h4 class="details__title"> Résultats</h4>
                <p class="details__text">${p.results}</p>
             </div>
          </div>

          <div class="details__section">
            <h4 class="details__title"> Difficultés rencontrées</h4>
            <p class="details__text" style="color:#ff6b6b;">${p.difficulties}</p>
          </div>
        </div>
      </div>
    `;
  }

  window.moveSlide = function(step) {
    const slides = document.querySelectorAll(".carousel__slide");
    const dots = document.querySelectorAll(".carousel__dot");
    if(!slides.length) return;
    slides[currentSlideIndex].classList.remove("active");
    if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + step + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add("active");
    if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
  };

  window.goToSlide = function(index) {
    const slides = document.querySelectorAll(".carousel__slide");
    const dots = document.querySelectorAll(".carousel__dot");
    slides[currentSlideIndex].classList.remove("active");
    if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.remove("active");
    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add("active");
    if(dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");
  };

  function openModal(key){
    const d = projectDetails[key];
    if(!d || !modal) return;
    currentSlideIndex = 0;
    modalTitle.textContent = d.title;
    modalBody.innerHTML = buildModalContent(key);
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
