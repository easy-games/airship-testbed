import { Dependency } from "@easy-games/flamework-core";
import { DamageService } from "Server/Services/Global/Damage/DamageService";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { GeneratorService } from "Server/Services/Global/Generator/GeneratorService";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "../../../../../Commands/ChatCommand";

/** Default generator spawn rate. */
const DEFAULT_SPAWN_RATE = 2;

export class SetGeneratorSpawnRateCommand extends ChatCommand {
	constructor() {
		super("setGeneratorSpawnRate");
	}

	public Execute(player: Player, args: string[]): void {
		let spawnRate: number | undefined;
		let generatorId: string | undefined;

		/* If no arguments are provided fallback to defaults. */
		if (args.size() === 0) {
			player.SendMessage("Invalid arguments");
			return;
		}

		/* generator id argument provided, fallback to default spawn rate. */
		if (args.size() === 1) {
			generatorId = `generator_${args[0]}`;
			spawnRate = DEFAULT_SPAWN_RATE;
		}

		/* generator id and spawn rate arguments provided */
		if (args.size() === 2) {
			generatorId = `generator_${args[0]}`;
			spawnRate = tonumber(args[1]);
		}

		if (spawnRate === undefined || generatorId === undefined) {
			player.SendMessage("Invalid arguments");
			return;
		}

		/* Update spawn rate. */
		Dependency<GeneratorService>().UpdateGeneratorSpawnRateById(generatorId, spawnRate);
	}
}
