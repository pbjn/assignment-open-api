import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokeapiService {
    private apiUrl = 'https://pokeapi.co/api/v2';

    async getPokemon(pokemonName: string) {
        try {
            const response = await axios.get(`${this.apiUrl}/pokemon/${pokemonName}`);
            const pokemonData = response.data;

            //format for the display of data
            const formattedData = {
                "Pokémon Information": {
                    "Basic Info": {
                        "name": pokemonData.name,
                        "types": pokemonData.types.map(type => type.type.name),
                        "height": pokemonData.height,
                        "weight": pokemonData.weight,
                    },
                    "abilities": pokemonData.abilities.map(ability => ability.ability.name),
                    "stats": this.formatStats(pokemonData.stats),
                    "evolution": await this.getEvolutionChain(pokemonData.id)
                }
            };
            return formattedData;
        } catch (error) {
            throw new HttpException('Pokémon not found', HttpStatus.NOT_FOUND);
        }
    }

    private formatStats(stats) {
        const statMap = {};
        stats.forEach(stat => {
            statMap[stat.stat.name] = stat.base_stat.toString();
        });
        return statMap;
    }

    private async getEvolutionChain(pokemonId: number) {
        try {
            //getting the species first to get the evolution chain
            const speciesResponse = await axios.get(`${this.apiUrl}/pokemon-species/${pokemonId}`);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;

            //get the evolution chain
            const evolutionResponse = await axios.get(evolutionChainUrl);
            const chain = evolutionResponse.data.chain;

            //evolution names
            const evolutionNames = this.extractEvolutions(chain);
            return evolutionNames;
        } catch (error) {
            return [];
        }
    }

    private extractEvolutions(chain) {
        const evolutions = [];
        let currentChain = chain;

        while (currentChain) {
            evolutions.push(currentChain.species.name);
            currentChain = currentChain.evolves_to[0]; //get next evolution
        }

        return evolutions;
    }
}
