# Diagrama entidade-relacionamento

Modelo actual do painel 4TB (SQLite / TypeORM).  
Apenas **um** `Semester` pode estar `ATIVO` em todo o sistema.

```mermaid
erDiagram
  users {
    integer id PK
    varchar username UK
    varchar password_hash
    datetime created_at
    datetime updated_at
  }

  academic_years {
    integer id PK
    varchar label UK
    datetime created_at
  }

  semesters {
    integer id PK
    integer academic_year_id FK
    varchar period
    varchar status
  }

  professors {
    integer id PK
    varchar name
    varchar academic_degree
    varchar contact
  }

  disciplines {
    integer id PK
    varchar name
    varchar acronym
    integer semester_id FK
    integer professor_id FK
  }

  assignments {
    integer id PK
    varchar title
    varchar description
    varchar type
    varchar due_date
    integer discipline_id FK
    datetime created_at
  }

  assignment_attachments {
    integer id PK
    integer assignment_id FK
    varchar stored_name
    varchar original_name
    varchar mime_type
    integer size
  }

  timetables {
    integer id PK
    integer semester_id FK UK
    varchar content
    varchar stored_name
    varchar original_name
    varchar mime_type
  }

  announcements {
    integer id PK
    varchar title
    varchar body
    varchar date
    integer semester_id FK
    datetime created_at
  }

  fees {
    integer id PK
    varchar tipo
    varchar valor
    varchar prazo
    varchar obs
    integer semester_id FK
  }

  students {
    integer id PK
    varchar contact UK
    varchar np UK
    varchar name
  }

  academic_years ||--|{ semesters : "2 semestres"
  semesters ||--o{ disciplines : "cadeiras"
  professors ||--o{ disciplines : "1 responsável"
  disciplines ||--o{ assignments : "tarefas"
  assignments ||--o{ assignment_attachments : "anexos"
  semesters ||--o| timetables : "horário"
  semesters ||--o{ announcements : "comunicados"
  semesters ||--o{ fees : "emolumentos"
```

Notas:

- `users` é a conta do delegado (sem FK para o resto).
- `students` é a turma (contacto WhatsApp → NP); não está ligado a um semestre.
- Sigla (`acronym`) é única **por semestre**.
- `period`: `PRIMEIRO` | `SEGUNDO`. `status`: `ATIVO` | `INATIVO`.
- `assignments.type`: `trabalho` | `prova` | `projeto`.
