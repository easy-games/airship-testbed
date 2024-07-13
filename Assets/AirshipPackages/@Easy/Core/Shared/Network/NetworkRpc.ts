import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { ServerRpcArgs } from "./ServerRpc";
import { ObserversRpcArgs } from "./ObserversRpc";
import { TargetRpcArgs } from "./TargetRpc";

type InstanceOf<T extends ClassLike> = T extends { prototype: infer TProto } ? TProto : never;
type ClassLike = { prototype: object };
type ClassOf<T, HasConstructor extends boolean = false> = HasConstructor extends true ? new () => T : { prototype: T };

const ServerRpcMap = new Map<string, NetworkSignal<ServerRpcArgs<unknown[]>>>();
const ObserverRpcMap = new Map<string, NetworkSignal<ObserversRpcArgs<unknown[]>>>();
const TargetRpcMap = new Map<string, NetworkSignal<TargetRpcArgs<unknown[]>>>();
const SyncVarHashMap = new Map<string, NetworkSignal<any>>();

export class NetworkRpc {
	public static GetOrCreateServerRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): NetworkSignal<ServerRpcArgs<T>> {
		let remote = ServerRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new NetworkSignal(remoteId);
		ServerRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateObserversRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): NetworkSignal<ObserversRpcArgs<T>> {
		let remote = ObserverRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new NetworkSignal(remoteId);
		ObserverRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateTargetRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): NetworkSignal<TargetRpcArgs<T>> {
		let remote = TargetRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new NetworkSignal(remoteId);
		TargetRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateNetworkVarRemote<T extends unknown[]>(
		id: string,
		behaviour: ClassOf<AirshipNetworkBehaviour>,
	): NetworkSignal<T> {
		let hashId = tostring(behaviour) + ":" + id;
		let remote = SyncVarHashMap.get(hashId);
		if (remote) {
			return remote;
		}

		remote = new NetworkSignal<T>(hashId);
		SyncVarHashMap.set(hashId, remote);
		return remote;
	}
}
