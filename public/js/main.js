// Universal vanilla interaction helper for Kava & Go
document.addEventListener('DOMContentLoaded', () => {
  // 1. Ensure all background & content videos play reliably on scroll
  const videos = document.querySelectorAll('video');
  videos.forEach(v => {
    v.muted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('loop', '');
  });

  const checkVideoPlayback = () => {
    videos.forEach(v => {
      const rect = v.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        if (v.paused) v.play().catch(() => {});
      } else {
        if (!v.paused) v.pause();
      }
    });
  };

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target.querySelector('video') || (entry.target.tagName === 'VIDEO' ? entry.target : null);
        if (!v) return;
        if (entry.isIntersecting) {
          v.muted = true;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, div').forEach(el => {
      if (el.querySelector('video') || el.tagName === 'VIDEO') {
        videoObserver.observe(el);
      }
    });
  }

  window.addEventListener('scroll', checkVideoPlayback, { passive: true });
  checkVideoPlayback();

  // 2. Smart Smooth-Scroll Section Finder
  const findSection = (keywords) => {
    const candidates = Array.from(
      document.querySelectorAll('section, main, [id*="section"], h1, h2, h3, h4, p, div')
    ).filter(el => !el.closest('header, nav, #mobile-nav-drawer'));

    const match = candidates.find(el => {
      const txt = (el.innerText || el.textContent || '').trim().toUpperCase();
      return keywords.some(k => txt.includes(k.toUpperCase())) && txt.length < 350;
    });
    return match ? (match.closest('section') || match) : null;
  };

  // Handle all anchor links with # hrefs
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.style.cursor = 'pointer';
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const slug = href.replace(/^#/, '').trim();
      if (!slug) return;

      // 1. Exact ID
      let target = document.getElementById(slug);
      // 2. Fallbacks
      if (!target) {
        target = document.getElementById(slug + '-section') ||
                 document.getElementById('section-' + slug);
      }
      // 3. Fallback matching keywords
      if (!target) {
        const textWords = (anchor.textContent || '').split(/\s+/);
        const slugWords = slug.split(/[-_]/);
        const allKeywords = [...slugWords, ...textWords].filter(w => w.length > 2);
        target = findSection(allKeywords);
      }

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile drawer if open
        const mobileDrawer = document.getElementById('mobile-nav-drawer');
        if (mobileDrawer) mobileDrawer.classList.add('hidden');
      }
    });
  });

  // Handle header brand and buttons
  document.querySelectorAll('header a[href="#"], header button:not(#mobile-menu-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 3. Mobile Hamburger Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }
});
