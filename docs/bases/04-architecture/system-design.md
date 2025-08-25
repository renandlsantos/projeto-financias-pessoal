# Design do Sistema

O FinanceFlow adota arquitetura de **microserviços** com API Gateway.

## Componentes

- **Frontend Web**: React SPA
- **API Gateway**: Kong
- **Microserviços**:  
  - Auth Service  
  - Transaction Service  
  - Account Service  
  - Budget Service  
  - Report Service  
  - Notification Service
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Mensageria**: RabbitMQ (Celery)
- **Infraestrutura**: Docker, Kubernetes, AWS

## Diagrama

```
┌──────────────────────────────┐
│        Load Balancer         │
└───────┬───────────┬──────────┘
        │           │
 ┌──────▼─────┐ ┌───▼──────┐
 │ Frontend   │ │ Mobile   │
 └──────┬─────┘ └───┬──────┘
        │           │
 ┌──────▼───────────▼───────┐
 │      API Gateway (Kong)  │
 └──────┬───────────┬───────┘
        │           │
 ┌──────▼───────────▼───────┐
 │    Microservices Layer   │
 └──────┬───────────┬───────┘
        │           │
 ┌──────▼───┐   ┌───▼──────┐
 │PostgreSQL│   │  Redis   │
 └──────────┘   └──────────┘
```
