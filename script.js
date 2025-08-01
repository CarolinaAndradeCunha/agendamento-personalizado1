document.addEventListener('DOMContentLoaded', () => {
  // seus seletores e dados de popup mantidos aqui...

  // seus botões e popups (sem alterações)
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

  // DOM elements para escolha dos serviços
  const categorias = document.getElementById('categorias');
  const subservicos = document.getElementById('subservicos');
  const voltarBtn = document.getElementById('voltar-categorias');
  const listaSubservicos = document.getElementById('lista-subservicos');
  const listaAgendados = document.getElementById('lista-agendados');
  const botaoAgendar = document.querySelector('.btn-agendar');
  const msgErro = document.getElementById('msg-erro');

  // array que guarda serviços escolhidos
  const servicosEscolhidos = [];

  // dadosServicos com campo duracaoMinutos adicionado
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

  // Abrir categoria
  document.querySelectorAll('.servico-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.categoria;
      mostrarSubservicos(categoria);
    });
  });

  // Voltar
  voltarBtn.addEventListener('click', () => {
    subservicos.classList.add('hidden');
    categorias.classList.remove('hidden');
  });

  // Mostrar subserviços da categoria
  function mostrarSubservicos(categoria) {
    categorias.classList.add('hidden');
    subservicos.classList.remove('hidden');
    listaSubservicos.innerHTML = '';

    dadosServicos[categoria].forEach((servico, i) => {
      const div = document.createElement('div');
      div.classList.add('subservico-card');
      div.innerHTML = `
        <img src="${servico.img}" alt="${servico.nome}" data-img="${servico.img}">
        <div class="subservico-desc" data-index="${i}" data-cat="${categoria}">
          <strong>${servico.nome}</strong>
          <span>${servico.tempo} - R$ ${servico.preco}</span>
        </div>
      `;
      listaSubservicos.appendChild(div);
    });
  }

  // Clicar em descrição = adicionar com campo duracao (minutos)
  listaSubservicos.addEventListener('click', (e) => {
    const el = e.target.closest('.subservico-desc');
    if (el) {
      const { index, cat } = el.dataset;
      const servicoOriginal = dadosServicos[cat][index];

      // Cria novo objeto incluindo duracao numérica para o agendamento
      const servico = {
        nome: servicoOriginal.nome,
        preco: servicoOriginal.preco,
        duracao: servicoOriginal.duracaoMinutos
      };

      // Evitar duplicatas
      if (!servicosEscolhidos.find(s => s.nome === servico.nome)) {
        servicosEscolhidos.push(servico);
        atualizarAgendados();
      }
    }
  });

  // Remover serviço
  listaAgendados.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const idx = e.target.dataset.index;
      servicosEscolhidos.splice(idx, 1);
      atualizarAgendados();
    }
  });

  // Atualizar lista agendada
  function atualizarAgendados() {
    listaAgendados.innerHTML = '';
    servicosEscolhidos.forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${s.nome} - ${s.duracao} min - R$ ${s.preco}
        <button data-index="${i}">×</button>
      `;
      listaAgendados.appendChild(li);
    });
  }

  // Botão agendar — validar e salvar no localStorage
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
    // Salva os serviços no localStorage para usar na página de agendamento
    localStorage.setItem('servicosSelecionados', JSON.stringify(servicosEscolhidos));

    // Redireciona para página de agendamento
    window.location.href = 'agendamento.html';
  });

  // Modal imagem grande (mantém seu código original)
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
  modal.innerHTML = `<img src="" alt="servico" style="max-width:90%; max-height:90%; border-radius:12px;" />`;
  document.body.appendChild(modal);

  listaSubservicos.addEventListener('click', (e) => {
    const img = e.target.closest('img[data-img]');
    if (img) {
      modal.querySelector('img').src = img.dataset.img;
      modal.style.display = 'flex';
    }
  });

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
});
