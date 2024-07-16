import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";
import { Player } from "@Easy/Core/Shared/Player/Player";
import inspect from "../Util/Inspect";

export type ServerRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...args: T];

type ServerNetworkFunction<T extends ReadonlyArray<unknown>> = (object: AirshipNetworkBehaviour, ...args: T) => void;

type ServerRpcMethodSignature<
	TArguments extends ReadonlyArray<unknown>,
	TRequiresOwner extends boolean,
> = TRequiresOwner extends true
	? (this: AirshipNetworkBehaviour, ...args: TArguments) => void
	: (this: AirshipNetworkBehaviour, player: Player | undefined, ...args: TArguments) => void;
export interface ServerRpcOptions<_T extends ReadonlyArray<unknown>, TRequiresOwner extends boolean = false> {
	RequiresOwnership?: TRequiresOwner;
	RunLocally?: boolean;
	NetworkConnectionAsLastArgument?: boolean;
}

export interface ConnectedFunction<T extends ReadonlyArray<unknown>> {
	readonly Callback: ServerNetworkFunction<T>;
	readonly Id: string;
	readonly RequiresOwner: boolean;
	readonly PassCallerAsFirstArgument: boolean;
	readonly Event: NetworkSignal<ServerRpcArgs<T>>;
}

export const ServerBehaviourListeners = new Map<AirshipNetworkBehaviour, ConnectedFunction<any>[]>();

export function ServerRpc<TMethodArguments extends ReadonlyArray<unknown>, TRequiresOwnership extends boolean = false>(
	options: ServerRpcOptions<TMethodArguments, TRequiresOwnership> = {},
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<ServerRpcMethodSignature<TMethodArguments, TRequiresOwnership>>,
) => void {
	const requiresOwnership = options.RequiresOwnership ?? false;
	const runLocally = options.RunLocally ?? false;

	return (ctor, property, descriptor) => {
		if (Game.IsHosting()) {
			return descriptor;
		}

		const callback = (ctor as unknown as Record<string, unknown>)[
			property
		] as ServerNetworkFunction<TMethodArguments>;
		const listeners = MapUtil.GetOrCreate(ServerBehaviourListeners, ctor, []);

		const rpcId = `${ctor}::${property}(ServerRpc)`;
		const event: NetworkSignal<any> = NetworkRpc.GetOrCreateObserversRpcRemote(rpcId);

		const existingListener = listeners.find((f) => f.Id === rpcId);
		assert(!existingListener, "Existing listener at id: " + rpcId);

		listeners.push({
			Callback: callback,
			Id: rpcId,
			PassCallerAsFirstArgument: !requiresOwnership,
			RequiresOwner: requiresOwnership,
			Event: event,
		});

		if (Game.IsClient()) {
			descriptor.value = (object, ...params) => {
				if (runLocally) {
					if (requiresOwnership) {
						callback(object, ...(params as never));
					} else {
						const args = select(2, ...params);
						callback(object, Game.localPlayer, ...(args as never));
					}
				}

				if (requiresOwnership) {
					event!.client.FireServer(object.networkObject.ObjectId, ...params);
				} else {
					const args = select(2, ...params);
					event!.client.FireServer(object.networkObject.ObjectId, ...args);
				}

				return undefined as ReturnType<ServerRpcMethodSignature<TMethodArguments, TRequiresOwnership>>;
			};
			return descriptor;
		}

		return descriptor;
	};
}
