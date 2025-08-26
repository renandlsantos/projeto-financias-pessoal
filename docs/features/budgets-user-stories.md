# 📝 User Stories: Gestão de Orçamentos (Budgets)

<div align="center">

[![Feature](https://img.shields.io/badge/Feature-Orcamentos-blue?style=for-the-badge)](./)
[![Owner](https://img.shields.io/badge/Owner-Product_Owner-green?style=for-the-badge)](./)
[![Status](https://img.shields.io/badge/Status-Definido-success?style=for-the-badge)](./)

**User Stories e Critérios de Aceite para o sistema de orçamentos mensais**

</div>

---

## 🎯 Epic: Gestão de Orçamentos

**Como** Marina Costa (persona primária)  
**Eu quero** criar e gerenciar orçamentos mensais por categoria  
**Para que** eu possa controlar meus gastos e evitar estourar meus limites financeiros

---

## 📋 User Stories Detalhadas

### US-01: Criar Novo Orçamento Mensal

**Como** usuária Marina  
**Eu quero** criar um orçamento mensal para uma categoria específica  
**Para que** eu possa definir quanto pretendo gastar naquela área

#### Critérios de Aceite:
- [ ] **CA-01.1**: O sistema deve permitir selecionar um mês/ano para o orçamento
- [ ] **CA-01.2**: O sistema deve permitir selecionar uma categoria existente (ex: Alimentação, Transporte)
- [ ] **CA-01.3**: O sistema deve permitir definir um valor limite em R$
- [ ] **CA-01.4**: O sistema deve salvar o orçamento com status "Ativo"
- [ ] **CA-01.5**: O sistema deve validar que o valor é positivo e maior que zero
- [ ] **CA-01.6**: O sistema deve impedir criar orçamentos duplicados (mesma categoria + mesmo mês)
- [ ] **CA-01.7**: O sistema deve mostrar mensagem de sucesso após criação

#### Regras de Negócio:
- **RN-01.1**: Apenas usuários autenticados podem criar orçamentos
- **RN-01.2**: Valor mínimo: R$ 1,00 / Valor máximo: R$ 1.000.000,00
- **RN-01.3**: Orçamentos podem ser criados para o mês atual e próximos 12 meses
- **RN-01.4**: Categorias devem estar previamente cadastradas no sistema

---

### US-02: Visualizar Lista de Orçamentos

**Como** usuária Marina  
**Eu quero** ver todos os meus orçamentos em uma lista organizada  
**Para que** eu possa ter visão geral dos meus limites de gastos

#### Critérios de Aceite:
- [ ] **CA-02.1**: O sistema deve exibir orçamentos ordenados por mês (mais recente primeiro)
- [ ] **CA-02.2**: Cada orçamento deve mostrar: Categoria, Mês/Ano, Valor Limite, Valor Gasto, % Utilizado
- [ ] **CA-02.3**: O sistema deve usar cores para indicar status: Verde (<70%), Amarelo (70-90%), Vermelho (>90%)
- [ ] **CA-02.4**: O sistema deve permitir filtrar por mês/ano específico
- [ ] **CA-02.5**: O sistema deve permitir filtrar por categoria
- [ ] **CA-02.6**: O sistema deve mostrar total geral de orçamentos vs gastos do mês
- [ ] **CA-02.7**: O sistema deve mostrar mensagem amigável quando não há orçamentos

#### Regras de Negócio:
- **RN-02.1**: Apenas orçamentos do usuário logado devem ser exibidos
- **RN-02.2**: Valores gastos são calculados em tempo real baseados nas transações
- **RN-02.3**: Percentual é calculado como: (Valor Gasto / Valor Limite) * 100

---

### US-03: Editar Orçamento Existente

**Como** usuária Marina  
**Eu quero** alterar o valor limite de um orçamento  
**Para que** eu possa ajustar conforme minha realidade financeira mude

#### Critérios de Aceite:
- [ ] **CA-03.1**: O sistema deve permitir alterar apenas o valor limite do orçamento
- [ ] **CA-03.2**: O sistema deve manter a categoria e mês/ano inalterados
- [ ] **CA-03.3**: O sistema deve validar que o novo valor é positivo
- [ ] **CA-03.4**: O sistema deve recalcular automaticamente o percentual utilizado
- [ ] **CA-03.5**: O sistema deve salvar a alteração com timestamp de atualização
- [ ] **CA-03.6**: O sistema deve mostrar mensagem de sucesso após edição
- [ ] **CA-03.7**: O sistema deve permitir cancelar a edição sem salvar

#### Regras de Negócio:
- **RN-03.1**: Apenas orçamentos "Ativos" podem ser editados
- **RN-03.2**: Orçamentos de meses passados podem ser editados apenas se o mês não foi "fechado"
- **RN-03.3**: Mesmas validações de valor da criação se aplicam

---

### US-04: Excluir Orçamento

**Como** usuária Marina  
**Eu quero** excluir um orçamento que não preciso mais  
**Para que** minha lista fique organizada apenas com orçamentos relevantes

#### Critérios de Aceite:
- [ ] **CA-04.1**: O sistema deve exibir confirmação antes da exclusão
- [ ] **CA-04.2**: O sistema deve informar impactos da exclusão (ex: "Histórico de acompanhamento será perdido")
- [ ] **CA-04.3**: O sistema deve excluir permanentemente após confirmação
- [ ] **CA-04.4**: O sistema deve mostrar mensagem de sucesso após exclusão
- [ ] **CA-04.5**: O sistema deve atualizar a lista automaticamente após exclusão
- [ ] **CA-04.6**: O sistema deve permitir cancelar a exclusão

#### Regras de Negócio:
- **RN-04.1**: Apenas orçamentos "Ativos" podem ser excluídos
- **RN-04.2**: A exclusão é permanente (soft delete não se aplica inicialmente)
- **RN-04.3**: Orçamentos com histórico de acompanhamento mantém os dados para fins de relatório

---

### US-05: Acompanhamento de Progresso em Tempo Real

**Como** usuária Marina  
**Eu quero** ver em tempo real quanto já gastei vs meu limite de orçamento  
**Para que** eu possa tomar decisões conscientes sobre gastos adicionais

#### Critérios de Aceite:
- [ ] **CA-05.1**: O sistema deve calcular gastos baseado em transações do mês/categoria
- [ ] **CA-05.2**: O sistema deve atualizar valores automaticamente quando nova transação é adicionada
- [ ] **CA-05.3**: O sistema deve considerar apenas transações de tipo "Despesa"
- [ ] **CA-05.4**: O sistema deve exibir progresso em barra visual percentual
- [ ] **CA-05.5**: O sistema deve mostrar valores absolutos: "R$ 850 de R$ 1.200 (70%)"
- [ ] **CA-05.6**: O sistema deve alertar visualmente quando atingir 90% do limite
- [ ] **CA-05.7**: O sistema deve alertar quando exceder o limite (>100%)

#### Regras de Negócio:
- **RN-05.1**: Apenas transações confirmadas são consideradas no cálculo
- **RN-05.2**: Transações de transferência não entram no cálculo de orçamento
- **RN-05.3**: Cálculo considera transações do primeiro ao último dia do mês

---

### US-06: Alertas Proativos de Orçamento

**Como** usuária Marina  
**Eu quero** receber alertas quando me aproximar do limite do orçamento  
**Para que** eu possa ajustar meus gastos antes de estourar

#### Critérios de Aceite:
- [ ] **CA-06.1**: O sistema deve exibir notificação no dashboard quando atingir 80% do orçamento
- [ ] **CA-06.2**: O sistema deve exibir notificação crítica quando atingir 95% do orçamento
- [ ] **CA-06.3**: O sistema deve exibir alerta de estouro quando exceder 100%
- [ ] **CA-06.4**: Os alertas devem ser dismissíveis pelo usuário
- [ ] **CA-06.5**: O sistema deve permitir configurar % personalizada para alertas
- [ ] **CA-06.6**: O sistema deve mostrar resumo de alertas na página de orçamentos

#### Regras de Negócio:
- **RN-06.1**: Alertas são calculados em tempo real a cada nova transação
- **RN-06.2**: Usuário pode desabilitar alertas por categoria se desejar
- **RN-06.3**: Alertas críticos (>100%) não podem ser desabilitados

---

## 🎯 Objetivos de Negócio

- **Aumentar engajamento**: Usuários com orçamentos ativos têm 3x mais sessões
- **Reduzir churn**: Controle de gastos melhora satisfação e retenção
- **Upsell futuro**: Feature base para planos Premium (orçamentos ilimitados)

## 📊 Métricas de Sucesso

- **Adoção**: 40% dos usuários ativos criam pelo menos 1 orçamento no primeiro mês
- **Engajamento**: Usuários com orçamentos acessam o app 2x mais vezes por semana
- **Efetividade**: 60% dos orçamentos criados permanecem ativos por 3+ meses
- **NPS**: Usuários que usam orçamentos têm NPS 15 pontos maior

---

## 🔗 Dependências

- **Backend**: Endpoints CRUD para orçamentos
- **Frontend**: Componentes de formulário, lista e dashboards
- **Database**: Tabelas `budgets` e relacionamentos
- **Integração**: Sistema de notificações

---

<div align="center">
**Documento aprovado pelo Product Owner em {{ data_atual }}**
</div>
