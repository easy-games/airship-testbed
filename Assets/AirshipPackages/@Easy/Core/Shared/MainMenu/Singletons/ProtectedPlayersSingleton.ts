import { OnStart, Singleton } from "../../Flamework";
import { BridgedPlayer } from "../../Player/BridgedPlayer";
import { ProtectedPlayer } from "../../Player/ProtectedPlayer";
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
		contextbridge.callback("Players:OnPlayerJoined", (from, player: BridgedPlayer) => {
			const protectedPlayer = new ProtectedPlayer(player.username, player.userId);
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

	OnStart(): void {}
}
