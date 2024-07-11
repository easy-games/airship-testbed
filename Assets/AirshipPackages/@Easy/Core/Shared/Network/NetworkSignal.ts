import { Player } from "@Easy/Core/Shared/Player/Player";
import NetworkAPI, { NetworkChannel } from "./NetworkAPI";
import { RemoteKeyHasher } from "./RemoteKeyHasher";

type NetworkParamsToClient<T> = Parameters<
	T extends unknown[]
		? (player: Player, ...args: T) => void
		: T extends unknown
			? (player: Player, arg: T) => void
			: (player: Player) => void
>;

type NetworkParamsToServer<T> = Parameters<
	T extends unknown[] ? (...args: T) => void : T extends unknown ? (arg: T) => void : () => void
>;

type NetworkParamsToAllClients<T> = NetworkParamsToServer<T>;

type NetworkCallbackFromClient<T> = (...args: NetworkParamsToClient<T>) => void;
type NetworkCallbackFromServer<T> = (...args: NetworkParamsToServer<T>) => void;

let ID_COUNTER = 0;

const packageMap = new Map<number, number>();

class NetworkSignalServer<T extends unknown[] | unknown> {
	constructor(
		private readonly id: number,
		private readonly channel: NetworkChannel = NetworkChannel.Reliable,
	) {}

	public FireAllClients(...args: NetworkParamsToAllClients<T>) {
		NetworkAPI.fireAllClients(this.id, args, this.channel);
	}

	public FireExcept(ignorePlayer: Player, ...args: NetworkParamsToAllClients<T>) {
		NetworkAPI.fireExcept(this.id, ignorePlayer, args, this.channel);
	}

	public FireClient(player: Player, ...args: NetworkParamsToAllClients<T>) {
		NetworkAPI.fireClient(this.id, player, args, this.channel);
	}

	public FireClients(players: Player[], ...args: NetworkParamsToAllClients<T>) {
		NetworkAPI.fireClients(this.id, players, args, this.channel);
	}

	public OnClientEvent(callback: NetworkCallbackFromClient<T>) {
		return NetworkAPI.connect(true, this.id, callback);
	}
}

class NetworkSignalClient<T extends unknown[] | unknown> {
	constructor(
		private readonly id: number,
		private readonly channel: NetworkChannel = NetworkChannel.Reliable,
	) {}

	public FireServer(...args: NetworkParamsToServer<T>) {
		NetworkAPI.fireServer(this.id, args, this.channel);
	}

	public OnServerEvent(callback: NetworkCallbackFromServer<T>) {
		return NetworkAPI.connect(false, this.id, callback);
	}
}

export class NetworkSignal<T extends unknown[] | unknown> {
	public readonly server: NetworkSignalServer<T>;
	public readonly client: NetworkSignalClient<T>;

	/**
	 *
	 * @param channel
	 * @param packageOffset Temporary workaround param.
	 */
	constructor(remoteIdentifier: string, channel: NetworkChannel = NetworkChannel.Reliable) {
		let id = 0;
		const context = RemoteKeyHasher.GetCallerContext();
		if (context) {
			id = RemoteKeyHasher.GetRemoteHash(context, remoteIdentifier, "_e");
		} else {
			warn(
				`Could not generate id for remote: ${remoteIdentifier}. Unable to determine the context that it was created in. 
				This may result in unexpected network behavior.`,
			);
		}

		this.server = new NetworkSignalServer(id, channel);
		this.client = new NetworkSignalClient(id, channel);
	}
}
