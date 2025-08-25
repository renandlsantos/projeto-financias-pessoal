# FinanceFlow Backend

Sistema completo de autenticação e gerenciamento financeiro construído com FastAPI, PostgreSQL e SQLAlchemy.

## Características

### 🔐 Sistema de Autenticação Completo
- Registro de usuário com validação de senha forte
- Login seguro com JWT tokens
- Refresh tokens para renovação automática
- Recuperação de senha por email
- Verificação de email
- Proteção contra força bruta (rate limiting)
- Suporte a MFA (2FA) planejado

### 🛡️ Segurança
- Hash de senhas com bcrypt
- Tokens JWT com expiração configurável
- Validação de entrada com Pydantic
- Middleware CORS configurado
- Headers de segurança
- Criptografia para dados sensíveis

### 📊 Recursos de Gerenciamento Financeiro
- Gerenciamento de contas bancárias
- Transações com categorização
- Orçamentos e metas
- Relatórios financeiros
- Suporte a múltiplas moedas (planejado)

### 🏗️ Arquitetura
- FastAPI com suporte assíncrono
- SQLAlchemy 2.0 com PostgreSQL
- Alembic para migrations
- Redis para cache
- Docker para containerização
- Testes automatizados com pytest

## Instalação

### Pré-requisitos
- Python 3.11+
- Docker e Docker Compose
- PostgreSQL 15+ (se não usar Docker)
- Redis 7+ (se não usar Docker)

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <repo-url>
cd projeto-financias-pessoal
```

2. Configure as variáveis de ambiente:
```bash
cp backend/.env.example backend/.env
# Edite o arquivo .env conforme necessário
```

3. Execute com Docker Compose:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Instalação Local

1. Crie um ambiente virtual:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Instale as dependências:
```bash
pip install -r requirements.txt
```

3. Configure o banco de dados PostgreSQL e Redis

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite conforme sua configuração local
```

5. Execute as migrations:
```bash
alembic upgrade head
```

6. Inicie o servidor:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/password-reset-request` - Solicitar reset de senha
- `POST /api/v1/auth/password-reset` - Resetar senha
- `POST /api/v1/auth/verify-email` - Verificar email

### Usuários
- `GET /api/v1/users/me` - Obter perfil atual
- `PUT /api/v1/users/me` - Atualizar perfil
- `POST /api/v1/users/me/change-password` - Alterar senha
- `DELETE /api/v1/users/me` - Desativar conta

### Contas e Transações
- Endpoints para contas bancárias
- Endpoints para transações financeiras
- (A ser implementado conforme roadmap)

## Testes

Execute os testes:
```bash
pytest
```

Com cobertura:
```bash
pytest --cov=app
```

## Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app principal
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # Endpoints de autenticação
│   │       ├── users.py     # Endpoints de usuários
│   │       ├── accounts.py  # Endpoints de contas
│   │       └── transactions.py
│   ├── core/
│   │   ├── config.py        # Configurações
│   │   ├── database.py      # Configuração do banco
│   │   ├── security.py      # JWT e criptografia
│   │   └── deps.py          # Dependências
│   ├── models/
│   │   ├── user.py          # Modelo de usuário
│   │   ├── refresh_token.py # Modelo de refresh token
│   │   ├── account.py       # Modelo de conta
│   │   └── transaction.py   # Modelo de transação
│   ├── schemas/
│   │   ├── user.py          # Schemas Pydantic
│   │   ├── account.py
│   │   └── transaction.py
│   └── services/
│       ├── auth_service.py  # Lógica de autenticação
│       ├── account_service.py
│       └── transaction_service.py
├── tests/
│   ├── test_auth.py         # Testes de autenticação
│   └── ...
├── alembic/                 # Migrations
├── alembic.ini             # Configuração Alembic
├── requirements.txt        # Dependências Python
├── Dockerfile             # Container Docker
└── .env.example          # Exemplo de variáveis de ambiente
```

## Configuração

### Variáveis de Ambiente Principais

```env
# Segurança
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=financeflow
POSTGRES_PASSWORD=financeflow123
POSTGRES_DB=financeflow

# Redis
REDIS_URL=redis://localhost:6379

# Environment
ENVIRONMENT=development
DEBUG=true
```

## Desenvolvimento

### Adicionando Novas Funcionalidades

1. Crie o modelo SQLAlchemy em `models/`
2. Crie os schemas Pydantic em `schemas/`
3. Implemente a lógica de negócio em `services/`
4. Crie os endpoints em `api/v1/`
5. Adicione testes em `tests/`
6. Crie migration com Alembic:
   ```bash
   alembic revision --autogenerate -m "Add new feature"
   alembic upgrade head
   ```

### Executando Migrations

```bash
# Criar nova migration
alembic revision --autogenerate -m "Description"

# Aplicar migrations
alembic upgrade head

# Voltar migration
alembic downgrade -1
```

### Debugging

Para debugging local:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

## Produção

### Deploy com Docker

1. Configure as variáveis de ambiente de produção
2. Use um proxy reverso (nginx/traefik)
3. Configure HTTPS
4. Use um banco PostgreSQL dedicado
5. Configure backup automático
6. Monitore logs e métricas

### Considerações de Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ JWT tokens com expiração
- ✅ Validação de entrada
- ✅ CORS configurado
- ✅ Rate limiting de login
- ✅ Headers de segurança
- 🔄 HTTPS obrigatório (configurar proxy)
- 🔄 Auditoria de segurança regular
- 🔄 Backup criptografado

## Roadmap

- [x] Sistema de autenticação completo
- [x] Modelo de usuário robusto
- [x] Testes básicos
- [ ] Integração com email para verificação
- [ ] Sistema de contas bancárias
- [ ] Transações e categorização
- [ ] Orçamentos e metas
- [ ] Relatórios financeiros
- [ ] API de terceiros (bancos)
- [ ] Notificações push
- [ ] Auditoria completa

## Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.
