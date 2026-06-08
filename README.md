# Associação A Esperança da Criança

Site institucional front-end da ONG Associação A Esperança da Criança, desenvolvido com HTML5, CSS3 e JavaScript puro.

## Estrutura do projeto

- `index.html`: página principal do site.
- `style.css`: estilos, responsividade e animações.
- `script.js`: menu mobile, animações, voltar ao topo e copiar PIX.
- `images/`: logotipo e fotos reais da ONG.
- `assets/`: favicon.

## Como abrir localmente

1. Abra a pasta do projeto no VS Code.
2. Clique duas vezes em `index.html`.
3. O site abrirá no navegador sem precisar de backend, banco de dados ou servidor local.

## Como subir no GitHub

1. Crie uma conta ou acesse sua conta em `https://github.com`.
2. Clique em `New repository`.
3. Defina um nome, por exemplo: `associacao-esperanca-crianca`.
4. Escolha `Public` se quiser publicar gratuitamente.
5. Clique em `Create repository`.
6. No computador, abra o terminal dentro da pasta do projeto.
7. Execute:

```bash
git init
git add .
git commit -m "Site institucional da ONG"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/associacao-esperanca-crianca.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub.

## Publicar gratuitamente na Vercel

1. Acesse `https://vercel.com`.
2. Entre com sua conta do GitHub.
3. Clique em `Add New Project`.
4. Escolha o repositório do site.
5. Em framework, selecione `Other` se a Vercel perguntar.
6. Não é necessário configurar build command.
7. Clique em `Deploy`.
8. A Vercel gerará um link público, como:

```text
https://associacao-esperanca-crianca.vercel.app
```

## Publicar gratuitamente na Netlify

1. Acesse `https://www.netlify.com`.
2. Entre com sua conta do GitHub.
3. Clique em `Add new site` e depois `Import an existing project`.
4. Escolha o repositório do site.
5. Em build command, deixe vazio.
6. Em publish directory, use:

```text
/
```

7. Clique em `Deploy site`.
8. A Netlify gerará um link público para compartilhar.

## Publicar no GitHub Pages

1. Entre no repositório no GitHub.
2. Clique em `Settings`.
3. Vá em `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Em branch, selecione `main`.
6. Em pasta, selecione `/root`.
7. Clique em `Save`.
8. Após alguns minutos, o GitHub exibirá o link público.

## Como atualizar o site futuramente

1. Edite os arquivos no VS Code.
2. Teste abrindo o `index.html`.
3. No terminal, execute:

```bash
git add .
git commit -m "Atualiza conteúdo do site"
git push
```

4. Vercel, Netlify ou GitHub Pages atualizarão o site automaticamente após o envio para o GitHub.

## Observações importantes

- O site é totalmente estático e não precisa de backend.
- O formulário de contato é visual e demonstrativo.
- O botão de WhatsApp abre conversa direta com o número informado.
- A chave PIX oficial exibida no site é: `32.297.441/0001-93`.
- Para melhor desempenho online, mantenha as fotos em formato `.jpeg` e evite arquivos muito grandes.
