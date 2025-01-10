import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokeapiService } from './pokeapi/pokeapi.service';
import { PokeapiController } from './pokeapi/pokeapi.controller';

@Module({
  imports: [],
  controllers: [AppController, PokeapiController],
  providers: [AppService, PokeapiService],
})
export class AppModule {}
