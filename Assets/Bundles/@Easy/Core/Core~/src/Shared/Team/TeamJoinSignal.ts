import { Player } from "Shared/Player/Player";
import { Team } from "./Team";

export class ChangeTeamSignal {
	constructor(
		public readonly player: Player,
		public readonly team: Team | undefined,
		public readonly oldTeam: Team | undefined,
	) {}
}
