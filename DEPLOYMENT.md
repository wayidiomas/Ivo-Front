# 🚀 IVO Frontend - Guia de Deploy no Render

## 📋 Preparação para Produção

### ✅ Configurações Implementadas

- **Proxy Next.js**: Configurado com timeout de 10 minutos para operações de IA
- **Bypass Development**: Conexão direta apenas em `NODE_ENV=development`
- **Timeout Configurado**: 600.000ms (10 min) para requisições longas de IA
- **Environment Variables**: Suporte completo para local/produção

### 🔧 Configurações no Render

#### 1. Environment Variables
```bash
# Obrigatórias
BACKEND_URL=https://seu-backend-render.onrender.com
FRONTEND_URL=https://seu-frontend-render.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://seu-backend-render.onrender.com
NODE_ENV=production

# Opcionais (Render define automaticamente)
PORT=3000
```

#### 2. Build Settings
```bash
# Build Command
npm run build

# Start Command  
npm start

# Node Version
18.x ou superior
```

#### 3. Configurações Avançadas
- **Health Check Path**: `/dashboard` (página principal)
- **Deploy Branch**: `main` ou `master`
- **Auto-Deploy**: Recomendado ativar

## 🔄 Fluxo de Requisições

### Em Desenvolvimento (Local)
```
Frontend → Bypass direto → Backend (localhost:8000)
```

### Em Produção (Render)
```
Frontend → Next.js Proxy → Backend (render.com)
```

## ⚡ Endpoints com Timeout Especial

Os seguintes endpoints são tratados com timeout estendido:

- `/api/v2/units/`
- `/api/v2/books/`  
- `/api/v2/courses/`
- `vocabulary`
- `sentences`
- `assessments`
- `generation`
- `gabarito` ✨
- `solve` ✨

## 🚨 Pontos de Atenção

### ✅ O que está PRONTO para produção:
- Proxy configurado com timeouts apropriados
- Bypass limitado apenas ao desenvolvimento
- Variables de ambiente configuradas
- Pipeline de geração funcional

### ⚠️ Verificar antes do deploy:
1. URLs do backend e frontend no Render
2. Certificados SSL automáticos
3. Logs de startup para verificar conexão
4. Testar pipeline completo em produção

## 🧪 Testando Localmente o Modo Produção

```bash
# 1. Build de produção
npm run build

# 2. Iniciar em modo produção
npm start

# 3. Verificar se bypass NÃO está ativo
# Deve aparecer: "Usando proxy Next.js" ao invés de "Bypass proxy"
```

## 📞 Troubleshooting

### Problema: Timeout em requisições de IA
**Solução**: Verificar se `BACKEND_URL` está correto e se o backend está respondendo

### Problema: CORS errors
**Solução**: Backend deve incluir a URL do frontend nas configurações de CORS

### Problema: Pipeline quebra em produção
**Solução**: Verificar logs do Next.js e confirmar que proxy está funcionando

## 🔄 Pipeline de Deploy Recomendado

1. **Teste Local**: `npm run build && npm start`
2. **Deploy Backend**: Primeiro o backend no Render
3. **Configurar Variáveis**: Usar URLs geradas pelo Render
4. **Deploy Frontend**: Deploy do frontend com variáveis corretas
5. **Smoke Test**: Testar geração completa de unidade

---

**✅ Sistema preparado para produção com todas as otimizações implementadas!**