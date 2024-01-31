import { Player } from "Shared/Player/Player";
import NetworkAPI, { NetworkChannel } from "./NetworkAPI";

type RemoteParamsToClient<T> = Parameters<
	T extends unknown[]
		? (player: Player, ...args: T) => void
		: T extends unknown
		? (player: Player, arg: T) => void
		: (player: Player) => void
>;

type RemoteParamsToServer<T> = Parameters<
	T extends unknown[] ? (...args: T) => void : T extends unknown ? (arg: T) => void : () => void
>;

type RemoteParamsToAllClients<T> = RemoteParamsToServer<T>;

type RemoteCallbackFromClient<T> = (...args: RemoteParamsToClient<T>) => void;
type RemoteCallbackFromServer<T> = (...args: RemoteParamsToServer<T>) => void;

let ID_COUNTER = 0;

class RemoteEventServer<T extends unknown[] | unknown> {
	constructor(private readonly id: number, private readonly channel: NetworkChannel = NetworkChannel.Reliable) {}

	public FireAllClients(...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireAllClients(this.id, args, this.channel);
	}

	public FireExcept(ignorePlayer: Player, ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireExcept(this.id, ignorePlayer, args, this.channel);
	}

	public FireClient(player: Player, ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireClient(this.id, player, args, this.channel);
	}

	public FireClients(players: Player[], ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireClients(this.id, players, args, this.channel);
	}

	public OnClientEvent(callback: RemoteCallbackFromClient<T>) {
		return NetworkAPI.connect(true, this.id, callback);
	}
}

class RemoteEventClient<T extends unknown[] | unknown> {
	constructor(private readonly id: number, private readonly channel: NetworkChannel = NetworkChannel.Reliable) {}

	public FireServer(...args: RemoteParamsToServer<T>) {
		NetworkAPI.fireServer(this.id, args, this.channel);
	}

	public OnServerEvent(callback: RemoteCallbackFromServer<T>) {
		return NetworkAPI.connect(false, this.id, callback);
	}
}

export class RemoteEvent<T extends unknown[] | unknown> {
	public readonly server: RemoteEventServer<T>;
	public readonly client: RemoteEventClient<T>;

	constructor(channel: NetworkChannel = NetworkChannel.Reliable) {
		const id = ID_COUNTER++;
		this.server = new RemoteEventServer(id, channel);
		this.client = new RemoteEventClient(id, channel);
	}
}
