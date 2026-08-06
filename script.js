document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item, .voltar-home');
  const tabContents = document.querySelectorAll('.tab-content');
  const bgVideo = document.getElementById('bg-video');
  const hero = document.querySelector('.hero');
  const heroScrollTip = document.querySelector('.hero-scroll-tip');
  const video = bgVideo;
  const canUseGsap = Boolean(window.gsap && window.ScrollTrigger);
  const heroMobileQuery = window.matchMedia('(max-width: 768px)');
  let heroScrollTrigger = null;
  let heroScrubVersion = 0;

  if (canUseGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const handleHeroViewportChange = () => {
    if (heroMobileQuery.matches) {
      destroyHeroScroll();
    } else if (document.querySelector('.tab-content.active')?.id === 'home') {
      initHeroScrub();
    }
  };

  if (heroMobileQuery.addEventListener) {
    heroMobileQuery.addEventListener('change', handleHeroViewportChange);
  } else if (heroMobileQuery.addListener) {
    heroMobileQuery.addListener(handleHeroViewportChange);
  }

  const destroyHeroScroll = () => {
    heroScrubVersion += 1;

    if (heroScrollTrigger) {
      heroScrollTrigger.kill();
      heroScrollTrigger = null;
    }
  };

  const initHeroScrub = () => {
    if (!hero || !video || !canUseGsap || window.matchMedia('(max-width: 768px)').matches) return;

    destroyHeroScroll();
    const currentScrubVersion = heroScrubVersion;

    const startScrub = () => {
      if (currentScrubVersion !== heroScrubVersion) return;

      video.pause();
      video.currentTime = 0;

      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 12;
      const scrollDistance = Math.max(5000, duration * 1000);

      heroScrollTrigger = ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        pin: true,
        scrub: 1,
        anticipatePin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (video.readyState >= 2) {
            video.currentTime = self.progress * duration;
            if (!video.paused) video.pause();
          }
        }
      });
    };

    if (video.readyState >= 2) {
      startScrub();
    } else {
      video.addEventListener('loadedmetadata', startScrub, { once: true });
    }
  };

  const videos = {
    home: 'videos/videos1-home.mp4',
    aulas: 'videos/videos2-aulas.mp4',
    agenda: 'videos/videos3-agenda.mp4',
    comunidade: 'videos/videos4-comunidade.mp4',
    vagas: 'videos/videos5-vagas.mp4',
    suporte: 'videos/videos6-suporte.mp4'
  };

  const activateTab = (tab) => {
    if (!document.getElementById(tab)) return;

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tab);
    });

    navItems.forEach(nav => {
      nav.classList.toggle('active', nav.getAttribute('data-tab') === tab);
    });

    if (videos[tab] && bgVideo) {
      bgVideo.src = videos[tab];
      bgVideo.load();
      bgVideo.play().catch(() => {});
    }

    const isHome = tab === 'home';

    if (isHome) {
      initHeroScrub();
    } else {
      destroyHeroScroll();
    }

    if (heroScrollTip) {
      heroScrollTip.style.display = isHome ? 'block' : 'none';
    }

    history.replaceState(null, '', `#${tab}`);
  };

  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();

      const tab = this.getAttribute('data-tab');
      if (!tab) return;

      activateTab(tab);

      document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const filterButtons = document.querySelectorAll('.filtro[data-filter]');
  const eventGroups = document.querySelectorAll('.grupo-evento[data-category]');
  const emptyState = document.querySelector('.agenda-empty');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let visibleEvents = 0;

      filterButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('ativo', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      eventGroups.forEach(group => {
        const isVisible = filter === 'todos' || group.dataset.category === filter;
        group.hidden = !isVisible;
        if (isVisible) visibleEvents += 1;
      });

      if (emptyState) emptyState.hidden = visibleEvents > 0;
    });
  });

  const requestedTab = window.location.hash.slice(1);
  activateTab(document.getElementById(requestedTab) ? requestedTab : 'home');
});
