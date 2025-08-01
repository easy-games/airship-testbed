import { AirshipUserController } from "@Easy/Core/Client/Controllers/Airship/User/AirshipUserController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Controller, Dependency, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { AirshipOutfit } from "../Airship/Types/AirshipPlatformInventory";
import { Asset } from "../Asset";
import { CoreLogger } from "../Logger/CoreLogger";
import { AirshipUrl } from "../Util/AirshipUrl";
import { RandomUtil } from "../Util/RandomUtil";
import { Levenshtein } from "../Util/Strings/Levenshtein";
import { OnUpdate } from "../Util/Timer";
import { BridgedPlayer } from "./BridgedPlayer";
import { Player, PlayerDto } from "./Player";

/*
 * This class is instantiated in BOTH Game and Protected context.
 * This means there are two instances of it running.
 *
 * Protected context mainly uses this for utilities
 */

/**
 * Access using {@link Airship.Players}. Players singleton allows you to work with currently connected clients (with Airship's {@link Player} object).
 */
@Controller({ loadOrder: -1000 })
@Service({ loadOrder: -1000 })
export class AirshipPlayersSingleton {
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

	private cachedProfilePictureTexturesByUserId = new Map<string, Texture2D>();
	private cachedProfilePictureSpriteByUserId = new Map<string, Sprite>();
	private cachedProfilePictureByImageId = new Map<string, Texture2D>();
	private cachedUserIdToProfileImageId = new Map<string, string>();

	private outfitFetchTime = new Map<string, number>();

	constructor() {
		Airship.Players = this;

		const FetchLocalPlayerWithWait = () => {
			let localPlayerInfo: PlayerInfo | undefined = this.playerManagerBridge.localPlayer;
			while (localPlayerInfo === undefined) {
				task.wait();
				localPlayerInfo = this.playerManagerBridge.localPlayer;
			}

			const mutable = Game.localPlayer as Mutable<Player>;
			mutable.connectionId = localPlayerInfo.connectionId;
			mutable.networkIdentity = localPlayerInfo.gameObject.GetComponent<NetworkIdentity>()!;
			mutable.username = localPlayerInfo.username;
			mutable.userId = localPlayerInfo.userId;
			mutable.orgRoleName = localPlayerInfo.orgRoleName;
			if (mutable.orgRoleName === "") {
				mutable.orgRoleName = undefined;
			}
			mutable.SetVoiceChatAudioSource(localPlayerInfo.voiceChatAudioSource);
			Game.localPlayerLoaded = true;
			Game.onLocalPlayerLoaded.Fire();

			// const timeDiff = Time.time - timeStart;
			// print("took " + timeDiff + " ms to load local player.");
		};

		if (Game.IsClient()) {
			Game.localPlayer = new Player(
				undefined as unknown as NetworkIdentity,
				0,
				"loading",
				"loading",
				undefined,
				"",
				"",
				undefined as unknown as PlayerInfo,
			);
			if (!Game.IsHosting()) {
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
		if (Game.IsServer()) {
			this.server = {
				botCounter: 0,
			};
		}

		if (Game.IsGameLuauContext()) {
			this.onPlayerJoined.ConnectWithPriority(SignalPriority.HIGHEST, (player) => {
				contextbridge.invoke<(bp: BridgedPlayer) => void>("Players:OnPlayerJoined", LuauContext.Protected, {
					userId: player.userId,
					username: player.username,
					profileImageId: player.profileImageId,
					connectionId: player.connectionId,
				});
				if (Game.IsServer() && this.joinMessagesEnabled) {
					Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" joined the server."));
				}
			});
			this.onPlayerDisconnected.ConnectWithPriority(SignalPriority.HIGHEST, (player) => {
				contextbridge.invoke<(bp: BridgedPlayer) => void>(
					"Players:OnPlayerDisconnected",
					LuauContext.Protected,
					{
						userId: player.userId,
						username: player.username,
						profileImageId: player.profileImageId,
						connectionId: player.connectionId,
					},
				);
				if (Game.IsServer() && this.disconnectMessagesEnabled) {
					Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" disconnected."));
				}
			});
		}
	}

	protected OnStart(): void {
		if (Game.IsServer() && !Game.IsEditor()) {
			InternalHttpManager.SetAuthToken("");
			// HttpManager.SetLoggingEnabled(true);
		}

		task.spawn(() => {
			if (Game.IsClient()) {
				this.InitClient();
			}
			if (Game.IsServer()) {
				this.InitServer();
			}

			if (Game.IsClient() && Game.coreContext === CoreContext.GAME && Game.IsProtectedLuauContext()) {
				Game.WaitForLocalPlayerLoaded();
				CoreNetwork.ClientToServer.Ready.client.FireServer();
			}
		});
	}

	/**
	 * Only called in LuauContext.Game
	 */
	private InitClient(): void {
		CoreNetwork.ServerToClient.ServerInfo.client.OnServerEvent((gameId, serverId, organizationId) => {
			// this.localConnection = InstanceFinder.ClientManager.Connection;
			// this.clientId = this.localConnection.ClientId;
			Game.gameId = gameId;
			Game.serverId = serverId;
			Game.organizationId = organizationId;

			// Temp
			contextbridge.broadcast("ProtectedGetServerInfo_Temp", Game.gameId, Game.serverId, Game.organizationId);

			const authenticated = contextbridge.invoke<() => boolean>(
				"AuthController:IsAuthenticated",
				LuauContext.Protected,
			);
			if (authenticated) {
				contextbridge.invoke("FriendsController:SendStatusUpdate", LuauContext.Protected);
			} else {
				const disc = contextbridge.subscribe("AuthController:OnAuthenticated", (fromContext, args) => {
					if (fromContext === LuauContext.Protected) {
						contextbridge.invoke("FriendsController:SendStatusUpdate", LuauContext.Protected);
						disc();
					}
				});
			}
		});

		// These remotes only come through in prot context
		if (Game.IsProtectedLuauContext()) {
			CoreNetwork.ServerToClient.AllPlayers.client.OnServerEvent((playerDtos) => {
				contextbridge.broadcast<(clients: PlayerDto[]) => void>("ProtectedPlayers:AddClients", playerDtos);
				for (let dto of playerDtos) {
					this.AddPlayerClient(dto);
				}
			});
			CoreNetwork.ServerToClient.AddPlayer.client.OnServerEvent((playerDto) => {
				contextbridge.broadcast<(clients: PlayerDto[]) => void>("ProtectedPlayers:AddClients", [playerDto]);
				this.AddPlayerClient(playerDto);
			});
		} else if (Game.IsGameLuauContext()) {
			contextbridge.subscribe<(from: LuauContext, clients: PlayerDto[]) => void>(
				"ProtectedPlayers:AddClients",
				(from, clients) => {
					for (const dto of clients) {
						this.AddPlayerClient(dto);
					}
				},
			);
		}
		CoreNetwork.ServerToClient.RemovePlayer.client.OnServerEvent((clientId) => {
			const player = this.FindByConnectionId(clientId);
			if (player) {
				this.players.delete(player);
				this.onPlayerDisconnected.Fire(player);
				player.Destroy();
			}
		});
	}

	/**
	 * Note: this is called from both the Game and Protected context.
	 * So if you have prints, you should see them happening twice.
	 */
	private InitServer(): void {
		const onPlayerPreJoin = (dto: PlayerInfoDto) => {
			// print(
			// 	`[${
			// 		contextbridge.current() === LuauContext.Game ? "Game" : "Protected"
			// 	}] player pre join. connectionId: ${dto.connectionId}, username: ${dto.username}, userId: ${
			// 		dto.userId
			// 	}`,
			// );
			// LocalPlayer is hardcoded, so we check if this client should be treated as local player.
			let player: Player;
			if (Game.IsHosting() && dto.connectionId === 0) {
				player = Game.localPlayer;
			} else {
				let playerInfo = dto.gameObject.GetComponent<PlayerInfo>()!;
				// print("Making new player with connectionId: " + dto.connectionId);

				let transferData = "";
				try {
					transferData = dto.transferPacket;
				} catch (err) {}

				player = new Player(
					dto.gameObject.GetComponent<NetworkIdentity>()!,
					dto.connectionId,
					dto.userId,
					dto.username,
					dto.orgRoleName,
					dto.profileImageId,
					transferData,
					playerInfo,
				);
			}
			dto.gameObject.name = `Player_${dto.username}`;
			this.playersPendingReady.set(dto.connectionId, player);

			// check for existing player with matching userId
			for (let player of this.players) {
				if (player.userId === dto.userId) {
					player.Kick("Kicked: You logged in from a different device.");
				}
			}

			// Ready bots immediately
			if (player.IsBot()) {
				this.playersPendingReady.delete(dto.connectionId);
				this.HandlePlayerReadyServer(player);

				if (Game.IsGameLuauContext()) {
					// fetch outfit
					task.spawn(() => {
						this.FetchEquippedOutfit(player, false);
					});
				}
			}

			// Next, the client will send a ready request which we handle in HandlePlayerReadyServer()
		};
		const onPlayerRemoved = (clientInfo: PlayerInfoDto) => {
			const clientId = clientInfo.connectionId;
			const player = this.FindByConnectionId(clientId);
			if (player) {
				this.players.delete(player);
				this.onPlayerDisconnected.Fire(player);
				if (Game.IsGameLuauContext()) {
					CoreNetwork.ServerToClient.RemovePlayer.server.FireAllClients(player.connectionId);
				}
				player.Destroy();
			}
		};
		const players = this.playerManagerBridge.GetPlayers();
		for (const clientInfo of players) {
			onPlayerPreJoin(clientInfo);
		}
		this.playerManagerBridge.OnPlayerAdded((clientInfo) => {
			onPlayerPreJoin(clientInfo);
		});
		this.playerManagerBridge.OnPlayerRemoved((clientInfo) => {
			onPlayerRemoved(clientInfo);
		});

		if (Game.IsProtectedLuauContext()) {
			CoreNetwork.ClientToServer.Ready.server.OnClientEvent((player) => {
				this.HandlePlayerConnect(player);
				contextbridge.broadcast<(connId: number) => void>("ProtectedPlayers:PlayerReady", player.connectionId);
			});
		} else if (Game.IsGameLuauContext()) {
			contextbridge.subscribe<(context: LuauContext, connId: number) => void>(
				"ProtectedPlayers:PlayerReady",
				(context, connId) => {
					const player = this.playersPendingReady.get(connId);
					if (!player) {
						warn("Failed to register player: not found in players list.");
						return;
					}
					// fetch outfit
					task.spawn(() => {
						this.FetchEquippedOutfit(player, false);
					});
					this.HandlePlayerConnect(player);
				},
			);
		}

		if (Game.IsProtectedLuauContext()) {
			CoreNetwork.ClientToServer.ChangedOutfit.server.OnClientEvent((player) => {
				contextbridge.broadcast<(connId: number) => void>(
					"ProtectedPlayers:ChangedOutfitServer",
					player.connectionId,
				);
			});
		} else if (Game.IsGameLuauContext()) {
			contextbridge.subscribe<(from: LuauContext, connId: number) => void>(
				"ProtectedPlayers:ChangedOutfitServer",
				(from, connId) => {
					const player = this.FindByConnectionId(connId);
					if (!player) {
						warn("Couldn't find player when equipping outfit. connId=" + connId);
						return;
					}

					this.FetchEquippedOutfit(player, true).then(() => {
						if (Airship.Characters.allowMidGameOutfitChanges && player.character) {
							const outfitDto = player.selectedOutfit;
							player.character.outfitDto = outfitDto;
							if (Game.IsGameLuauContext() && outfitDto) {
								CoreNetwork.ServerToClient.Character.ChangeOutfit.server.FireAllClients(
									player.character.id,
									outfitDto,
								);
							}
						}
					});
				},
			);
		}

		// Player completes join
		if (Game.IsGameLuauContext()) {
			CoreNetwork.ClientToServer.ChangedOutfit.server.OnClientEvent((player) => {});
		}
	}

	private HandlePlayerConnect(player: Player) {
		if (Game.IsHosting()) {
			this.HandlePlayerReadyServer(Game.localPlayer);
			return;
		}

		this.playersPendingReady.delete(player.connectionId);
		this.HandlePlayerReadyServer(player);
	}

	private async FetchEquippedOutfit(player: Player, ignoreCache: boolean): Promise<boolean> {
		// disable to test networking:
		ignoreCache = true;

		const SetOutfit = (outfitDto: AirshipOutfit | undefined) => {
			player.selectedOutfit = outfitDto;
			player.outfitLoaded = true;
			// print("SetOutfit. userId: " + player.userId + ", outfit: " + inspect(outfitDto));
			if (Game.IsEditor()) {
				EditorSessionState.SetString("player_" + player.userId + "_outfit5", json.encode(outfitDto));
			}
		};

		// print("fetch outfit. userId: " + player.userId);
		// Uncomment to disable editor cache
		if (Game.IsEditor() && !ignoreCache) {
			//print("Using editor cache: " + player.userId);
			const data = EditorSessionState.GetString("player_" + player.userId + "_outfit5");
			if (data && data !== "") {
				const outfitDto = json.decode<AirshipOutfit>(data);
				if (outfitDto) {
					SetOutfit(outfitDto);
					return true;
				}
			}
		}

		let userId = player.userId;

		// Bots use a random outfit
		if (player.IsBot()) {
			userId = RandomUtil.FromArray([
				"vVCFVA6DPufQLWVorGvDmaH59zs1", // Luke
				"cB3fE3DedvQ7A7YMIo1Sw2UK8aX2",
				"j05IHcHVsUTn03I37OLoED6VCoH3",
				"lPzZLComeoTQB3eKP7VDfMDXz3g1",
				"oba5stTj31Z9HGKPx8AFvhATE7A2",
				"pIlbgcnL8cRF3OIFEc2I281ehPs2",
				"t54D9Bhr77Ot8MCaGEQ4Cg19w9p1",
			]);
		}

		let outfit = await Airship.Avatar.GetUserEquippedOutfitDto(userId);

		// Minify outfitDto. None of this data is needed to render accessories on the character.
		if (outfit) {
			for (let gear of outfit.gear) {
				gear.createdAt = undefined!;
				gear.instanceId = undefined!;
				gear.ownerId = undefined!;

				gear.class.name = undefined!;
				gear.class.default = undefined!;
				gear.class.description = undefined!;
				gear.class.imageId = undefined!;
				gear.class.marketable = undefined!;
				gear.class.resourceId = undefined!;
				gear.class.resourceType = undefined!;
				gear.class.tags = undefined!;
				gear.class.tradable = undefined!;
			}

			outfit.createdAt = undefined!;
			outfit.equipped = undefined!;
			outfit.name = undefined!;
			outfit.outfitId = undefined!;
		}
		// print("outfitDto: " + inspect(outfit));

		SetOutfit(outfit);

		return true;
	}

	private HandlePlayerReadyServer(player: Player): void {
		if (!player.IsBot()) {
			while (player.networkIdentity?.connectionToClient === undefined) {
				task.unscaledWait();
			}
			const conn = player.networkIdentity.connectionToClient;
			if (!conn?.isReady) {
				CoreLogger.Log("Player " + player.username + "'s connection was not ready. Waiting for ready.");
				while (!conn?.isReady) {
					task.unscaledWait();
				}
			}
		}

		if (Game.IsProtectedLuauContext()) {
			CoreNetwork.ServerToClient.ServerInfo.server.FireClient(
				player,
				Game.gameId,
				Game.serverId,
				Game.organizationId,
			);
		}

		if (Game.IsHosting() || player !== Game.localPlayer) {
			this.players.add(player);
		}

		// notify all clients of the joining player
		if (Game.IsProtectedLuauContext()) {
			CoreNetwork.ServerToClient.AddPlayer.server.FireExcept(player, player.Encode(false));
		}

		// send list of all connected players to the joining player
		if (Game.IsProtectedLuauContext()) {
			const playerDtos: PlayerDto[] = table.create(this.players.size());
			for (let p of this.players) {
				playerDtos.push(p.Encode(player.userId === p.userId));
			}
			CoreNetwork.ServerToClient.AllPlayers.server.FireClient(player, playerDtos);
		}

		this.onPlayerJoined.Fire(player);
	}

	private AddPlayerClient(dto: PlayerDto): void {
		let team: Team | undefined;
		if (dto.teamId) {
			team = Airship.Teams.FindById(dto.teamId);
		}

		let player = this.FindByConnectionId(dto.connectionId);
		if (!player) {
			const nob = NetworkUtil.WaitForNetworkIdentity(dto.netId);
			nob.gameObject.name = `Player_${dto.username}`;
			let playerInfo = nob.gameObject.GetComponent<PlayerInfo>()!;
			player = new Player(
				nob,
				dto.connectionId,
				dto.userId,
				dto.username,
				dto.orgRoleName,
				dto.profileImageId,
				"",
				playerInfo,
			);
		}

		team?.AddPlayer(player);

		if (Game.localPlayer !== player) {
			this.players.add(player);
		}

		if (!Game.IsHosting()) {
			this.onPlayerJoined.Fire(player);
		}
	}

	/**
	 * Adds a bot player to your game server. This player will function similarly
	 * to a real player.
	 */
	public AddBotPlayer(): Player {
		if (!Game.IsServer()) {
			error("AddBotPlayer() must be called on the server.");
		}
		this.server!.botCounter++;
		let userId = `bot${this.server!.botCounter}`;
		let username = `Bot${this.server!.botCounter}`;
		let tag = "bot";
		this.playerManagerBridge.AddBotPlayer(username, userId, tag);

		const botPlayer = this.FindByUserId(userId);
		return botPlayer!;
	}

	public GetPlayers(): Player[] {
		return ObjectUtils.keys(this.players);
	}

	/**
	 * Observe every player entering/leaving the game. The returned function can be
	 * called to stop observing.
	 *
	 * @param observer Function fired for every player currently in the game and
	 * every future player that joins. The `observer` function must return another
	 * function which is called when said player leaves (_or_ the top-level observer
	 * function was called to stop the observation process).
	 *
	 * ```ts
	 * Airship.players.ObservePlayers((player) => {
	 * 	print(`${player.name} entered`);
	 * 	return () => {
	 *  	print(`${player.name} left`);
	 * 	};
	 * });
	 * ```
	 *
	 * @returns Disconnect function -- call to stop observing players and call the
	 * cleanup function on each.
	 */
	public ObservePlayers(
		observer: (player: Player) => (() => void) | void,
		signalPriority?: SignalPriority,
	): () => void {
		const cleanupPerPlayer = new Map<Player, () => void>();
		const observe = (player: Player) => {
			task.spawn(() => {
				const cleanup = observer(player);
				if (cleanup !== undefined) {
					cleanupPerPlayer.set(player, cleanup);
				}
			});
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
	 * Tries to find an online player with a username similar to ``searchName``. If an exact match is found that
	 * player will be returned. This search is not case sensitive.
	 *
	 * @param searchName The target username to match.
	 */
	public FindByFuzzySearch(searchName: string): Player | undefined {
		const matchingPlayers = new Array<Player>();
		for (const player of this.GetPlayers()) {
			const fullUsername = `${player.username.lower()}`;
			if (fullUsername.find(searchName.lower(), 1, true)[0] !== undefined) {
				matchingPlayers.push(player);
			}
		}

		// With each match, we'll sort by levenschtein distance to order by best match (lower distance = higher match chance)
		// e.g. if we search `lu` and there's a user called `lu` - we'd prioritize that over `luke` even if luke was in the server first.
		matchingPlayers.sort(
			(firstPlayer, secondPlayer) =>
				Levenshtein(`${firstPlayer.username.lower()}`, searchName) <
				Levenshtein(`${secondPlayer.username.lower()}`, searchName),
		);
		return matchingPlayers.size() === 0 ? undefined : matchingPlayers[0];
	}

	/**
	 * Search for an online player by connection id.
	 *
	 * @param connectionId The connection id to match.
	 * @returns The player with target connectionId if one exists.
	 */
	public FindByConnectionId(connectionId: number): Player | undefined {
		for (const player of this.players) {
			if (player.connectionId === connectionId) {
				return player;
			}
		}
		return undefined;
	}

	/**
	 * Special method used for startup handshake.
	 * @internal
	 */
	public FindByConnectionIdIncludePending(clientId: number): Player | undefined {
		return this.FindByConnectionId(clientId) ?? this.playersPendingReady.get(clientId);
	}

	/**
	 * @internal
	 */
	public WaitForClientIdIncludePending(clientId: number, timeout = 5): Promise<Player | undefined> {
		return new Promise((resolve) => {
			let readyOrPending = this.FindByConnectionIdIncludePending(clientId);
			if (readyOrPending) {
				resolve(readyOrPending);
				return;
			}
			let acc = 0;
			const disconnect = OnUpdate.Connect((dt) => {
				acc += dt;
				readyOrPending = this.FindByConnectionIdIncludePending(clientId);
				if (acc >= timeout) {
					disconnect();
					resolve(undefined);
					return;
				}
				if (readyOrPending) {
					disconnect();
					resolve(readyOrPending);
					return;
				}
			});
		});
	}

	/**
	 * Waits for player by connectionId. This is only useful if you are working with a connection id
	 * before a player has been added. A player is added when the client loads the starting scene. On
	 * client your local player will exist immediately.
	 *
	 * @param connectionId The connection id to wait for
	 * @param timeoutSec How long (in seconds) to stop waiting for this player.
	 * @returns Player with connectionId if found, otherwise undefined after timeout.
	 */
	public WaitForPlayerByConnectionId(connectionId: number, timeoutSec = 5): Promise<Player | undefined> {
		return new Promise((resolve) => {
			let readyOrPending = this.FindByConnectionId(connectionId);
			if (readyOrPending) {
				resolve(readyOrPending);
			}
			let acc = 0;
			const disconnect = OnUpdate.Connect((dt) => {
				acc += dt;
				readyOrPending = this.FindByConnectionId(connectionId);
				if (readyOrPending) {
					disconnect();
					resolve(readyOrPending);
				}
				if (acc >= timeoutSec) {
					disconnect();
					resolve(undefined);
				}
			});
		});
	}

	/**
	 * Searches for online player by userId.
	 *
	 * @param userId Target user id to match.
	 * @returns Player with user id if one exists, otherwise undefined.
	 */
	public FindByUserId(userId: string): Player | undefined {
		for (const player of this.players) {
			//print("checking player " + player.userId + " to " + userId);
			if (player.userId === userId) {
				return player;
			}
		}
		return undefined;
	}

	/**
	 * Waits for online player by userId.
	 *
	 * @param userId Target user id to match.
	 * @param timeoutSeconds An optional timeout.
	 * @returns Player with user id if one exists, otherwise undefined.
	 */
	public WaitForUserId(userId: string): Player;
	public WaitForUserId(userId: string, timeoutSeconds: number): Player | undefined;
	public WaitForUserId(userId: string, timeout?: number): Player | undefined {
		let player: Player | undefined;

		if (timeout !== undefined) {
			let startTime = Time.time;

			while (!(player = this.FindByUserId(userId)) && Time.time < startTime + timeout) {
				task.wait();
			}

			return player;
		} else {
			while (!(player = this.FindByUserId(userId))) {
				task.wait();
			}

			return player;
		}
	}

	/**
	 * Searches for online player by username. This is case sensitive. For a more lenient
	 * username search see {@link FindByFuzzySearch}.
	 *
	 * @param name Target username -- this must match the player's username exactly.
	 * @returns An online player with matching username if one exists, otherwise undefined.
	 */
	public FindByUsername(name: string): Player | undefined {
		for (const player of this.players) {
			if (player.username === name) {
				return player;
			}
		}
		return undefined;
	}

	/**
	 * Same logic should also be at EditorAuthManager.cs
	 *
	 * @internal
	 */
	public GetDefaultProfilePictureFromUserId(userId: string): Texture2D {
		let num = 0;
		if (userId.size() > 0) {
			const [n] = string.byte(userId, userId.size());
			num = n;
		}

		let files = [
			"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/BlueDefaultProfilePicture.png",
			"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/RedDefaultProfilePicture.png",
			"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/GreenDefaultProfilePicture.png",
			"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/PurpleDefaultProfilePicture.png",
		];
		let index = num % files.size();
		let path = files[index];
		return Asset.LoadAsset(path);
	}

	/**
	 * Gets a user's profile picture as Texture2D.
	 *
	 * @param userId Id of user you want to get profile picture of. This player doesn't need to be online.
	 * @param useLocalCache If true this function will return values cached locally. This is usually preferable
	 * unless you need to guarantee the most up-to-date profile picture. Defaults to ``true``.
	 * @returns A Texture2D of the profile picture. If this function fails to fetch the profile picture or it doesn't
	 * exist it will return the default profile picture for the user.
	 */
	public async GetProfilePictureAsync(userId: string, useLocalCache = true): Promise<Texture2D> {
		const cachedByUserId = this.cachedProfilePictureTexturesByUserId.get(userId);
		if (useLocalCache && cachedByUserId) {
			return cachedByUserId;
		}

		const [success, user] = Dependency<AirshipUserController>().GetUserById(userId, useLocalCache).await();
		if (!success || user?.profileImageId === undefined) {
			const texture = this.GetDefaultProfilePictureFromUserId(userId);
			this.cachedProfilePictureTexturesByUserId.set(userId, texture);
			return texture;
		}

		const imageId = user.profileImageId;
		const texture = await this.GetProfilePictureFromImageId(imageId, useLocalCache);
		if (texture) {
			this.cachedProfilePictureTexturesByUserId.set(userId, texture);
			this.cachedProfilePictureByImageId.set(imageId, texture);
			return texture;
		}
		return this.GetDefaultProfilePictureFromUserId(userId);
	}

	/**
	 * @returns Profile picture from image id (with caching)
	 * @internal
	 */
	public async GetProfilePictureFromImageId(imageId: string, useLocalCache = true): Promise<Texture2D | undefined> {
		// First check cache for image
		if (useLocalCache) {
			const existingTexture = this.cachedProfilePictureByImageId.get(imageId);
			if (existingTexture) {
				return existingTexture;
			}
		}

		// Download image if not found locally (or useLocalCache = false)
		const texture = Bridge.DownloadTexture2DYielding(`${AirshipUrl.CDN}/images/${imageId}`);
		if (texture) {
			this.cachedProfilePictureByImageId.set(imageId, texture);
			return texture;
		}
		return undefined;
	}

	/**
	 * @internal
	 * @param userId
	 */
	public ClearProfilePictureCache(userId: string): void {
		this.cachedProfilePictureSpriteByUserId.delete(userId);
		this.cachedProfilePictureTexturesByUserId.delete(userId);
	}
}
