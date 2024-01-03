import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AuthController } from "Client/MainMenuControllers/Auth/AuthController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { Player, PlayerDto } from "Shared/Player/Player";
import { Team } from "Shared/Team/Team";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { TeamController } from "../Team/TeamController";
import { PlayerUtils } from "Shared/Util/PlayerUtils";

@Controller({})
export class PlayerController implements OnStart {
	public readonly clientId: number;
	public readonly localConnection: NetworkConnection;
	private players = new Set<Player>([Game.localPlayer]);

	constructor(
		private readonly friendsController: FriendsController,
		private readonly authController: AuthController,
	) {
		this.localConnection = InstanceFinder.ClientManager.Connection;
		this.clientId = this.localConnection.ClientId;
		this.players.add(Game.localPlayer);

		CoreNetwork.ServerToClient.ServerInfo.client.OnServerEvent((gameId, serverId) => {
			Game.gameId = gameId;
			Game.serverId = serverId;
			print(`GameId=${gameId} ServerId=${serverId}`);
			if (this.authController.IsAuthenticated()) {
				this.friendsController.SendStatusUpdate();
			} else {
				this.authController.onAuthenticated.Once(() => {
					this.friendsController.SendStatusUpdate();
				});
			}
		});
	}

	OnStart(): void {
		CoreNetwork.ServerToClient.AllPlayers.client.OnServerEvent((playerDtos) => {
			for (let dto of playerDtos) {
				this.AddPlayer(dto);
			}
		});
		CoreNetwork.ServerToClient.AddPlayer.client.OnServerEvent((playerDto) => {
			this.AddPlayer(playerDto);
		});
		CoreNetwork.ServerToClient.RemovePlayer.client.OnServerEvent((clientId) => {
			const player = this.GetPlayerFromClientId(clientId);
			if (player) {
				this.players.delete(player);
				CoreClientSignals.PlayerLeave.Fire(player);
				player.Destroy();
			}
		});
	}

	/**
	 * Looks for a player using a case insensitive fuzzy search
	 *
	 * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
	 * @param searchName The name of the plaeyr
	 */
	public FuzzyFindFirstPlayerByName(searchName: string): Player | undefined {
		return PlayerUtils.FuzzyFindPlayerByName([...this.players], searchName);
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
			if (Game.localPlayer !== existing) {
				warn("Tried to add existing player " + dto.username);
			}
			return;
		}
		const nob = NetworkUtil.WaitForNobId(dto.nobId);
		nob.gameObject.name = `Player_${dto.username}`;

		let team: Team | undefined;
		if (dto.teamId) {
			team = Dependency<TeamController>().GetTeam(dto.teamId);
		}

		if (dto.clientId === this.localConnection.ClientId) {
			const mutablePlayer = Game.localPlayer as Mutable<Player>;
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
		CoreClientSignals.PlayerJoin.Fire(player);
	}

	public GetPlayers(): Player[] {
		return Object.keys(this.players);
	}
}
