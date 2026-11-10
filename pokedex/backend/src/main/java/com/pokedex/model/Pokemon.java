package com.pokedex.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "pokemons")
public class Pokemon {

    @Id
    private Integer id;

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotNull @Min(1) private Integer hp;
    @NotNull @Min(1) private Integer attack;
    @NotNull @Min(1) private Integer defense;
    @NotNull @Min(1) private Integer specialAttack;
    @NotNull @Min(1) private Integer specialDefense;
    @NotNull @Min(1) private Integer speed;

    private List<String> types = new ArrayList<>();

    public Pokemon() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getHp() { return hp; }
    public void setHp(Integer hp) { this.hp = hp; }
    public Integer getAttack() { return attack; }
    public void setAttack(Integer attack) { this.attack = attack; }
    public Integer getDefense() { return defense; }
    public void setDefense(Integer defense) { this.defense = defense; }
    public Integer getSpecialAttack() { return specialAttack; }
    public void setSpecialAttack(Integer specialAttack) { this.specialAttack = specialAttack; }
    public Integer getSpecialDefense() { return specialDefense; }
    public void setSpecialDefense(Integer specialDefense) { this.specialDefense = specialDefense; }
    public Integer getSpeed() { return speed; }
    public void setSpeed(Integer speed) { this.speed = speed; }
    public List<String> getTypes() { return types; }
    public void setTypes(List<String> types) { this.types = types == null ? new ArrayList<>() : types; }
}
