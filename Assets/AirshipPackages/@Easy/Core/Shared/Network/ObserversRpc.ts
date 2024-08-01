import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";
import { NetworkChannel } from "./NetworkAPI";
import { Airship } from "../Airship";

export interface ClientRpcAttribute<T extends ReadonlyArray<unknown>> {
	includeOwner?: boolean;
	channel?: NetworkChannel;
}

export interface ClientRpcInfo<T extends ReadonlyArray<unknown>> {
	readonly Callback: NetworkFunction<T>;
	readonly Id: string;
	readonly IgnoreOwner: boolean;
	readonly Event: NetworkSignal<ObserversRpcArgs<T>>;
}

export type ObserversRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...args: T];

export type NetworkFunction<T extends ReadonlyArray<unknown>> = (object: AirshipNetworkBehaviour, ...args: T) => void;

export const ClientRpcs = new Map<AirshipNetworkBehaviour, ClientRpcInfo<any>[]>();
export const ObserverBuffers = new Map<AirshipNetworkBehaviour, unknown[]>();

type TypedPropertyFunction<T extends ReadonlyArray<unknown>> = (this: AirshipNetworkBehaviour, ...args: T) => void;
/**
 * Registers the following method as a `Observer` (multiple clients remote procedure call) - this allows the server to invoke this function on all listening clients (based on permissions)
 * @param options Options & permissions around this RPC
 */
export function ClientRpc<T extends ReadonlyArray<unknown>>(
	options: ClientRpcAttribute<T> = {},
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<TypedPropertyFunction<T>>,
) => void {
	let ignoreOwner = !options.includeOwner ?? false;

	let isHost = Game.IsHosting();

	return (ctor, property, descriptor) => {
		let id = `${ctor}::${property}(ClientRpc)`;
		const event: NetworkSignal<any> = NetworkRpc.GetOrCreateClientRpcRemote(id);

		const callback = (ctor as unknown as Record<string, unknown>)[property] as NetworkFunction<T>;
		const listeners = MapUtil.GetOrCreate(ClientRpcs, ctor, []);
		listeners.push({
			Callback: callback,
			Id: id,
			IgnoreOwner: ignoreOwner,
			Event: event,
		});

		if (Game.IsServer()) {
			if (ignoreOwner) {
				descriptor.value = (object, ...params) => {
					const networkIdentity = object.networkIdentity;
					const connection = networkIdentity.connectionToClient;

					const owner =
						connection !== undefined
							? Airship.Players.FindByConnectionId(connection.connectionId)
							: undefined;
					if (owner) {
						event!.server.FireExcept(owner, object.networkIdentity.netId, ...(params as never));
					} else {
						event!.server.FireAllClients(object.networkIdentity.netId, ...(params as never));
					}
				};
			} else {
				descriptor.value = (object, ...params) => {
					event!.server.FireAllClients(object.networkIdentity.netId, ...(params as never));
				};
			}
			return descriptor;
		}

		return descriptor;
	};
}
