# Diagramas de sequência (casos de uso)

## UC01 — Autenticação do delegado

```mermaid
sequenceDiagram
  actor D as Delegado
  participant W as Painel EJS
  participant A as AuthService
  participant DB as SQLite

  D->>W: GET /login
  W-->>D: Formulário
  D->>W: POST /login (utilizador, senha)
  W->>A: login()
  A->>DB: buscar user + bcrypt.compare
  alt credenciais inválidas
    A-->>W: AppError genérico
    W-->>D: redirect /login + flash
  else sucesso
    A-->>W: User
    W-->>D: Set-Cookie JWT httpOnly + redirect /
  end
```

## UC02 — Activar semestre letivo

```mermaid
sequenceDiagram
  actor D as Delegado
  participant W as Painel
  participant S as SemesterService
  participant DB as SQLite

  D->>W: POST /semestres/:id/ativar
  W->>S: activate(id)
  S->>DB: contar cadeiras do semestre
  alt menos de 3 cadeiras
    S-->>W: AppError 400
    W-->>D: alerta (flash)
  else ≥ 3 cadeiras
    S->>DB: desactivar o ATIVO anterior
    S->>DB: marcar este como ATIVO
    S-->>W: semestre activo
    W-->>D: redirect + sucesso
  end
```

## UC03 — Professores e disciplinas

```mermaid
sequenceDiagram
  actor D as Delegado
  participant W as Painel
  participant P as ProfessorService
  participant C as DisciplineService
  participant DB as SQLite

  D->>W: POST /professores
  W->>P: create(nome, grau, contacto)
  P->>DB: INSERT professors
  D->>W: POST /semestres/:id/cadeiras
  W->>C: create(nome, sigla, professor)
  C->>DB: unique (semester_id, acronym)
  alt sigla duplicada no semestre
    C-->>W: AppError
    W-->>D: flash de erro
  else ok
    C->>DB: INSERT disciplines
    W-->>D: cadeira listada
  end
```

## UC04 — Tarefas, horário, comunicados e emolumentos

```mermaid
sequenceDiagram
  actor D as Delegado
  participant W as Painel
  participant SV as Services
  participant FS as Disco (uploads)
  participant DB as SQLite

  D->>W: POST tarefa / horário / comunicado / emolumento
  alt com ficheiro (tarefa ou horário)
    W->>FS: Multer (PDF/PNG/JPG)
    W->>SV: persistir metadados
  end
  SV->>DB: INSERT no semestre / cadeira
  DB-->>W: ok
  W-->>D: listagem actualizada
```

## Área do estudante (consulta sem login)

```mermaid
sequenceDiagram
  actor E as Estudante
  participant W as /turma
  participant C as PublicCatalogService
  participant DB as SQLite

  E->>W: GET /turma/...
  W->>C: listar no semestre ATIVO
  alt não há semestre activo
    C-->>W: vazio
    W-->>E: mensagem de espera
  else activo
    C->>DB: professores / cadeiras / tarefas / comunicados / emolumentos
    DB-->>C: só leitura
    W-->>E: páginas públicas
  end
```

## UC05 — Slash commands no WhatsApp (fase 7, planeado)

```mermaid
sequenceDiagram
  actor E as Estudante
  participant WA as WhatsApp
  participant B as Bot
  participant SV as Services
  participant DB as SQLite

  E->>WA: /tarefas-am
  WA->>B: mensagem de texto
  B->>B: Command Pattern (parser)
  B->>SV: consultar semestre ATIVO
  SV->>DB: SELECT
  DB-->>SV: dados
  SV-->>B: texto
  B->>WA: resposta Markdown
  WA-->>E: lista de tarefas AM
```

## UC06 — Gatilho de emoji (fase 7, planeado)

```mermaid
sequenceDiagram
  actor E as Participante
  participant WA as WhatsApp
  participant B as Bot

  E->>WA: "... 😭"
  WA->>B: mensagem
  B->>B: trim + emoji no fim?
  alt 😢 ou 😭 no final
    B->>WA: reply PTT faah.mp3
  else outro texto
    B-->>WA: ignora
  end
```

## Importação CSV de alunos (NP)

```mermaid
sequenceDiagram
  actor D as Delegado
  participant W as Painel
  participant S as StudentService
  participant DB as SQLite

  D->>W: POST /alunos/importar (CSV)
  W->>S: importCsv(contato,np,nome)
  loop cada linha
    S->>S: normalizar contacto → 244…
    alt inválida
      S-->>S: saltar + relatório
    else contacto novo
      S->>DB: INSERT
    else contacto existente
      S->>DB: UPDATE nome/NP
    end
  end
  S-->>W: inseridos / actualizados / saltados
  W-->>D: relatório
```
