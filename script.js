/* ============================================================
   WEB-2: OUR LOVE COLLAGE GALLERY - JAVASCRIPT
   Mobile-Optimized, Interactive Canvas & Lightbox
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initGalleryFilter();
  initLightbox();
  initLikes();
  initReasonsSlider();
  initAudio();
});

/* ------------------------------------------------------------
   1. FLOATING PARTICLE & HEART CANVAS
------------------------------------------------------------ */
function initParticleCanvas() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleTypes = ['💖', '✨', '🌸', '💕', '⭐', '💗'];
  const particleCount = window.innerWidth < 600 ? 18 : 35;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 14 + 10,
      char: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      speedY: Math.random() * 0.8 + 0.3,
      speedX: Math.sin(Math.random() * Math.PI) * 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * 0.02
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.5;

      if (p.y < -30) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.font = `${p.size}px serif`;
      ctx.fillText(p.char, p.x, p.y);
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ------------------------------------------------------------
   2. GALLERY FILTERING
------------------------------------------------------------ */
function initGalleryFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.photo-card');

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');

      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ------------------------------------------------------------
   3. LIGHTBOX & SWIPE NAVIGATION
------------------------------------------------------------ */
let currentImageIndex = 0;
let visibleCards = [];

function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!modal) return;

  function updateVisibleCards() {
    visibleCards = Array.from(document.querySelectorAll('.photo-card')).filter(
      (c) => c.style.display !== 'none'
    );
  }

  function openLightbox(index) {
    updateVisibleCards();
    if (index < 0 || index >= visibleCards.length) return;

    currentImageIndex = index;
    const card = visibleCards[currentImageIndex];
    const img = card.querySelector('img');
    const caption = card.getAttribute('data-caption') || img.alt;

    modalImg.src = img.src;
    modalCaption.textContent = caption;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach click on each photo wrapper
  document.querySelectorAll('.photo-card .img-wrapper').forEach((wrapper) => {
    wrapper.addEventListener('click', () => {
      updateVisibleCards();
      const parentCard = wrapper.closest('.photo-card');
      const idx = visibleCards.indexOf(parentCard);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox((currentImageIndex - 1 + visibleCards.length) % visibleCards.length);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox((currentImageIndex + 1) % visibleCards.length);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn?.click();
    if (e.key === 'ArrowRight') nextBtn?.click();
  });

  // Touch Swipe Gesture for Mobile
  let touchStartX = 0;
  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextBtn?.click(); // Swipe left
    if (touchEndX - touchStartX > 50) prevBtn?.click(); // Swipe right
  }, { passive: true });
}

/* ------------------------------------------------------------
   4. LIKES CONTROLLER
------------------------------------------------------------ */
function initLikes() {
  const cards = document.querySelectorAll('.photo-card');

  cards.forEach((card, idx) => {
    const likeBtn = card.querySelector('.like-btn');
    const countSpan = card.querySelector('.like-count');
    const storageKey = `web2_like_${idx}`;

    let isLiked = localStorage.getItem(storageKey) === 'true';
    let count = parseInt(countSpan.textContent) || 10;

    if (isLiked) {
      likeBtn.classList.add('liked');
      countSpan.textContent = count + 1;
    }

    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isLiked = !isLiked;
      localStorage.setItem(storageKey, isLiked);

      if (isLiked) {
        likeBtn.classList.add('liked');
        countSpan.textContent = count + 1;
        triggerHeartBurst(likeBtn);
      } else {
        likeBtn.classList.remove('liked');
        countSpan.textContent = count;
      }
    });
  });

  // Lightbox Heart Button
  const lbLikeBtn = document.getElementById('lightboxLike');
  lbLikeBtn?.addEventListener('click', () => {
    triggerHeartBurst(lbLikeBtn);
    const lbText = document.getElementById('lbLikeText');
    if (lbText) lbText.textContent = 'Sent Love! 💖';
    setTimeout(() => {
      if (lbText) lbText.textContent = 'Send Love';
    }, 2000);
  });
}

function triggerHeartBurst(element) {
  const rect = element.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const h = document.createElement('span');
    h.textContent = '💖';
    h.style.position = 'fixed';
    h.style.left = `${rect.left + rect.width / 2}px`;
    h.style.top = `${rect.top}px`;
    h.style.fontSize = '1.2rem';
    h.style.pointerEvents = 'none';
    h.style.zIndex = '1002';
    h.style.transition = 'all 0.8s ease-out';
    document.body.appendChild(h);

    setTimeout(() => {
      h.style.transform = `translate(${(Math.random() - 0.5) * 80}px, -${Math.random() * 60 + 40}px) scale(1.4)`;
      h.style.opacity = '0';
    }, 20);

    setTimeout(() => h.remove(), 850);
  }
}

/* ------------------------------------------------------------
   5. REASONS SLIDER
------------------------------------------------------------ */
function initReasonsSlider() {
  const items = document.querySelectorAll('.reason-item');
  const dots = document.querySelectorAll('.slider-dots .dot');
  if (!items.length) return;

  let index = 0;

  function showReason(n) {
    items.forEach((it) => it.classList.remove('active'));
    dots.forEach((d) => d.classList.remove('active'));

    index = (n + items.length) % items.length;
    items[index].classList.add('active');
    dots[index].classList.add('active');
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => showReason(i));
  });

  setInterval(() => {
    showReason(index + 1);
  }, 4500);
}

/* ------------------------------------------------------------
   6. AMBIENT MUSIC MELODY GENERATOR (Web Audio API)
------------------------------------------------------------ */
function initAudio() {
  const btn = document.getElementById('musicToggle');
  if (!btn) return;

  let audioCtx = null;
  let isPlaying = false;
  let timerId = null;

  // Soft soothing romantic chord notes (Hz)
  const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 293.66];

  function playAmbientTone() {
    if (!isPlaying) return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const note = notes[Math.floor(Math.random() * notes.length)];
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.6);

    timerId = setTimeout(playAmbientTone, Math.random() * 1500 + 1200);
  }

  btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      btn.classList.add('active');
      btn.querySelector('.btn-text').textContent = 'Playing...';
      playAmbientTone();
    } else {
      btn.classList.remove('active');
      btn.querySelector('.btn-text').textContent = 'Music';
      clearTimeout(timerId);
    }
  });
}
