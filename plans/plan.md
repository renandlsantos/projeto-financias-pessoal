# 🚀 Plano de Desenvolvimento: Próximos Passos do FinanceFlow

<div align="center">

[![Status](https://img.shields.io/badge/Status-Planejamento-blue?style=for-the-badge)](./)
[![Version](https://img.shields.io/badge/Plano-v1.0-lightgrey?style=for-the-badge)](./)
[![Foco](https://img.shields.io/badge/Foco-Features_Core-purple?style=for-the-badge)](./)

**Um plano de ação detalhado para as próximas iterações de desenvolvimento do FinanceFlow, com tarefas e agentes responsáveis.**

</div>

---

## 🎯 Visão Geral

Este documento delineia o plano de desenvolvimento para as próximas features e melhorias do FinanceFlow. O objetivo é criar um backlog claro e acionável, atribuindo responsabilidades a cada agente especializado para garantir um desenvolvimento paralelo e organizado.

Este plano é um documento vivo e deve ser atualizado pelo **Product Owner** e pelo **Tech Lead** ao final de cada sprint.

---

##  sprint-01: Orçamentos e Metas Financeiras

**Foco do Sprint**: Implementar as funcionalidades core de Orçamentos Mensais e Metas Financeiras, que são essenciais para a proposta de valor do produto.

### 📝 Feature 1: Gestão de Orçamentos (Budgets)

**Descrição**: Permitir que os usuários criem orçamentos mensais por categoria de despesa para controlar seus gastos.

| Tarefa | Agente Responsável | Status |
| :--- | :--- | :--- |
| 1.1. Definir User Stories e Critérios de Aceite para Orçamentos. | 👑 **Product Owner** | ✅ `Concluído` |
| 1.2. Projetar o fluxo de criação, visualização e edição de orçamentos. | ✨ **UX Designer** | ✅ `Concluído` |
| 1.3. Planejar a arquitetura da feature (modelos, serviços, endpoints). | 🛠️ **Tech Lead** | ✅ `Concluído` |
| 1.4. Modelar tabelas `budgets` e `budget_items` e criar migração. | 🗄️ **DBA** | ✅ `Concluído` |
| 1.5. Desenvolver endpoints CRUD para `/budgets`. | 🚀 **Backend Dev** | ✅ `Concluído` |
| 1.6. Desenvolver a página de Orçamentos no frontend com formulários e gráficos. | 🎨 **Frontend Dev** | ✅ `Concluído` |
| 1.7. Criar testes de integração para a API de Orçamentos. | 🏗️ **Infra & QA** | ✅ `Concluído` |
| 1.8. Validar a feature implementada contra os critérios de aceite. | 👑 **Product Owner** | 🚧 `Em Progresso` |

### 💰 Feature 2: Metas Financeiras (Goals)

**Descrição**: Permitir que os usuários criem metas financeiras (ex: "Viagem para a Europa") e acompanhem o progresso.

| Tarefa | Agente Responsável | Status |
| :--- | :--- | :--- |
| 2.1. Definir User Stories e Critérios de Aceite para Metas. | 👑 **Product Owner** | `A Fazer` |
| 2.2. Projetar a interface de criação e acompanhamento de metas. | ✨ **UX Designer** | `A Fazer` |
| 2.3. Modelar a tabela `goals` (com `name`, `target_amount`, `current_amount`, `due_date`) e criar migração. | 🗄️ **DBA** | `A Fazer` |
| 2.4. Desenvolver endpoints CRUD para `/goals` e lógica para vincular transações. | 🚀 **Backend Dev** | `A Fazer` |
| 2.5. Desenvolver a página de Metas no frontend. | 🎨 **Frontend Dev** | `A Fazer` |
| 2.6. Criar testes unitários para o `GoalService`. | 🏗️ **Infra & QA** | `A Fazer` |

---

## sprint-02: Melhorias e Débitos Técnicos

**Foco do Sprint**: Melhorar a experiência do usuário com novas formas de autenticação e refatorar componentes chave para melhorar a performance e manutenibilidade.

### 🔐 Melhoria 1: Login Social

**Descrição**: Implementar login com Google e Apple para facilitar o acesso e reduzir a fricção no cadastro.

| Tarefa | Agente Responsável | Status |
| :--- | :--- | :--- |
| 1.1. Pesquisar e decidir as melhores bibliotecas para OAuth2 com FastAPI e React. | 🛠️ **Tech Lead** | `A Fazer` |
| 1.2. Redesenhar a tela de login para incluir os botões de login social. | ✨ **UX Designer** | `A Fazer` |
| 1.3. Implementar os fluxos OAuth2 no backend, incluindo a criação de usuário. | 🚀 **Backend Dev** | `A Fazer` |
| 1.4. Adicionar os botões e a lógica de redirecionamento no frontend. | 🎨 **Frontend Dev** | `A Fazer` |
| 1.5. Adicionar testes de integração para os novos fluxos de login. | 🏗️ **Infra & QA** | `A Fazer` |

### 🔄 Débito Técnico 2: Refatoração do Dashboard

**Descrição**: Otimizar o carregamento dos dados do dashboard, introduzindo cache e otimizando as queries.

| Tarefa | Agente Responsável | Status |
| :--- | :--- | :--- |
| 2.1. Analisar as queries atuais do dashboard e identificar gargalos. | 🗄️ **DBA** | `A Fazer` |
| 2.2. Propor uma estratégia de cache (ex: Redis) para os dados do dashboard. | 🛠️ **Tech Lead** | `A Fazer` |
| 2.3. Implementar a camada de cache no `DashboardService`. | 🚀 **Backend Dev** | `A Fazer` |
| 2.4. Refatorar os componentes do dashboard no frontend para exibir dados cacheados e atualizar em segundo plano. | 🎨 **Frontend Dev** | `A Fazer` |

---

## 🚀 Próximos Passos

1.  **Product Owner**: Detalhar as User Stories da Feature 1 e 2 no backlog.
2.  **Tech Lead**: Iniciar a discussão técnica sobre a arquitetura de Orçamentos.
3.  **Equipe**: Iniciar o desenvolvimento da **Feature 1: Gestão de Orçamentos**.

---

<div align="center">
**Este plano guiará nosso foco para entregar o máximo de valor aos nossos usuários.**
</div>
