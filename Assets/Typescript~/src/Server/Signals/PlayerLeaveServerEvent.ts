import { Player } from "Imports/Core/Shared/Player/Player";

export class PlayerLeaveServerEvent {
	constructor(public readonly player: Player) {}
}
