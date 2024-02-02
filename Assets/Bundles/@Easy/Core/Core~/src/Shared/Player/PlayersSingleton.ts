import { Controller, Dependency, OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { AuthController } from "Client/MainMenuControllers/Auth/AuthController";
import { FriendsController } from "Client/MainMenuControllers/Social/FriendsController";
import { Airship } from "Shared/Airship";
import { CoreContext } from "Shared/CoreClientContext";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { Team } from "Shared/Team/Team";
import { ChatColor } from "Shared/Util/ChatColor";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { PlayerUtils } from "Shared/Util/PlayerUtils";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { Player, PlayerDto } from "./Player";

@Controller({ loadOrder: -1000 })
@Service({ loadOrder: -1000 })
export class PlayersSingleton implements OnStart {
	public onPlayerJoined = new Signal<Player>();
	public onPlayerDisconnected = new Signal<Player>();

	public joinMessagesEnabled = true;
	public disconnectMessagesEnabled = true;

	private players = new Set<Player>([]);
	private playerManagerBridge = PlayerManagerBridge.Instance;
	private server?: {
		botCounter: number;
	};

	private playersPendingReady = new Map<number, Player>();

	constructor() {
		Airship.players = this;
		// const timeStart = Time.time;

		const FetchLocalPlayerWithWait = () => {
			let localPlayerInfo: PlayerInfo | undefined = this.playerManagerBridge.localPlayer;
			while (localPlayerInfo === undefined) {
				task.wait();
				localPlayerInfo = this.playerManagerBridge.localPlayer;
			}

			const mutable = Game.localPlayer as Mutable<Player>;
			mutable.clientId = localPlayerInfo.clientId;
			mutable.networkObject = localPlayerInfo.gameObject.GetComponent<NetworkObject>();
			mutable.username = localPlayerInfo.username;
			mutable.usernameTag = localPlayerInfo.usernameTag;
			mutable.userId = localPlayerInfo.userId;
			Game.localPlayerLoaded = true;
			Game.onLocalPlayerLoaded.Fire();

			// const timeDiff = Time.time - timeStart;
			// print("took " + timeDiff + " ms to load local player.");
		};

		if (RunUtil.IsClient()) {
			Game.localPlayer = new Player(undefined as unknown as NetworkObject, 0, "loading", "loading", "null");
			if (!RunUtil.IsHosting()) {
				/**
				 * Host mode: start with no players
				 * Dedicated client: start with LocalPlayer
				 * Dedicated server: start with no players
				 */
				this.players.add(Game.localPlayer);
			}

			task.spawn(() => {
				FetchLocalPlayerWithWait();
			});
		}
		if (RunUtil.IsServer()) {
			this.server = {
				botCounter: 0,
			};
		}

		this.onPlayerJoined.Connect((player) => {
			if (RunUtil.IsServer() && this.joinMessagesEnabled) {
				Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" joined the server."));
			}
		});
		this.onPlayerDisconnected.Connect((player) => {
			if (RunUtil.IsServer() && this.disconnectMessagesEnabled) {
				Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" disconnected."));
			}
		});
	}

	OnStart(): void {
		task.spawn(() => {
			if (RunUtil.IsClient()) {
				this.InitClient();
			}
			if (RunUtil.IsServer()) {
				if (RunUtil.IsClient()) {
					Game.WaitForLocalPlayerLoaded();
				}
				this.InitServer();
			}

			if (RunUtil.IsClient() && Game.context === CoreContext.GAME) {
				Game.WaitForLocalPlayerLoaded();
				CoreNetwork.ClientToServer.Ready.client.FireServer();
			}
		});
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
				this.onPlayerDisconnected.Fire(player);
				player.Destroy();
			}
		});
	}

	private InitServer(): void {
		const onPlayerPreJoin = (playerInfo: PlayerInfoDto) => {
			// LocalPlayer is hardcoded, so we check if this client should be treated as local player.
			let player: Player;
			if (RunUtil.IsHosting() && playerInfo.clientId === 0) {
				player = Game.localPlayer;
			} else {
				player = new Player(
					playerInfo.gameObject.GetComponent<NetworkObject>(),
					playerInfo.clientId,
					playerInfo.userId,
					playerInfo.username,
					playerInfo.usernameTag,
				);
			}
			playerInfo.gameObject.name = `Player_${playerInfo.username}`;
			this.playersPendingReady.set(playerInfo.clientId, player);

			// Ready bots immediately
			if (playerInfo.clientId < 0) {
				this.playersPendingReady.delete(playerInfo.clientId);
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
		CoreNetwork.ClientToServer.Ready.server.OnClientEvent((player) => {
			if (RunUtil.IsHosting()) {
				this.HandlePlayerReadyServer(Game.localPlayer);
				return;
			}

			/*
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
			*/
			this.playersPendingReady.delete(player.clientId);
			this.HandlePlayerReadyServer(player);
		});
	}

	private HandlePlayerReadyServer(player: Player): void {
		CoreNetwork.ServerToClient.ServerInfo.server.FireClient(
			player,
			Game.gameId,
			Game.serverId,
			Game.organizationId,
		);

		if (RunUtil.IsHosting() || player !== Game.localPlayer) {
			this.players.add(player);
		}

		// notify all clients of the joining player
		CoreNetwork.ServerToClient.AddPlayer.server.FireExcept(player, player.Encode());

		// send list of all connected players to the joining player
		const playerDtos: PlayerDto[] = table.create(this.players.size());
		for (let p of this.players) {
			playerDtos.push(p.Encode());
		}
		CoreNetwork.ServerToClient.AllPlayers.server.FireClient(player, playerDtos);

		this.onPlayerJoined.Fire(player);
	}

	private AddPlayerClient(dto: PlayerDto): void {
		let team: Team | undefined;
		if (dto.teamId) {
			team = Airship.teams.FindById(dto.teamId);
		}

		let player = this.FindByClientId(dto.clientId);
		if (!player) {
			const nob = NetworkUtil.WaitForNetworkObject(dto.nobId);
			nob.gameObject.name = `Player_${dto.username}`;
			player = new Player(nob, dto.clientId, dto.userId, dto.username, dto.usernameTag);
		}

		team?.AddPlayer(player);

		if (Game.localPlayer !== player) {
			this.players.add(player);
		}

		if (!RunUtil.IsHosting()) {
			this.onPlayerJoined.Fire(player);
		}
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
	 * Airship.players.ObservePlayers((player) => {
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
		for (const player of this.players) {
			if (player.clientId === clientId) {
				return player;
			}
		}
		return undefined;
	}

	/** Special method used for startup handshake. */
	public FindByClientIdIncludePending(clientId: number): Player | undefined {
		return this.FindByClientId(clientId) ?? this.playersPendingReady.get(clientId);
	}

	public FindByUserId(userId: string): Player | undefined {
		for (const player of this.players) {
			//print("checking player " + player.userId + " to " + userId);
			if (player.userId === userId) {
				return player;
			}
		}
		return undefined;
	}

	public FindByUsername(name: string): Player | undefined {
		for (const player of this.players) {
			if (player.username === name) {
				return player;
			}
		}
		return undefined;
	}
}
