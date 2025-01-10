import { Controller, Get, Param } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';

@Controller('pokemon')
export class PokeapiController {
  constructor(private readonly pokeapiService: PokeapiService) {}

  @Get(':name')
  async getPokemon(@Param('name') name: string) {
    return this.pokeapiService.getPokemon(name);
  }
}
