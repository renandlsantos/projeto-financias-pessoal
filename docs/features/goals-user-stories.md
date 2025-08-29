# 🎯 User Stories - Metas Financeiras (Goals)

## 📋 Visão Geral
**Feature:** Sistema de Metas Financeiras  
**Sprint:** 01  
**Prioridade:** Alta  
**Estimativa:** 8 Story Points  

## 🎯 Epic: Como usuário, quero estabelecer e acompanhar metas financeiras para alcançar meus objetivos

### 📌 User Story 1: Criar Meta Financeira
**Como** usuário  
**Quero** criar metas financeiras com prazos  
**Para** ter objetivos claros de economia

#### Critérios de Aceite:
- [ ] Posso definir um nome descritivo para a meta
- [ ] Posso estabelecer o valor alvo a ser alcançado
- [ ] Posso definir a data limite para alcançar a meta
- [ ] Posso escolher a categoria relacionada (opcional)
- [ ] Posso adicionar uma descrição/motivação
- [ ] Sistema calcula automaticamente valor mensal necessário
- [ ] Validação impede metas com valores negativos
- [ ] Validação impede datas no passado

#### Mockup de Dados:
```json
{
  "name": "Viagem para Europa",
  "target_amount": 15000.00,
  "current_amount": 0.00,
  "deadline": "2026-06-30",
  "category_id": "uuid-travel",
  "description": "Economizar para viagem de férias em família",
  "monthly_contribution": 1250.00,
  "status": "IN_PROGRESS"
}
```

---

### 📌 User Story 2: Contribuir para Meta
**Como** usuário  
**Quero** adicionar valores às minhas metas  
**Para** acompanhar meu progresso de economia

#### Critérios de Aceite:
- [ ] Posso adicionar contribuição manual à meta
- [ ] Posso vincular transações existentes à meta
- [ ] Sistema atualiza progresso automaticamente
- [ ] Histórico de contribuições é mantido
- [ ] Posso editar/excluir contribuições
- [ ] Sistema recalcula percentual de conclusão
- [ ] Notificação quando meta é alcançada

#### Tipos de Contribuição:
- **Manual:** Valor adicionado diretamente
- **Automática:** Vinculada a transação de economia
- **Recorrente:** Programada mensalmente

---

### 📌 User Story 3: Visualizar Progresso das Metas
**Como** usuário  
**Quero** ver o status de todas minhas metas  
**Para** monitorar meu progresso financeiro

#### Critérios de Aceite:
- [ ] Dashboard dedicado para metas
- [ ] Cards visuais com barra de progresso
- [ ] Percentual de conclusão destacado
- [ ] Tempo restante até o prazo
- [ ] Valor restante a economizar
- [ ] Indicador de ritmo (no prazo/atrasado/adiantado)
- [ ] Filtros por status (ativa/pausada/concluída)
- [ ] Ordenação por prazo/progresso/valor

#### Métricas Exibidas:
- **Progresso:** R$ 3.750 de R$ 15.000 (25%)
- **Tempo:** 10 meses restantes
- **Ritmo:** R$ 1.125/mês necessários
- **Status:** No prazo ✅

---

### 📌 User Story 4: Gerenciar Status da Meta
**Como** usuário  
**Quero** pausar, reativar ou cancelar metas  
**Para** ajustar meus objetivos conforme necessário

#### Critérios de Aceite:
- [ ] Posso pausar uma meta temporariamente
- [ ] Posso reativar uma meta pausada
- [ ] Posso marcar meta como concluída
- [ ] Posso cancelar/arquivar uma meta
- [ ] Histórico é preservado mesmo após cancelamento
- [ ] Sistema ajusta cálculos ao reativar
- [ ] Notificações respeitam status da meta

#### Estados Possíveis:
- `DRAFT` - Rascunho (ainda não iniciada)
- `IN_PROGRESS` - Em andamento
- `PAUSED` - Pausada temporariamente
- `COMPLETED` - Concluída com sucesso
- `CANCELLED` - Cancelada pelo usuário
- `OVERDUE` - Vencida (prazo expirado)

---

### 📌 User Story 5: Análise de Metas
**Como** usuário  
**Quero** ver relatórios sobre minhas metas  
**Para** entender meu desempenho histórico

#### Critérios de Aceite:
- [ ] Relatório de metas concluídas vs canceladas
- [ ] Tempo médio para conclusão de metas
- [ ] Taxa de sucesso por categoria
- [ ] Gráfico de evolução temporal
- [ ] Comparação planejado vs realizado
- [ ] Exportação de dados em CSV/PDF
- [ ] Insights e recomendações automáticas

#### Métricas do Relatório:
- **Taxa de Sucesso:** 75% (6 de 8 metas)
- **Economia Total:** R$ 45.000
- **Tempo Médio:** 8 meses por meta
- **Categoria Top:** Viagens (3 metas concluídas)

---

## 🔄 Regras de Negócio

### Cálculos Automáticos:
1. **Contribuição Mensal Sugerida:**
   ```
   (valor_alvo - valor_atual) / meses_restantes
   ```

2. **Percentual de Progresso:**
   ```
   (valor_atual / valor_alvo) * 100
   ```

3. **Status do Ritmo:**
   - **Adiantado:** Economia acima do necessário
   - **No Prazo:** Economia conforme planejado (±10%)
   - **Atrasado:** Economia abaixo do necessário

### Validações:
- Meta não pode ter valor alvo menor que R$ 1,00
- Data limite deve ser futura (mínimo D+7)
- Contribuições não podem ser negativas
- Meta concluída não pode receber novas contribuições
- Usuário pode ter máximo 20 metas ativas

### Notificações:
- Lembrete mensal para contribuição
- Alerta quando faltam 30 dias para o prazo
- Celebração quando meta é alcançada
- Aviso quando está 20% atrasado

---

## 🎨 Elementos de Interface

### Card de Meta:
```
┌─────────────────────────────────┐
│ 🎯 Viagem para Europa           │
│                                  │
│ ████████████░░░░░░░ 60%         │
│                                  │
│ R$ 9.000 / R$ 15.000            │
│ 6 meses restantes               │
│                                  │
│ [Contribuir] [Detalhes]         │
└─────────────────────────────────┘
```

### Formulário de Nova Meta:
- Campo: Nome da Meta (obrigatório)
- Campo: Valor Alvo (obrigatório, R$)
- Campo: Data Limite (obrigatório, date picker)
- Select: Categoria (opcional)
- TextArea: Descrição/Motivação
- Checkbox: Criar contribuição recorrente
- Botões: [Cancelar] [Criar Meta]

---

## 📊 Definição de Pronto (DoD)

- [ ] Código implementado e revisado
- [ ] Testes unitários com cobertura > 80%
- [ ] Testes de integração passando
- [ ] Documentação da API atualizada
- [ ] Interface responsiva (mobile/desktop)
- [ ] Validações frontend e backend
- [ ] Tratamento de erros adequado
- [ ] Code review aprovado
- [ ] Deploy em ambiente de staging

---

## 🚀 Notas de Implementação

### Prioridade de Development:
1. **MVP:** Stories 1, 2, 3 (Criar, Contribuir, Visualizar)
2. **Fase 2:** Stories 4, 5 (Gerenciar, Analisar)

### Considerações Técnicas:
- Usar transações DB para garantir consistência
- Implementar soft delete para preservar histórico
- Cache de cálculos frequentes
- Webhook para integrações futuras
- API preparada para app mobile

### Dependências:
- Sistema de autenticação (implementado ✅)
- Gestão de categorias (implementado ✅)
- Sistema de notificações (futuro)

---

*Documento criado para Sprint 01 - Feature 2: Metas Financeiras*