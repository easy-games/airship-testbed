import NetworkAPI, { NetworkChannel } from "./NetworkAPI";

type RemoteParamsToClient<T> = Parameters<
	T extends unknown[]
		? (clientId: number, ...args: T) => void
		: T extends unknown
		? (clientId: number, arg: T) => void
		: (clientId: number) => void
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

	public FireExcept(ignoredClientId: number, ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireExcept(this.id, ignoredClientId, args, this.channel);
	}

	public FireClient(clientId: number, ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireClient(this.id, clientId, args, this.channel);
	}

	public FireClients(clientIds: number[], ...args: RemoteParamsToAllClients<T>) {
		NetworkAPI.fireClients(this.id, clientIds, args, this.channel);
	}

	public OnClientEvent(callback: RemoteCallbackFromClient<T>) {
		return NetworkAPI.connect(this.id, callback);
	}
}

class RemoteEventClient<T extends unknown[] | unknown> {
	constructor(private readonly id: number, private readonly channel: NetworkChannel = NetworkChannel.Reliable) {}

	public FireServer(...args: RemoteParamsToServer<T>) {
		NetworkAPI.fireServer(this.id, args, this.channel);
	}

	public OnServerEvent(callback: RemoteCallbackFromServer<T>) {
		return NetworkAPI.connect(this.id, callback);
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
