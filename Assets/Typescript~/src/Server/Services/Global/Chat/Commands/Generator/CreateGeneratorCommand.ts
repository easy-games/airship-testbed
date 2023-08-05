import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { GeneratorService } from "Server/Services/Global/Generator/GeneratorService";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";

/** Default generator item type. */
const DEFAULT_ITEM_TYPE = ItemType.COBBLESTONE;
/** Default generator spawn rate. */
const DEFAULT_SPAWN_RATE = 2;
/** Default generator stack limit. */
const DEFAULT_GENERATOR_STACK_LIMIT = 50;

export class CreateGeneratorCommand extends ChatCommand {
	constructor() {
		super("createGenerator");
	}

	public Execute(player: Player, args: string[]): void {
		let itemType: ItemType | undefined;
		let spawnRate: number | undefined;

		/* If no arguments are provided fallback to defaults. */
		if (args.size() === 0) {
			itemType = DEFAULT_ITEM_TYPE;
			spawnRate = DEFAULT_SPAWN_RATE;
		}

		/* ItemType argument provided, fallback to default spawn rate. */
		if (args.size() === 1) {
			itemType = args[0] as ItemType;
			spawnRate = DEFAULT_SPAWN_RATE;
		}

		/* ItemType and spawn rate arguments provided. */
		if (args.size() === 2) {
			itemType = args[0] as ItemType;
			spawnRate = tonumber(args[1]);
		}

		/* If no ItemType or spawn rate, return. */
		if (itemType === undefined || spawnRate === undefined) {
			player.SendMessage("Invalid arguments");
			return;
		}

		/* Spawn generator underneath command executor. */
		const executorEntity = Dependency<EntityService>().GetEntityByClientId(player.clientId);
		if (!executorEntity) return;
		const generatorPosition = executorEntity.gameObject.transform.position;
		Dependency<GeneratorService>().CreateGenerator(generatorPosition, {
			item: itemType,
			spawnRate: spawnRate,
			stackLimit: DEFAULT_GENERATOR_STACK_LIMIT,
			label: true,
			/* TODO: Split data? Maybe? */
		});
	}
}
