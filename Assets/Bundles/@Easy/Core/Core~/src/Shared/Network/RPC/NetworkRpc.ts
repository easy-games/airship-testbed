import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { ObserversRpcArgs } from "./ObserversRpc";
import { AirshipNetworkBehaviour } from "../AirshipNetworkBehaviour";
import { ServerRpcArgs } from "./ServerRpc";
import { TargetRpcArgs } from "./TargetRpc";

const ServerRpcMap = new Map<string, RemoteEvent<ServerRpcArgs<unknown[]>>>();
const ObserverRpcMap = new Map<string, RemoteEvent<ObserversRpcArgs<unknown[]>>>();
const TargetRpcMap = new Map<string, RemoteEvent<TargetRpcArgs<unknown[]>>>();
const SyncVarHashMap = new Map<string, RemoteEvent<any>>();

/**
 * The internal RPC API
 * @internal Internal Rpc API
 */
export class NetworkRpc {
	public static GetOrCreateServerRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): RemoteEvent<ServerRpcArgs<T>> {
		let remote = ServerRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new RemoteEvent(remoteId);
		ServerRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateObserversRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): RemoteEvent<ObserversRpcArgs<T>> {
		let remote = ObserverRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new RemoteEvent(remoteId);
		ObserverRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateTargetRpcRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): RemoteEvent<TargetRpcArgs<T>> {
		let remote = TargetRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new RemoteEvent(remoteId);
		TargetRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateNetworkVarRemote<T extends unknown[]>(
		id: string,
		behaviour: ClassOf<AirshipNetworkBehaviour>,
	): RemoteEvent<T> {
		let hashId = tostring(behaviour) + ":" + id;
		let remote = SyncVarHashMap.get(hashId);
		if (remote) {
			return remote;
		}

		remote = new RemoteEvent<T>(hashId);
		SyncVarHashMap.set(hashId, remote);
		return remote;
	}
}
