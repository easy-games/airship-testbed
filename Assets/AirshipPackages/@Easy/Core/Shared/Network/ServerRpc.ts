import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { NetworkRpc } from "./NetworkRpc";
import { NetworkChannel } from "./NetworkAPI";

export type ServerRpcArgs<T extends ReadonlyArray<unknown>> = [objectId: number, ...args: T];

type ServerNetworkFunction<T extends ReadonlyArray<unknown>> = (object: AirshipNetworkBehaviour, ...args: T) => void;

export interface CommandAttribute<_T extends ReadonlyArray<unknown>> {
	/**
	 * @default true
	 */
	requiresAuthority?: boolean;
	/**
	 * @default NetworkChannel.Reliable
	 */
	channel?: NetworkChannel;
}

export interface CommandRpcInfo<T extends ReadonlyArray<unknown>> {
	readonly Callback: ServerNetworkFunction<T>;
	readonly Id: string;
	readonly RequiresOwner: boolean;
	readonly Event: NetworkSignal<ServerRpcArgs<T>>;
}

export const CommandRpcs = new Map<AirshipNetworkBehaviour, CommandRpcInfo<any>[]>();

export function Command<TMethodArguments extends ReadonlyArray<unknown>>(
	options: CommandAttribute<TMethodArguments> = {},
): (
	target: AirshipNetworkBehaviour,
	property: string,
	descriptor: TypedPropertyDescriptor<(this: AirshipNetworkBehaviour, ...args: TMethodArguments) => void>,
) => void {
	const requiresOwnership = options.requiresAuthority ?? true;

	return (ctor, property, descriptor) => {
		if (Game.IsHosting()) {
			return descriptor;
		}

		const callback = (ctor as unknown as Record<string, unknown>)[
			property
		] as ServerNetworkFunction<TMethodArguments>;
		const listeners = MapUtil.GetOrCreate(CommandRpcs, ctor, []);

		const rpcId = `${ctor}::${property}(Command)`;
		const event: NetworkSignal<any> = NetworkRpc.GetOrCreateClientRpcRemote(rpcId);

		const existingListener = listeners.find((f) => f.Id === rpcId);
		assert(!existingListener, "Existing listener at id: " + rpcId);

		listeners.push({
			Callback: callback,
			Id: rpcId,
			RequiresOwner: requiresOwnership,
			Event: event,
		});

		if (Game.IsClient()) {
			if (requiresOwnership) {
				descriptor.value = (object, ...params) => {
					if (!object.networkIdentity.isOwned) return undefined!;
					event.client.FireServer(object.networkIdentity.netId, ...params);

					return undefined!;
				};
			} else {
				descriptor.value = (object, ...params) => {
					event.client.FireServer(object.networkIdentity.netId, ...params);
					return undefined!;
				};
			}

			return descriptor;
		}

		return descriptor;
	};
}
