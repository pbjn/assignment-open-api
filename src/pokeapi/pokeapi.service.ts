import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeapiService {
    private apiUrl = 'https://pokeapi.co/api/v2';

    //simplified mapping of type's weaknesses
    private typeWeaknesses = {
        "normal": ["fighting"],
        "fire": ["water", "rock", "ground"],
        "ice": ["fire", "rock", "steel", "fighting"],
        "water": ["electric", "grass"],
        "flying": ["electric", "ice", "rock"],
        "electric": ["ground"],
        "grass": ["fire", "ice", "poison", "flying", "bug"],
        "fighting": ["flying", "psychic", "fairy"],
        "poison": ["ground", "psychic"],
        "ground": ["water", "grass", "ice"],
        "fairy": ["poison", "steel"],
        "psychic": ["bug", "dark", "ghost"],
        "bug": ["fire", "flying", "rock"],
        "rock": ["fighting", "ground", "steel", "water", "grass"],
        "ghost": ["dark", "ghost"],
        "dragon": ["dragon", "fairy", "ice"],
        "dark": ["bug", "fairy", "fighting"],
        "steel": ["fighting", "fire", "ground"]
    };

    async getPokemon(pokemonName: string) {
        try {
            const response = await axios.get(`${this.apiUrl}/pokemon/${pokemonName}`);
            const pokemonData = response.data;

            const formattedData = {
                "Pokémon Trainer's Companion Report": {
                    "Introduction": "Greetings, Trainer! Here is everything you need to know about your Pokémon. Use this report wisely in your adventures!",
                    "Pokémon Profile": {
                        "Name": this.capitalizeFirstLetter(pokemonData.name),
                        "Type(s)": pokemonData.types.map(type => this.capitalizeFirstLetter(type.type.name)),
                        "Height": `${pokemonData.height / 10} meters`,
                        "Weight": `${pokemonData.weight / 10} kg`,
                        "Abilities": pokemonData.abilities.map(ability => `${this.capitalizeFirstLetter(ability.ability.name)}`),
                        "Image": pokemonData.sprites.other['official-artwork'].front_default
                    },
                    "Battle Insights": {
                        "Base Stats": this.formatStats(pokemonData.stats),
                        "Weaknesses": this.getWeaknesses(pokemonData.types),
                        "Tip": "Carefully analyze your Pokémon's base stats to develop strategies based on its strengths and weaknesses. A well-informed trainer can turn any battle in their favor!"
                    },
                    "Evolution Guide": {
                        "Evolution Chain": await this.getEvolutionChain(pokemonData.id),
                        "Message": "Keep training to see the next evolution!"
                    },
                    "Trainer's Note": "Keep training and building your bond with this Pokémon to unlock its full potential!"
                }
            };
            return formattedData;
        } catch (error) {
            throw new HttpException('Pokémon not found', HttpStatus.NOT_FOUND);
        }
    }

    private formatStats(stats) {
        const statDescriptions = stats.map(stat => ({
            [this.capitalizeFirstLetter(stat.stat.name)]: `${stat.base_stat} points (${this.getStatCommentary(stat.stat.name, stat.base_stat)})`
        }));
        return statDescriptions;
    }

    private getStatCommentary(statName: string, statValue: number): string {
        if (statValue > 100) {
            return `${statName.toUpperCase()} is exceptional! A key strength in battles.`;
        }
        if (statValue > 60) {
            return `${statName.toUpperCase()} is solid. Balanced for most battles.`;
        }
        return `${statName.toUpperCase()} is a bit low. Play strategically!`;
    }

    private async getEvolutionChain(pokemonId: number) {
        try {
            const speciesResponse = await axios.get(`${this.apiUrl}/pokemon-species/${pokemonId}`);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

            const evolutionResponse = await axios.get(evolutionChainUrl);
            const chain = evolutionResponse.data.chain;

            return this.extractEvolutions(chain);
        } catch (error) {
            return ["No evolution data available."];
        }
    }

    private extractEvolutions(chain) {
        const evolutions = [];
        let currentChain = chain;

        while (currentChain) {
            evolutions.push(currentChain.species.name.toUpperCase());
            currentChain = currentChain.evolves_to[0];
        }

        return evolutions.length > 1 ? evolutions : ["No further evolutions."];
    }

    //fetch weaknesses based on Pokémon types
    private getWeaknesses(types: any[]): string {
        const weaknesses: string[] = [];

        types.forEach(typeObj => {
            const type = typeObj.type.name;
            if (this.typeWeaknesses[type]) {
                weaknesses.push(...this.typeWeaknesses[type]);
            }
        });

        if (weaknesses.length === 0) { //if no weaknesses
            return "No significant weaknesses found.";
        }

        //returns/shows the weaknesses
        return [...new Set(weaknesses)].map(type => this.capitalizeFirstLetter(type)).join(", ");
    }

    private capitalizeFirstLetter(text: string): string { //capitalizes the first letter of the word
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
}
