# Especificações Técnicas (`specs.md`)
**Projeto:** Sistema de Gerenciamento de Turma (Painel do Delegado & Bot WhatsApp)  
**Versão:** 1.0.0 (MMMVP)

---

## 1. Visão Geral
O sistema é um monólito modular construído em Node.js e TypeScript seguindo o padrão arquitetural MVC enriquecido com camada de Serviços. Ele integra um painel web administrativo (EJS) para o delegado da turma e um bot automatizado no WhatsApp que responde exclusivamente a comandos de texto (*slash commands*) e gatilhos específicos de reação.

## 2. Stack Tecnológica
* **Runtime & Linguagem:** Node.js, TypeScript (Strict Mode)
* **Framework Web:** Express.js
* **Template Engine:** EJS (Server-Side Rendering)
* **ORM & Banco de Dados:** TypeORM + SQLite3 (com WAL mode ativado)
* **Segurança & Autenticação:** `bcryptjs` (hash de senhas), `jsonwebtoken` (JWT para sessão)
* **Upload de Arquivos:** `multer` (armazenamento local organizado)
* **Testes:** Vitest ou Jest (Unitários) + Supertest (End-to-End)

## 3. Regras de Negócio e Domínio (Domain Rules)

### 3.1. Autenticação e Acesso
* **Conta Padrão:** Ao inicializar pela primeira vez, o sistema deve garantir a existência de uma conta administrativa padrão para o delegado.
* **Controle de Acesso:** Apenas usuários autenticados podem acessar as rotas de criação, edição e exclusão no painel web. O bot no WhatsApp é público para consulta dos membros do grupo/turma.

### 3.2. Calendário Acadêmico (Padrão Ensino Superior - Angola)
* **Estrutura do Ano Letivo:** Cada ano letivo é composto obrigatoriamente por **2 semestres** (1º Semestre e 2º Semestre).
* **Unicidade de Estado Ativo:** Apenas **1 semestre** pode estar marcado como `ATIVO` no sistema em um determinado momento. Ao ativar um semestre, qualquer outro semestre anteriormente ativo deve ser automaticamente desativado.
* **Regra Mínima de Ativação:** Um semestre **não pode** ser ativado se possuir menos de **3 disciplinas (cadeiras)** vinculadas a ele.

### 3.3. Entidades e Relacionamentos
* **Professor $\leftrightarrow$ Disciplina:** Um professor pode lecionar várias disciplinas ($1:N$ ou $N:N$ conforme necessidade da cadeira).
* **Semestre $\rightarrow$ Disciplina:** Uma disciplina pertence a um semestre específico ($1:N$) e deve possuir um nome completo e uma sigla identificadora única no semestre (ex: `TCE`, `AM`).
* **Disciplina $\rightarrow$ Tarefa:** Uma disciplina pode possuir múltiplas tarefas/avaliações associadas ($1:N$), contendo descrição, tipo (trabalho, prova, projeto) e data de entrega.

### 3.4. Comportamento do Bot WhatsApp
* **Escopo de Consulta:** Todos os comandos executados no WhatsApp devem consultar e retornar dados pertencentes **exclusivamente ao semestre ativo**.
* **Formato de Interação:** O bot processa apenas mensagens de texto iniciadas com `/` (*slash commands*). Não há suporte para transcrição ou comandos por áudio.
* **Gatilho de Meme (Easter Egg):** Caso uma mensagem de texto recebida no chat termine com o emoji de choro (ex: `😢` ou `😭`, ignorando espaços em branco ao final), o bot deve responder enviando o arquivo de áudio estático predefinido (`faah.mp3`).

## 4. Requisitos Não-Funcionais
* **Qualidade de Código:** Adesão estrita aos princípios **SOLID**, **DRY** e Programação Orientada a Objetos (OOP) com tipagem forte.
* **Confiabilidade:** Cobertura de testes unitários para regras de negócio e testes End-to-End (E2E) para os fluxos críticos da API/Painel.
* **Manutenibilidade:** Separação clara entre infraestrutura (Express, TypeORM, cliente WhatsApp) e regras de domínio (Services).