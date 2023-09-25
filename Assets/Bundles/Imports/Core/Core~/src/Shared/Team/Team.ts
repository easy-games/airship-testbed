import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { ChangeTeamSignal } from "./TeamJoinSignal";

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

		if (RunUtil.IsClient()) {
			import("Client/CoreClientSignals").then((i) => {
				i.CoreClientSignals.PlayerChangeTeam.Fire(new ChangeTeamSignal(player, this, oldTeam));
			});
		} else {
			import("Server/CoreServerSignals").then((i) => {
				i.CoreServerSignals.PlayerChangeTeam.Fire(new ChangeTeamSignal(player, this, oldTeam));
			});
		}
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
		return Game.LocalPlayer !== undefined && this.players.has(Game.LocalPlayer);
	}

	public SendMessage(message: string): void {
		for (const player of this.players) {
			player.SendMessage(message);
		}
	}
}
