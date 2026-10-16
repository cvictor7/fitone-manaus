/* ====== CONFIGURAÇÃO DO CLIENTE (troque aqui) ======
   Este arquivo vale para o site inteiro (início e planos).
   Edite no GitHub (lápis), salve com "Commit changes" e o Cloudflare publica sozinho. */
const CONFIG = {
  whatsapp: "5592984163597",            // número com DDI+DDD, só dígitos
  instagram: "https://www.instagram.com/fit1_manaus/",   // vazio = esconde o botão
  fotos: [],                             // ex.: ["assets/fotos/salao.jpg","assets/fotos/cross.jpg", ...] até 5

  // Medição de visitas e cliques (Umami, sem cookies). Vazio = não mede nada.
  // Depois de criar o site no Umami, cole aqui o "Website ID" (um código tipo 1a2b3c4d-....).
  umamiId: "",
  umamiScript: "https://cloud.umami.is/script.js",
  dominio: "fitonemanaus.com.br",        // só conta visitas vindas deste domínio (ignora prévias e testes)

  // Avisos: faixas no topo do site. Cada aviso some sozinho depois da data "ate" (formato AAAA-MM-DD, vale até o fim desse dia).
  // "de" é opcional (só aparece a partir dessa data). "cor" é opcional: "rosa" ou "amarelo" (sem cor = verde).
  // "curto" (opcional) é a versão de uma linha que aparece no celular; o toque no "+" abre o texto inteiro.
  // Lista vazia = nada aparece. Para mais de um aviso, separe por vírgula.
  // Exemplo: {titulo:"Aulão Setembro Amarelo", texto:"Sábado, 20/09, às 7h15.", cor:"amarelo", de:"2026-09-15", ate:"2026-09-20"}
  avisos: [
    {titulo: "Aulão Outubro Rosa", texto: "Sábado, 17/10, às 7h15, para os alunos da Fit One. Vá de rosa, com sorteios e brindes. Juntos por mais vida!", curto: "Sáb, 17/10, 7h15", cor: "rosa", de: "2026-10-16", ate: "2026-10-17"}
  ],

  // Feriados e dias com horário diferente. Preencha uma linha por dia; depois do dia, não faz mais nada.
  // Nesse dia o "Aberto agora" e a tabela de horários usam o horário especial, e um aviso aparece sozinho
  // nos 5 dias anteriores (mude com "avisoDe"). Para dia fechado, troque abre/fecha por null.
  // Exemplo: {data:"2026-11-02", nome:"Finados", abre:6, fecha:12}
  excecoes: [],

  // Grade de aulas: chave = dia da semana (0 domingo ... 6 sábado), valor = lista de [horário, aula]
  // ATENÇÃO: a tabela da grade também existe escrita direto no index.html (é o que o Google e as IAs leem).
  // Se mudar a grade aqui, peça pro Claude gerar a tabela do index.html de novo, senão ela fica desatualizada pros robôs.
  grade: {
    1: [["05:30","Cross"],["06:30","Cross/Hyrox"],["07:00","Spinning"],["07:30","Cross"],["08:30","Cross"],["16:00","Cross"],["17:00","Cross"],["18:00","Cross"],["19:00","Cross"],["20:00","Cross"]],
    2: [["05:30","Cross"],["06:30","Funcional"],["07:30","Funcional"],["08:30","Cross"],["16:00","Cross"],["17:00","Kids/Func"],["18:00","Kids/Func"],["19:00","Spinning/Cross"]],
    3: [["05:30","Cross"],["06:30","Cross"],["07:00","Spinning"],["07:30","Cross"],["08:30","Cross"],["16:00","Cross"],["17:00","Cross"],["18:00","Cross"],["19:00","Cross"],["20:00","Cross"]],
    4: [["05:30","Hybrid"],["06:30","Hybrid"],["07:30","Hybrid"],["08:30","Hybrid"],["16:00","Hybrid"],["17:00","Kids/Hybrid"],["18:00","Kids/Hybrid"],["19:00","Spinning/Hybrid"]],
    5: [["05:30","Cross"],["06:30","Hybrid"],["07:30","Cross"],["08:30","Cross"],["16:00","Cross"],["17:00","Cross"],["18:00","Cross"],["19:00","Cross"]],
    6: [["07:15","Aulão"],["09:30","Matpilates"]],
    0: [["07:00","Hybrid"]]
  },
  horarios: {0:[7,11],1:[5,22],2:[5,22],3:[5,22],4:[5,22],5:[5,22],6:[6,14]}
};
/* =================================================== */
