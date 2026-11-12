# 🔴 Pokédex Full Stack — React + Spring Boot + MongoDB

Atividade 04: a Pokédex da Atividade 03 (React + Vite) agora busca os dados em uma **API REST Spring Boot** que persiste no **MongoDB Atlas**.

```
Script_Pokedex.sql → MongoDB → Spring Boot REST API → React + Vite
```

## Estrutura

```
pokedex/
├── backend/            # Spring Boot (Web, Data MongoDB, Validation)
│   ├── src/main/java/com/pokedex/{model,repository,service,controller,config}
│   ├── src/main/resources/seed/   # dados do Script_Pokedex.sql em JSON
│   ├── .env.example
│   └── pom.xml
├── frontend/           # React + Vite
├── tools/              # scripts Python que convertem o Script_Pokedex.sql em JSON
├── Script_Pokedex.sql
└── README.md
```

## Requisitos

- Java 17+ e Maven 3.9+
- Node 18+ e npm
- Uma conta/cluster no [MongoDB Atlas](https://www.atlas.mongodb.com)

## 1. Configurar o MongoDB Atlas

1. Crie um cluster gratuito (M0) e um usuário em **Database Access**.
2. Em **Network Access**, libere seu IP (ou `0.0.0.0/0` apenas para testes).
3. Em **Connect → Drivers**, copie a connection string (`mongodb+srv://...`).
4. Copie `backend/.env.example` para `backend/.env` e preencha:

```env
MONGODB_URI=mongodb+srv://USUARIO:SENHA@SEU_CLUSTER.mongodb.net/pokedex?retryWrites=true&w=majority
```

> 🔐 O `.env` está no `.gitignore` e **não deve ser publicado no GitHub**.
> Se a senha tiver caracteres especiais (`@`, `:`, `/`), use URL-encode.

O banco `pokedex` e as coleções `pokemons`, `types` e `trainers` são criados automaticamente.

## 2. Rodar o backend

```bash
cd backend
mvn spring-boot:run
```

Na primeira execução o `DataSeeder` popula o MongoDB com os dados do `Script_Pokedex.sql`
(151 Pokémon, 18 tipos, 12 treinadores). Se a coleção já tiver dados, nada é inserido.
A API sobe em `http://localhost:8080`.

## 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. O Vite redireciona `/api` para o backend (`vite.config.js`).
Para apontar para outra URL, defina `VITE_API_URL` (veja `frontend/.env.example`).

## API REST

| Método   | Endpoint                         | Descrição                                   |
| -------- | -------------------------------- | ------------------------------------------- |
| `GET`    | `/api/pokemons`                  | Lista todos os Pokémon                      |
| `GET`    | `/api/pokemons?name=pika`        | Busca por nome (parcial, sem case)          |
| `GET`    | `/api/pokemons?type=Fire`        | Filtra por tipo                             |
| `GET`    | `/api/pokemons/{id}`             | Busca um Pokémon pelo ID                    |
| `POST`   | `/api/pokemons`                  | Cadastra (id automático se não informado)   |
| `PUT`    | `/api/pokemons/{id}`             | Atualiza                                    |
| `DELETE` | `/api/pokemons/{id}`             | Remove                                      |
| `GET`    | `/api/types`                     | Lista os tipos                              |
| `GET`    | `/api/trainers`, `/{id}`         | Treinadores e seus Pokémon (desafio)        |

Exemplo de documento (`pokemons`):

```json
{ "id": 25, "name": "Pikachu", "hp": 35, "attack": 55, "defense": 30,
  "specialAttack": 50, "specialDefense": 40, "speed": 90, "types": ["Electric"] }
```

Treinadores (`trainers`): `{ "id": 1, "name": "Ash", "badges": 9, "pokemonIds": [25, 3, 6, 9, 131, 143] }`.

## Funcionalidades do frontend

- 🔎 Pesquisa por nome e 🧬 filtro por tipo (consultas feitas na API)
- 📄 Detalhes com atributos em barras e treinadores que possuem o Pokémon
- ➕ Cadastro, ✏️ edição e 🗑️ exclusão via API (persistem no MongoDB)

## Observações sobre os dados

- O `Script_Pokedex.sql` não define tipo para o Mew (#151); no seed ele foi cadastrado como `Psychic`.
- Para regenerar os JSONs de seed: `cd tools && python3 generate_seed.py`.

## Dupla

- Vitor de Freitas Rios
- Brayan Mendes de Carvalho
