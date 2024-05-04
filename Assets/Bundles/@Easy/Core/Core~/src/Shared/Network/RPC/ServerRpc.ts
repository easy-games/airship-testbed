import { Game } from "@Easy/Core/Shared/Game";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "../AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";

export type ServerRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...args: T];
type ServerNetworkFunction<T extends ReadonlyArray<unknown>> = (object: AirshipNetworkBehaviour, ...args: T) => void;
type TypedPropertyFunction<T extends ReadonlyArray<unknown>> = (this: AirshipNetworkBehaviour, ...args: T) => void;

export interface ServerRpcOptions<T extends ReadonlyArray<unknown>> {
	RequiresOwnership?: boolean;
	RunLocally?: boolean;
}

export interface ConnectedFunction<T extends ReadonlyArray<unknown>> {
	readonly Callback: ServerNetworkFunction<T>;
	readonly Id: string;
	readonly RequiresOwner: boolean;
	readonly Event: RemoteEvent<ServerRpcArgs<T>>;
}

export const ServerBehaviourListeners = new Map<AirshipNetworkBehaviour, ConnectedFunction<any>[]>();

/**
 * Registers the following method as a `ServerRpc` (server remote procedure call) - this allows client(s) to invoke this function on the server (based on permissions)
 * @param options Options & permissions around this RPC
 *
 * @see https://fish-networking.gitbook.io/docs/manual/guides/remote-procedure-calls#serverrpc
 */
export function ServerRpc<T extends ReadonlyArray<unknown>>(
	options: ServerRpcOptions<T>,
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<TypedPropertyFunction<T>>,
) => void {
	const requiresOwnership = options.RequiresOwnership ?? false;
	const runLocally = options.RunLocally ?? false;

	return (ctor, property, descriptor) => {
		const callback = (ctor as unknown as Record<string, unknown>)[property] as ServerNetworkFunction<T>;
		const listeners = MapUtil.GetOrCreate(ServerBehaviourListeners, ctor, []);

		const rpcId = `${ctor}::${property}(ServerRpc)`;
		const event = NetworkRpc.GetOrCreateObserversRpcRemote<ServerRpcArgs<T>>(rpcId);

		const existingListener = listeners.find((f) => f.Id === rpcId);
		assert(!existingListener, "Existing listener at id: " + rpcId);

		listeners.push({
			Callback: callback,
			Id: rpcId,
			RequiresOwner: requiresOwnership,
			Event: event,
		});

		if (Game.IsClient()) {
			descriptor.value = (object, ...params) => {
				if (runLocally) {
					callback(object, ...(params as never));
				}

				event!.client.FireServer(object.networkObject.ObjectId, ...(params as never));
				return undefined as ReturnType<TypedPropertyFunction<T>>;
			};
			return descriptor;
		}

		return descriptor;
	};
}
