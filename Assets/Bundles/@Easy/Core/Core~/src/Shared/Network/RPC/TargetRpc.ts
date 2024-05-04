import inspect from "@easy-games/unity-inspect";
import { NetworkChannel } from "@Easy/Core/Shared/Network/NetworkAPI";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { AirshipNetworkBehaviour } from "../AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";

export interface ClientBroadcastOptions<T extends ReadonlyArray<unknown>> {}

export interface ConnectedFunction<T extends ReadonlyArray<unknown>> {
	readonly Callback: NetworkFunction<T>;
	readonly IgnoreOwner: boolean;
	readonly Event: RemoteEvent<TargetRpcArgs<T>>;
}

export type TargetRpcArgs<T extends ReadonlyArray<unknown>> = [clientId: number, objectId: number, ...args: T];

export type NetworkFunction<T extends ReadonlyArray<unknown>> = (
	object: AirshipNetworkBehaviour,
	player: Player,
	...args: T
) => void;
export const ClientTargetedBehaviourListeners = new Map<AirshipNetworkBehaviour, ConnectedFunction<any>[]>();

type TypedPropertyFunction<T extends ReadonlyArray<unknown>> = (
	this: AirshipNetworkBehaviour,
	player: Player,
	...args: T
) => void;
/**
 * Registers the following method as a `Observer` (multiple clients remote procedure call) - this allows the server to invoke this function on all listening clients (based on permissions)
 * @param options Options & permissions around this RPC
 *
 * @see https://fish-networking.gitbook.io/docs/manual/guides/remote-procedure-calls#targetrpc
 */
export function TargetRpc<T extends ReadonlyArray<unknown>>(
	options: ClientBroadcastOptions<T>,
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<TypedPropertyFunction<T>>,
) => void {
	return (ctor, property, descriptor) => {
		const rpcId = `${ctor}::${property}(TargetRpc)`;
		const event = NetworkRpc.GetOrCreateTargetRpcRemote<TargetRpcArgs<T>>(rpcId);

		const callback = (ctor as unknown as Record<string, unknown>)[property] as NetworkFunction<T>;
		const listeners = MapUtil.GetOrCreate(ClientTargetedBehaviourListeners, ctor, []);
		listeners.push({
			Callback: callback,
			IgnoreOwner: false,
			Event: event,
		} as unknown as ConnectedFunction<T>);

		if (RunUtil.IsServer()) {
			descriptor.value = (object, player, ...params) => {
				event.server.FireClient(player, player.clientId, object.networkObject.ObjectId, ...(params as never));
				return undefined as ReturnType<TypedPropertyFunction<T>>;
			};
			return descriptor;
		}

		return descriptor;
	};
}
