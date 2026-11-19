# 4TB

Sistema de gerenciamento da turma **4TB**: painel web do delegado e, depois, bot de consulta no WhatsApp.

O monólito serve um único propósito: o delegado administra o semestre letivo no painel; os membros da turma consultam esses dados no WhatsApp por slash commands.

Documentação em [`docs/`](docs/README.md):

- [Especificações](docs/especifica_es_t_cnicas_do_sistema.md)
- [Casos de uso](docs/casos_de_uso_iniciais.md)
- [Análise técnica](docs/an_lise_t_cnica_e_boas_pr_ticas.md)
- [Tasks](docs/TASKS.md)
- [Diagrama ER](docs/diagrama-er.md)
- [Sequências](docs/diagramas-sequencia.md)

## Escopo do MMVP

**Painel (prioridade):** login do delegado, calendário acadêmico, professores, disciplinas, tarefas, horário, comunicados, emolumentos e alunos (NP).

**Bot (último):** slash commands de consulta no semestre ativo e gatilho de áudio no emoji de choro.

## Stack

| Camada | Escolha |
| :--- | :--- |
| Runtime | Node.js + TypeScript (strict) |
| Pacotes | pnpm |
| Web | Express.js + EJS |
| UI | HTML + CSS próprio (sem framework) |
| Banco | TypeORM com driver intercambiável: SQLite3 (dev/testes, modo WAL) ou Supabase Postgres (produção) |
| Auth | JWT em cookie `httpOnly` + `bcryptjs` |
| Upload | Multer (horário e anexos permitidos) |
| Testes | Vitest (unitário) + Supertest (E2E) |

Biblioteca do WhatsApp fica para a fase do bot e será alinhada naquele momento.

## Regras de domínio

- Conta padrão do delegado é criada no seed (`DEFAULT_ADMIN_USER` / `DEFAULT_ADMIN_PASS`).
- Só o delegado autenticado altera dados. O bot (quando existir) é só leitura.
- Ano letivo no formato `2025/2026`, com **2 semestres** (1.º e 2.º).
- **Apenas 1 semestre** pode estar `ATIVO`. Ativar um desativa o anterior.
- Semestre só ativa com **no mínimo 3 disciplinas**.
- Cada disciplina tem **um** professor responsável, nome, sigla única **no semestre** (ex.: `AM`, `TCE`) e pertence a um semestre.
- Tarefas pertencem a uma disciplina: título, descrição, tipo (`trabalho` \| `prova` \| `projeto`) e data limite.
- Horário: texto **e/ou** ficheiro (PDF/PNG/JPG).
- Comunicados são **por semestre**.
- Emolumentos: tabela por semestre com `tipo`, `valor`, `prazo`, `obs`.
- Alunos (`contato`, `np`, `nome`): importação CSV **e** CRUD manual no painel.
- `contato` aceita vários formatos na entrada e é **normalizado** para dígitos com indicativo `244`.
- CSV inválido: **salta a linha** e continua; o relatório lista inseridos, atualizados e falhas.
- `/meu-np` usa o contacto WhatsApp para devolver NP e nome.
- Consultas do bot usam **somente** o semestre ativo.

## Arquitetura

MVC com camada de **services**. Controllers e handlers do bot não concentram regra de negócio.

```text
src/
├── @types/
├── config/
├── controllers/
├── models/
├── services/
├── bot/                 # fase final
├── middlewares/
├── views/
├── public/
├── routes/
├── database/            # migrations + seed
└── app.ts
```

Princípios: SOLID, DRY, OOP, erros via `AppError` + middleware global, migrations desde o dia 1 (`synchronize: false`).

O acesso ao banco segue o princípio da inversão de dependência: os services dependem de `Repository<T>` (abstração do TypeORM) e a conexão é criada por um `DatabaseAdapter` (`src/config/database/`) com duas implementações — `SqliteDatabase` e `SupabaseDatabase` — selecionadas pela variável `DB_DRIVER`.

## Entidades (painel)

```text
User (delegado)
AcademicYear (rótulo 2025/2026) 1──N Semester (apenas um ATIVO no sistema)
Semester 1──N Discipline
Professor 1──N Discipline
Discipline 1──N Assignment (tipo: trabalho | prova | projeto)
Semester 1──1? Timetable (texto + ficheiro)
Semester 1──N Announcement
Semester 1──N Fee (tipo, valor, prazo, obs)
Student (contato normalizado, np, nome)  — CSV + CRUD
```

## Como correr

```bash
pnpm install
cp .env.example .env   # preencher JWT_SECRET e a senha do delegado
pnpm dev
```

Abre `http://localhost:3000` (redirecciona para `/login`). Na primeira inicialização o sistema corre as migrations automaticamente, activa WAL no SQLite (quando `DB_DRIVER=sqlite`) e garante a conta padrão do delegado — em qualquer driver.

### Supabase (produção)

Para usar o Supabase como banco (recomendado na Vercel, onde o SQLite em `/tmp` perde os dados a cada deploy):

1. Crie um projeto no [Supabase](https://supabase.com) e copie a connection string (**Session mode**, porta `5432`) em *Project Settings → Database*.
2. Defina no ambiente:

```bash
DB_DRIVER=supabase
SUPABASE_DB_URL=postgresql://postgres.<ref>:<senha>@aws-0-<regiao>.pooler.supabase.com:5432/postgres
```

Na primeira inicialização as migrations correm automaticamente contra o Postgres, tal como no SQLite. Na Vercel define `JWT_SECRET`, `DEFAULT_ADMIN_USER`, `DEFAULT_ADMIN_PASS`, `DB_DRIVER=supabase` e `SUPABASE_DB_URL`. Os uploads continuam em `/tmp` (efémeros entre deploys).

```bash
pnpm seed              # reexecuta o seed à mão
pnpm migration:run
pnpm test
```

As entidades TypeORM devem declarar `type` em cada coluna regular (`varchar`, `integer`): o `tsx` não emite `design:type`. Exceção: `@CreateDateColumn`/`@UpdateDateColumn` **não** devem fixar `type: "datetime"` — omitir o tipo deixa o TypeORM escolher `datetime` no SQLite e `timestamp` no Postgres. Nas migrations, use o helper `timestampType(queryRunner)` para o mesmo efeito.

## Variáveis de ambiente

```bash
PORT=3000
NODE_ENV=development
DB_DRIVER=sqlite          # sqlite | supabase
DB_PATH=./data/4tb.sqlite # usada apenas com DB_DRIVER=sqlite
SUPABASE_DB_URL=          # obrigatória com DB_DRIVER=supabase
JWT_SECRET=
JWT_EXPIRES_IN=8h
COOKIE_NAME=4tb_token
DEFAULT_ADMIN_USER=
DEFAULT_ADMIN_PASS=
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=5242880
```

## Ordem de construção

1. Fundação (projeto, TypeORM, layout EJS, erros)
2. Autenticação do delegado
3. Ano letivo e semestres (activar com regra das 3 cadeiras)
4. Professores e disciplinas
5. Tarefas, horário, comunicados, emolumentos
6. Alunos (CSV + CRUD, NP)
7. Testes do painel
8. **Bot WhatsApp por último**

Detalhe em [`docs/TASKS.md`](docs/TASKS.md).
