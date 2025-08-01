document.addEventListener('DOMContentLoaded', () => {
  // Botões do header e seus popups
  const buttons = {
    instagram: document.querySelector('button[title="Instagram"]'),
    whatsapp: document.querySelector('button[title="WhatsApp"]'),
    expediente: document.querySelector('button[title="Expediente"]'),
    endereco: document.querySelector('button[title="Endereço"]'),
  };

  const popups = {
    instagram: document.getElementById('popup-instagram'),
    whatsapp: document.getElementById('popup-whatsapp'),
    expediente: document.getElementById('popup-expediente'),
    endereco: document.getElementById('popup-endereco'),
  };

  function closeAllPopups() {
    Object.values(popups).forEach(popup => popup.classList.remove('open'));
  }

  function togglePopup(name) {
    const popup = popups[name];
    const isOpen = popup.classList.contains('open');
    closeAllPopups();
    if (!isOpen) popup.classList.add('open');
  }

  buttons.instagram.addEventListener('click', () => togglePopup('instagram'));
  buttons.whatsapp.addEventListener('click', () => togglePopup('whatsapp'));
  buttons.expediente.addEventListener('click', () => togglePopup('expediente'));
  buttons.endereco.addEventListener('click', () => togglePopup('endereco'));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.popup') && !e.target.closest('header button')) {
      closeAllPopups();
    }
  });

  // Elementos DOM para a seleção de serviços
  const categorias = document.getElementById('categorias');
  const subservicos = document.getElementById('subservicos');
  const voltarBtn = document.getElementById('voltar-categorias');
  const listaSubservicos = document.getElementById('lista-subservicos');
  const listaAgendados = document.getElementById('lista-agendados');
  const botaoAgendar = document.querySelector('.btn-agendar');
  const msgErro = document.getElementById('msg-erro');

  // Array para armazenar serviços selecionados
  const servicosEscolhidos = [];

  // Dados dos serviços com duração em minutos
  const dadosServicos = {
    unha: [
      { nome: "Alongamento em gel", tempo: "1h", duracaoMinutos: 60, preco: 50, img: "assets/alongamentogel.jpg" },
      { nome: "Esmaltação", tempo: "30min", duracaoMinutos: 30, preco: 25, img: "assets/esmaltacao.jpg" },
    ],
    cabelo: [
      { nome: "Corte feminino", tempo: "40min", duracaoMinutos: 40, preco: 40, img: "assets/corte.jpg" },
      { nome: "Hidratação", tempo: "1h", duracaoMinutos: 60, preco: 60, img: "assets/hidratacao.jpg" },
    ],
    maquiagem: [
      { nome: "Make social", tempo: "1h", duracaoMinutos: 60, preco: 70, img: "assets/makesocial.jpg" },
    ]
  };

  // Abre a lista de subserviços ao clicar em categoria
  document.querySelectorAll('.servico-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.categoria;
      mostrarSubservicos(categoria);
    });
  });

  // Botão voltar para categorias
  voltarBtn.addEventListener('click', () => {
    subservicos.classList.add('hidden');
    categorias.classList.remove('hidden');
  });

  // Função para mostrar subserviços de uma categoria
  function mostrarSubservicos(categoria) {
    categorias.classList.add('hidden');
    subservicos.classList.remove('hidden');
    listaSubservicos.innerHTML = '';

    dadosServicos[categoria].forEach((servico, i) => {
      const div = document.createElement('div');
      div.classList.add('subservico-card');
      div.innerHTML = `
        <img src="${servico.img}" alt="${servico.nome}" data-img="${servico.img}" tabindex="0" role="button" aria-label="Ampliar imagem do serviço ${servico.nome}">
        <div class="subservico-desc" data-index="${i}" data-cat="${categoria}" tabindex="0" role="button" aria-label="Adicionar serviço ${servico.nome}">
          <strong>${servico.nome}</strong>
          <span>${servico.tempo} - R$ ${servico.preco.toFixed(2)}</span>
        </div>
      `;
      listaSubservicos.appendChild(div);
    });
  }

  // Adicionar serviço clicando na descrição ou teclando Enter/Space para acessibilidade
  listaSubservicos.addEventListener('click', (e) => {
    const el = e.target.closest('.subservico-desc');
    if (el) {
      adicionarServico(el);
    }
  });

  listaSubservicos.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('.subservico-desc');
      if (el) {
        e.preventDefault();
        adicionarServico(el);
      }
    }
  });

  // Função para adicionar serviço ao array e atualizar lista
  function adicionarServico(el) {
    const { index, cat } = el.dataset;
    const servicoOriginal = dadosServicos[cat][index];

    const servico = {
      nome: servicoOriginal.nome,
      preco: servicoOriginal.preco,
      duracao: servicoOriginal.duracaoMinutos
    };

    if (!servicosEscolhidos.find(s => s.nome === servico.nome)) {
      servicosEscolhidos.push(servico);
      atualizarAgendados();
    }
  }

  // Remover serviço da lista agendada via botão
  listaAgendados.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const idx = e.target.dataset.index;
      servicosEscolhidos.splice(idx, 1);
      atualizarAgendados();
    }
  });

  // Atualiza visualmente a lista de serviços agendados
  function atualizarAgendados() {
    listaAgendados.innerHTML = '';
    servicosEscolhidos.forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${s.nome} - ${s.duracao} min - R$ ${s.preco.toFixed(2)}
        <button data-index="${i}" aria-label="Remover serviço ${s.nome}">×</button>
      `;
      listaAgendados.appendChild(li);
    });
  }

  // Botão Agendar: valida e salva localStorage, depois redireciona
  botaoAgendar.addEventListener('click', (e) => {
    e.preventDefault();
    if (servicosEscolhidos.length === 0) {
      msgErro.textContent = 'Por favor, selecione pelo menos um serviço antes de agendar.';
      msgErro.style.display = 'block';
      setTimeout(() => {
        msgErro.style.display = 'none';
      }, 4000);
      return;
    }
    localStorage.setItem('servicosSelecionados', JSON.stringify(servicosEscolhidos));
    window.location.href = 'agendamento.html';
  });

  // Modal para ampliar imagem do serviço
  const modal = document.createElement('div');
  modal.id = 'modal-imagem';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  modal.innerHTML = `<img src="" alt="Imagem ampliada do serviço" style="max-width:90%; max-height:90%; border-radius:12px; cursor:pointer;" tabindex="0" role="button" aria-label="Fechar imagem ampliada" />`;
  document.body.appendChild(modal);

  // Abre modal ao clicar ou teclar Enter/Espaço na imagem do serviço
  listaSubservicos.addEventListener('click', (e) => {
    const img = e.target.closest('img[data-img]');
    if (img) {
      modal.querySelector('img').src = img.dataset.img;
      modal.style.display = 'flex';
    }
  });

  listaSubservicos.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const img = e.target.closest('img[data-img]');
      if (img) {
        e.preventDefault();
        modal.querySelector('img').src = img.dataset.img;
        modal.style.display = 'flex';
      }
    }
  });

  // Fecha modal ao clicar na imagem ou fora da imagem
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.tagName === 'IMG') {
      modal.style.display = 'none';
    }
  });

  modal.querySelector('img').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      modal.style.display = 'none';
    }
  });
});
