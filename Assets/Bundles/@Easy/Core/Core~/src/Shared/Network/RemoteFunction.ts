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

type RemoteCallbackFromClient<T> = (clientId: number, ...args: RemoteParamsToClient<T>) => void;
type RemoteCallbackFromServer<T> = (...args: RemoteParamsToServer<T>) => void;

type RemoteFunctionReturn<RX> = RX extends [infer A] ? A : RX;
type RemoteFunctionCallback<TX, RX> = (clientId: number, ...args: RemoteParamsToServer<TX>) => RemoteFunctionReturn<RX>;

// To prevent collisions with RemoteEvent IDs:
const RF_ID_OFFSET = 1000000;
let ID_COUNTER = 0;

class RemoteFunctionClient<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
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
		NetworkAPI.connect(this.id, (sendId: number, ...args: unknown[]) => {
			const thread = this.yieldingThreads.get(sendId);
			this.yieldingThreads.delete(sendId);
			if (thread !== undefined) {
				// const [success, err] = coroutine.resume(thread, ...args);
				// if (!success) {
				// 	print(`NETWORK HANDLER ERROR:\n${tostring(err)}`);
				// }
				task.spawn(thread, ...args);
			}
		});
	}
}

class RemoteFunctionServer<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	private disconnect: (() => void) | undefined;

	constructor(private readonly id: number) {}

	public SetCallback(callback: RemoteFunctionCallback<TX, RX>) {
		if (this.disconnect !== undefined) {
			this.disconnect();
		}
		this.disconnect = NetworkAPI.connect(this.id, (clientId: number, sendId: number, ...args: unknown[]) => {
			const res = [(callback as Callback)(clientId, ...args)];
			const argsReturn = [sendId, ...res];
			NetworkAPI.fireClient(this.id, clientId, argsReturn, NetworkChannel.Reliable);
		});
	}
}

export class RemoteFunction<TX extends unknown[] | unknown, RX extends unknown[] | unknown> {
	public readonly Server: RemoteFunctionServer<TX, RX>;
	public readonly Client: RemoteFunctionClient<TX, RX>;

	constructor() {
		let id = ID_COUNTER;
		ID_COUNTER++;
		id += RF_ID_OFFSET;
		this.Server = new RemoteFunctionServer(id);
		this.Client = new RemoteFunctionClient(id);
	}
}

// const rf1 = new RemoteFunction<[msg: string], [numChars: number]>();

// rf1.Server.SetCallback((clientId, msg) => {
// 	return msg.size();
// });

// const numChars = rf1.Client.FireServer("hello world");
