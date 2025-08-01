// Importa e inicializa o Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do Firebase (a que você colou antes)
const firebaseConfig = {
  apiKey: "AIzaSyCPWrq-J2UKlfdIWElcfhN7a1IMbEK3y80",
  authDomain: "painel-agendamento.firebaseapp.com",
  projectId: "painel-agendamento",
  storageBucket: "painel-agendamento.firebasestorage.app",
  messagingSenderId: "192094406681",
  appId: "1:192094406681:web:46a39fbff85684f5d08288"
};

// Inicializa o app e o banco de dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referência ao container da lista no HTML
const listaAgendamentos = document.getElementById("lista-agendamentos");

// Função para buscar agendamentos do Firestore
async function carregarAgendamentos() {
  const querySnapshot = await getDocs(collection(db, "agendamentos"));
  querySnapshot.forEach((doc) => {
    const agendamento = doc.data();
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${agendamento.nome}</strong> agendou <strong>${agendamento.servico}</strong> para <strong>${agendamento.data}</strong> às <strong>${agendamento.horario}</strong>.
    `;
    listaAgendamentos.appendChild(item);
  });
}

// Carrega os dados ao iniciar
carregarAgendamentos();
