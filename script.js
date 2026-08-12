/* ===== 1. ESPERA O HTML CARREGAR COMPLETO ===== */
/* Só roda o código depois que a página carregar */
document.addEventListener('DOMContentLoaded', () => {

  /* ===== 2. PEGAR ELEMENTOS DO SITE ===== */
  /* Seleciona todos os elementos que vamos controlar */
  const navItems = document.querySelectorAll('.nav-item, .voltar-home'); /* Pega todos os links do menu */
  const tabContents = document.querySelectorAll('.tab-content'); /* Pega todas as abas: home, aulas, agenda */
  const bgVideo = document.getElementById('bg-video'); /* Pega o vídeo de fundo */
  const hero = document.querySelector('.hero'); /* Pega a primeira seção */
  const heroScrollTip = document.querySelector('.hero-scroll-tip'); /* Pega o texto "Role a página" */
  const video = bgVideo; /* Atalho pra não ficar repetindo bgVideo */

  /* ===== 3. VERIFICAÇÕES INICIAIS ===== */
  /* Checa se GSAP e se é mobile pra não quebrar */
  const canUseGsap = Boolean(window.gsap && window.ScrollTrigger); /* Verifica se GSAP está instalado */
  const heroMobileQuery = window.matchMedia('(max-width: 768px)'); /* Detecta se tela é menor que 768px */
  let heroScrollTrigger = null; /* Guarda o efeito de scroll do GSAP */
  let heroScrubVersion = 0; /* Controla versão pra cancelar efeito antigo */

  /* ===== 4. REGISTRA PLUGIN DO GSAP ===== */
  /* Ativa o ScrollTrigger do GSAP */
  if (canUseGsap) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* ===== 5. FUNÇÃO: LIDAR COM MUDANÇA DE TAMANHO DA TELA ===== */
  /* Desliga efeito no mobile e liga no desktop */
  const handleHeroViewportChange = () => {
    if (heroMobileQuery.matches) {
      destroyHeroScroll();/* Se for mobile, destroi efeito */
    } else if (document.querySelector('.tab-content.active')?.id === 'home') {
      initHeroScrub(); /* Se for desktop e estiver na home, inicia efeito */
    }
  };

  /* ===== 6. OUVIR MUDANÇA DE TAMANHO DA TELA ===== */
  /* Fica escutando se o usuário redimensionou a tela */
  if (heroMobileQuery.addEventListener) {
    heroMobileQuery.addEventListener('change', handleHeroViewportChange);
  } else if (heroMobileQuery.addListener) { /* Compatibilidade com navegador antigo */
    heroMobileQuery.addListener(handleHeroViewportChange);
  }

  /* ===== 7. FUNÇÃO: DESTRUIR EFEITO DO VIDEO ===== */
  /* Para o efeito quando sai da home */
  const destroyHeroScroll = () => {
    heroScrubVersion += 1; /* Muda versão pra cancelar efeitos rodando */

    if (heroScrollTrigger) {
      heroScrollTrigger.kill(); /* Mata o ScrollTrigger do GSAP */
      heroScrollTrigger = null; /* Limpa variável */
    }
  };

  /* ===== 8. FUNÇÃO: INICIAR EFEITO DO VIDEO PRENDIDO ===== */
  /* Faz o vídeo rolar junto com o scroll na home */
  const initHeroScrub = () => {
    /* Só roda se tiver tudo e não for mobile */
    if (!hero || !video || !canUseGsap || window.matchMedia('(max-width: 768px)').matches) return;

    destroyHeroScroll(); /* Limpa efeito antigo primeiro */
    const currentScrubVersion = heroScrubVersion; /* Salva versão atual */

    /* Função interna pra iniciar depois que vídeo carregar */
    const startScrub = () => {
      if (currentScrubVersion !== heroScrubVersion) return; /* Cancela se mudou de aba */

      video.pause(); /* Pausa vídeo pra controlar manualmente */
      video.currentTime = 0; /* Reseta vídeo pro começo */

      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 12;
      /* Pega duração do vídeo */
      const scrollDistance = Math.max(5000, duration * 1000); /* Define quanto vai rolar baseado na duração */

      /* ===== CRIA EFEITO SCROLLTRIGGER ===== */
      heroScrollTrigger = ScrollTrigger.create({
        trigger: hero, /* Elemento que ativa */
        start: 'top top', /* Começa quando topo bate no topo */
        end: () => `+=${scrollDistance}`, /* Termina depois de rolar X pixels */
        pin: true, /* Prende seção na tela */
        scrub: 1, /* Anima junto com o scroll */
        anticipatePin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => { /* Roda toda vez que rolar */
          if (video.readyState >= 2) {
            video.currentTime = self.progress * duration; /* Avança vídeo conforme scroll */
            if (!video.paused) video.pause(); /* Garante que fica pausado */
          }
        }
      });
    };

    /* Espera vídeo carregar pra iniciar efeito */
    if (video.readyState >= 2) {
      startScrub();
    } else {
      video.addEventListener('loadedmetadata', startScrub, { once: true });
    }
  };

  /* ===== 9. LISTA DE VIDEOS POR ABA ===== */
  /* Cada aba tem seu vídeo de fundo */
  const videos = {
    home: 'videos/videos1-home.mp4',
    aulas: 'videos/videos2-aulas.mp4',
    agenda: 'videos/videos3-agenda.mp4',
    comunidade: 'videos/videos4-comunidade.mp4',
    vagas: 'videos/videos5-vagas.mp4',
    suporte: 'videos/videos6-suporte.mp4'
  };

  /* ===== 10. FUNÇÃO: ATIVAR ABA ===== */
  /* Troca de aba e atualiza tudo */
  const activateTab = (tab) => {
    if (!document.getElementById(tab)) return; /* Se aba não existe, sai */

    /* Mostra só a aba ativa e esconde as outras */
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tab);
    });

    /* Marca item do menu como ativo */
    navItems.forEach(nav => {
      nav.classList.toggle('active', nav.getAttribute('data-tab') === tab);
    });

    /* Troca vídeo de fundo conforme aba */
    if (videos[tab] && bgVideo) {
      bgVideo.src = videos[tab]; /* Muda source do vídeo */
      bgVideo.load(); /* Recarrega vídeo */
      bgVideo.play().catch(() => { }); /* Tenta dar play */
    }

    /* Liga efeito só na home */
    const isHome = tab === 'home';

    if (isHome) {
      initHeroScrub(); /* Inicia efeito */
    } else {
      destroyHeroScroll();  /* Destroi efeito */
    }

    /* Mostra/esconde dica de rolar */
    if (heroScrollTip) {
      heroScrollTip.style.display = isHome ? 'block' : 'none';
    }

    /* Muda URL pra #home #aulas sem recarregar */
    history.replaceState(null, '', `#${tab}`);
  };

  /* ===== 11. EVENTO: CLIQUE NO MENU ===== */
  /* Quando clicar em qualquer item do menu */
  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault(); /* Não deixa link recarregar página */

      const tab = this.getAttribute('data-tab'); /* Pega qual aba clicar */
      if (!tab) return;

      activateTab(tab); /* Ativa aba */

      /* Rola suave pro início do conteúdo */
      document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===== 12. FILTROS DA AGENDA ===== */
  /* Seleciona botões e grupos de eventos */
  const filterButtons = document.querySelectorAll('.filtro[data-filter]'); /* Botões de filtro */
  const eventGroups = document.querySelectorAll('.grupo-evento[data-category]'); /* Grupos de eventos */
  const emptyState = document.querySelector('.agenda-empty'); /* Mensagem "nenhum evento" */

  /* ===== 13. EVENTO: CLIQUE NO FILTRO ===== */
  /* Filtra eventos por categoria */
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter; /* Pega categoria do botão */
      let visibleEvents = 0; /* Conta quantos eventos visíveis */

      /* Marca botão clicado como ativo */
      filterButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle('ativo', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });

      /* Mostra/esconde grupos conforme filtro */
      eventGroups.forEach(group => {
        const isVisible = filter === 'todos' || group.dataset.category === filter;
        group.hidden = !isVisible;  /* Esconde se não for da categoria */
        if (isVisible) visibleEvents += 1; /* Conta visíveis */
      });

      /* Mostra mensagem se não tiver evento */
      if (emptyState) emptyState.hidden = visibleEvents > 0;
    });
  });

  /* ===== 14. INICIAR SITE ===== */
  /* Abre aba da URL # ou abre home por padrão */
  const requestedTab = window.location.hash.slice(1); /* Pega # da URL */
  activateTab(document.getElementById(requestedTab) ? requestedTab : 'home'); /* Ativa aba ou home */
});
