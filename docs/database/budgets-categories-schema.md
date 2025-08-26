# 🗄️ Database Schema: Budgets & Categories

<div align="center">

[![Schema](https://img.shields.io/badge/Schema-Budgets_Categories-blue?style=for-the-badge)](./)
[![Owner](https://img.shields.io/badge/Owner-DBA-green?style=for-the-badge)](./)
[![Status](https://img.shields.io/badge/Status-Schema_Definido-success?style=for-the-badge)](./)

**Modelagem de dados para sistema de orçamentos e categorias**

</div>

---

## 🎯 Visão Geral

Esta documentação detalha a modelagem de dados para o sistema de orçamentos e categorias do FinanceFlow, incluindo:

- **Tabela `categories`**: Categorização hierárquica de transações
- **Tabela `budgets`**: Orçamentos mensais por categoria
- **Relacionamentos**: Foreign keys e constraints
- **Performance**: Índices otimizados para queries frequentes
- **Integridade**: Constraints e validações de dados

---

## 📊 Diagrama Entidade-Relacionamento

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     users       │         │   categories    │         │     budgets     │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │◄────────│ user_id (UUID)  │◄────────│ user_id (UUID)  │
│ email           │         │ id (UUID) PK    │◄────────│ category_id     │
│ password_hash   │         │ name            │         │ id (UUID) PK    │
│ full_name       │         │ type (enum)     │         │ year            │
│ is_active       │         │ icon            │         │ month           │
│ created_at      │         │ color           │         │ limit_amount    │
│ ...             │         │ parent_id ──────┤         │ alert_%_1       │
└─────────────────┘         │ is_system       │         │ alert_%_2       │
                            │ is_active       │         │ alerts_enabled  │
                            │ sort_order      │         │ is_active       │
                            │ created_at      │         │ created_at      │
                            └─────────────────┘         └─────────────────┘
                                     │                           │
                                     └───────────────────────────┘
                                        (self-reference)

                            ┌─────────────────┐
                            │  transactions   │  
                            ├─────────────────┤
                            │ id (UUID) PK    │
                            │ user_id         │
                            │ category_id ────┤ (relacionamento futuro)
                            │ amount          │
                            │ date            │
                            │ type            │
                            └─────────────────┘
```

---

## 🏗️ Estrutura das Tabelas

### Tabela `categories`

```sql
CREATE TABLE categories (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dados da Categoria
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,  -- 'income', 'expense', 'transfer'
    icon VARCHAR(50),                -- Emoji ou código do ícone
    color VARCHAR(7),                -- Hex color (#FF9800)
    
    -- Hierarquia (Subcategorias)
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Metadados
    is_system BOOLEAN NOT NULL DEFAULT FALSE,  -- Categoria padrão do sistema
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT uix_user_category_name_type 
        UNIQUE (user_id, name, type),
        
    -- Validações
    CONSTRAINT ck_categories_valid_color 
        CHECK (color ~* '^#[0-9A-F]{6}$' OR color IS NULL),
    CONSTRAINT ck_categories_name_length 
        CHECK (LENGTH(TRIM(name)) >= 2),
    CONSTRAINT ck_categories_no_self_parent 
        CHECK (id != parent_id)
);
```

### Tabela `budgets`

```sql
CREATE TABLE budgets (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Período do Orçamento
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    
    -- Configurações Financeiras
    limit_amount DECIMAL(15,2) NOT NULL,
    
    -- Sistema de Alertas
    alert_percentage_1 INTEGER NOT NULL DEFAULT 80,
    alert_percentage_2 INTEGER NOT NULL DEFAULT 95,
    alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints Únicos
    CONSTRAINT uix_user_category_period 
        UNIQUE (user_id, category_id, year, month),
    
    -- Validações de Negócio
    CONSTRAINT ck_budgets_positive_limit 
        CHECK (limit_amount > 0),
    CONSTRAINT ck_budgets_valid_month 
        CHECK (month >= 1 AND month <= 12),
    CONSTRAINT ck_budgets_valid_year 
        CHECK (year >= 2020 AND year <= 2030),
    CONSTRAINT ck_budgets_valid_alert1 
        CHECK (alert_percentage_1 >= 1 AND alert_percentage_1 <= 100),
    CONSTRAINT ck_budgets_valid_alert2 
        CHECK (alert_percentage_2 >= 1 AND alert_percentage_2 <= 100),
    CONSTRAINT ck_budgets_alert2_greater 
        CHECK (alert_percentage_2 > alert_percentage_1)
);
```

### Tipo ENUM `transaction_type`

```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
```

---

## 📈 Índices para Performance

### Índices da Tabela `categories`

```sql
-- Índice principal para queries por usuário
CREATE INDEX ix_categories_user_id ON categories(user_id);

-- Índice composto para listagem por tipo
CREATE INDEX ix_categories_user_type_active 
ON categories(user_id, type, is_active);

-- Índice para hierarquia (subcategorias)
CREATE INDEX ix_categories_parent_id ON categories(parent_id);

-- Índice para categorias sistema (templates)
CREATE INDEX ix_categories_system_active 
ON categories(is_system, is_active);

-- Índice para busca otimizada
CREATE INDEX ix_categories_user_type_name 
ON categories(user_id, type, name) WHERE is_active = TRUE;

-- Índice para ordenação
CREATE INDEX ix_categories_parent_sort 
ON categories(parent_id, sort_order) WHERE is_active = TRUE;
```

### Índices da Tabela `budgets`

```sql
-- Índice principal para queries por período
CREATE INDEX ix_budgets_user_period 
ON budgets(user_id, year, month);

-- Índice para queries por categoria
CREATE INDEX ix_budgets_user_category 
ON budgets(user_id, category_id);

-- Índice para listagem de orçamentos ativos
CREATE INDEX ix_budgets_user_active 
ON budgets(user_id, is_active);

-- Índice para relatórios globais
CREATE INDEX ix_budgets_period 
ON budgets(year, month);
```

---

## 🔗 Relacionamentos e Integridades

### Foreign Keys

1. **categories.user_id → users.id**
   - `ON DELETE CASCADE`: Remove categorias do usuário
   - **Exceção**: `user_id = NULL` para categorias sistema

2. **categories.parent_id → categories.id**
   - `ON DELETE CASCADE`: Remove subcategorias junto com categoria pai
   - Auto-referência para hierarquia

3. **budgets.user_id → users.id**
   - `ON DELETE CASCADE`: Remove orçamentos do usuário

4. **budgets.category_id → categories.id**
   - `ON DELETE CASCADE`: Remove orçamentos da categoria

### Constraints de Integridade

#### Categories
- **Unicidade**: Mesmo usuário não pode ter categorias com mesmo nome+tipo
- **Nome válido**: Mínimo 2 caracteres, não pode ser vazio
- **Cor válida**: Hex format #RRGGBB ou NULL
- **Auto-referência**: Categoria não pode ser pai de si mesma

#### Budgets
- **Período único**: Um orçamento por usuário+categoria+mês+ano
- **Valores positivos**: `limit_amount > 0`
- **Período válido**: Mês 1-12, Ano 2020-2030
- **Alertas válidos**: Percentuais 1-100%, alert2 > alert1

---

## 💾 Dados de Seed

### Categorias Sistema (Templates)

As categorias sistema (`user_id = NULL, is_system = TRUE`) servem como templates copiados para novos usuários:

#### Despesas (expense)
- 🍕 Alimentação (#FF9800)
- 🚗 Transporte (#2196F3)  
- 🏠 Moradia (#795548)
- 🏥 Saúde (#F44336)
- 👗 Roupas (#E91E63)
- 🎮 Entretenimento (#9C27B0)
- 📚 Educação (#3F51B5)
- 💼 Trabalho (#607D8B)
- ✈️ Viagens (#009688)
- 🎁 Presentes (#FF5722)

#### Receitas (income)
- 💼 Salário (#4CAF50)
- 💰 Freelance (#8BC34A)
- 📈 Investimentos (#CDDC39)
- 🎯 Bonificação (#FFC107)
- 🎁 Presentes (#FF9800)
- 💵 Outros (#9E9E9E)

### Função para Novos Usuários

```sql
-- Copia categorias sistema para novo usuário
SELECT copy_system_categories_to_user('new-user-uuid');
```

---

## 🔍 Queries Principais

### 1. Listar Categorias do Usuário

```sql
SELECT 
    c.id,
    c.name,
    c.type,
    c.icon,
    c.color,
    c.parent_id,
    parent.name as parent_name,
    COUNT(sub.id) as subcategories_count
FROM categories c
LEFT JOIN categories parent ON c.parent_id = parent.id
LEFT JOIN categories sub ON c.id = sub.parent_id AND sub.is_active = TRUE
WHERE c.user_id = $1 
  AND c.is_active = TRUE
  AND c.type = $2  -- 'expense', 'income', 'transfer'
GROUP BY c.id, c.name, c.type, c.icon, c.color, c.parent_id, parent.name
ORDER BY c.sort_order, c.name;
```

### 2. Listar Orçamentos com Valores Gastos

```sql
SELECT 
    b.id,
    b.year,
    b.month,
    b.limit_amount,
    b.alert_percentage_1,
    b.alert_percentage_2,
    b.alerts_enabled,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    COALESCE(spent.amount, 0) as spent_amount,
    CASE 
        WHEN b.limit_amount > 0 THEN 
            ROUND((COALESCE(spent.amount, 0) / b.limit_amount * 100), 2)
        ELSE 0 
    END as spent_percentage,
    CASE 
        WHEN COALESCE(spent.amount, 0) >= b.limit_amount THEN 'exceeded'
        WHEN COALESCE(spent.amount, 0) >= (b.limit_amount * b.alert_percentage_2 / 100) THEN 'danger'
        WHEN COALESCE(spent.amount, 0) >= (b.limit_amount * b.alert_percentage_1 / 100) THEN 'warning'
        ELSE 'safe'
    END as status,
    b.created_at,
    b.updated_at
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN (
    SELECT 
        category_id,
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        SUM(amount) as amount
    FROM transactions
    WHERE user_id = $1 
      AND transaction_type = 'expense'
      AND is_confirmed = TRUE
    GROUP BY category_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
) spent ON b.category_id = spent.category_id 
         AND b.year = spent.year 
         AND b.month = spent.month
WHERE b.user_id = $1 
  AND b.is_active = TRUE
  AND ($2 IS NULL OR b.year = $2)   -- Filtro ano opcional
  AND ($3 IS NULL OR b.month = $3)  -- Filtro mês opcional
ORDER BY b.year DESC, b.month DESC, c.name;
```

### 3. Resumo de Orçamentos para Dashboard

```sql
SELECT 
    COUNT(*) as total_budgets,
    SUM(b.limit_amount) as total_limit,
    SUM(COALESCE(spent.amount, 0)) as total_spent,
    CASE 
        WHEN SUM(b.limit_amount) > 0 THEN 
            ROUND(SUM(COALESCE(spent.amount, 0)) / SUM(b.limit_amount) * 100, 2)
        ELSE 0 
    END as average_percentage,
    COUNT(CASE WHEN COALESCE(spent.amount, 0) >= b.limit_amount THEN 1 END) as exceeded,
    COUNT(CASE WHEN COALESCE(spent.amount, 0) >= (b.limit_amount * b.alert_percentage_1 / 100) 
              AND COALESCE(spent.amount, 0) < b.limit_amount THEN 1 END) as warning,
    COUNT(CASE WHEN COALESCE(spent.amount, 0) < (b.limit_amount * b.alert_percentage_1 / 100) THEN 1 END) as safe
FROM budgets b
LEFT JOIN (
    SELECT 
        category_id,
        SUM(amount) as amount
    FROM transactions
    WHERE user_id = $1 
      AND transaction_type = 'expense'
      AND is_confirmed = TRUE
      AND EXTRACT(YEAR FROM date) = $2
      AND EXTRACT(MONTH FROM date) = $3
    GROUP BY category_id
) spent ON b.category_id = spent.category_id
WHERE b.user_id = $1 
  AND b.year = $2 
  AND b.month = $3 
  AND b.is_active = TRUE;
```

---

## ⚡ Otimizações de Performance

### 1. Query Planning

```sql
-- Análise de performance da query principal
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT /* query de orçamentos */;
```

### 2. Índices Parciais

```sql
-- Índice apenas para orçamentos ativos (mais eficiente)
CREATE INDEX ix_budgets_active_user_period 
ON budgets(user_id, year, month) 
WHERE is_active = TRUE;

-- Índice para categorias ativas por tipo
CREATE INDEX ix_categories_active_user_type 
ON categories(user_id, type) 
WHERE is_active = TRUE;
```

### 3. Particionamento (Futuro)

Para escala muito grande, considerar particionamento da tabela `budgets` por ano:

```sql
-- Particionamento por range de ano
CREATE TABLE budgets_2025 PARTITION OF budgets
FOR VALUES FROM (2025) TO (2026);
```

---

## 🔧 Migrations e Versionamento

### Migration Principal

- **Arquivo**: `c84a2f6d1e8b_add_categories_and_budgets_tables.py`
- **Dependência**: `b630c1c5357f_initial_migration.py`
- **Operações**: 
  - CREATE TABLE categories
  - CREATE TABLE budgets
  - CREATE TYPE transaction_type
  - CREATE INDEX (8 índices)
  - Constraints e validações

### Script de Dados

- **Arquivo**: `backend/scripts/insert_default_categories.sql`
- **Execução**: Pós-deployment da migration
- **Conteúdo**:
  - Categorias padrão do sistema
  - Subcategorias populares
  - Função para copiar para novos usuários
  - Verificações de integridade

### Rollback

```sql
-- Rollback completo (ordem importante)
DROP INDEX IF EXISTS ix_budgets_period;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
```

---

## 📊 Métricas e Monitoramento

### Queries de Monitoramento

```sql
-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('categories', 'budgets')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices mais utilizados
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'budgets')
ORDER BY idx_scan DESC;

-- Queries lentas relacionadas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query ILIKE '%budgets%' OR query ILIKE '%categories%'
ORDER BY total_time DESC
LIMIT 10;
```

### Alertas de Performance

- **Query time > 100ms**: Revisar índices
- **Table size > 1GB**: Considerar particionamento  
- **Index usage < 80%**: Avaliar necessidade do índice
- **Lock waits > 1s**: Revisar transações longas

---

## 🎯 Próximos Passos

### Fase 1: Implementação Básica
- [x] Migration de tabelas
- [x] Constraints e validações
- [x] Índices de performance
- [x] Dados de seed

### Fase 2: Otimizações
- [ ] Índices compostos adicionais
- [ ] Materialised views para reports
- [ ] Triggers para auditoria
- [ ] Stored procedures para bulk operations

### Fase 3: Escala
- [ ] Particionamento por data
- [ ] Archiving de dados antigos
- [ ] Read replicas para relatórios
- [ ] Connection pooling

---

<div align="center">
**Schema aprovado pelo DBA em 26/08/2025**
**Migrations prontas para deploy em produção**
</div>
