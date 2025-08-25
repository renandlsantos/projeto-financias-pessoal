# Configuração do Backend

O backend do FinanceFlow é construído com **Python 3.11+** e **FastAPI**.

## Passos

1. Clone o repositório
2. Crie um ambiente virtual:  
   `python -m venv venv && source venv/bin/activate`
3. Instale as dependências:  
   `pip install -r requirements.txt`
4. Configure o arquivo `.env`
5. Execute as migrações do banco de dados
6. Inicie o servidor:  
   `uvicorn app.main:app --reload`

## Principais tecnologias

- FastAPI
- SQLAlchemy 2.0
- PostgreSQL
- Redis
- Celery + RabbitMQ (tarefas assíncronas)
