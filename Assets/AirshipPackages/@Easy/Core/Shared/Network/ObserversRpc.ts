import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";

export interface ClientBroadcastOptions<T extends ReadonlyArray<unknown>> {
	RunOnServer?: boolean;
	/**
	 * @deprecated TODO
	 */
	BufferLast?: boolean;
	ExcludeOwner?: boolean;
}

export interface ConnectedFunction<T extends ReadonlyArray<unknown>> {
	readonly Callback: NetworkFunction<T>;
	readonly Id: string;
	readonly BuffersLast: boolean;
	readonly IgnoreOwner: boolean;
	readonly Event: NetworkSignal<ObserversRpcArgs<T>>;
}

export type ObserversRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...args: T];

export type NetworkFunction<T extends ReadonlyArray<unknown>> = (object: AirshipNetworkBehaviour, ...args: T) => void;

export const ClientBehaviourListeners = new Map<AirshipNetworkBehaviour, ConnectedFunction<any>[]>();
export const ObserverBuffers = new Map<AirshipNetworkBehaviour, unknown[]>();

type TypedPropertyFunction<T extends ReadonlyArray<unknown>> = (this: AirshipNetworkBehaviour, ...args: T) => void;
/**
 * Registers the following method as a `Observer` (multiple clients remote procedure call) - this allows the server to invoke this function on all listening clients (based on permissions)
 * @param options Options & permissions around this RPC
 *
 * @see https://fish-networking.gitbook.io/docs/manual/guides/remote-procedure-calls#observersrpc
 */
export function ObserversRpc<T extends ReadonlyArray<unknown>>(
	options: ClientBroadcastOptions<T> = {},
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<TypedPropertyFunction<T>>,
) => void {
	let runOnServer = options.RunOnServer ?? false;
	let ignoreOwner = options.ExcludeOwner ?? false;
	let bufferLast = options.BufferLast ?? false;

	let isHost = Game.IsHosting();

	return (ctor, property, descriptor) => {
		let id = `${ctor}::${property}(ObserverRpc)`;
		const event: NetworkSignal<any> = NetworkRpc.GetOrCreateObserversRpcRemote(id);

		const callback = (ctor as unknown as Record<string, unknown>)[property] as NetworkFunction<T>;
		const listeners = MapUtil.GetOrCreate(ClientBehaviourListeners, ctor, []);
		listeners.push({
			Callback: callback,
			Id: id,
			IgnoreOwner: ignoreOwner,
			BuffersLast: bufferLast,
			Event: event,
		});

		if (Game.IsServer()) {
			descriptor.value = (object, ...params) => {
				if (bufferLast) {
					ObserverBuffers.set(object, params);
				}

				if (isHost) {
					event!.server.FireExcept(Game.localPlayer, object.networkIdentity.netId, ...(params as never));
				} else {
					event!.server.FireAllClients(object.networkIdentity.netId, ...(params as never));
				}

				if (runOnServer) {
					task.spawn(callback, object, ...(params as never));
				}
				return undefined as ReturnType<TypedPropertyFunction<T>>;
			};
			return descriptor;
		}

		return descriptor;
	};
}
