# Associação A Esperança da Criança

Site institucional da ONG Associação A Esperança da Criança, desenvolvido com HTML5, CSS3 e JavaScript puro.

## Estrutura do projeto

- `index.html`: página pública do site.
- `style.css`: estilos, responsividade e animações.
- `script.js`: menu mobile, animações, voltar ao topo, copiar PIX e visualização pública da Prestação de Contas.
- `admin/`: área administrativa exclusiva para Prestação de Contas.
- `api/`: funções serverless usadas pelo admin para gravar arquivos no repositório.
- `data/prestacao-contas.json`: fonte pública dos registros cadastrados.
- `documents/prestacao-contas/`: documentos anexados aos registros.
- `images/`: logotipo e fotos reais da ONG.
- `assets/`: favicon.

## Prestação de Contas sem banco de dados

A página pública consulta os registros em `data/prestacao-contas.json`. A área `/admin` permite cadastrar, editar, excluir e anexar documentos exclusivamente da Prestação de Contas.

Para persistir dados no deploy sem banco de dados, as funções em `api/` gravam o JSON e os documentos no próprio repositório via GitHub API. Configure estas variáveis de ambiente na plataforma de deploy:

- `ADMIN_PASSWORD`: senha de acesso da área administrativa.
- `GITHUB_TOKEN`: token com permissão de escrita no repositório.
- `GITHUB_OWNER`: usuário ou organização dona do repositório.
- `GITHUB_REPO`: nome do repositório.
- `GITHUB_BRANCH`: branch usada no deploy, por padrão `main`.

Limitação: em GitHub Pages puro não há execução de backend, então a página pública funciona, mas a gravação pelo `/admin` exige Vercel, Netlify Functions ou outra hospedagem com funções serverless.
