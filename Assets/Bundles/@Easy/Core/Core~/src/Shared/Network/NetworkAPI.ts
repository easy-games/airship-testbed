import { Airship } from "Shared/Airship";
import { Player } from "Shared/Player/Player";
import { RunUtil } from "Shared/Util/RunUtil";

export enum NetworkChannel {
	Reliable,
	Unreliable,
}

interface BlobData {
	/** ID. */
	i: number;

	/** Data. */
	d: unknown[];
}

interface CallbackItem {
	callback: Callback;
}

const MAX_QUEUE = 10000;

const callbacksByIdServer = new Map<string, Array<CallbackItem>>();
const callbacksByIdClient = new Map<string, Array<CallbackItem>>();
const queuedDataById = new Map<string, Array<BlobData>>();

function addToQueue(msg: BlobData) {
	const id = tostring(msg.i);
	let queue = queuedDataById.get(id);
	if (queue === undefined) {
		queue = [];
		queuedDataById.set(id, queue);
	}
	if (queue.size() >= MAX_QUEUE) {
		warn("REMOTE EVENT: MAX REQUEST QUEUE REACHED; DROPPING FUTURE MESSAGES");
		return;
	}
	queue.push(msg);
}

export function InitNet() {
	if (RunUtil.IsServer()) {
		NetworkCore.Net.OnBroadcastFromClientAction((clientId, blob) => {
			const msg = blob.Decode() as BlobData;
			const id = msg.i;
			const data = msg.d;
			const callbacks = callbacksByIdServer.get(tostring(id));
			if (callbacks === undefined) return;
			const waitForClient = Airship.players.WaitForClientIdIncludePending(clientId);
			waitForClient.then((player) => {
				if (!player) {
					warn(debug.traceback(`Dropping request from client ${clientId}: Failed to find Player object`));
					return;
				}
				for (const callback of callbacks) {
					task.spawn(callback.callback, player, ...data);
				}
			});
		});
	}
	if (RunUtil.IsClient()) {
		NetworkCore.Net.OnBroadcastFromServerAction((blob) => {
			const msg = blob.Decode() as BlobData;
			const id = msg.i;
			const data = msg.d;
			const callbacks = callbacksByIdClient.get(tostring(id));
			if (callbacks === undefined) {
				// Queue data
				addToQueue(msg);
				return;
			}
			for (const callback of callbacks) {
				task.spawn(callback.callback, ...data);
			}
		});
	}
}

function pack(id: number, args: unknown[]) {
	return new BinaryBlob({ i: id, d: args } satisfies BlobData);
}

function fireServer(id: number, args: unknown[], channel: NetworkChannel) {
	const msg = pack(id, args);
	NetworkCore.Net.BroadcastToServer(msg, channel === NetworkChannel.Reliable ? 1 : 0);
}

function fireAllClients(id: number, args: unknown[], channel: NetworkChannel) {
	const msg = pack(id, args);
	NetworkCore.Net.BroadcastToAllClients(msg, channel === NetworkChannel.Reliable ? 1 : 0);
}

function fireClient(id: number, player: Player, args: unknown[], channel: NetworkChannel) {
	const msg = pack(id, args);
	NetworkCore.Net.BroadcastToClient(player.clientId, msg, channel === NetworkChannel.Reliable ? 1 : 0);
}

function fireExcept(id: number, ignorePlayer: Player, args: unknown[], channel: NetworkChannel) {
	const msg = pack(id, args);
	NetworkCore.Net.BroadcastToAllExceptClient(ignorePlayer.clientId, msg, channel === NetworkChannel.Reliable ? 1 : 0);
}

function fireClients(id: number, players: Player[], args: unknown[], channel: NetworkChannel) {
	const msg = pack(id, args);
	const clientIds = players.map((player) => player.clientId);
	NetworkCore.Net.BroadcastToClients(
		clientIds as unknown as CSArray<number>,
		msg,
		channel === NetworkChannel.Reliable ? 1 : 0,
	);
}

function connect(asServer: boolean, id: number, callback: Callback): () => void {
	const callbacksById = asServer ? callbacksByIdServer : callbacksByIdClient;

	let connected = true;
	let callbacks = callbacksById.get(tostring(id));
	if (callbacks === undefined) {
		callbacks = [];
		callbacksById.set(tostring(id), callbacks);
	}

	// Wrap callback in a unique object:
	const callbackItem: CallbackItem = { callback };
	callbacks.push(callbackItem);

	// Invoke callback with any queued data:
	const queue = queuedDataById.get(tostring(id));
	if (queue !== undefined) {
		for (const msg of queue) {
			callback(...msg.d);
		}
		queuedDataById.delete(tostring(id));
	}

	// Disconnect function
	return () => {
		if (!connected) return;
		connected = false;
		const callbacksDisconnect = callbacksById.get(tostring(id));
		if (callbacksDisconnect === undefined) return;
		const index = callbacksDisconnect.indexOf(callbackItem);
		if (index === -1) return;
		callbacksDisconnect.remove(index);
	};
}

const NetworkAPI = {
	fireServer,
	fireAllClients,
	fireClient,
	fireClients,
	fireExcept,
	connect,
};

export default NetworkAPI;
