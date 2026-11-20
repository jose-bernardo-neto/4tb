# Tasks de implementação — 4TB

Ordem fixa: **painel administrativo primeiro**, bot WhatsApp **por último**.  
Não avançar de fase sem os critérios de aceite da fase actual.

## Decisões alinhadas

- Nome: **4TB**
- Pacotes: **pnpm**
- Disciplina tem **1 professor**
- JWT em **cookie httpOnly**
- UI: **CSS simples**
- Testes: **Vitest**
- Ano letivo: **`2025/2026`**
- Horário: **texto + ficheiro**
- Comunicados: **por semestre**
- Tarefas: tipo enum **`trabalho | prova | projeto`**
- Emolumentos: **`tipo`, `valor`, `prazo`, `obs`**
- Alunos: CSV `contato,np,nome` **+ CRUD manual**
- Contacto: aceitar vários formatos e **normalizar para dígitos com 244**
- CSV: **saltar linha inválida** e continuar, com relatório

---

## Fase 0 — Fundação do painel

- [x] Inicializar Node + TypeScript strict, Express, EJS, TypeORM, SQLite WAL, **pnpm**
- [x] Estrutura de pastas MVC + `services/`
- [x] `AppError` + middleware global de erros
- [x] Layout EJS base (header, nav, flash de erro/sucesso) + CSS próprio
- [x] Config de env, Multer (MIME PDF/PNG/JPG, limite de tamanho)
- [x] Migrations (sem `synchronize: true`)
- [x] Seeder da conta padrão do delegado
- [x] Página inicial (dashboard vazio) e 404/500 — auth na Fase 1

**Aceite:** `pnpm dev` sobe, seed cria o delegado, layout renderiza, banco em ficheiro SQLite.

---

## Fase 1 — Autenticação (UC01)

- [x] Entidade `User` (email/username, hash bcrypt)
- [x] `AuthService`: login, hash, emissão JWT
- [x] Cookie httpOnly, Secure em produção, SameSite
- [x] Views: login + logout
- [x] Middleware `ensureAuthenticated` nas rotas do painel
- [x] Erro genérico se credenciais inválidas (não revelar qual campo falhou)
- [x] Testes: login ok, login inválido, rota protegida sem cookie

**Aceite:** delegado entra, vê o dashboard, sai; URL protegida redirecciona ao login.

---

## Fase 2 — Ano letivo e semestres (UC02)

- [x] Entidades `AcademicYear` (rótulo `2025/2026`) e `Semester` (`PRIMEIRO` | `SEGUNDO`, `ATIVO` | `INATIVO`)
- [x] CRUD de ano letivo criando os 2 semestres
- [x] Listar semestres, ver disciplinas vinculadas (contagem)
- [x] `activateSemester`: bloqueia se `< 3` disciplinas; desactiva o anterior
- [x] UI de alerta quando a activação é recusada
- [x] Testes de domínio da regra das 3 cadeiras e da unicidade do activo

**Aceite:** só um semestre activo; activar com 2 cadeiras falha; com 3+ sucede.

---

## Fase 3 — Professores e disciplinas (UC03)

- [x] Entidade `Professor` (nome, grau académico, contacto/email)
- [x] CRUD professores
- [x] Entidade `Discipline` (nome, sigla, semestre, professor)
- [x] Sigla única **por semestre** (não global)
- [x] CRUD disciplinas vinculadas a um semestre e a 1 professor
- [x] Validação: não activar semestre sem 3 cadeiras (já na fase 2, revalidar aqui)
- [x] Testes: sigla duplicada no mesmo semestre; professor 1:N disciplinas

**Aceite:** dá para montar um semestre com ≥ 3 cadeiras e activá-lo.

---

## Fase 4 — Conteúdo do semestre (UC04)

Fazer nesta ordem, um módulo de cada vez:

### 4.1 Tarefas

- [x] Entidade `Assignment` ligada à disciplina
- [x] CRUD: título, descrição, tipo (`trabalho | prova | projeto`), data limite
- [x] Listar por disciplina e por semestre
- [x] Anexos: foto com preview + baixar; PDF/outros só baixar
- [x] Testes de criação/listagem no semestre

### 4.2 Horário

- [x] Texto + upload opcional (PDF/PNG/JPG) no semestre
- [x] Substituir ficheiro antigo ao reenviar
- [x] Visualizar no painel

### Área pública do estudante (extra)

- [x] Entrar em `/turma` sem login
- [x] Consulta read-only: professores, cadeiras e tarefas do semestre **activo**
- [x] Anexos das tarefas visíveis na área pública (preview/download)

### 4.3 Comunicados

- [x] CRUD de comunicados oficiais **do semestre** (título, corpo, data)
- [x] Listar só os do semestre em contexto (o bot, no futuro, lista os do activo)

### 4.4 Emolumentos

- [x] CRUD por semestre: `tipo`, `valor`, `prazo`, `obs`
- [x] Listar no painel

**Aceite:** delegado gere tarefas, horário, comunicados e emolumentos sem o bot existir.

---

## Fase 5 — Alunos / NP (preparação do `/meu-np`)

Painel, ainda sem bot:

- [x] Entidade `Student` (`contato` único normalizado, `np`, `nome`)
- [x] Normalizar contacto: remover espaços/`+`/zeros à esquerda e garantir prefixo `244`
- [x] Importar CSV com cabeçalho `contato,np,nome`
- [x] Linha inválida ou contacto ilegível: **saltar** e acumular no relatório
- [x] Relatório: inseridos, actualizados, linhas saltadas
- [x] CRUD manual (criar, editar, apagar) + listar
- [x] Reimportação actualiza pelo `contato` normalizado

**Aceite:** CSV misto importa as linhas boas; o painel também cria/edita/apaga aluno; lookup futuro por número WhatsApp encontra NP e nome.

---

## Fase 6 — Testes e endurecimento do painel

- [x] Unitários nos services (activação, unicidade de sigla, auth, normalização de contacto, import CSV)
- [x] E2E Supertest + SQLite `:memory:`  
      Login → ano `2025/2026` → 3 cadeiras → activar → tarefa → comunicado → emolumento → CSV + CRUD aluno
- [x] Rate limit no login / tamanho de upload (Multer) / sanitização EJS (`<%=`)

**Aceite:** fluxo crítico do painel verde nos testes.

---

## Fase 7 — Bot WhatsApp (último)

Não começar antes das fases 0–6.

- [x] Escolher e alinhar a lib (whatsapp-web.js, topologia unificada)
- [x] Cliente isolado em `src/bot/`
- [x] Command Pattern (`IBotCommand`)
- [x] Comandos só no semestre **activo**:
  - `/professores`
  - `/cadeiras-sm1` `/cadeiras-sm2`
  - `/tarefas` `/tarefas-<sigla>`
  - `/horario` `/comunicados` `/emolumentos`
  - `/meu-np` (lookup pelo contacto WhatsApp já normalizado)
- [x] Gatilho: mensagem que **termina** em 😢 ou 😭 → reply PTT `faah.mp3` (falta o ficheiro de áudio)
- [x] Cooldown ~2s por utilizador
- [x] Testes de parser/comandos sem WhatsApp real

**Aceite:** grupo consulta o semestre activo; NP resolve pelo número; meme só no emoji final.

---

## Fora deste MMVP

- Multi-turma / multi-faculdade
- PostgreSQL
- SPA / framework CSS
- Comandos de áudio ou NLP
- Papéis além do delegado
