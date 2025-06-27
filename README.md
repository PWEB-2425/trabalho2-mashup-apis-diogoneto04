 Clima e Informação — Mashup de APIs
Trabalho #2 — Programação Web

 Autores
Diogo Neto (29510)

Hugo Carvalho (31791)

 Descrição
Aplicação web com:

 Sistema de autenticação (registo, login e logout).

 Integração de duas APIs externas:

OpenWeatherMap — Clima atual da cidade/pais pesquisado.

Wikipedia REST API — Resumo enciclopédico e imagem representativa da cidade.

 Histórico de pesquisas persistente em MongoDB, associado a cada utilizador autenticado.

 Funcionalidades
 Registo e login de utilizadores (com passwords encriptadas — bcrypt).

 Proteção de rotas (apenas utilizadores autenticados podem aceder à dashboard).

 Pesquisa de cidades ou países.

 Retorno de:

Clima atual (OpenWeatherMap).

Resumo textual + imagem (Wikipedia API).

 Histórico de pesquisas, visível na dashboard.

 Logout seguro.

 Interface moderna, simples e responsiva.

 Tecnologias
Frontend:

HTML5, CSS3, JavaScript

Backend:

Node.js + Express

Autenticação: passport-local, express-session

Segurança: bcrypt, dotenv, connect-mongo

MongoDB + Mongoose

APIs externas:

 OpenWeatherMap (clima)

 Wikipedia REST API (resumo + imagem)

Outros:

Axios (chamadas HTTP)

 Estrutura do Projeto
├── models/
│   └── User.js
├── public/
│   ├── index.html
│   ├── dashboard.html
│   ├── style.css
│   └── script.js
├── routes/
│   ├── auth.js
│   ├── api.js
│   └── passport.js
├── views/ (se aplicável)
├── .env
├── .gitignore
├── app.js
├── package.json
├── README.md

 Instalação Local
1 Clonar o Repositório
git clone https://github.com/PWEB-2425/trab2_APIMashup.git
cd trab2_APIMashup
2️ Instalar Dependências
npm install
3️ Configurar Variáveis de Ambiente
Criar um ficheiro .env na raiz do projeto com o seguinte conteúdo:
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=sua_chave_secreta
API_KEY_OPENWEATHERMAP=sua_api_key_openweather
(Se usares Unsplash ou outra API para imagens, adicionar também a chave correspondente.)

 Executar Localmente

npm start
Aceder em:

http://localhost:3000
 Deploy Online
O projeto está disponível em:
 https://trabalho2-mashup-apis-diogoneto04.onrender.com/

 Como Usar
 Faz registo com nome de utilizador e password.

 Faz login na plataforma.

 Pesquisa por uma cidade ou país.

 Vê o clima atual, resumo da Wikipedia e uma imagem representativa.

 Consulta o teu histórico de pesquisas na dashboard.

 Faz logout quando quiseres.

 Notas Importantes
 Todas as chamadas às APIs externas são feitas pelo servidor (as API Keys nunca estão no frontend).

 As passwords são guardadas de forma segura (encriptadas com bcrypt).

 O histórico é privado e associado a cada utilizador.

 O projeto está pronto a correr em qualquer ambiente Node.js compatível.