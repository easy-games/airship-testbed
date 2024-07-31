import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";

export interface ClientBroadcastOptions<T extends ReadonlyArray<unknown>> {}

export interface ConnectedFunction<T extends ReadonlyArray<unknown>> {
	readonly Callback: NetworkFunction<T>;
	readonly IgnoreOwner: boolean;
	readonly Event: NetworkSignal<TargetRpcArgs<T>>;
}

export type TargetRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...T];

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

export function TargetRpc<T extends ReadonlyArray<unknown>>(
	options: ClientBroadcastOptions<T> = {},
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<TypedPropertyFunction<T>>,
) => void {
	return (ctor, property, descriptor) => {
		const rpcId = `${ctor}::${property}(TargetRpc)`;
		const event = NetworkRpc.GetOrCreateTargetRpcRemote<T>(rpcId);

		const callback = (ctor as unknown as Record<string, unknown>)[property] as NetworkFunction<T>;
		const listeners = MapUtil.GetOrCreate(ClientTargetedBehaviourListeners, ctor, []);
		listeners.push({
			Callback: callback,
			IgnoreOwner: false,
			Event: event,
		} as unknown as ConnectedFunction<T>);

		if (Game.IsServer()) {
			descriptor.value = (object, player, ...params: T) => {
				event.server.FireClient(player!, object.networkIdentity.netId, ...(params as never));
				return undefined as ReturnType<TypedPropertyFunction<T>>;
			};
			return descriptor;
		}

		return descriptor;
	};
}
