import { Singleton } from "../../Flamework";
import { BridgedPlayer } from "../../Player/BridgedPlayer";
import { ProtectedPlayer } from "../../Player/ProtectedPlayer";
import { Protected } from "../../Protected";
import { Signal, SignalPriority } from "../../Util/Signal";

/**
 * @internal
 */
@Singleton()
export class ProtectedPlayersSingleton {
	public onPlayerJoined = new Signal<ProtectedPlayer>();
	public onPlayerDisconnected = new Signal<ProtectedPlayer>();
	public players: ProtectedPlayer[] = [];

	constructor() {
		Protected.protectedPlayers = this;

		contextbridge.callback("Players:OnPlayerJoined", (from, player: BridgedPlayer) => {
			const protectedPlayer = new ProtectedPlayer(
				player.username,
				player.userId,
				player.profileImageId,
				player.clientId,
			);
			this.players.push(protectedPlayer);
			this.onPlayerJoined.Fire(protectedPlayer);
		});
		contextbridge.callback("Players:OnPlayerDisconnected", (from, player: BridgedPlayer) => {
			const protectedPlayer = this.players.find((p) => p.userId === player.userId);
			if (protectedPlayer) {
				this.players.remove(this.players.indexOf(protectedPlayer));
				this.onPlayerDisconnected.Fire(protectedPlayer);
			}
		});

		contextbridge.callback("player.kick", (from, connectionId: number, message: string) => {
			task.spawn(() => {
				TransferManager.Instance.KickClient(connectionId, message);
			});
		});
	}

	public FindByClientId(clientId: number): ProtectedPlayer | undefined {
		return this.players.find((p) => p.clientId === clientId);
	}

	public FindByUserId(userId: string): ProtectedPlayer | undefined {
		return this.players.find((p) => p.userId === userId);
	}

	public ObservePlayers(
		observer: (player: ProtectedPlayer) => (() => void) | void,
		signalPriority?: SignalPriority,
	): () => void {
		const cleanupPerPlayer = new Map<ProtectedPlayer, () => void>();
		const observe = (player: ProtectedPlayer) => {
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

	protected OnStart(): void {}
}
