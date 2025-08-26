# FinanceFlow - Sistema de Controle Financeiro Pessoal

## 📋 Sobre o Projeto

O FinanceFlow é um sistema completo de gestão de finanças pessoais desenvolvido com Python FastAPI no backend e React TypeScript no frontend. O projeto combina todas as funcionalidades desenvolvidas nas branches `start-dev`, `01.model-user-auth` e `03.front-end`.

## 🚀 Funcionalidades Implementadas

### Backend (FastAPI)

- ✅ Sistema de autenticação JWT completo
- ✅ Modelos de dados (User, Account, Transaction, RefreshToken)
- ✅ APIs RESTful para usuários, contas e transações
- ✅ Validação com Pydantic
- ✅ Migrações com Alembic
- ✅ Containerização com Docker
- ✅ Testes unitários com pytest
- ✅ Documentação automática com Swagger

### Frontend (React TypeScript)
- ✅ Interface responsiva com Material-UI
- ✅ Sistema de autenticação integrado
- ✅ Gerenciamento de estado com Redux Toolkit
- ✅ Hooks personalizados para autenticação
- ✅ Layout principal e componentes reutilizáveis
- ✅ Configuração de build e desenvolvimento

### Infraestrutura
- ✅ Docker Compose para desenvolvimento
- ✅ Banco de dados PostgreSQL
- ✅ Variáveis de ambiente configuradas
- ✅ Estrutura de testes

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy 2.0** - ORM para Python
- **PostgreSQL** - Banco de dados relacional
- **Alembic** - Migrações de banco de dados
- **JWT** - Autenticação baseada em tokens
- **Pydantic** - Validação de dados
- **pytest** - Framework de testes
- **Docker** - Containerização

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Material-UI** - Componentes de interface
- **Redux Toolkit** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **Axios** - Cliente HTTP
- **Vite** - Bundler e servidor de desenvolvimento
- **Vitest** - Framework de testes

## 📁 Estrutura do Projeto

```
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/v1/         # Endpoints da API
│   │   ├── core/           # Configurações e dependências
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negócio
│   ├── alembic/            # Migrações
│   ├── tests/              # Testes do backend
│   └── Dockerfile
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços e API
│   │   ├── store/          # Store Redux
│   │   ├── hooks/          # Hooks personalizados
│   │   └── types/          # Definições TypeScript
│   └── package.json
├── docs/                   # Documentação do projeto
├── docker-compose.yml      # Orquestração dos containers
└── README.md               # Este arquivo
```

## 🔧 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento do frontend)
- Python 3.11+ (para desenvolvimento do backend)

### Executando com Docker
```bash
# Clone o repositório
git clone <url-do-repo>
cd projeto-financias-pessoal

# Execute com Docker Compose
docker-compose up --build

# O backend estará disponível em http://localhost:8000
# O frontend estará disponível em http://localhost:3000
```

### Desenvolvimento Local

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentação

- **Backend**: Documentação automática disponível em `http://localhost:8000/docs`
- **Documentação Completa**: Consulte a pasta `docs/` para guias detalhados
- **Instruções de Desenvolvimento**: Veja `.github/copilot-instructions.md`

## 🧪 Testes

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Validação de entrada em todos os endpoints
- Proteção contra SQL injection
- Hash seguro de senhas com bcrypt
- Headers de segurança configurados

## 🤝 Contribuição

Este projeto segue os padrões definidos em `.github/copilot-instructions.md`. Consulte este arquivo para:
- Padrões de código
- Convenções de nomenclatura
- Estrutura de arquivos
- Práticas de segurança

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📈 Próximos Passos

- [ ] Implementar dashboard com gráficos
- [ ] Sistema de categorias de transações
- [ ] Relatórios financeiros
- [ ] Metas e orçamentos
- [ ] Notificações e lembretes
- [ ] Exportação de dados
- [ ] API mobile

---

**Desenvolvido com ❤️ usando FastAPI + React**
