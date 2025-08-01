// Importa e inicializa o Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Configuração do Firebase (Realtime Database)
const firebaseConfig = {
  apiKey: "AIzaSyCPWrq-J2UKlfdIWElcfhN7a1IMbEK3y80",
  authDomain: "painel-agendamento.firebaseapp.com",
  projectId: "painel-agendamento",
  storageBucket: "painel-agendamento.appspot.com",
  messagingSenderId: "192094406681",
  appId: "1:192094406681:web:46a39fbff85684f5d08288",
  databaseURL: "https://painel-agendamento-default-rtdb.firebaseio.com"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referência ao container no HTML
const listaAgendamentos = document.getElementById("lista-agendamentos");

// Carregar dados do Realtime Database
async function carregarAgendamentos() {
  const dbRef = ref(db, "agendamentos");

  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const dados = snapshot.val();

      // Percorre os dias (datas)
      Object.keys(dados).forEach((data) => {
        const agendamentosDoDia = dados[data];
        agendamentosDoDia.forEach((agendamento) => {
          const item = document.createElement("li");
          item.innerHTML = `
            <strong>${agendamento.nome}</strong> agendou <strong>${agendamento.servico}</strong>
            para <strong>${data}</strong> às <strong>${agendamento.horario}</strong>.
          `;
          listaAgendamentos.appendChild(item);
        });
      });
    } else {
      listaAgendamentos.innerHTML = "<li>Nenhum agendamento encontrado.</li>";
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    listaAgendamentos.innerHTML = "<li>Erro ao carregar agendamentos.</li>";
  }
}

// Executa ao iniciar
carregarAgendamentos();
