# Pokédex React + Vite

Pokédex interativa feita com **React + Vite** (Atividade 03 – Desenvolvimento e Integração de Aplicações Web).

**Demonstração no Render:** [Abrir Pokédex](https://diaw-completo.onrender.com/#pokedex). A aplicação estática abre diretamente pelo menu.

## Funcionalidades

- Lista dos 151 Pokémon com ID, nome, tipos e os 6 atributos (HP, Attack, Defense, Special Attack, Special Defense, Speed)
- Pesquisa por **nome** ou **ID** (atualiza enquanto digita)
- Filtro por **tipo** (botões gerados a partir do `pokedex-data.json`)
- Detalhes do Pokémon em **modal** com barras de atributos, total e treinadores que o possuem (Esc fecha; setas ← → navegam)
- Área de **Treinadores**: nome, insígnias e Pokémon de cada um
- Tratamento de "nenhum Pokémon encontrado"
- Layout responsivo (desktop, tablet e celular)
- Extras: ordenação por atributo/nome/ID, favoritos (salvos no `localStorage`), Pokémon aleatório

## Como executar

```bash
npm install
npm run dev
```


Abra no navegador: **http://localhost:5173**

Build de produção: `npm run build` (e `npm run preview` para testar).

## Dados

Os dados ficam em `src/data/pokedex-data.json` (convertidos do script SQL fornecido: Pokémon, tipos, treinadores e relações).

> Observação: no SQL original o Mew (#151) não possui tipo na tabela `Rel_Pokemon_Type`, então ele aparece como **Typeless**.

## Imagens

As imagens usam as **artworks oficiais da PokéAPI** (repositório [PokeAPI/sprites](https://github.com/PokeAPI/sprites)), carregadas por URL a partir do ID:
`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`

Se a imagem não carregar (sem internet), o app continua funcionando só com os dados do JSON.

## Organização do projeto

```text
src/
├── components/   Header, SearchBar, TypeFilter, PokemonList, PokemonCard,
│                 PokemonDetails, StatBar, TypeBadge, TrainerList
├── css/          um arquivo CSS por componente + App.css
├── data/         pokedex-data.json
├── utils/        typeColors.js (cores dos tipos, URL da imagem, formatação de ID)
├── App.jsx       estados (busca, filtro, ordenação, favoritos, seleção)
├── main.jsx
└── index.css     variáveis globais
```

## Conceitos de React usados

Componentes funcionais, props, `useState`, `useEffect`, `useMemo` / `useCallback`, `map()` para listas, eventos, estados derivados e reutilização de componentes.

## Dupla

- Vitor Rios
- Brayan Mendes
