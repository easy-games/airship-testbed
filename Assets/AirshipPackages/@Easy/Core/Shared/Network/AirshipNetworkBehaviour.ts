import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../Airship";
import { Game } from "../Game";
import { Player } from "../Player/Player";
import { ClientRpcs } from "./ObserversRpc";
import { CommandRpcs } from "./ServerRpc";
import { TargetRpcs } from "./TargetRpc";

const networked = new Set<AirshipNetworkBehaviour>();
function connectRpcMethods(networkBehaviour: AirshipNetworkBehaviour) {
	if (networked.has(networkBehaviour)) {
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

	networked.add(networkBehaviour);
	return () => {
		networked.delete(networkBehaviour);
		rpcBin.Clean();
	};
}

/**
 * A TypeScript parallel to the C# `NetworkBehaviour` for Airship.
 *
 * - To expose the serializable properties to the inspector, it must be exported as `default`.
 *
 * ## This component **REQUIRES** a NetworkObject in the same game object or in the parent of the heirachy
 *
 * Example declaration:
 * ```ts
 * export default class ExampleBehaviour extends AirshipNetworkBehaviour {
 * 	public OnClientStart() {
 * 		print("Hello, World! from the client!");
 * 	}
 * 	public OnServerStart() {
 * 		print("Hello, World! from the server!");
 * 	}
 * ```
 */
export abstract class AirshipNetworkBehaviour extends AirshipBehaviour {
	private networkBin = new Bin();

	/**
	 * The NetworkObject this behaviour is attached to
	 */
	@NonSerialized()
	public networkIdentity!: NetworkIdentity;

	/**
	 * # DO NOT OVERRIDE - USE {@link OnStartNetwork} or {@link Start}
	 * @deprecated
	 */
	protected Awake(): void {
		this.networkIdentity =
			this.gameObject.GetComponent<NetworkIdentity>() ?? this.gameObject.GetComponentInParent<NetworkIdentity>()!;
		assert(
			this.networkIdentity,
			"Missing NetworkIdentity on GameObject or parent of '" + this.gameObject.name + "'",
		);

		// Initialize the RPCs
		this.networkBin.Add(connectRpcMethods(this));

		const id = this.networkIdentity;
		if (Game.IsServer()) {
			this.networkBin.Add(
				id.onStartServer.Connect(() => {
					this.OnStartServer?.();
				}),
			);
			this.networkBin.Add(
				id.onStopServer.Connect(() => {
					this.OnStopServer?.();
				}),
			);
		}
		if (Game.IsClient()) {
			this.networkBin.Add(
				id.onStartClient.Connect(() => {
					this.OnStartClient?.();
				}),
			);
			this.networkBin.Add(
				id.onStartAuthority.Connect(() => {
					this.OnStartAuthority?.();
				}),
			);
			this.networkBin.Add(
				id.onStopClient.Connect(() => {
					this.OnStopClient?.();
				}),
			);
			this.networkBin.Add(
				id.onStopAuthority.Connect(() => {
					this.OnStartClient?.();
				}),
			);
		}
	}

	/**
	 * Like Start(), but only called on server and host.
	 */
	protected OnStartServer?(): void;

	/**
	 * Like Start(), but only called on client and host.
	 */
	protected OnStartClient?(): void;
	/**
	 * Like Start(), but only called for objects the client has authority over.
	 */
	protected OnStartAuthority?(): void;

	/**
	 * Stop event, only called for objects the client has authority over.
	 */
	protected OnStopAuthority?(): void;

	/**
	 * Stop event, only called on server and host.
	 */
	protected OnStopServer?(): void;
	/**
	 * Stop event, only called on client and host.
	 */
	protected OnStopClient?(): void;

	/**
	 * Returns true if the caller is the owner of this object
	 */
	public IsOwned() {
		return this.networkIdentity.isOwned;
	}

	/**
	 * Gets the player who owns this object (if applicable)
	 *
	 * - Will return `undefined` if the object is server-owned or the owner is no longer in the server
	 * - If you want to verify the owner isn't the server, use {@link IsServerOwned}. or if the caller is the owner {@link IsOwned}
	 */
	public GetPlayerOwner(): Player | undefined {
		return Airship.Players.FindByConnectionId(this.networkIdentity.connectionToClient.connectionId);
	}

	/**
	 * @deprecated This method is used by `AirshipNetworkBehaviour`
	 */
	protected OnDestroy(): void {
		this.networkBin.Clean();
	}
}
