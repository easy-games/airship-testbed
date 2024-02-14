import { Dependency } from "Shared/Flamework";
import { GeneratorService } from "Server/Services/Generator/GeneratorService";
import { Airship } from "Shared/Airship";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";

/** Default generator item type. */
const DEFAULT_ITEM_TYPE = ItemType.WOOD_SWORD;
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

		// If no arguments are provided fallback to defaults.
		if (args.size() === 0) {
			itemType = DEFAULT_ITEM_TYPE;
			spawnRate = DEFAULT_SPAWN_RATE;
		}

		// ItemType argument provided, fallback to default spawn rate.
		if (args.size() === 1) {
			itemType = args[0] as ItemType;
			spawnRate = DEFAULT_SPAWN_RATE;
		}

		// ItemType and spawn rate arguments provided.
		if (args.size() === 2) {
			itemType = args[0] as ItemType;
			spawnRate = tonumber(args[1]);
		}

		// If no ItemType or spawn rate, return.
		if (itemType === undefined || spawnRate === undefined) {
			player.SendMessage("Invalid arguments");
			return;
		}

		// Spawn generator underneath command executor.
		const executorCharacter = Airship.characters.FindByClientId(player.clientId);
		if (!executorCharacter) return;
		const generatorPosition = executorCharacter.gameObject.transform.position;
		Dependency<GeneratorService>().CreateGenerator(generatorPosition, {
			item: itemType,
			spawnRate: spawnRate,
			stackLimit: DEFAULT_GENERATOR_STACK_LIMIT,
			nameLabel: true,
			spawnTimeLabel: spawnRate > 2,
		});
	}
}
