import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export interface TeamDto {
	name: string;
	id: string;
	userIds: string[];
	color: [r: number, g: number, b: number, a: number];
}

export class Team {
	private players = new Set<Player>();
	public readonly onPlayerAdded = new Signal<Player>();
	public readonly onPlayerRemoved = new Signal<Player>();

	constructor(public readonly name: string, public readonly id: string, public readonly color: Color) {}

	public GetPlayers(): Set<Player> {
		return this.players;
	}

	public AddPlayer(player: Player): void {
		const oldTeam = player.GetTeam();

		this.players.add(player);
		player.SetTeam(this);
		this.onPlayerAdded.Fire(player);

		Airship.teams.onPlayerChangeTeam.Fire(player, this, oldTeam);
	}

	public RemovePlayer(player: Player): void {
		if (this.players.delete(player)) {
			this.onPlayerRemoved.Fire(player);
		}
	}

	public Encode(): TeamDto {
		const playerIds = new Array<string>();
		for (let player of this.players) {
			playerIds.push(player.userId);
		}
		return {
			name: this.name,
			id: this.id,
			userIds: playerIds,
			color: [this.color.r, this.color.g, this.color.b, this.color.a],
		};
	}

	public HasLocalPlayer(): boolean {
		return Game.localPlayer !== undefined && this.players.has(Game.localPlayer);
	}

	public SendMessage(message: string): void {
		for (const player of this.players) {
			player.SendMessage(message);
		}
	}
}
