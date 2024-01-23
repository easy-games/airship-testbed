import { Controller, Dependency, OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { TeamController } from "Client/Controllers/Team/TeamController";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AuthController } from "Client/MainMenuControllers/Auth/AuthController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { Airship } from "Shared/Airship";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { Team } from "Shared/Team/Team";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { PlayerUtils } from "Shared/Util/PlayerUtils";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { Player, PlayerDto } from "./Player";

@Controller()
@Service()
export class PlayerManager implements OnStart {
	public onPlayerJoined = new Signal<Player>();
	public onPlayerDisconnected = new Signal<Player>();

	private players = new Set<Player>([Game.localPlayer]);
	private playerManagerBridge = PlayerManagerBridge.Instance;
	private client?: {
		clientId: number;
	};
	private server?: {
		botCounter: number;
	};

	constructor() {
		Airship.players = this;

		if (RunUtil.IsClient()) {
			this.client = {
				clientId: InstanceFinder.ClientManager.Connection.ClientId,
			};
		}
		if (RunUtil.IsServer()) {
			this.server = {
				botCounter: 0,
			};
		}
	}

	OnStart(): void {
		if (RunUtil.IsClient()) {
			this.InitClient();
		}
		if (RunUtil.IsServer()) {
			this.InitServer();
		}
	}

	private InitClient(): void {
		const authController = Dependency<AuthController>();
		const friendsController = Dependency<FriendsController>();
		CoreNetwork.ServerToClient.ServerInfo.client.OnServerEvent((gameId, serverId, organizationId) => {
			// this.localConnection = InstanceFinder.ClientManager.Connection;
			// this.clientId = this.localConnection.ClientId;
			Game.gameId = gameId;
			Game.serverId = serverId;
			Game.organizationId = organizationId;
			if (authController.IsAuthenticated()) {
				friendsController.SendStatusUpdate();
			} else {
				authController.onAuthenticated.Once(() => {
					friendsController.SendStatusUpdate();
				});
			}
		});

		CoreNetwork.ServerToClient.AllPlayers.client.OnServerEvent((playerDtos) => {
			for (let dto of playerDtos) {
				this.AddPlayerClient(dto);
			}
		});
		CoreNetwork.ServerToClient.AddPlayer.client.OnServerEvent((playerDto) => {
			this.AddPlayerClient(playerDto);
		});
		CoreNetwork.ServerToClient.RemovePlayer.client.OnServerEvent((clientId) => {
			const player = this.FindByClientId(clientId);
			if (player) {
				this.players.delete(player);
				CoreClientSignals.PlayerLeave.Fire(player);
				player.Destroy();
			}
		});

		CoreNetwork.ServerToClient.SpawnCharacters.client.OnServerEvent((spawnPackets) => {
			for (const spawnPacket of spawnPackets) {
				task.spawn(() => {
					const userId = spawnPacket[0];
					const nobId = spawnPacket[1];
					const nob = NetworkUtil.WaitForNobId(nobId);
					const player = this.FindByUserId(userId);
				});
			}
		});
	}

	private InitServer(): void {
		const playersPendingReady = new Map<number, Player>();
		const onPlayerPreJoin = (playerInfo: PlayerInfoDto) => {
			const player = new Player(
				playerInfo.gameObject.GetComponent<NetworkObject>(),
				playerInfo.clientId,
				playerInfo.userId,
				playerInfo.username,
				playerInfo.usernameTag,
			);
			playerInfo.gameObject.name = `Player_${playerInfo.username}`;
			playersPendingReady.set(playerInfo.clientId, player);

			// Ready bots immediately
			if (playerInfo.clientId < 0) {
				playersPendingReady.delete(playerInfo.clientId);
				this.players.add(player);
				this.HandlePlayerReadyServer(player);
			}
		};
		const onPlayerRemoved = (clientInfo: PlayerInfoDto) => {
			const clientId = clientInfo.clientId;
			const player = this.FindByClientId(clientId);
			if (player) {
				this.players.delete(player);
				this.onPlayerDisconnected.Fire(player);
				CoreNetwork.ServerToClient.RemovePlayer.server.FireAllClients(player.clientId);
				player.Destroy();
			}
		};
		const players = this.playerManagerBridge.GetPlayers();
		for (let i = 0; i < players.Length; i++) {
			const clientInfo = players.GetValue(i);
			onPlayerPreJoin(clientInfo);
		}
		this.playerManagerBridge.OnPlayerAdded((clientInfo) => {
			onPlayerPreJoin(clientInfo);
		});
		this.playerManagerBridge.OnPlayerRemoved((clientInfo) => {
			onPlayerRemoved(clientInfo);
		});

		// Player completes join
		CoreNetwork.ClientToServer.Ready.server.OnClientEvent((clientId) => {
			let retry = 0;
			while (!playersPendingReady.has(clientId)) {
				//print("player not found in pending: " + clientId);
				// warn("Player not found in pending: " + clientId);
				retry++;
				task.wait();
				// return;
			}

			const player = playersPendingReady.get(clientId)!;

			playersPendingReady.delete(clientId);
			this.players.add(player);

			this.HandlePlayerReadyServer(player);
		});
	}

	private HandlePlayerReadyServer(player: Player): void {
		CoreNetwork.ServerToClient.ServerInfo.server.FireClient(
			player.clientId,
			Game.gameId,
			Game.serverId,
			Game.organizationId,
		);

		// notify all clients of the joining player
		CoreNetwork.ServerToClient.AddPlayer.server.FireAllClients(player.Encode());

		// send list of all connected players to the joining player
		const playerDtos: PlayerDto[] = [];
		for (let p of this.players) {
			playerDtos.push(p.Encode());
		}
		CoreNetwork.ServerToClient.AllPlayers.server.FireClient(player.clientId, playerDtos);

		this.onPlayerJoined.Fire(player);
	}

	private AddPlayerClient(dto: PlayerDto): void {
		const existing = this.FindByClientId(dto.clientId);
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

		if (dto.clientId === this.client!.clientId) {
			const mutablePlayer = Game.localPlayer as Mutable<Player>;
			mutablePlayer.nob = nob;
			mutablePlayer.clientId = dto.clientId;
			mutablePlayer.userId = dto.userId;
			mutablePlayer.username = dto.username;
			mutablePlayer.usernameTag = dto.usernameTag;

			team?.AddPlayer(mutablePlayer as Player);

			Game.localPlayerLoaded = true;
			Game.onLocalPlayerLoaded.Fire();

			return;
		}

		const player = new Player(nob, dto.clientId, dto.userId, dto.username, dto.usernameTag);
		team?.AddPlayer(player);

		this.players.add(player);
		CoreClientSignals.PlayerJoin.Fire(player);
	}

	public AddBotPlayer(): void {
		if (!RunUtil.IsServer()) {
			error("AddBotPlayer must be called on the server.");
		}
		this.server!.botCounter++;
		let userId = `bot${this.server!.botCounter}`;
		let username = `Bot${this.server!.botCounter}`;
		let tag = "bot";
		print("Adding bot " + username);
		this.playerManagerBridge.AddBotPlayer(username, tag, userId);
	}

	public GetPlayers(): Player[] {
		return ObjectUtils.keys(this.players);
	}

	/**
	 * Observe every player entering/leaving the game. The returned function can be
	 * called to stop observing.
	 *
	 * The `observer` function is fired for every player currently in the game and
	 * every future player that joins. The `observer` function must return another
	 * function which is called when said player leaves (_or_ the top-level observer
	 * function was called to stop the observation process).
	 *
	 * ```ts
	 * playersService.ObservePlayers((player) => {
	 * 	print(`${player.name} entered`);
	 * 	return () => {
	 * 		print(`${player.name} left`);
	 * 	};
	 * });
	 * ```
	 */
	public ObservePlayers(
		observer: (player: Player) => (() => void) | void,
		signalPriority?: SignalPriority,
	): () => void {
		const cleanupPerPlayer = new Map<Player, () => void>();
		const observe = (player: Player) => {
			const cleanup = observer(player);
			if (cleanup !== undefined) {
				cleanupPerPlayer.set(player, cleanup);
			}
		};
		for (const player of this.players) {
			observe(player);
		}
		const stopPlayerAdded = this.onPlayerJoined.ConnectWithPriority(
			signalPriority ?? SignalPriority.NORMAL,
			(player) => {
				observe(player);
			},
		);
		const stopPlayerRemoved = this.onPlayerDisconnected.ConnectWithPriority(
			signalPriority ?? SignalPriority.NORMAL,
			(player) => {
				const cleanup = cleanupPerPlayer.get(player);
				if (cleanup !== undefined) {
					cleanup();
					cleanupPerPlayer.delete(player);
				}
			},
		);
		return () => {
			stopPlayerAdded();
			stopPlayerRemoved();
			for (const [player, cleanup] of cleanupPerPlayer) {
				cleanup();
			}
		};
	}

	/**
	 * Looks for a player using a case insensitive fuzzy search
	 *
	 * Specific players can be grabbed using the full discriminator as well - e.g. `Luke#0001` would be a specific player
	 * @param searchName The name of the plaeyr
	 */
	public FindByFuzzySearch(searchName: string): Player | undefined {
		return PlayerUtils.FuzzyFindPlayerByName([...this.players], searchName);
	}

	public FindByClientId(clientId: number): Player | undefined {
		for (let player of this.players) {
			if (player.clientId === clientId) {
				return player;
			}
		}
		return undefined;
	}

	public FindByUserId(userId: string): Player | undefined {
		for (let player of this.players) {
			//print("checking player " + player.userId + " to " + userId);
			if (player.userId === userId) {
				return player;
			}
		}
		return undefined;
	}

	public FindByUsername(name: string): Player | undefined {
		for (let player of this.players) {
			if (player.username === name) {
				return player;
			}
		}
		return undefined;
	}
}
