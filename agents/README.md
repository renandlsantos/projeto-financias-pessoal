# 🤖 Agentes Especializados para o Projeto FinanceFlow

<div align="center">

[![Status](https://img.shields.io/badge/Status-Ativo-green?style=for-the-badge)](./)
[![Version](https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge)](./)
[![Docs](https://img.shields.io/badge/Docs-Completa-green?style=for-the-badge)](./)

**Um conjunto de prompts de sistema para guiar a IA na execução de tarefas especializadas dentro do ecossistema FinanceFlow.**

</div>

---

## 🎯 Visão Geral

Este diretório contém uma coleção de "agentes" ou "personas" de IA, cada um especializado em uma área específica do projeto FinanceFlow. O objetivo é fornecer um contexto rico e focado para a IA, garantindo que as respostas e o código gerado estejam alinhados com nossa arquitetura, stack tecnológico e padrões de desenvolvimento.

Ao iniciar uma interação com a IA, copie e cole o conteúdo do agente relevante para definir o `system prompt`. Isso garante que a IA "vista a camisa" daquele especialista.

---

## 📋 Índice de Agentes

| Agente | Descrição | Quando Usar | Link |
| :--- | :--- | :--- | :--- |
| 👑 **Product Owner** | Focado em regras de negócio, requisitos, PRD e visão do produto. | Para criar user stories, definir critérios de aceite, validar features e alinhar com os objetivos de negócio. | [Ver Prompt](./product_owner.md) |
| 🛠️ **Tech Lead** | Visão macro da arquitetura, decisões técnicas, qualidade de código e integração. | Para planejar novas features, revisar arquitetura, definir padrões e garantir a coesão técnica do projeto. | [Ver Prompt](./tech_lead.md) |
| 🎨 **Frontend Dev** | Especialista no stack React, TypeScript, Material-UI e Vite. | Para criar componentes, desenvolver páginas, integrar APIs e resolver problemas de UI/UX. | [Ver Prompt](./frontend_developer.md) |
| 🚀 **Backend Dev** | Especialista no stack FastAPI, Python, SQLAlchemy e PostgreSQL. | Para criar endpoints, desenvolver serviços, modelar dados e otimizar a lógica de negócio. | [Ver Prompt](./backend_developer.md) |
| 🗄️ **DBA** | Focado em PostgreSQL, Alembic, otimização de queries e integridade dos dados. | Para criar migrações, otimizar performance do banco, modelar tabelas e garantir a segurança dos dados. | [Ver Prompt](./database_administrator.md) |
| 🏗️ **Infra & QA** | Especialista em Docker, CI/CD, testes (pytest/vitest) e qualidade. | Para configurar pipelines, criar testes, gerenciar containers e garantir a estabilidade do ambiente. | [Ver Prompt](./infra_quality.md) |
| ✨ **UX Designer** | Focado na experiência do usuário, usabilidade, design system e Material-UI. | Para projetar fluxos de usuário, criar mockups, definir componentes e garantir uma interface intuitiva. | [Ver Prompt](./ux_designer.md) |

---

## 🚀 Como Usar

1.  **Escolha o Agente**: Identifique qual especialista é mais adequado para a sua tarefa.
2.  **Copie o Prompt**: Abra o arquivo `.md` do agente escolhido e copie todo o seu conteúdo.
3.  **Defina o System Prompt**: Cole o conteúdo copiado como a primeira instrução (system prompt) na sua conversa com a IA.
4.  **Execute a Tarefa**: Prossiga com sua solicitação. A IA agora atuará com o conhecimento e as restrições daquele especialista.

### Exemplo de Uso

```markdown
**[Conteúdo do frontend_developer.md colado aqui]**

---

**Tarefa:** Crie um novo componente React chamado `TransactionList` que exibe uma lista de transações. Use a tabela do Material-UI e siga os padrões do nosso design system.
```

---

## 💡 Benefícios

-   **Consistência**: Garante que a IA siga os padrões e o stack tecnológico do projeto.
-   **Eficiência**: Reduz a necessidade de explicar o contexto a cada nova solicitação.
-   **Qualidade**: Evita "alucinações" e sugestões de bibliotecas inadequadas.
-   **Foco**: Permite que a IA se concentre em resolver o problema dentro das restrições definidas.
-   **Colaboração**: Simula uma equipe de desenvolvimento especializada, melhorando a qualidade das soluções.

---

<div align="center">
**Use esses agentes para maximizar a eficácia da IA no desenvolvimento do FinanceFlow.**
</div>
