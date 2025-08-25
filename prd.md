# PRD - Sistema de Controle Financeiro Pessoal
## FinanceFlow v2.0


### 1. VISÃO EXECUTIVA

#### 1.1 Problema
Pessoas físicas enfrentam dificuldades significativas no controle de suas finanças pessoais:
- 78% dos brasileiros não conseguem poupar regularmente
- 65% não sabem exatamente onde gastam seu dinheiro
- 82% não possuem controle efetivo de orçamento
- 45% se endividam por falta de planejamento financeiro

#### 1.2 Solução
FinanceFlow é uma plataforma web completa de gestão financeira pessoal que oferece:
- Visibilidade total das finanças em tempo real
- Categorização automática inteligente de gastos
- Sistema de metas e orçamentos com alertas proativos
- Relatórios e insights acionáveis
- Interface intuitiva e responsiva

#### 1.3 Objetivos de Negócio
- Atingir 10.000 usuários ativos
- Atingir 50.000 usuários e implementar modelo freemium
- Atingir 200.000 usuários e break-even

---


### 2. ANÁLISE DE MERCADO

#### 2.1 Tamanho do Mercado
- **TAM**: R$ 2.5 bilhões (mercado de gestão financeira pessoal no Brasil)
- **SAM**: R$ 500 milhões (aplicações web/mobile)
- **SOM**: R$ 50 milhões (5 anos)

#### 2.2 Competidores
| Competidor | Pontos Fortes | Pontos Fracos | Diferencial FinanceFlow |
|------------|---------------|---------------|-------------------------|
| Mobills | Grande base de usuários | Interface complexa | UX simplificada |
| Organizze | Funcionalidades robustas | Caro | Freemium generoso |
| GuiaBolso | Integração bancária | Privacidade | Controle manual seguro |

#### 2.3 Posicionamento
"A ferramenta mais intuitiva e completa para quem quer tomar controle real de suas finanças, sem complicação."

---

### 3. PERSONAS DETALHADAS

#### 3.1 Persona Primária - Marina Costa
**Demografia**
- Idade: 32 anos
- Profissão: Analista de Marketing
- Renda: R$ 6.500/mês
- Local: São Paulo, SP
- Estado civil: Solteira

**Comportamento Financeiro**
- Gasta 30% em moradia, 20% em alimentação, 15% em transporte
- Usa 3 cartões de crédito diferentes
- Tem dificuldade em economizar para objetivos
- Faz compras por impulso online

**Dores**
- "Não sei onde meu dinheiro vai parar"
- "Sempre estouro o cartão de crédito"
- "Quero viajar mas nunca sobra dinheiro"
- "Planilhas são muito trabalhosas"

**Necessidades**
- Visualização clara e imediata dos gastos
- Alertas antes de estourar limites
- Planejamento de metas tangíveis
- Simplicidade de uso

#### 3.2 Persona Secundária - Ricardo Almeida
**Demografia**
- Idade: 45 anos
- Profissão: Pequeno empresário (MEI)
- Renda: R$ 8.000-15.000/mês (variável)
- Local: Belo Horizonte, MG
- Estado civil: Casado, 2 filhos

**Comportamento Financeiro**
- Mistura finanças pessoais e empresariais
- Renda variável dificulta planejamento
- Precisa separar gastos para impostos
- Quer construir patrimônio para família

**Necessidades**
- Múltiplas contas/projetos
- Relatórios para contabilidade
- Projeção de fluxo de caixa
- Planejamento familiar

---

### 4. REQUISITOS FUNCIONAIS DETALHADOS

#### 4.1 Módulo de Autenticação e Usuários

##### RF-AUTH-001: Cadastro de Usuário
- **Descrição**: Permitir registro com email e senha
- **Campos obrigatórios**: Nome, email, senha (min 8 caracteres)
- **Validações**: Email único, senha forte
- **Extras**: Captcha, termos de uso

##### RF-AUTH-002: Login Seguro
- **Métodos**: Email/senha, Google OAuth, Apple ID
- **Segurança**: 2FA opcional via SMS/app
- **Sessão**: JWT com refresh token (15min/7dias)

##### RF-AUTH-003: Recuperação de Senha
- **Fluxo**: Email com link temporário (1h validade)
- **Segurança**: Limite 3 tentativas/dia
- **Validação**: Perguntas de segurança opcionais

##### RF-AUTH-004: Perfil do Usuário
- **Dados**: Nome, foto, telefone, endereço
- **Preferências**: Moeda, idioma, fuso horário
- **Privacidade**: Configurações de compartilhamento

#### 4.2 Módulo de Contas Bancárias

##### RF-CONTA-001: Gerenciamento de Contas
- **Tipos**: Corrente, Poupança, Investimento, Cartão de Crédito, Dinheiro
- **Campos**: Nome, banco, agência, conta, saldo inicial
- **Recursos**: Cores e ícones personalizáveis

##### RF-CONTA-002: Reconciliação
- **Manual**: Ajuste de saldo atual
- **Histórico**: Log de todas reconciliações
- **Alertas**: Divergências significativas

##### RF-CONTA-003: Múltiplas Moedas
- **Suporte**: BRL, USD, EUR
- **Conversão**: Taxa automática (API BC)
- **Histórico**: Taxas utilizadas

#### 4.3 Módulo de Transações

##### RF-TRANS-001: Registro de Transações
- **Tipos**: Receita, Despesa, Transferência
- **Campos**: Valor, data, descrição, categoria, conta
- **Anexos**: Fotos de recibos, PDFs

##### RF-TRANS-002: Categorização
- **Automática**: IA baseada em padrões
- **Manual**: Seleção/criação de categorias
- **Hierárquica**: Categoria > Subcategoria

##### RF-TRANS-003: Transações Recorrentes
- **Padrões**: Diária, Semanal, Mensal, Anual
- **Gestão**: Pausar, editar, excluir série
- **Previsão**: Projeção futura automática

##### RF-TRANS-004: Parcelamentos
- **Cartão**: Divisão automática
- **Juros**: Cálculo de custo total
- **Visualização**: Timeline de parcelas

##### RF-TRANS-005: Tags e Notas
- **Tags**: Múltiplas por transação
- **Notas**: Campo texto livre
- **Busca**: Por tags e conteúdo

#### 4.4 Módulo de Orçamentos

##### RF-ORC-001: Criação de Orçamentos
- **Período**: Mensal, Trimestral, Anual
- **Tipo**: Por categoria ou total
- **Base**: Histórico ou manual

##### RF-ORC-002: Acompanhamento
- **Visual**: Barras de progresso
- **Cores**: Verde/Amarelo/Vermelho
- **Projeção**: Estimativa fim do período

##### RF-ORC-003: Alertas Inteligentes
- **Níveis**: 50%, 80%, 100% do orçamento
- **Canais**: In-app, email, push
- **Personalização**: Por categoria

#### 4.5 Módulo de Metas

##### RF-META-001: Definição de Metas
- **Tipos**: Economia, Redução de gastos, Quitação
- **Prazo**: Data alvo configurável
- **Valor**: Objetivo monetário

##### RF-META-002: Contribuições
- **Manual**: Aportes específicos
- **Automática**: % da receita
- **Tracking**: Progresso visual

##### RF-META-003: Gamificação
- **Badges**: Conquistas desbloqueáveis
- **Streaks**: Dias consecutivos economizando
- **Ranking**: Comparativo anônimo opcional

#### 4.6 Módulo de Relatórios

##### RF-REL-001: Dashboard Principal
- **Widgets**: Saldo, gastos do mês, gráficos
- **Personalização**: Arrastar e soltar
- **Período**: Seletor de datas

##### RF-REL-002: Relatórios Detalhados
- **Tipos**: Fluxo de caixa, DRE pessoal, Evolução
- **Filtros**: Período, conta, categoria
- **Comparativos**: Mês a mês, ano a ano

##### RF-REL-003: Exportação
- **Formatos**: PDF, Excel, CSV
- **Conteúdo**: Dados e gráficos
- **Agendamento**: Envio automático mensal

##### RF-REL-004: Insights Automáticos
- **Análises**: Padrões de gasto
- **Sugestões**: Economia potencial
- **Alertas**: Anomalias detectadas

---

### 5. REQUISITOS NÃO FUNCIONAIS

#### 5.1 Performance
- **Tempo de resposta**: <200ms (p95)
- **Carregamento inicial**: <3s
- **Disponibilidade**: 99.9% uptime
- **Concorrência**: 10.000 usuários simultâneos

#### 5.2 Segurança
- **Criptografia**: TLS 1.3, AES-256
- **Autenticação**: OAuth 2.0, JWT
- **Autorização**: RBAC
- **Compliance**: LGPD, PCI DSS Level 1

#### 5.3 Usabilidade
- **Responsivo**: Mobile-first design
- **Acessibilidade**: WCAG 2.1 Level AA
- **Idiomas**: PT-BR, EN, ES
- **Suporte**: Chat in-app, tutoriais

#### 5.4 Escalabilidade
- **Arquitetura**: Microserviços
- **Database**: Sharding ready
- **Cache**: Redis distributed
- **CDN**: Global distribution

---

### 6. ARQUITETURA TÉCNICA

#### 6.1 Stack Tecnológico

**Backend**
- Runtime: Python 3.11+
- Framework: FastAPI
- ORM: SQLAlchemy 2.0
- Database: PostgreSQL 15
- Cache: Redis 7
- Queue: Celery + RabbitMQ

**Frontend**
- Framework: React 18
- Language: TypeScript 5
- State: Redux Toolkit
- UI: Material-UI v5
- Charts: Recharts
- Forms: React Hook Form

**Infrastructure**
- Container: Docker
- Orchestration: Kubernetes
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana
- APM: New Relic
- Cloud: AWS

#### 6.2 Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                      │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼────────┐
    │   Web Frontend    │   │   Mobile API    │
    │   (React SPA)     │   │   (REST/GraphQL)│
    └─────────┬─────────┘   └────────┬────────┘
              │                       │
    ┌─────────▼───────────────────────▼─────────┐
    │            API Gateway (Kong)              │
    └─────────┬───────────────────────┬─────────┘
              │                       │
    ┌─────────▼─────────────────────▼─────────┐
    │         Microservices Layer              │
    ├───────────────────────────────────────────┤
    │ • Auth Service    • Transaction Service  │
    │ • Account Service • Budget Service       │
    │ • Report Service  • Notification Service │
    └─────────┬───────────────────────┬─────────┘
              │                       │
    ┌─────────▼─────────┐   ┌────────▼────────┐
    │   PostgreSQL      │   │     Redis       │
    │   (Primary DB)    │   │    (Cache)      │
    └───────────────────┘   └─────────────────┘
```

#### 6.3 Modelo de Dados Principal

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    mfa_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'investment', 'cash')),
    bank VARCHAR(100),
    agency VARCHAR(10),
    account_number VARCHAR(20),
    initial_balance DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'BRL',
    color VARCHAR(7),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Transações
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_id UUID,
    installment_number INTEGER,
    total_installments INTEGER,
    tags TEXT[],
    notes TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Orçamentos
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    amount DECIMAL(12,2) NOT NULL,
    period VARCHAR(20) CHECK (period IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold INTEGER DEFAULT 80,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Metas
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE NOT NULL,
    category VARCHAR(50),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_achieved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para Performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_goals_user_active ON goals(user_id, is_achieved);
```

---


### 7. ROADMAP DE DESENVOLVIMENTO

#### 7.1 MVP
**Objetivo**: Sistema funcional básico

**Entregáveis**:
- ✓ Autenticação completa
- ✓ CRUD de contas
- ✓ CRUD de transações
- ✓ Categorias básicas
- ✓ Dashboard simples
- ✓ Deploy em staging

**Métricas de Sucesso**:
- 100% dos testes passando
- 0 bugs críticos
- Deploy funcional

#### 7.2 Fase 1 - Features Core
**Objetivo**: Funcionalidades essenciais

**Entregáveis**:
- Orçamentos com alertas
- Metas financeiras
- Relatórios básicos
- Transações recorrentes
- Mobile responsive

**Métricas**:
- 100 usuários beta
- NPS > 7

#### 7.3 Fase 2 - Enhancements
**Objetivo**: Melhorias e otimizações

**Entregáveis**:
- Insights automáticos
- Exportação avançada
- Múltiplas moedas
- Integração bancária (OFX)
- App mobile nativo

**Métricas**:
- 1.000 usuários
- Retenção > 60%

#### 7.4 Fase 3 - Scale
**Objetivo**: Crescimento e monetização

**Entregáveis**:
- Plano Premium
- API pública
- Marketplace de integrações
- IA para categorização
- Suporte multi-idioma

**Métricas**:
- 10.000 usuários
- 5% conversão Premium
- Break-even

---


### 8. MODELO DE NEGÓCIO

#### 8.1 Monetização

**Freemium Model**
- **Free**: 2 contas, 100 transações/mês, relatórios básicos
- **Premium**: R$ 19,90/mês - Ilimitado, insights, exportação
- **Family**: R$ 34,90/mês - 5 usuários, compartilhamento

**Receitas Adicionais**:
- Consultoria financeira (parceiros)
- Cashback em compras
- Dados agregados (anonimizados)


#### 8.2 Métricas-Chave (KPIs)

**Aquisição**
- CAC: R$ 25
- Canais: SEO (40%), Social (30%), Referral (30%)

**Ativação**
- Onboarding completion: 70%
- Time to value: <5 minutos

**Retenção**
- Churn mensal: <5%
- DAU/MAU: 40%

**Receita**
- ARPU: R$ 8
- LTV: R$ 160
- LTV/CAC: 6.4x

---

### 9. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Vazamento de dados | Baixa | Muito Alto | Criptografia, auditorias, pentest |
| Baixa adoção | Média | Alto | Marketing, referral program |
| Competição | Alta | Médio | Diferenciação UX, preço |
| Problemas técnicos | Média | Alto | Testes, monitoring, rollback |
| Regulação | Baixa | Alto | Compliance LGPD, advogados |

---


### 10. CRITÉRIOS DE SUCESSO

#### 10.1 Técnicos
- ✓ 99.9% uptime
- ✓ <200ms latência
- ✓ 0 vulnerabilidades críticas
- ✓ 80% cobertura de testes

#### 10.2 Produto
- ✓ NPS > 50
- ✓ 4.5+ estrelas nas lojas
- ✓ <2% churn mensal
- ✓ 70% feature adoption

#### 10.3 Negócio
- ✓ 200k usuários (12 meses)
- ✓ R$ 1.6M ARR
- ✓ Break-even mês 12
- ✓ 20% margem operacional

---

### 11. APÊNDICES

#### A. Glossário
- **ARR**: Annual Recurring Revenue
- **ARPU**: Average Revenue Per User
- **CAC**: Customer Acquisition Cost
- **DAU**: Daily Active Users
- **LTV**: Lifetime Value
- **MAU**: Monthly Active Users
- **MRR**: Monthly Recurring Revenue
- **NPS**: Net Promoter Score

#### B. Referências
- Pesquisa SPC Brasil 2024
- Relatório Banco Central
- Benchmark fintechs Brasil
- LGPD Guidelines

#### C. Changelog
- v2.0 - Documento completo inicial
- v1.0 - Draft inicial