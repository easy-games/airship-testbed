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

type NetworkCallbackFromClient<T> = (player: Player, ...args: NetworkParamsToClient<T>) => void;
type NetworkCallbackFromServer<T> = (...args: NetworkParamsToServer<T>) => void;

type NetworkFunctionReturn<RX> = RX extends [infer A] ? A : RX;
type NetworkFunctionCallbackFromServer<TX, RX> = (
	player: Player,
	...args: NetworkParamsToServer<TX>
) => NetworkFunctionReturn<RX>;
type NetworkFunctionCallbackFromClient<TX, RX> = (...args: NetworkParamsToServer<TX>) => NetworkFunctionReturn<RX>;

const packageMap = new Map<number, number>();

class NetworkFunctionClient<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	private disconnect: (() => void) | undefined;
	private listening = false;
	private sendId = 0;

	private readonly yieldingThreads = new Map<number, thread>();

	constructor(private readonly id: number) {}

	public FireServer(...args: NetworkParamsToServer<TX>): NetworkFunctionReturn<RX> {
		if (!this.listening) {
			this.StartListening();
		}
		const sendId = this.sendId++;
		const sendArgs = [sendId, ...args];
		const thread = coroutine.running();
		this.yieldingThreads.set(sendId, thread);
		NetworkAPI.fireServer(this.id, sendArgs, NetworkChannel.Reliable);
		return coroutine.yield() as unknown as NetworkFunctionReturn<RX>;
	}

	private StartListening() {
		if (this.listening) return;
		this.listening = true;
		NetworkAPI.connect(false, this.id, (sendId: number, ...args: unknown[]) => {
			const thread = this.yieldingThreads.get(sendId);
			this.yieldingThreads.delete(sendId);
			if (thread !== undefined) {
				task.spawn(thread, ...args);
			}
		});
	}

	public SetCallback(callback: NetworkFunctionCallbackFromClient<TX, RX>) {
		if (this.disconnect !== undefined) {
			this.disconnect();
		}
		this.disconnect = NetworkAPI.connect(false, this.id, (sendId: number, ...args: unknown[]) => {
			const res = [(callback as Callback)(...args)];
			const argsReturn = [sendId, ...res];
			NetworkAPI.fireServer(this.id, argsReturn, NetworkChannel.Reliable);
		});
	}
}

class NetworkFunctionServer<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	private disconnect: (() => void) | undefined;
	private listening = false;
	private sendId = 0;

	private readonly yieldingThreads = new Map<number, thread>();

	constructor(private readonly id: number) {}

	public FireClient(player: Player, ...args: NetworkParamsToAllClients<TX>): NetworkFunctionReturn<RX> {
		if (!this.listening) {
			this.StartListening();
		}
		const sendId = this.sendId++;
		const sendArgs = [sendId, ...args];
		const thread = coroutine.running();
		this.yieldingThreads.set(sendId, thread);
		NetworkAPI.fireClient(this.id, player, sendArgs, NetworkChannel.Reliable);
		const res = coroutine.yield() as unknown as NetworkFunctionReturn<RX>;
		return res;
	}

	private StartListening() {
		if (this.listening) return;
		this.listening = true;
		NetworkAPI.connect(true, this.id, (player: Player, sendId: number, ...args: unknown[]) => {
			const thread = this.yieldingThreads.get(sendId);
			this.yieldingThreads.delete(sendId);
			if (thread !== undefined) {
				task.spawn(thread, ...args);
			}
		});
	}

	public SetCallback(callback: NetworkFunctionCallbackFromServer<TX, RX>) {
		if (this.disconnect !== undefined) {
			this.disconnect();
		}
		this.disconnect = NetworkAPI.connect(true, this.id, (player: Player, sendId: number, ...args: unknown[]) => {
			const res = [(callback as Callback)(player, ...args)];
			const argsReturn = [sendId, ...res];
			NetworkAPI.fireClient(this.id, player, argsReturn, NetworkChannel.Reliable);
		});
	}
}

export class NetworkFunction<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	public readonly server: NetworkFunctionServer<TX, RX>;
	public readonly client: NetworkFunctionClient<TX, RX>;

	constructor(remoteIdentifier: string) {
		let id = 0;
		const context = RemoteKeyHasher.GetCallerContext();
		if (context) {
			id = RemoteKeyHasher.GetRemoteHash(context, remoteIdentifier, "_f");
		} else {
			warn(
				`Could not generate id for remote: ${remoteIdentifier}. Unable to determine the context that it was created in. This may result in unexpected network behavior.`,
			);
		}

		this.server = new NetworkFunctionServer(id);
		this.client = new NetworkFunctionClient(id);
	}
}
