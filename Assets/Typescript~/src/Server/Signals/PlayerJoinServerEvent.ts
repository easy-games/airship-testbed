import { Player } from "@Easy/Core/Shared/Player/Player";

export class PlayerJoinServerEvent {
	constructor(public readonly player: Player) {}
}
