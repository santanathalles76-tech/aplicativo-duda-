# DUDA — organizador pessoal para iPhone

Aplicativo pessoal de Maria Eduarda, com identidade verde sálvia e creme. O projeto mantém a versão Expo/React Native e inclui uma versão web PWA para abrir pelo Safari e adicionar à Tela de Início do iPhone.

## Executar no computador

Requer Node.js LTS.

```bash
npm install
npx expo install --fix
npm run web
```

Abra o endereço informado pelo Expo no navegador. Para testar no iPhone pela rede local, computador e iPhone precisam estar na mesma rede Wi-Fi. O endereço local pode não funcionar fora dessa rede.

## Gerar a versão web para publicação

```bash
npm install
npx expo install --fix
npm run build:web
```

A pasta `dist/` é o artefato de publicação. Configure o comando `npm run build:web` e a pasta de saída `dist` na Vercel, Netlify ou Cloudflare Pages. O repositório inclui configurações básicas de fallback de rotas para Vercel e Netlify.

A hospedagem gratuita fornece um endereço HTTPS público após a publicação. Não é necessário comprar domínio para testar.

## Adicionar ao iPhone

1. Abra o endereço publicado diretamente no Safari.
2. Toque em Compartilhar.
3. Escolha **Adicionar à Tela de Início**.
4. Confirme o nome DUDA e toque em Adicionar.
5. Abra o ícone DUDA pela Tela de Início.

Use Safari, não o navegador interno de aplicativos de mensagens ou redes sociais. A instalação PWA depende de HTTPS.

## Dados e privacidade

Na web, as tarefas são gravadas no IndexedDB do navegador. Na versão nativa Expo, continuam usando AsyncStorage. Os dados são locais ao navegador/dispositivo: não há sincronização automática entre iPhones ou navegadores.

No Perfil, a versão web permite exportar e importar backup JSON. Guarde o backup em local seguro. Limpar os dados do Safari, remover os dados do site ou trocar de dispositivo pode apagar ou tornar inacessíveis os dados locais. Exporte backups periodicamente.

## Funcionamento offline

O service worker armazena a página inicial, o manifest, ícones e os arquivos JS/CSS referenciados no HTML exportado. O funcionamento offline deve ser validado após a primeira abertura online e a conclusão do carregamento. Atualizações do app podem exigir conexão para baixar os novos arquivos.

## Notificações e limitações do iOS

Esta versão não agenda notificações locais persistentes em segundo plano. Notificações push na web do iOS exigem PWA adicionado à Tela de Início, versão compatível do iOS, permissão do usuário e infraestrutura de push/servidor. Uma hospedagem estática sozinha não agenda lembretes. O aplicativo não afirma que lembretes foram agendados quando isso não está implementado.

## Funcionalidades incluídas

- Criar, editar, excluir e concluir tarefas.
- Título, descrição, data, horário, prioridade e categorias iniciais.
- Início com saudação, resumo diário e tarefas do dia.
- Planejamento semanal com seleção de dia e filtro por prioridade.
- Progresso diário, últimos sete dias e conclusão por categoria.
- Perfil, contadores, limpeza de dados e backup JSON na web.
- Persistência local: IndexedDB na web e AsyncStorage no app nativo.

## Ainda não implementado

- Calendário mensal completo.
- Categorias criadas/editadas pelo usuário.
- Regras de recorrência automática.
- Notificações agendadas em segundo plano.
- Sincronização em nuvem entre dispositivos.
- Teste real em dispositivo iOS físico e publicação efetiva na conta de hospedagem.

Esses itens não são simulados; estão listados para deixar claro o escopo real desta versão.


## Publicar no Netlify (configuração deste pacote)

Este ZIP já está organizado com `package.json` na raiz e inclui `netlify.toml`.
Isso significa que, ao conectar o repositório ao Netlify, use:

- **Base directory:** deixe em branco (raiz do repositório)
- **Build command:** `npx expo install --fix && npm run build:web`
- **Publish directory:** `dist`
- **Node:** 22 (definido no `netlify.toml`)

Não publique o código-fonte diretamente pelo Netlify Drop: o Netlify precisa executar o build.
Para publicar por GitHub, extraia este ZIP, envie o conteúdo para a raiz de um repositório e conecte esse repositório ao Netlify. Depois clique em **Deploy site**.

Se a instalação/build falhar, abra **Deploys → último deploy → Deploy log** e compartilhe o log completo, principalmente as primeiras linhas que contenham `ERR!`, `Error:` ou `Failed`.
A configuração prepara o projeto para o Netlify, mas este pacote ainda precisa passar por um build real no ambiente do Netlify e por teste no iPhone antes de ser considerado validado.


## Correção de dependências para Netlify

Este pacote permanece no **Expo SDK 57**. As dependências Expo que estavam com `*` foram fixadas em versões da mesma geração do SDK 57, evitando que o npm misture `expo-router` 57 com `expo-constants`/`expo-linking` 58.

Configuração Netlify:
- Base directory: em branco (a raiz contém `package.json`)
- Build command: `npm run build:web`
- Publish directory: `dist`
- Node: 22 (mínimo 22.13)

Depois de substituir os arquivos no GitHub, faça um novo deploy com cache limpo no Netlify (**Deploys → Trigger deploy → Clear cache and deploy site**).

Observação: o pacote foi corrigido com base no conflito do log enviado. O ambiente disponível não concluiu a instalação de dependências dentro do tempo permitido, portanto o build final ainda precisa ser confirmado pelo Netlify. Se houver outro erro, envie o novo Deploy Log.
