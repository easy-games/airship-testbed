import { Player } from "@Easy/Core/Shared/Player/Player";
import NetworkAPI, { NetworkChannel } from "./NetworkAPI";
import { RemoteKeyHasher } from "./RemoteKeyHasher";

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

type RemoteCallbackFromClient<T> = (player: Player, ...args: RemoteParamsToClient<T>) => void;
type RemoteCallbackFromServer<T> = (...args: RemoteParamsToServer<T>) => void;

type RemoteFunctionReturn<RX> = RX extends [infer A] ? A : RX;
type RemoteFunctionCallbackFromServer<TX, RX> = (player: Player, ...args: RemoteParamsToServer<TX>) => RemoteFunctionReturn<RX>;
type RemoteFunctionCallbackFromClient<TX, RX> = (...args: RemoteParamsToServer<TX>) => RemoteFunctionReturn<RX>;

const packageMap = new Map<number, number>();

class RemoteFunctionClient<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	private disconnect: (() => void) | undefined;
	private listening = false;
	private sendId = 0;

	private readonly yieldingThreads = new Map<number, thread>();

	constructor(private readonly id: number) {}

	public FireServer(...args: RemoteParamsToServer<TX>): RemoteFunctionReturn<RX> {
		if (!this.listening) {
			this.StartListening();
		}
		const sendId = this.sendId++;
		const sendArgs = [sendId, ...args];
		const thread = coroutine.running();
		this.yieldingThreads.set(sendId, thread);
		NetworkAPI.fireServer(this.id, sendArgs, NetworkChannel.Reliable);
		return coroutine.yield() as unknown as RemoteFunctionReturn<RX>;
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

	public SetCallback(callback: RemoteFunctionCallbackFromClient<TX, RX>) {
		if (this.disconnect !== undefined) {
			this.disconnect();
		}
		this.disconnect = NetworkAPI.connect(false, this.id, (sendId: number, ...args: unknown[]) => {
			print("Client receive remote function: " + this.id);
			const res = [(callback as Callback)(...args)];
			const argsReturn = [sendId, ...res];
			print("Client respond to remote function: " + this.id);
			NetworkAPI.fireServer(this.id, argsReturn, NetworkChannel.Reliable);
		});
	}
}

class RemoteFunctionServer<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	private disconnect: (() => void) | undefined;
	private listening = false;
	private sendId = 0;

	private readonly yieldingThreads = new Map<number, thread>();

	constructor(private readonly id: number) {}

	public FireClient(player: Player, ...args: RemoteParamsToAllClients<TX>): RemoteFunctionReturn<RX> {
		if (!this.listening) {
			this.StartListening();
		}
		const sendId = this.sendId++;
		const sendArgs = [sendId, ...args];
		const thread = coroutine.running();
		this.yieldingThreads.set(sendId, thread);
		NetworkAPI.fireClient(this.id, player, sendArgs, NetworkChannel.Reliable);
		print("yield co");
		print("Start listening for remote function: " + this.id);
		const res = coroutine.yield() as unknown as RemoteFunctionReturn<RX>;;
		print("post yield co");
		return res;
	}

	private StartListening() {
		if (this.listening) return;
		this.listening = true;
		NetworkAPI.connect(true, this.id, (player: Player, sendId: number, ...args: unknown[]) => {
			print("Respond to remote function");
			const thread = this.yieldingThreads.get(sendId);
			print("Thread exists: " + (thread !== undefined));
			this.yieldingThreads.delete(sendId);
			if (thread !== undefined) {
				task.spawn(thread, ...args);
			}
		});
	}

	public SetCallback(callback: RemoteFunctionCallbackFromServer<TX, RX>) {
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

export class RemoteFunction<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	public readonly server: RemoteFunctionServer<TX, RX>;
	public readonly client: RemoteFunctionClient<TX, RX>;

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

		this.server = new RemoteFunctionServer(id);
		this.client = new RemoteFunctionClient(id);
	}
}
