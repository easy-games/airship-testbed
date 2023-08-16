import { Player } from "Imports/Core/Shared/Player/Player";

export class PlayerJoinServerEvent {
	constructor(public readonly player: Player) {}
}
