import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreContext } from "@Easy/Core/Shared/CoreClientContext";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { PlayerUtils } from "@Easy/Core/Shared/Util/PlayerUtils";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { AssetCache } from "../AssetCache/AssetCache";
import { AvatarPlatformAPI } from "../Avatar/AvatarPlatformAPI";
import { OnUpdate } from "../Util/Timer";
import { DecodeJSON, EncodeJSON } from "../json";
import { BridgedPlayer } from "./BridgedPlayer";
import { Player, PlayerDto } from "./Player";

/*
 * This class is instantiated in BOTH Game and Protected context.
 * This means there are two instances of it running.
 *
 * Protected context mainly uses this for utilities (e.g. GetProfilePictureSpriteAsync)
 */

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

	private cachedProfilePictureTextures = new Map<string, Texture2D>();
	private cachedProfilePictureSprite = new Map<string, Sprite>();

	private outfitFetchTime = new Map<string, number>();

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
			mutable.clientId = localPlayerInfo.clientId.Value;
			mutable.networkObject = localPlayerInfo.gameObject.GetComponent<NetworkObject>()!;
			mutable.username = localPlayerInfo.username.Value;
			mutable.userId = localPlayerInfo.userId.Value;
			mutable.SetVoiceChatAudioSource(localPlayerInfo.voiceChatAudioSource);
			Game.localPlayerLoaded = true;
			Game.onLocalPlayerLoaded.Fire();

			// const timeDiff = Time.time - timeStart;
			// print("took " + timeDiff + " ms to load local player.");
		};

		if (Game.IsClient()) {
			Game.localPlayer = new Player(
				undefined as unknown as NetworkObject,
				0,
				"loading",
				"loading",
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
			// task.spawn(() => {
			// 	Game.WaitForLocalPlayerLoaded();
			// 	contextbridge.invoke<(bp: BridgedPlayer) => void>("Players:OnPlayerJoined", LuauContext.Protected, {
			// 		userId: Game.localPlayer.userId,
			// 		username: Game.localPlayer.username,
			// 	});
			// });
			this.onPlayerJoined.Connect((player) => {
				contextbridge.invoke<(bp: BridgedPlayer) => void>("Players:OnPlayerJoined", LuauContext.Protected, {
					userId: player.userId,
					username: player.username,
				});
				if (Game.IsServer() && this.joinMessagesEnabled) {
					Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" joined the server."));
				}
			});
			this.onPlayerDisconnected.Connect((player) => {
				contextbridge.invoke<(bp: BridgedPlayer) => void>(
					"Players:OnPlayerDisconnected",
					LuauContext.Protected,
					{
						userId: player.userId,
						username: player.username,
					},
				);
				if (Game.IsServer() && this.disconnectMessagesEnabled) {
					Game.BroadcastMessage(ChatColor.Aqua(player.username) + ChatColor.Gray(" disconnected."));
				}
			});
		}
	}

	OnStart(): void {
		if (Game.IsServer() && !Game.IsEditor()) {
			InternalHttpManager.SetAuthToken("");
			// HttpManager.SetLoggingEnabled(true);
		}

		if (Game.IsGameLuauContext()) {
			task.spawn(() => {
				if (Game.IsClient()) {
					this.InitClient();
				}
				if (Game.IsServer()) {
					if (Game.IsClient()) {
						Game.WaitForLocalPlayerLoaded();
					}
					this.InitServer();
				}

				if (Game.IsClient() && Game.coreContext === CoreContext.GAME) {
					Game.WaitForLocalPlayerLoaded();
					CoreNetwork.ClientToServer.Ready.client.FireServer();
				}
			});
		}
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
		const onPlayerPreJoin = (dto: PlayerInfoDto) => {
			// LocalPlayer is hardcoded, so we check if this client should be treated as local player.
			let player: Player;
			if (RunUtil.IsHosting() && dto.clientId === 0) {
				player = Game.localPlayer;
			} else {
				let playerInfo = dto.gameObject.GetComponent<PlayerInfo>()!;
				player = new Player(
					dto.gameObject.GetComponent<NetworkObject>()!,
					dto.clientId,
					dto.userId,
					dto.username,
					playerInfo,
				);
			}
			dto.gameObject.name = `Player_${dto.username}`;
			this.playersPendingReady.set(dto.clientId, player);

			// Ready bots immediately
			if (dto.clientId < 0) {
				this.playersPendingReady.delete(dto.clientId);
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
			// fetch outfit
			task.spawn(() => {
				this.FetchEquippedOutfit(player, false);
			});

			if (RunUtil.IsHosting()) {
				this.HandlePlayerReadyServer(Game.localPlayer);
				return;
			}

			this.playersPendingReady.delete(player.clientId);
			this.HandlePlayerReadyServer(player);
		});

		CoreNetwork.ClientToServer.ChangedOutfit.server.OnClientEvent((player) => {
			this.FetchEquippedOutfit(player, true);

			if (Airship.characters.allowMidGameOutfitChanges && player.character) {
				const outfitDto = player.selectedOutfit;
				player.character.outfitDto = outfitDto;
				CoreNetwork.ServerToClient.Character.ChangeOutfit.server.FireAllClients(player.character.id, outfitDto);
			}
		});
	}

	private FetchEquippedOutfit(player: Player, ignoreCache: boolean): void {
		const SetOutfit = (outfitDto: OutfitDto | undefined) => {
			player.selectedOutfit = outfitDto;
			player.outfitLoaded = true;
			if (Game.IsEditor()) {
				EditorSessionState.SetString("player_" + player.userId + "_outfit", EncodeJSON(outfitDto));
			}
		};

		if (Game.IsEditor() && !ignoreCache) {
			const data = EditorSessionState.GetString("player_" + player.userId + "_outfit");
			if (data) {
				const outfitDto = DecodeJSON<OutfitDto>(data);
				if (outfitDto) {
					SetOutfit(outfitDto);
					return;
				}
			}
		}

		// let diff = os.time() - (this.outfitFetchTime.get(player.userId) ?? 0);
		// if (diff <= 0.5) {
		// 	return;
		// }
		// this.outfitFetchTime.set(player.userId, os.time());

		if (player.IsLocalPlayer()) {
			AvatarPlatformAPI.GetEquippedOutfit().then(SetOutfit);
		} else {
			print("loading outfit from server for player: " + player.userId);
			AvatarPlatformAPI.GetPlayerEquippedOutfit(player.userId).then(SetOutfit);
		}
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
			let playerInfo = nob.gameObject.GetComponent<PlayerInfo>()!;
			player = new Player(nob, dto.clientId, dto.userId, dto.username, playerInfo);
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

	/**
	 * @internal
	 */
	public WaitForClientIdIncludePending(clientId: number, timeout = 5): Promise<Player | undefined> {
		return new Promise((resolve) => {
			let readyOrPending = this.FindByClientIdIncludePending(clientId);
			if (readyOrPending) {
				resolve(readyOrPending);
				return;
			}
			let acc = 0;
			const disconnect = OnUpdate.Connect((dt) => {
				acc += dt;
				readyOrPending = this.FindByClientIdIncludePending(clientId);
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

	public WaitForClientId(clientId: number, timeout = 5): Promise<Player | undefined> {
		return new Promise((resolve) => {
			let readyOrPending = this.FindByClientId(clientId);
			if (readyOrPending) {
				resolve(readyOrPending);
				return;
			}
			let acc = 0;
			const disconnect = OnUpdate.Connect((dt) => {
				acc += dt;
				readyOrPending = this.FindByClientId(clientId);
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

	/**
	 * @param userId
	 * @returns
	 */
	public async GetProfilePictureTextureAsync(userId: string): Promise<Texture2D | undefined> {
		return new Promise((resolve, reject) => {
			if (this.cachedProfilePictureTextures.has(userId)) {
				resolve(this.cachedProfilePictureTextures.get(userId));
				return;
			}

			let pictures = [
				"Assets/AirshipPackages/@Easy/Core/Prefabs/Images/ProfilePictures/DefaultProfilePicture.png",
			];
			// let index = this.pictureIndex++ % pictures.size();
			// let path = pictures[index];
			const texture = AssetCache.LoadAssetIfExists<Texture2D>(pictures[0]);
			resolve(texture);
		});
	}

	/**
	 * @param userId
	 * @returns
	 */
	public async GetProfilePictureSpriteAsync(userId: string): Promise<Sprite | undefined> {
		if (this.cachedProfilePictureSprite.has(userId)) {
			return this.cachedProfilePictureSprite.get(userId);
		}
		const texture = await this.GetProfilePictureTextureAsync(userId);
		if (texture !== undefined) {
			const sprite = Bridge.MakeSprite(texture);
			this.cachedProfilePictureSprite.set(userId, sprite);
			return sprite;
		}
	}
}
