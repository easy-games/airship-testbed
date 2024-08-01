import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { AirshipNetworkBehaviour } from "./AirshipNetworkBehaviour";
import { CommandRpcs, ServerRpcArgs } from "./ServerRpc";
import { ClientRpcs, ObserversRpcArgs } from "./ObserversRpc";
import { TargetRpcArgs, TargetRpcs } from "./TargetRpc";
import { Game } from "../Game";
import { Bin } from "../Util/Bin";

type InstanceOf<T extends ClassLike> = T extends { prototype: infer TProto } ? TProto : never;
type ClassLike = { prototype: object };
type ClassOf<T, HasConstructor extends boolean = false> = HasConstructor extends true ? new () => T : { prototype: T };

const ServerRpcMap = new Map<string, NetworkSignal<ServerRpcArgs<unknown[]>>>();
const ObserverRpcMap = new Map<string, NetworkSignal<ObserversRpcArgs<unknown[]>>>();
const TargetRpcMap = new Map<string, NetworkSignal<TargetRpcArgs<unknown[]>>>();
const SyncVarHashMap = new Map<string, NetworkSignal<any>>();

/**
 * @internal
 */
export class NetworkRpc {
	public static GetOrCreateCommandRemote<T extends ReadonlyArray<unknown>>(
		remoteId: string,
	): NetworkSignal<ServerRpcArgs<T>> {
		let remote = ServerRpcMap.get(remoteId);
		if (remote) return remote;

		remote = new NetworkSignal(remoteId);
		ServerRpcMap.set(remoteId, remote);
		return remote;
	}

	public static GetOrCreateClientRpcRemote<T extends ReadonlyArray<unknown>>(
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

	private static networked = new Set<AirshipNetworkBehaviour>();
	public static Connect(networkBehaviour: AirshipNetworkBehaviour) {
		if (this.networked.has(networkBehaviour)) {
			error("The AirshipNetworkBehaviour's RPC methods have already been connected!");
		}

		const networkIdentity = networkBehaviour.networkIdentity;
		const metatable = getmetatable(networkBehaviour) as AirshipNetworkBehaviour;
		const rpcBin = new Bin();

		if (Game.IsServer()) {
			const commands = CommandRpcs.get(metatable) ?? [];

			for (const command of commands) {
				rpcBin.Add(
					command.Event.server.OnClientEvent((player, netId, ...args) => {
						if (netId !== networkIdentity.netId) return;
						if (
							command.RequiresOwner &&
							player.connectionId !== networkIdentity.connectionToClient.connectionId
						)
							return;
						command.Callback(networkBehaviour, ...args);
					}),
				);
			}
		}

		if (Game.IsClient()) {
			const clientRpcs = ClientRpcs.get(metatable) ?? [];
			for (const clientRpc of clientRpcs) {
				clientRpc.Event.client.OnServerEvent((netId, ...args) => {
					if (netId !== networkIdentity.netId) return;
					clientRpc.Callback(networkBehaviour, ...args);
				});
			}

			const targetRpcs = TargetRpcs.get(metatable) ?? [];
			for (const targetRpc of targetRpcs) {
				targetRpc.Event.client.OnServerEvent((netId, ...args) => {
					if (netId !== networkIdentity.netId) return;
					targetRpc.Callback(networkBehaviour, Game.localPlayer, ...args);
				});
			}
		}

		this.networked.add(networkBehaviour);
		return () => {
			this.networked.delete(networkBehaviour);
			rpcBin.Clean();
		};
	}
}
