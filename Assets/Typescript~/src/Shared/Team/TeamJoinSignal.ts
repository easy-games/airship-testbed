import { Player } from "Shared/Player/Player";
import { Team } from "./Team";

export class ChangeTeamSignal {
	constructor(
		public readonly Player: Player,
		public readonly Team: Team | undefined,
		public readonly OldTeam: Team | undefined,
	) {}
}
