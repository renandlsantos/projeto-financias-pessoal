# ✨ UX Design: Fluxos de Orçamentos (Budgets)

<div align="center">

[![Feature](https://img.shields.io/badge/Feature-Orcamentos-blue?style=for-the-badge)](./)
[![Owner](https://img.shields.io/badge/Owner-UX_Designer-purple?style=for-the-badge)](./)
[![Status](https://img.shields.io/badge/Status-Wireframes_Prontos-success?style=for-the-badge)](./)

**Wireframes, fluxos e especificações UX para gestão de orçamentos**

</div>

---

## 🎯 Visão Geral da Experiência

A experiência de orçamentos deve ser **simples, visual e proativa**. O usuário deve conseguir:
1. Criar orçamentos de forma rápida e intuitiva
2. Acompanhar progresso visualmente em tempo real  
3. Receber alertas claros antes de estourar limites
4. Ter visão consolidada de todos os orçamentos

---

## 🗺️ Jornada do Usuário: Marina & Orçamentos

```
📱 Marina abre o app → 👀 Vê dashboard com alertas de orçamento
    ↓
🎯 Clica em "Orçamentos" → 📊 Visualiza lista com progresso visual
    ↓  
➕ Clica "Novo Orçamento" → 📝 Preenche categoria e valor de forma simples
    ↓
💰 Durante o mês → 🔔 Recebe alertas quando gasto se aproxima do limite
    ↓
📈 Final do mês → 📊 Vê relatório de performance vs orçamentos
```

---

## 📱 Wireframes Detalhados

### 1. Página Principal de Orçamentos

```
┌─────────────────────────────────────┐
│ FinanceFlow          [🔔] [👤]      │
├─────────────────────────────────────┤
│                                     │
│ 💰 Orçamentos - Janeiro 2025        │
│ [◀️ Dez] [Janeiro 2025] [Fev ▶️]     │
│                                     │
│ ┌─ Resumo do Mês ─────────────────┐ │
│ │ Orçado: R$ 3.200 | Gasto: R$ 2.1K│ │
│ │ [████████░░] 65% utilizado       │ │
│ │ ✅ Dentro do planejado            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Novo Orçamento]                  │
│                                     │
│ ┌─ 🍕 Alimentação ────────────────┐ │
│ │ R$ 850 de R$ 1.200 (70%)        │ │
│ │ [███████░░░] 🟡                  │ │
│ │ Restam R$ 350 para 12 dias      │ │
│ │                    [📊] [✏️]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ 🚗 Transporte ─────────────────┐ │
│ │ R$ 420 de R$ 800 (52%)          │ │
│ │ [█████░░░░░] 🟢                  │ │
│ │ Restam R$ 380 para 12 dias      │ │
│ │                    [📊] [✏️]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─ 🏥 Saúde ──────────────────────┐ │
│ │ R$ 920 de R$ 600 (153%) 🚨       │ │
│ │ [████████████] 🔴                │ │
│ │ Estorou R$ 320!                  │ │
│ │                    [📊] [✏️]    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Modal: Criar Novo Orçamento

```
┌─────────────────────────────────────┐
│                                     │
│        ➕ Novo Orçamento             │
│                                     │
│ 📅 Período                          │
│ [Janeiro 2025 ▼]                    │
│                                     │
│ 🏷️ Categoria                        │
│ [Selecione uma categoria ▼]         │
│ • 🎮 Entretenimento                 │
│ • 🧥 Roupas                         │
│ • 📚 Educação                       │
│                                     │
│ 💰 Valor Limite                     │
│ [R$ ______.___]                     │
│ ⚡ Sugestão: R$ 450 (baseado em     │
│    seus gastos históricos)          │
│                                     │
│ 🔔 Alertas                          │
│ ☑️ Avisar quando atingir 80%        │
│ ☑️ Avisar quando atingir 95%        │
│                                     │
│         [Cancelar] [Criar]          │
└─────────────────────────────────────┘
```

### 3. Modal: Editar Orçamento

```
┌─────────────────────────────────────┐
│                                     │
│        ✏️ Editar Orçamento          │
│                                     │
│ 🍕 Alimentação - Janeiro 2025       │
│                                     │
│ 💰 Valor Limite Atual               │
│ [R$ 1.200,00]                       │
│                                     │
│ 📊 Progresso Atual                  │
│ R$ 850 gastos (70%)                 │
│ [███████░░░]                        │
│                                     │
│ 💡 Se alterar para R$ 1.000:        │
│ Progresso ficará em 85% (🟡)        │
│                                     │
│ 🔔 Configurações de Alerta          │
│ [80%] [95%] ☑️ Habilitado           │
│                                     │
│      [Excluir] [Cancelar] [Salvar]  │
└─────────────────────────────────────┘
```

### 4. Componente: Card de Alerta

```
┌─────────────────────────────────────┐
│ 🚨 Atenção! Orçamento Estourado     │
│                                     │
│ Sua categoria Saúde estourou o      │
│ orçamento em R$ 320,00 este mês.    │
│                                     │
│ • Limite: R$ 600,00                 │
│ • Gasto: R$ 920,00 (153%)          │
│                                     │
│ [Ver Detalhes] [Ajustar Orçamento]  │
│                           [✕]       │
└─────────────────────────────────────┘
```

### 5. Dashboard: Widget Orçamentos

```
┌─ 💰 Orçamentos Janeiro ─────────────┐
│                                     │
│ 3 de 5 orçamentos no verde ✅       │
│                                     │
│ 🔴 Saúde: 153% (R$ 320 a mais)     │
│ 🟡 Alimentação: 70% (cuidado!)     │
│ 🟢 Transporte: 52% (tranquilo)     │
│                                     │
│            [Ver Todos]              │
└─────────────────────────────────────┘
```

---

## 🎨 Design System: Componentes

### Paleta de Cores - Status Orçamentos

- 🟢 **Verde (Seguro)**: `#4CAF50` - 0% a 69%
- 🟡 **Amarelo (Atenção)**: `#FF9800` - 70% a 94%  
- 🔴 **Vermelho (Crítico)**: `#F44336` - 95% a 100%+
- 🚨 **Vermelho Intenso (Estouro)**: `#D32F2F` - >100%

### Iconografia

- 💰 Orçamento Geral
- 🍕 Alimentação  
- 🚗 Transporte
- 🏥 Saúde
- 🎮 Entretenimento
- 🏠 Moradia
- 👗 Roupas
- 📚 Educação

### Componentes Material-UI Utilizados

1. **Card** (MUI Card) - Container principal dos orçamentos
2. **LinearProgress** (MUI) - Barra de progresso visual  
3. **Chip** (MUI) - Tags de status e categorias
4. **Dialog** (MUI) - Modais de criar/editar
5. **Select** (MUI) - Dropdown categoria e período
6. **TextField** (MUI) - Input de valor monetário
7. **Alert** (MUI) - Notificações de alerta
8. **Fab** (MUI) - Botão flutuante "+" novo orçamento

---

## 🔄 Fluxos de Interação

### Fluxo 1: Criar Orçamento

```
1. [Dashboard] → Clica "Orçamentos"
2. [Lista Orçamentos] → Clica "+ Novo Orçamento"  
3. [Modal Criar] → Seleciona período (padrão: mês atual)
4. [Modal Criar] → Seleciona categoria do dropdown
5. [Modal Criar] → Digita valor (com sugestão automática)
6. [Modal Criar] → Configura alertas (padrão: 80% e 95%)
7. [Modal Criar] → Clica "Criar"
8. [Lista Atualizada] → Novo orçamento aparece + Toast success
```

### Fluxo 2: Acompanhar Progresso

```
1. [Dashboard] → Widget mostra resumo top 3 orçamentos
2. [Dashboard] → Clica "Ver Todos" → Lista completa
3. [Lista] → Progresso visual em tempo real
4. [Lista] → Filtro por mês/ano se necessário
5. [Lista] → Clica 📊 → Detalhes da categoria
```

### Fluxo 3: Receber Alerta

```
1. [Nova Transação] → Sistema recalcula orçamentos
2. [Background] → Detecta 80% atingido em categoria
3. [Notificação] → Push/Toast: "⚠️ 80% do orçamento Alimentação usado"
4. [Usuário] → Clica notificação → Vai para orçamento específico
5. [Ação] → Pode ajustar orçamento ou revisar gastos
```

---

## 📱 Responsividade Mobile-First

### Mobile (320px+)
- Cards em lista vertical com scroll
- Progresso em barras horizontais simples
- FAB para "+" novo orçamento
- Modal fullscreen para criar/editar

### Tablet (768px+)  
- Grid 2 colunas de cards
- Sidebar com filtros
- Modal centrado (não fullscreen)

### Desktop (1024px+)
- Grid 3 colunas de cards  
- Sidebar fixa com filtros
- Hover states nos cards
- Tooltips informativos

---

## ♿ Acessibilidade (WCAG 2.1 AA)

### Contraste
- Textos principais: 7:1 (AAA)
- Textos secundários: 4.5:1 (AA)
- Cores de status com ícones complementares

### Navegação
- Tab order lógico
- Focus visible em todos elementos interativos
- Skip links para conteúdo principal

### Semântica
- Headers hierárquicos (h1 > h2 > h3)  
- Labels descritivos em inputs
- ARIA labels em progressbars
- Roles adequados (dialog, alert, etc)

### Feedback
- Confirmações visuais e por screen reader
- Mensagens de erro claras
- Estados loading com ARIA live regions

---

## 🧪 Testes de Usabilidade Recomendados

### Cenários de Teste
1. **Primeiro Uso**: Usuário novo criando primeiro orçamento
2. **Gestão Mensal**: Usuário experiente gerenciando múltiplos orçamentos  
3. **Situação Crítica**: Usuário lidando com orçamento estourado
4. **Mobile vs Desktop**: Experiência em diferentes dispositivos

### Métricas UX
- **Task Success Rate**: >90% conseguem criar orçamento
- **Time to Complete**: <2min para criar primeiro orçamento
- **Error Rate**: <5% de erros na criação
- **SUS Score**: >80 (Excelente usabilidade)

---

## 🔗 Handoff para Desenvolvimento

### Especificações Técnicas
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Grid**: MUI Grid com spacing(2) = 16px
- **Tipografia**: MUI Typography scale padrão
- **Shadows**: MUI elevation 1, 4, 8 para cards
- **Animations**: MUI Transitions (200ms ease-out)

### Assets Entregáveis  
- [ ] Wireframes finais (Figma)
- [ ] Protótipo interativo (Figma)
- [ ] Componentes do design system
- [ ] Especificações de spacing e cores
- [ ] Ícones customizados (SVG)
- [ ] Estados de loading e erro
- [ ] Documentação de acessibilidade

---

<div align="center">
**Design aprovado pelo UX Designer em 26/08/2025**
**Pronto para handoff ao time de desenvolvimento**
</div>
