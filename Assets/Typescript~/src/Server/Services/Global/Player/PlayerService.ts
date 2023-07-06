import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { Signal } from "Shared/Util/Signal";

@Service({})
export class PlayerService implements OnStart {
	/** Fires when a player first connects to the server. */
	public readonly PlayerPreReady = new Signal<[player: Player]>();

	public readonly PlayerAdded = new Signal<[player: Player]>();

	/** Fires when a player is removed from the game. */
	public readonly PlayerRemoved = new Signal<[player: Player]>();

	private readonly players: Player[] = [];
	private playersPendingReady = new Map<number, Player>();

	constructor() {
		const playerCore = GameObject.Find("Players").GetComponent<PlayerCore>();
		const onPlayerPreJoin = (clientInfo: ClientInfoDto) => {
			const player = new Player(
				clientInfo.GameObject.GetComponent<NetworkObject>(),
				clientInfo.ClientId,
				clientInfo.UserId,
				clientInfo.Username,
				clientInfo.UsernameTag,
			);
			clientInfo.GameObject.name = `Player_${clientInfo.Username}`;
			this.playersPendingReady.set(clientInfo.ClientId, player);
			this.PlayerPreReady.Fire(player);
		};
		const onPlayerRemoved = (clientInfo: ClientInfoDto) => {
			const clientId = clientInfo.ClientId;
			const index = this.players.findIndex((player) => player.clientId === clientId);
			if (index === -1) return;
			const player = this.players[index];
			this.players.remove(index);
			this.PlayerRemoved.Fire(player);
			ServerSignals.PlayerLeave.fire(player);
			Network.ServerToClient.RemovePlayer.Server.FireAllClients(player.clientId);
			player.Destroy();
		};
		const players = playerCore.GetPlayers();
		for (let i = 0; i < players.Length; i++) {
			const clientInfo = players.GetValue(i);
			onPlayerPreJoin(clientInfo);
		}
		playerCore.OnPlayerAdded((clientInfo) => {
			onPlayerPreJoin(clientInfo);
		});
		playerCore.OnPlayerRemoved((clientInfo) => {
			onPlayerRemoved(clientInfo);
		});

		// Player completes join
		Network.ClientToServer.Ready.Server.OnClientEvent((clientId) => {
			if (!this.playersPendingReady.has(clientId)) {
				//print("player not found in pending: " + clientId);
				error("Player not found in pending: " + clientId);
			}

			const player = this.playersPendingReady.get(clientId)!;
			this.playersPendingReady.delete(clientId);
			this.players.push(player);

			Network.ServerToClient.AddPlayer.Server.FireAllClients(player.Encode());
			Network.ServerToClient.AllPlayers.Server.FireClient(
				player.clientId,
				this.players.map((p) => p.Encode()),
			);
			this.PlayerAdded.Fire(player);
			ServerSignals.PlayerJoin.fire(player);
		});
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
	public ObservePlayers(observer: (player: Player) => (() => void) | void): () => void {
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
		const stopPlayerAdded = this.PlayerAdded.Connect((player) => {
			observe(player);
		});
		const stopPlayerRemoved = this.PlayerRemoved.Connect((player) => {
			const cleanup = cleanupPerPlayer.get(player);
			if (cleanup !== undefined) {
				cleanup();
				cleanupPerPlayer.delete(player);
			}
		});
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
