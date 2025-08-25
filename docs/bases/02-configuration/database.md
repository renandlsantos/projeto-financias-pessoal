# Configuração do Banco de Dados

O sistema utiliza **PostgreSQL 15** como banco de dados principal.

## Passos para configuração

1. Instale o PostgreSQL 15
2. Crie um banco de dados chamado `financeflow`
3. Configure o usuário e permissões
4. Execute as migrações iniciais (ver instruções de desenvolvimento)

## Estrutura Principal

- Tabelas: users, accounts, categories, transactions, budgets, goals
- Índices para performance em transações, contas e categorias

Veja o [schema detalhado](../04-architecture/database-schema.md).
