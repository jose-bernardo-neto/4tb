# Casos de Uso (`use-cases.md`)
**Projeto:** Sistema de Gerenciamento de Turma (Painel do Delegado & Bot WhatsApp)

---

## UC01: Autenticação do Delegado
* **Ator:** Delegado da Turma
* **Pré-condição:** O sistema foi inicializado e a conta padrão do delegado existe no banco de dados.
* **Fluxo Principal:**
  1. O delegado acessa a tela de login do painel web.
  2. Insere suas credenciais (usuário/e-mail e senha).
  3. O sistema valida o hash da senha via `bcryptjs` e gera um token JWT.
  4. O delegado é redirecionado ao dashboard administrativo.
* **Fluxo Alternativo:** Credenciais inválidas retornam mensagem de erro sem expor qual campo está incorreto.

---

## UC02: Configuração e Ativação do Semestre Letivo
* **Ator:** Delegado da Turma
* **Pré-condição:** Delegado autenticado no painel.
* **Fluxo Principal:**
  1. O delegado cadastra um novo Ano Letivo e os respectivos 1º e 2º Semestres seguindo o calendário acadêmico angolano.
  2. O delegado cadastra e vincula pelo menos 3 disciplinas ao semestre desejado.
  3. O delegado aciona a opção "Ativar Semestre".
  4. O sistema verifica se existem $\ge 3$ disciplinas vinculadas.
  5. O sistema desativa o semestre ativo anterior e define o novo semestre como `ATIVO`.
* **Fluxo de Exceção:** Se o semestre tiver menos de 3 disciplinas cadastradas, o sistema bloqueia a ativação e exibe um alerta informando o requisito mínimo.

---

## UC03: Cadastro de Professores e Disciplinas
* **Ator:** Delegado da Turma
* **Pré-condição:** Delegado autenticado e semestre criado.
* **Fluxo Principal:**
  1. O delegado acessa o módulo de Professores e cadastra o docente (nome, grau académico, contato/e-mail).
  2. O delegado acessa o módulo de Disciplinas, informa o nome da cadeira (ex: *Análise Matemática*), sua sigla (ex: `AM`), seleciona o semestre e vincula o professor responsável.
  3. O sistema persiste os dados no SQLite.

---

## UC04: Gestão de Tarefas, Horários, Comunicados e Emolumentos
* **Ator:** Delegado da Turma
* **Pré-condição:** Delegado autenticado e disciplinas cadastradas no semestre ativo.
* **Fluxo Principal:**
  1. O delegado cadastra uma nova tarefa vinculada a uma disciplina específica, definindo título, descrição e data limite.
  2. O delegado atualiza informações gerais da turma: grade de horários (texto ou upload via `multer`), comunicados oficiais e tabela/avisos de emolumentos.
  3. Os dados ficam imediatamente disponíveis para consulta via bot no WhatsApp.

---

## UC05: Consulta de Informações via Slash Commands (WhatsApp)
* **Ator:** Estudante / Membro da Turma (via WhatsApp)
* **Pré-condição:** Bot conectado ao WhatsApp e um semestre marcado como `ATIVO` no sistema.
* **Fluxo Principal:**
  1. O estudante envia um comando de texto no chat ou grupo (ex: `/professores`, `/cadeiras-sm1`, `/tarefas`, `/tarefas-tce`, `/horario`, `/comunicados`, `/meu-np`, `/emolumentos`).
  2. O parser do bot identifica o comando e eventuais parâmetros (como a sigla `tce`).
  3. O bot consulta os serviços referentes ao semestre atualmente ativo.
  4. O bot formata a resposta em texto legível (Markdown do WhatsApp) e responde à mensagem.
* **Fluxos Específicos por Comando:**
  * `/professores`: Lista os professores das cadeiras do semestre ativo.
  * `/cadeiras-sm1` ou `/cadeiras-sm2`: Lista as cadeiras cadastradas no respectivo semestre do ano letivo corrente.
  * `/tarefas`: Lista todas as tarefas pendentes do semestre ativo.
  * `/tarefas-<sigla>`: Filtra as tarefas apenas da disciplina correspondente à sigla informada (ex: `/tarefas-am`).
  * `/horario`, `/comunicados`, `/emolumentos`, `/meu-np`: Retornam os respectivos registros/instruções configurados pelo delegado.
* **Fluxo Alternativo:** Caso a sigla da disciplina não exista no semestre ativo (ex: `/tarefas-xyz`), o bot informa que a disciplina não foi encontrada.

---

## UC06: Resposta Automática a Gatilho de Emoji (Meme Trigger)
* **Ator:** Qualquer participante do chat no WhatsApp
* **Pré-condição:** Bot ativo e arquivo de áudio `faah.mp3` presente no diretório público/assets.
* **Fluxo Principal:**
  1. Um participante envia uma mensagem de texto terminada com o emoji de choro (ex: *"Chumbei na parcelar de AM 😭"*).
  2. O listener de mensagens verifica o final da string após remover espaços extras (`trim()`).
  3. Ao detectar o caractere unicode correspondente ao choro, o bot dispara o envio do áudio `faah.mp3` como resposta direta (reply/PTT) à mensagem original.