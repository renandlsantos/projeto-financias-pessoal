Vou te dar o passo a passo mais direto para conectar uma segunda conta GitHub no VSCode e usar ela para baixar/subir código:

## Passo a passo rápido para segunda conta

### 1. Primeira coisa - atualizar VSCode
Se não estiver na versão 1.95+, atualiza primeiro porque ela tem suporte nativo para múltiplas contas.

### 2. Adicionar a segunda conta no VSCode
1. Clica no ícone do seu perfil (canto inferior esquerdo)
2. Clica em **"Turn on Settings Sync..."** ou **"Sign in to Sync Settings"**
3. Escolhe **"Sign in with another account"**
4. Faz login com a segunda conta GitHub

### 3. Configurar Git para alternar contas automaticamente

Cria ou edita o arquivo `~/.gitconfig`:

```bash
# Abrir terminal e editar
code ~/.gitconfig
```

Adiciona isso:

```ini
[user]
    name = Seu Nome
    email = conta-principal@email.com

# Para projetos pessoais (pasta ~/pessoal)
[includeIf "gitdir:~/pessoal/"]
    path = ~/.gitconfig-pessoal

# Para projetos de trabalho (pasta ~/trabalho)  
[includeIf "gitdir:~/trabalho/"]
    path = ~/.gitconfig-trabalho
```

### 4. Criar arquivos de configuração específicos

**Para conta pessoal** (`~/.gitconfig-pessoal`):
```ini
[user]
    name = Seu Nome
    email = pessoal@email.com
```

**Para conta trabalho** (`~/.gitconfig-trabalho`):
```ini
[user]
    name = Seu Nome Profissional  
    email = trabalho@empresa.com
```

### 5. Organizar pastas

Cria essas pastas no seu computador:
```
~/pessoal/     # Projetos da conta pessoal
~/trabalho/    # Projetos da conta de trabalho
```

### 6. Como usar depois de configurado

**Para clonar um repo da conta pessoal:**
```bash
cd ~/pessoal
git clone https://github.com/sua-conta-pessoal/repo.git
```

**Para clonar um repo da conta de trabalho:**
```bash
cd ~/trabalho  
git clone https://github.com/conta-empresa/repo.git
```

**O Git vai usar automaticamente:**
- Email pessoal para commits em `~/pessoal/`
- Email de trabalho para commits em `~/trabalho/`

### 7. No VSCode

1. Abre a pasta do projeto (`File > Open Folder`)
2. O VSCode vai detectar automaticamente qual conta usar
3. Para push/pull, usa os botões normais do Git no VSCode

## Testando se funcionou

Entra numa pasta e testa:
```bash
cd ~/trabalho/algum-projeto
git config user.email
# Deve mostrar: trabalho@empresa.com

cd ~/pessoal/algum-projeto  
git config user.email
# Deve mostrar: pessoal@email.com
```
---

## Solução rápida (usando HTTPS)

```bash
# Em vez de SSH, usa HTTPS
git clone https://github.com/xpto/projeto.git
```

Quando pedir usuário/senha, usa:
- **Usuário:** seu-usuario-github
- **Senha:** um Personal Access Token (não a senha do GitHub)

## Solução completa (configurar SSH)

### 1. Verificar se você já tem chave SSH
```bash
ls -la ~/.ssh
```

Se não aparecer arquivos como `id_ed25519` ou `id_rsa`, você não tem chave.

### 2. Criar chave SSH
```bash
# Substitui pelo seu email do GitHub
ssh-keygen -t ed25519 -C "seu.email@gmail.com"

# Quando perguntar onde salvar, aperta Enter (usa o padrão)
# Quando pedir senha, pode deixar em branco (aperta Enter 2x)
```

### 3. Adicionar chave ao SSH agent
```bash
# Iniciar SSH agent
eval "$(ssh-agent -s)"

# Adicionar a chave
ssh-add ~/.ssh/id_ed25519
```

### 4. Copiar chave pública
```bash
# Copia a chave pública
cat ~/.ssh/id_ed25519.pub
```

### 5. Adicionar no GitHub
1. Vai no GitHub → Settings → SSH and GPG keys
2. Clica em "New SSH key"
3. Cola a chave que você copiou
4. Salva

### 6. Testar conexão
```bash
ssh -T git@github.com
```

Deve aparecer algo como:
```
Hi seu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```

### 7. Agora tentar clonar novamente
```bash
git clone git@github.com:repo/xpto.git
```

## Verificar se o repositório existe

Antes de tudo, confirma se:
1. O repositório `repo/medagente` realmente existe
2. Você tem acesso a ele (se for privado)
3. O nome está correto

Você pode verificar acessando: https://github.com/xpto/projeto
