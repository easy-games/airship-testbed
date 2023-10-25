import { Player } from "@Easy/Core/Shared/Player/Player";

export class PlayerLeaveServerEvent {
	constructor(public readonly player: Player) {}
}
