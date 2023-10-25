import { Player } from "Shared/Player/Player";

export class PlayerLeaveServerEvent {
	constructor(public readonly player: Player) {}
}
