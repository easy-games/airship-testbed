import { OnStart, Singleton } from "../../Flamework";
import { BridgedPlayer } from "../../Player/BridgedPlayer";
import { ProtectedPlayer } from "../../Player/ProtectedPlayer";
import { Protected } from "../../Protected";
import { Signal } from "../../Util/Signal";

/**
 * @internal
 */
@Singleton()
export class ProtectedPlayersSingleton implements OnStart {
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
	}

	public FindByClientId(clientId: number): ProtectedPlayer | undefined {
		return this.players.find((p) => p.clientId === clientId);
	}

	public FindByUserId(userId: string): ProtectedPlayer | undefined {
		return this.players.find((p) => p.userId === userId);
	}

	OnStart(): void {}
}
