# Análise Técnica e Boas Práticas de Engenharia (MMMVP)

## 1. Análise Crítica das Decisões Iniciais (Prós & Contras)

### Stack Tecnológica

| Decisão | Prós | Contras / Riscos |
| :--- | :--- | :--- |
| **Node.js + TypeScript** | Ecossistema maduro, tipagem estática previne erros em tempo de execução, excelente suporte a bibliotecas de integração com WhatsApp (Baileys, WPPConnect). | Single-thread: operações síncronas pesadas podem bloquear o event loop se não forem bem isoladas. |
| **Express.js** | Simples, leve, flexível e rápido de configurar para uma API MVC tradicional. | Pouco opinativo — exige disciplina arquitetural rigorosa para aplicar SOLID e DRY sem gerar acoplamento. |
| **TypeORM** | Suporte robusto a Data Mapper, migrations integradas e tipagem forte via TypeScript. | Pode gerar queries ineficientes (problema N+1) se as relações não forem carregadas explicitamente. |
| **SQLite3** | Zero configuração, arquivo único, portabilidade extrema, ideal para MVP e baixa concorrência. | Concorrência de escrita limitada (mitigável ativando o modo `WAL`); exigirá migração para PostgreSQL caso o sistema escale para múltiplas turmas/faculdades. |
| **EJS (Views)** | Renderização rápida no servidor, reutilização de *partials* sem necessidade de build complexo de SPA. | Interatividade limitada no frontend caso o painel precise de estados complexos no futuro. |

### Arquitetura (MVC)
* **Prós:** Baixo atrito inicial, estrutura direta e familiar, fácil de manter por um desenvolvedor solo.
* **Contras:** Em sistemas híbridos (Painel Web + Bot WhatsApp), a camada de controle tende a virar *Fat Controllers* (controladores gordos) se a regra de negócio não for extraída para uma camada intermediária de serviços.

---

## 2. Estrutura de Diretórios Recomendada (MVC + Services)

Para manter o padrão MVC fácil de testar e aderente aos princípios **SOLID** e **DRY**, evite colocar regras de negócio nos `Controllers` ou nos handlers do Bot.

```text
src/
├── @types/            # Definições de tipos globais e extensões do Express
├── config/            # Configurações de banco (TypeORM), JWT, Upload (Multer) e Variáveis de Ambiente
├── controllers/       # Recebem requisições HTTP, validam inputs básicos e chamam os Services
├── models/            # Entidades do TypeORM (@Entity) representando as tabelas
├── services/          # Regras de negócio puras (OOP + SOLID). Onde a mágica acontece
├── bot/               # Módulo isolado do WhatsApp
│   ├── commands/      # Classes individuais para cada slash command (Command Pattern)
│   ├── handlers/      # Interceptadores de mensagens e gatilhos (ex: Regex do emoji)
│   └── client.ts      # Inicialização e conexão com o WhatsApp
├── middlewares/       # Autenticação JWT, tratamento global de erros, validação de payloads
├── views/             # Templates EJS organizados por domínio (layouts, partials, pages)
├── public/            # Arquivos estáticos (CSS, JS client-side, áudio faah.mp3)
├── routes/            # Definição das rotas Web/API
├── database/          # Migrations e Seeders (ex: criação da conta padrão do delegado)
└── app.ts             # Ponto de entrada e injeção de dependências
```

---

## 3. Boas Práticas de Engenharia para este Projeto

### 1. Command Pattern no Bot do WhatsApp (Princípio Aberto/Fechado - OCP)
Em vez de criar um bloco gigante de `if / else` ou `switch` para tratar `/professores`, `/tarefas-am`, `/horario`, etc., utilize o **Command Pattern**:
* Crie uma interface `IBotCommand` com um método `execute(args: string[]): Promise<string>`.
* Cada comando é uma classe separada registrada em um `Map<string, IBotCommand>`.
* **Vantagem:** Para adicionar um comando novo no futuro, você apenas cria um novo arquivo de classe e o registra, sem modificar o núcleo do bot. Para comandos dinâmicos por sigla de cadeira (como `/tarefas-tce`), você pode ter um comando base `TarefasCommand` que extrai o sufixo após o hífen (`tce`).

### 2. Ativação do Modo WAL no SQLite3
Como você terá o painel web (escrita) e o bot do WhatsApp (leitura simultânea) acessando o mesmo arquivo `.sqlite`, configure o banco na inicialização para rodar em **Write-Ahead Logging (`PRAGMA journal_mode = WAL;`)**. Isso evita erros de `SQLITE_BUSY` (banco travado) durante acessos concorrentes.

### 3. Migrations e Seeders desde o Dia 1
* **Nunca** use `synchronize: true` do TypeORM em produção, pois alterações nas entidades podem apagar dados reais da turma. Use **Migrations** para versionar o banco.
* Crie um script de **Seeder** executado na inicialização (`npm run seed`) que verifica se já existe um usuário delegado no banco; caso não exista, cria a conta padrão utilizando variáveis de ambiente (`DEFAULT_ADMIN_USER`, `DEFAULT_ADMIN_PASS`).

### 4. Estratégia de Testes (Unitários vs. E2E)
* **Testes Unitários (Jest ou Vitest):** Foque 100% na camada de `services/` e nos parsers do `bot/`. Teste as regras de domínio isoladamente (ex: tentar ativar um semestre com apenas 2 disciplinas deve lançar uma exceção de domínio; testar se a regex captura o emoji de choro apenas no *final* da frase).
* **Testes End-to-End (Supertest + SQLite em memória):** Suba a aplicação Express apontando para um banco SQLite `:memory:`, rode as migrations e teste o fluxo completo das rotas HTTP (Login -> Criar Semestre -> Cadastrar 3 Cadeiras -> Ativar Semestre).

### 5. Tratamento Centralizado de Erros
Crie uma classe base `AppError` (contendo `message` e `statusCode`) e um middleware global de erros no Express. Assim, seus `Services` apenas lançam erros semânticos (ex: `throw new AppError("Um semestre precisa de no mínimo 3 cadeiras para ser ativado", 400)`), e tanto o painel web quanto o bot podem capturar e exibir mensagens amigáveis sem quebrar a aplicação.

### 6. Segurança Básica e Higienização
* **Upload com Multer:** Restrinja rigorosamente os tipos MIME permitidos (ex: apenas PDF, PNG, JPG para horários ou enunciados de tarefas) e limite o tamanho máximo dos arquivos para evitar esgotamento de disco.
* **Rate Limiting no Bot:** Implemente um *cooldown* simples (ex: 2 segundos por usuário) no bot do WhatsApp para evitar que alguém faça spam de comandos ou floode o chat com o áudio do meme.