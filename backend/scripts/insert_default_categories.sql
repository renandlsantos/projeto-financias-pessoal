-- SQL Script: Inserção de Categorias Padrão do Sistema
-- Arquivo: backend/scripts/insert_default_categories.sql
-- Execução: Após deployment da migration de categories/budgets

-- ============================================================================
-- CATEGORIAS PADRÃO DO SISTEMA
-- ============================================================================
-- Este script insere as categorias padrão que serão copiadas para novos usuários

-- Limpar categorias sistema existentes (caso re-execute)
DELETE FROM categories WHERE user_id IS NULL AND is_system = TRUE;

-- ============================================================================
-- CATEGORIAS DE DESPESA (EXPENSE)
-- ============================================================================

INSERT INTO categories (id, user_id, name, type, icon, color, parent_id, is_system, is_active, sort_order, created_at, updated_at)
VALUES 
-- Essenciais
(gen_random_uuid(), NULL, 'Alimentação', 'expense', '🍕', '#FF9800', NULL, TRUE, TRUE, 1, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Transporte', 'expense', '🚗', '#2196F3', NULL, TRUE, TRUE, 2, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Moradia', 'expense', '🏠', '#795548', NULL, TRUE, TRUE, 3, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Saúde', 'expense', '🏥', '#F44336', NULL, TRUE, TRUE, 4, NOW(), NOW()),

-- Pessoais
(gen_random_uuid(), NULL, 'Roupas', 'expense', '👗', '#E91E63', NULL, TRUE, TRUE, 5, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Entretenimento', 'expense', '🎮', '#9C27B0', NULL, TRUE, TRUE, 6, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Educação', 'expense', '📚', '#3F51B5', NULL, TRUE, TRUE, 7, NOW(), NOW()),

-- Profissionais
(gen_random_uuid(), NULL, 'Trabalho', 'expense', '💼', '#607D8B', NULL, TRUE, TRUE, 8, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Viagens', 'expense', '✈️', '#009688', NULL, TRUE, TRUE, 9, NOW(), NOW()),

-- Outros
(gen_random_uuid(), NULL, 'Presentes', 'expense', '🎁', '#FF5722', NULL, TRUE, TRUE, 10, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Impostos', 'expense', '📄', '#9E9E9E', NULL, TRUE, TRUE, 11, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Outros', 'expense', '📦', '#607D8B', NULL, TRUE, TRUE, 99, NOW(), NOW());

-- ============================================================================
-- CATEGORIAS DE RECEITA (INCOME) 
-- ============================================================================

INSERT INTO categories (id, user_id, name, type, icon, color, parent_id, is_system, is_active, sort_order, created_at, updated_at)
VALUES 
-- Principais
(gen_random_uuid(), NULL, 'Salário', 'income', '💼', '#4CAF50', NULL, TRUE, TRUE, 1, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Freelance', 'income', '💰', '#8BC34A', NULL, TRUE, TRUE, 2, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Investimentos', 'income', '📈', '#CDDC39', NULL, TRUE, TRUE, 3, NOW(), NOW()),

-- Extras
(gen_random_uuid(), NULL, 'Bonificação', 'income', '🎯', '#FFC107', NULL, TRUE, TRUE, 4, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Presentes', 'income', '🎁', '#FF9800', NULL, TRUE, TRUE, 5, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Vendas', 'income', '🛍️', '#E91E63', NULL, TRUE, TRUE, 6, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Outros', 'income', '💵', '#9E9E9E', NULL, TRUE, TRUE, 99, NOW(), NOW());

-- ============================================================================
-- CATEGORIAS DE TRANSFERÊNCIA (TRANSFER)
-- ============================================================================

INSERT INTO categories (id, user_id, name, type, icon, color, parent_id, is_system, is_active, sort_order, created_at, updated_at)
VALUES 
(gen_random_uuid(), NULL, 'Transferência entre Contas', 'transfer', '🔄', '#2196F3', NULL, TRUE, TRUE, 1, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Poupança', 'transfer', '🏦', '#4CAF50', NULL, TRUE, TRUE, 2, NOW(), NOW()),
(gen_random_uuid(), NULL, 'Investimento', 'transfer', '💎', '#673AB7', NULL, TRUE, TRUE, 3, NOW(), NOW());

-- ============================================================================
-- SUBCATEGORIAS POPULARES (OPCIONAL)
-- ============================================================================

-- Subcategorias para Alimentação
INSERT INTO categories (id, user_id, name, type, icon, color, parent_id, is_system, is_active, sort_order, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  NULL,
  subcat.name,
  'expense',
  subcat.icon,
  parent.color,
  parent.id,
  TRUE,
  TRUE,
  subcat.sort_order,
  NOW(),
  NOW()
FROM categories parent,
(VALUES 
  ('Supermercado', '🛒', 1),
  ('Restaurante', '🍽️', 2),
  ('Lanche', '🍔', 3),
  ('Delivery', '🛵', 4)
) AS subcat(name, icon, sort_order)
WHERE parent.name = 'Alimentação' AND parent.user_id IS NULL;

-- Subcategorias para Transporte
INSERT INTO categories (id, user_id, name, type, icon, color, parent_id, is_system, is_active, sort_order, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  NULL,
  subcat.name,
  'expense',
  subcat.icon,
  parent.color,
  parent.id,
  TRUE,
  TRUE,
  subcat.sort_order,
  NOW(),
  NOW()
FROM categories parent,
(VALUES 
  ('Combustível', '⛽', 1),
  ('Uber', '🚙', 2),
  ('Transporte Público', '🚌', 3),
  ('Estacionamento', '🅿️', 4)
) AS subcat(name, icon, sort_order)
WHERE parent.name = 'Transporte' AND parent.user_id IS NULL;

-- ============================================================================
-- FUNCTION: Copiar categorias para novos usuários
-- ============================================================================

CREATE OR REPLACE FUNCTION copy_system_categories_to_user(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER := 0;
    cat_record RECORD;
    new_parent_id UUID;
    parent_mapping JSONB := '{}';
BEGIN
    -- Primeiro, copiar categorias principais (sem parent)
    FOR cat_record IN 
        SELECT * FROM categories 
        WHERE user_id IS NULL AND is_system = TRUE AND parent_id IS NULL
        ORDER BY sort_order
    LOOP
        INSERT INTO categories (
            id, user_id, name, type, icon, color, parent_id,
            is_system, is_active, sort_order, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), target_user_id, cat_record.name, cat_record.type,
            cat_record.icon, cat_record.color, NULL,
            FALSE, TRUE, cat_record.sort_order, NOW(), NOW()
        )
        RETURNING id INTO new_parent_id;
        
        -- Mapear ID antigo -> ID novo para subcategorias
        parent_mapping := parent_mapping || jsonb_build_object(cat_record.id::text, new_parent_id::text);
        inserted_count := inserted_count + 1;
    END LOOP;
    
    -- Depois, copiar subcategorias (com parent)
    FOR cat_record IN 
        SELECT * FROM categories 
        WHERE user_id IS NULL AND is_system = TRUE AND parent_id IS NOT NULL
        ORDER BY parent_id, sort_order
    LOOP
        INSERT INTO categories (
            id, user_id, name, type, icon, color, parent_id,
            is_system, is_active, sort_order, created_at, updated_at
        )
        VALUES (
            gen_random_uuid(), target_user_id, cat_record.name, cat_record.type,
            cat_record.icon, cat_record.color, 
            (parent_mapping ->> cat_record.parent_id::text)::UUID,
            FALSE, TRUE, cat_record.sort_order, NOW(), NOW()
        );
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES ADICIONAIS PARA PERFORMANCE
-- ============================================================================

-- Índice para busca rápida de categorias por usuário e tipo
CREATE INDEX IF NOT EXISTS ix_categories_user_type_name ON categories(user_id, type, name) WHERE is_active = TRUE;

-- Índice para busca de subcategorias
CREATE INDEX IF NOT EXISTS ix_categories_parent_sort ON categories(parent_id, sort_order) WHERE is_active = TRUE;

-- Índice parcial para categorias sistema
CREATE INDEX IF NOT EXISTS ix_categories_system_template ON categories(type, sort_order) WHERE user_id IS NULL AND is_system = TRUE;

-- ============================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE categories IS 'Categorias de transações (receitas, despesas, transferências)';
COMMENT ON COLUMN categories.user_id IS 'NULL para categorias sistema (templates)';
COMMENT ON COLUMN categories.parent_id IS 'Self-referência para subcategorias';
COMMENT ON COLUMN categories.is_system IS 'TRUE para categorias padrão do sistema';
COMMENT ON COLUMN categories.sort_order IS 'Ordem de exibição na interface';

COMMENT ON TABLE budgets IS 'Orçamentos mensais por categoria';
COMMENT ON COLUMN budgets.limit_amount IS 'Valor limite do orçamento em decimal(15,2)';
COMMENT ON COLUMN budgets.alert_percentage_1 IS 'Primeiro nível de alerta (ex: 80%)';
COMMENT ON COLUMN budgets.alert_percentage_2 IS 'Segundo nível de alerta (ex: 95%)';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Contar categorias inseridas
SELECT 
    type,
    COUNT(*) as total,
    COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as principais,
    COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as subcategorias
FROM categories 
WHERE user_id IS NULL AND is_system = TRUE 
GROUP BY type
ORDER BY type;
