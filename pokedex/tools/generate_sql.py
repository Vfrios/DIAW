"""Regenera o Script_Pokedex.sql a partir de data.py (mesmo conteúdo/estrutura do script da atividade)."""
import pathlib
from data import STATS, TYPE_REL, TYPES, TRAINERS, TRAINER_REL

def q(s): return s.replace("'", "''")

L = []
L.append("CREATE TABLE Pokemon\n    (`ID_Pokemon` int not null, `Pokemon` varchar(11), `HP` int, `Attack` int, `Defense` int, `Special_Attack` int, `Special_Defense` int, `Speed` int, PRIMARY KEY (ID_Pokemon))\n;\n")
rows = []
for line in STATS.splitlines():
    i, n, *s = line.split("|")
    rows.append(f"    ({i}, '{q(n)}', {', '.join(s)})")
L.append("INSERT INTO Pokemon\n    (`ID_Pokemon`, `Pokemon`, `HP`, `Attack`, `Defense`, `Special_Attack`, `Special_Defense`, `Speed`)\nVALUES\n" + ",\n".join(rows) + "\n;\n")
L.append("CREATE TABLE Rel_Pokemon_Type\n    (`ID_Pokemon` int, `ID_Type` int)\n;\n")
rows = [f"    ({k}, {t})" for k, v in (p.split(":") for p in TYPE_REL.split(";")) for t in v.split(",")]
L.append("INSERT INTO Rel_Pokemon_Type\n    (`ID_Pokemon`, `ID_Type`)\nVALUES\n" + ",\n".join(rows) + "\n;\n")
L.append("CREATE TABLE Types\n    (`ID_Type` int not null, `Type` varchar(8), PRIMARY KEY(ID_Type))\n;\n")
L.append("INSERT INTO Types\n    (`ID_Type`, `Type`)\nVALUES\n" + ",\n".join(f"    ({i}, '{n}')" for i, n in enumerate(TYPES)) + "\n;\n")
L.append("CREATE TABLE Rel_Trainer_Pokemon\n    (`ID_Trainer` int, `ID_Pokemon` int)\n;\n")
rows = [f"    ({k}, {p})" for k, v in (x.split(":") for x in TRAINER_REL.split(";")) for p in v.split(",")]
L.append("INSERT INTO Rel_Trainer_Pokemon\n    (`ID_Trainer`, `ID_Pokemon`)\nVALUES\n" + ",\n".join(rows) + "\n;\n")
L.append("CREATE TABLE Trainers\n    (`ID_Trainer` int not null, `Trainer` varchar(11), `Badges` int, PRIMARY KEY(ID_Trainer))\n;\n")
L.append("INSERT INTO Trainers\n    (`ID_Trainer`, `Trainer`, `Badges`)\nVALUES\n" + ",\n".join(f"    ({i}, '{q(n)}', {b})" for i, n, b in TRAINERS) + "\n;\n")
L.append("SELECT * FROM Pokemon;\nSELECT * FROM Trainers;\nSELECT * FROM Types;\nSELECT * FROM Rel_Pokemon_Type;\nSELECT * FROM Rel_Trainer_Pokemon;\n")
(pathlib.Path(__file__).resolve().parent.parent / "Script_Pokedex.sql").write_text("\n\n".join(L), encoding="utf-8")
