"""Gera os JSONs de seed (pokemons, types, trainers) a partir dos dados do Script_Pokedex.sql."""
import json
import pathlib

from data import STATS, TYPE_REL, TYPES, TRAINERS, TRAINER_REL

out = pathlib.Path(__file__).resolve().parent.parent / "backend/src/main/resources/seed"
out.mkdir(parents=True, exist_ok=True)

rel = {int(k): [TYPES[int(t)] for t in v.split(",")]
       for k, v in (p.split(":") for p in TYPE_REL.split(";"))}
rel[151] = ["Psychic"]  # o script original não define tipo para o Mew

pokemons = []
for line in STATS.splitlines():
    i, n, hp, at, df, sa, sd, sp = line.split("|")
    pokemons.append({
        "id": int(i), "name": n, "hp": int(hp), "attack": int(at), "defense": int(df),
        "specialAttack": int(sa), "specialDefense": int(sd), "speed": int(sp),
        "types": rel[int(i)],
    })

types = [{"id": i, "name": n} for i, n in enumerate(TYPES)]
trel = {int(k): [int(x) for x in v.split(",")]
        for k, v in (p.split(":") for p in TRAINER_REL.split(";"))}
trainers = [{"id": i, "name": n, "badges": b, "pokemonIds": trel.get(i, [])}
            for i, n, b in TRAINERS]

for name, data in (("pokemons", pokemons), ("types", types), ("trainers", trainers)):
    (out / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(pokemons), len(types), len(trainers))
