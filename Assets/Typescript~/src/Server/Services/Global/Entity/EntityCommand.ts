import { Dependency } from "@easy-games/flamework-core";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "../../../Commands/ChatCommand";
import { EntityService } from "./EntityService";

export class EntityCommand extends ChatCommand {
	constructor() {
		super("entity", ["e"]);
	}

	public Execute(player: Player, args: string[]): void {
		const entityService = Dependency<EntityService>();

		if (!player.Character) return;

		const pos = player.Character.gameObject.transform.position;
		entityService.SpawnEntityForPlayer(undefined, EntityPrefabType.HUMAN, pos);
	}
}
