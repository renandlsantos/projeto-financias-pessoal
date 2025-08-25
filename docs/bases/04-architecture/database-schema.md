# Modelo de Dados

O modelo de dados principal é baseado em PostgreSQL, com tabelas para usuários, contas, categorias, transações, orçamentos e metas.

## Principais tabelas

- **users**: informações do usuário, autenticação, MFA
- **accounts**: contas bancárias, cartões, investimentos
- **categories**: categorias e subcategorias de transações
- **transactions**: receitas, despesas, transferências, anexos
- **budgets**: orçamentos por categoria/período
- **goals**: metas financeiras

## Exemplo de schema

Veja o [PRD](../../prd.md) para o SQL completo.
