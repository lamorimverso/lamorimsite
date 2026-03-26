# 🛒 LamorimPromos Bot

Bot Telegram para conversão automática de links do Mercado Livre para links de afiliado, com encurtamento via API oficial do ML.

---

## 🚀 Funcionalidades

- 🔗 **Converte links de produtos** para o link de afiliado do dono do bot
- 🔍 **Converte links de busca** (`lista.mercadolivre.com.br`) para afiliado
- 🔄 **Substitui links de outros afiliados** pelo link do dono do bot
- 📦 **Sugere produtos recomendados** quando o link não é de produto (home, carrinho, ofertas, etc.)
- ✂️ **Encurta links** via API oficial do Mercado Livre
- 📝 **Aceita ID de produto** diretamente (ex: `MLB1234567890`)
- 🧠 **Cache em memória** para evitar chamadas repetidas à API
- ♻️ Suporta **polling** (desenvolvimento) e **webhook** (produção)

---

## 📋 Pré-requisitos

- Node.js >= 16.0.0
- Token de bot Telegram (via [@BotFather](https://t.me/BotFather))
- Conta de afiliado no Mercado Livre com `access_token` e `partner_id`

---

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/lamorimverso/lamorimpromosbot.git
cd lamorimpromosbot
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com seus valores:

```env
# Telegram
TELEGRAM_BOT_TOKEN=seu_token_do_botfather

# Mercado Livre Afiliado
ML_ACCESS_TOKEN=seu_access_token_mercado_livre
ML_PARTNER_ID=seu_partner_id
ML_SITE_ID=MLB

# Produtos recomendados (IDs separados por vírgula)
ML_RECOMMENDED_PRODUCTS=MLB1234567890,MLB0987654321

# Opcionais
CACHE_TTL_SECONDS=3600
LOG_LEVEL=info
BOT_MODE=polling
```

---

## ▶️ Como rodar

### Desenvolvimento (polling)

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Modo webhook (produção em servidor)

Adicione ao `.env`:
```env
BOT_MODE=webhook
WEBHOOK_URL=https://seu-dominio.com
PORT=3000
```

---

## 🏗️ Estrutura do projeto

```
lamorimpromosbot/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── index.js              # Entry point
    ├── bot.js                # Configuração do bot Telegram
    ├── config.js             # Carregamento de variáveis de ambiente
    ├── handlers/
    │   ├── messageHandler.js # Handler principal de mensagens
    │   └── commandHandler.js # Handlers de comandos (/start, /help, etc.)
    ├── services/
    │   ├── linkParser.js          # Parsing e classificação de links ML
    │   ├── affiliateConverter.js  # Conversão para link de afiliado
    │   ├── linkShortener.js       # Encurtamento via API ML
    │   ├── productScraper.js      # Busca de produtos via API ML
    │   └── cache.js               # Cache em memória com TTL
    └── utils/
        ├── constants.js      # Constantes e regex patterns
        └── helpers.js        # Funções auxiliares
```

---

## 🎯 Cenários de uso

| Entrada | Ação |
|---|---|
| Link de produto ML | Converte para afiliado + encurta |
| Link de busca (lista.mercadolivre.com.br) | Adiciona afiliado ao link + encurta |
| Link de afiliado de outro (produto) | Substitui por afiliado do dono + encurta |
| Link de página social/afiliado | Fallback: 1º produto recomendado convertido |
| Home, carrinho, ofertas, categorias | Fallback: 1º produto recomendado convertido |
| ID de produto (MLB...) sem URL | Constrói URL, converte e encurta |
| Texto sem link do ML | Mensagem de ajuda |

---

## 📦 Comandos do bot

- `/start` — Mensagem de boas-vindas
- `/help` — Lista de funcionalidades
- `/recomendacoes` — Mostra links dos produtos recomendados configurados

---

## 🚢 Deploy

### Render / Railway

1. Crie um novo serviço web apontando para este repositório
2. Configure as variáveis de ambiente no painel do serviço
3. Defina o comando de start: `npm start`
4. Para usar webhook, configure `BOT_MODE=webhook` e `WEBHOOK_URL=https://seu-app.onrender.com`

### VPS

```bash
# Instalar PM2
npm install -g pm2

# Iniciar o bot
pm2 start src/index.js --name lamorimpromosbot

# Salvar configuração
pm2 save
pm2 startup
```

---

## 📄 Licença

MIT