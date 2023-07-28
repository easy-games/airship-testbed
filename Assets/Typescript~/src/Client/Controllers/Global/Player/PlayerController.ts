import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { Game } from "Shared/Game";
import { Network } from "Shared/Network";
import { Player, PlayerDto } from "Shared/Player/Player";
import { Team } from "Shared/Team/Team";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { TeamController } from "../Team/TeamController";

@Controller({})
export class PlayerController implements OnStart {
	public readonly LocalConnection: NetworkConnection;
	private players = new Set<Player>([Game.LocalPlayer]);

	constructor() {
		this.LocalConnection = InstanceFinder.ClientManager.Connection;
		this.players.add(Game.LocalPlayer);
	}

	OnStart(): void {
		Network.ServerToClient.AllPlayers.Client.OnServerEvent((playerDtos) => {
			for (let dto of playerDtos) {
				this.AddPlayer(dto);
			}
		});
		Network.ServerToClient.AddPlayer.Client.OnServerEvent((playerDto) => {
			this.AddPlayer(playerDto);
		});
		Network.ServerToClient.RemovePlayer.Client.OnServerEvent((clientId) => {
			const player = this.GetPlayerFromClientId(clientId);
			if (player) {
				this.players.delete(player);
				ClientSignals.PlayerLeave.Fire(player);
				player.Destroy();
			}
		});
	}

	public GetPlayerFromClientId(clientId: number): Player | undefined {
		for (let player of this.players) {
			if (player.clientId === clientId) {
				return player;
			}
		}
		return undefined;
	}

	public GetPlayerFromUserId(userId: string): Player | undefined {
		for (let player of this.players) {
			//print("checking player " + player.userId + " to " + userId);
			if (player.userId === userId) {
				return player;
			}
		}
		return undefined;
	}

	public GetPlayerFromUsername(name: string): Player | undefined {
		for (let player of this.players) {
			if (player.username === name) {
				return player;
			}
		}
		return undefined;
	}

	private AddPlayer(dto: PlayerDto): void {
		const existing = this.GetPlayerFromClientId(dto.clientId);
		if (existing) {
			return;
		}
		const nob = NetworkUtil.WaitForNobId(dto.nobId);
		nob.gameObject.name = `Player_${dto.username}`;

		let team: Team | undefined;
		if (dto.teamId) {
			team = Dependency<TeamController>().GetTeam(dto.teamId);
		}

		if (dto.clientId === this.LocalConnection.ClientId) {
			const mutablePlayer = Game.LocalPlayer as Mutable<Player>;
			mutablePlayer.nob = nob;
			mutablePlayer.clientId = dto.clientId;
			mutablePlayer.userId = dto.userId;
			mutablePlayer.username = dto.username;
			mutablePlayer.usernameTag = dto.usernameTag;

			team?.AddPlayer(mutablePlayer as Player);

			return;
		}

		const player = new Player(nob, dto.clientId, dto.userId, dto.username, dto.usernameTag);
		team?.AddPlayer(player);

		this.players.add(player);
		ClientSignals.PlayerJoin.Fire(player);
	}

	public GetPlayers(): Player[] {
		return Object.keys(this.players);
	}
}
