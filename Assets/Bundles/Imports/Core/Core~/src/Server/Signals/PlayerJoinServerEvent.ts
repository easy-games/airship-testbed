import { Player } from "Shared/Player/Player";

export class PlayerJoinServerEvent {
	constructor(public readonly player: Player) {}
}
