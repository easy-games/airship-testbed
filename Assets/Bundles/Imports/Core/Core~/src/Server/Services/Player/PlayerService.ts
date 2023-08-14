import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { PlayerJoinServerEvent } from "Server/Signals/PlayerJoinServerEvent";
import { CoreNetwork } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { Signal, SignalPriority } from "Shared/Util/Signal";

@Service({})
export class PlayerService implements OnStart {
	/** Fires when a player first connects to the server. */
	public readonly PlayerPreReady = new Signal<[player: Player]>();

	public readonly PlayerAdded = new Signal<[player: Player]>();

	/** Fires when a player is removed from the game. */
	public readonly PlayerRemoved = new Signal<[player: Player]>();

	private playerCore: PlayerCore = GameObject.Find("Players").GetComponent<PlayerCore>();
	private readonly players: Player[] = [];
	private playersPendingReady = new Map<number, Player>();
	private botCounter = 0;

	constructor() {
		const onPlayerPreJoin = (playerInfo: PlayerInfoDto) => {
			const player = new Player(
				playerInfo.gameObject.GetComponent<NetworkObject>(),
				playerInfo.clientId,
				playerInfo.userId,
				playerInfo.username,
				playerInfo.usernameTag,
			);
			playerInfo.gameObject.name = `Player_${playerInfo.username}`;
			this.playersPendingReady.set(playerInfo.clientId, player);
			this.PlayerPreReady.Fire(player);

			// Ready bots immediately
			if (playerInfo.clientId < 0) {
				this.playersPendingReady.delete(playerInfo.clientId);
				this.players.push(player);
				this.HandlePlayerReady(player);
			}
		};
		const onPlayerRemoved = (clientInfo: PlayerInfoDto) => {
			const clientId = clientInfo.clientId;
			const index = this.players.findIndex((player) => player.clientId === clientId);
			if (index === -1) return;
			const player = this.players[index];
			this.players.remove(index);
			this.PlayerRemoved.Fire(player);
			ServerSignals.PlayerLeave.fire(player);
			CoreNetwork.ServerToClient.RemovePlayer.Server.FireAllClients(player.clientId);
			player.Destroy();
		};
		const players = this.playerCore.GetPlayers();
		for (let i = 0; i < players.Length; i++) {
			const clientInfo = players.GetValue(i);
			onPlayerPreJoin(clientInfo);
		}
		this.playerCore.OnPlayerAdded((clientInfo) => {
			onPlayerPreJoin(clientInfo);
		});
		this.playerCore.OnPlayerRemoved((clientInfo) => {
			onPlayerRemoved(clientInfo);
		});

		// Player completes join
		CoreNetwork.ClientToServer.Ready.Server.OnClientEvent((clientId) => {
			if (!this.playersPendingReady.has(clientId)) {
				//print("player not found in pending: " + clientId);
				warn("Player not found in pending: " + clientId);
				return;
			}

			const player = this.playersPendingReady.get(clientId)!;
			this.playersPendingReady.delete(clientId);
			this.players.push(player);

			this.HandlePlayerReady(player);
		});
	}

	public HandlePlayerReady(player: Player): void {
		// notify all clients of the joining player
		CoreNetwork.ServerToClient.AddPlayer.Server.FireAllClients(player.Encode());

		// send list of all connected players to the joining player
		CoreNetwork.ServerToClient.AllPlayers.Server.FireClient(
			player.clientId,
			this.players.map((p) => p.Encode()),
		);

		this.PlayerAdded.Fire(player);
		ServerSignals.PlayerJoin.Fire(new PlayerJoinServerEvent(player));
	}

	public AddBotPlayer(): void {
		this.botCounter++;
		let userId = `bot${this.botCounter}`;
		let username = `Bot${this.botCounter}`;
		let tag = "bot";
		print("Adding bot " + username);
		this.playerCore.AddBotPlayer(username, tag, userId);
	}

	/** Get all players. */
	public GetPlayers(): Readonly<Array<Player>> {
		return this.players;
	}

	/** Attempt to retrieve a player by `clientId`. */
	public GetPlayerFromClientId(clientId: number): Player | undefined {
		const player = this.players.find((player) => player.clientId === clientId);
		return player;
	}

	/** Attempt to retrieve a player by username. */
	public GetPlayerFromUsername(name: string): Player | undefined {
		const player = this.players.find((player) => player.username === name);
		return player;
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
		const stopPlayerAdded = this.PlayerAdded.ConnectWithPriority(
			signalPriority ?? SignalPriority.NORMAL,
			(player) => {
				observe(player);
			},
		);
		const stopPlayerRemoved = this.PlayerRemoved.ConnectWithPriority(
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

	OnStart() {}
}
