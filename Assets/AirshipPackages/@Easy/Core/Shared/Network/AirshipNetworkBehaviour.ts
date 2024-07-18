import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ClientBehaviourListeners } from "./ObserversRpc";
import { ServerBehaviourListeners } from "./ServerRpc";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { ClientTargetedBehaviourListeners } from "./TargetRpc";
import { Airship } from "../Airship";
import { Player } from "../Player/Player";

export interface AirshipNetworkOwnership {
	/**
	 * The player who owns the object
	 */
	readonly Player: Player | undefined;
	/**
	 * The connection underlying the ownership event
	 */
	readonly Connection: NetworkConnection;
	/**
	 * The client id of the owner
	 */
	readonly ClientId: number;

	/**
	 * Whether or not the current client is the owner of this object
	 */
	readonly IsOwner: boolean;

	/**
	 * Whether or not the owner is the server
	 */
	readonly IsServerOwned: boolean;
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
	public networkObject!: NetworkObject;

	private InitClientRpc() {
		const nob = this.networkObject;

		const broadcastListeners = ClientBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);
		const targetedListeners = ClientTargetedBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);

		if (broadcastListeners) {
			const listenerSet = new Set<string>();
			for (const listener of broadcastListeners) {
				if (listenerSet.has(listener.Id)) continue;

				this.networkBin.Add(
					listener.Event.client.OnServerEvent((objId, ...params: unknown[]) => {
						const allowRequest =
							!listener.IgnoreOwner || this.networkObject.OwnerId !== Game.localPlayer.connectionId;

						if (objId === nob.ObjectId && allowRequest) {
							listener.Callback(this, ...(params as unknown[]));
						}
					}),
				);

				listenerSet.add(listener.Id);
			}
		}

		if (targetedListeners) {
			for (const listener of targetedListeners) {
				this.networkBin.Add(
					listener.Event.client.OnServerEvent((objId, ...params) => {
						if (objId === nob.ObjectId) {
							listener.Callback(this, Game.localPlayer, ...(params as unknown[]));
						}
					}),
				);
			}
		}
	}

	private InitServerRpc() {
		const nob = this.networkObject;

		const broadcastListeners = ClientBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);
		const listeners = ServerBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);

		if (broadcastListeners) {
			const listenerSet = new Set<string>();
			for (const listener of broadcastListeners) {
				if (listenerSet.has(listener.Id)) continue;

				listenerSet.add(listener.Id);
			}
		}

		if (listeners) {
			const listenerSet = new Set<string>();
			for (const listener of listeners) {
				if (listenerSet.has(listener.Id)) continue;

				this.networkBin.Add(
					listener.Event.server.OnClientEvent((player, objId, ...params) => {
						const hasPermission =
							!listener.RequiresOwner || this.networkObject.OwnerId === player.connectionId;

						if (objId === nob.ObjectId && hasPermission) {
							let args = params;
							if (listener.PassCallerAsFirstArgument) {
								args = [player, ...params];
							}

							listener.Callback(this, ...(args as unknown[]));
						}
					}),
				);

				listenerSet.add(listener.Id);
			}
		}
	}

	/**
	 * # DO NOT OVERRIDE - USE {@link OnStartNetwork} or {@link Start}
	 * @deprecated
	 */
	public Awake(): void {
		this.networkObject =
			this.gameObject.GetComponent<NetworkObject>() ?? this.gameObject.GetComponentInParent<NetworkObject>()!;
		assert(this.networkObject, "Missing NetworkObject on GameObject or parent of '" + this.gameObject.name + "'");

		let startedNetwork = false;

		const nob = this.networkObject;
		if (Game.IsServer()) {
			let startedServer = false;
			this.networkBin.AddEngineEventConnection(
				nob.OnStartServer(() => {
					if (startedServer) return;
					startedServer = true;

					this.InitServerRpc();
					this.OnStartServer?.();
				}),
			);

			this.networkBin.AddEngineEventConnection(
				nob.OnStopServer(() => {
					if (!startedServer) return;
					startedServer = false;

					this.OnStopServer?.();
				}),
			);
		}

		this.networkBin.AddEngineEventConnection(
			nob.OnStartNetwork(() => {
				if (startedNetwork) return;
				startedNetwork = true;

				this.OnStartNetwork?.();
			}),
		);

		this.networkBin.AddEngineEventConnection(
			nob.OnStopNetwork(() => {
				if (!startedNetwork) return;
				startedNetwork = false;
				this.OnStopNetwork?.();
			}),
		);

		if (Game.IsClient()) {
			let startedClient = false;
			this.networkBin.AddEngineEventConnection(
				nob.OnStartClient(() => {
					if (startedClient) return;
					startedClient = true;

					this.InitClientRpc();
					this.OnStartClient?.();
				}),
			);

			this.networkBin.AddEngineEventConnection(
				nob.OnStopClient(() => {
					if (!startedClient) return;
					startedClient = false;

					this.OnStopClient?.();
				}),
			);
		}

		this.networkBin.AddEngineEventConnection(nob.OnStopNetwork(() => this.OnStopNetwork?.()));
		this.networkBin.AddEngineEventConnection(nob.OnDespawnServer((conn) => this.OnDespawnServer?.()));

		this.networkBin.AddEngineEventConnection(
			nob.OnOwnershipServer((conn) => {
				const nob = this.networkObject;
				const player = Airship.Players.FindByConnectionId(nob.OwnerId);
				this.OnOwnershipServer?.({
					Player: player,
					Connection: conn,
					ClientId: nob.OwnerId,
					IsOwner: nob.IsOwner,
					IsServerOwned: nob.OwnerId === -1,
				});
			}),
		);

		this.networkBin.AddEngineEventConnection(nob.OnSpawnServer(() => this.OnSpawnServer?.()));

		this.networkBin.AddEngineEventConnection(
			nob.OnOwnershipClient((conn) => {
				const nob = this.networkObject;
				const player = Airship.Players.FindByConnectionId(nob.OwnerId);
				this.OnOwnershipClient?.({
					Player: player,
					Connection: conn,
					ClientId: nob.OwnerId,
					IsOwner: nob.IsOwner,
					IsServerOwned: nob.OwnerId === -1,
				});
			}),
		);
	}

	/**
	 * Called when this `AirshipNetworkBehaviour` starts networking
	 *
	 * This is useful for code that needs to run on the start on both server and client
	 * - If you want a server or client only start, use {@link OnStartServer} or {@link OnStartClient}
	 */
	public OnStartNetwork?(): void;
	/**
	 * Called when this `AirshipNetworkBehaviour` stops networking
	 */
	public OnStopNetwork?(): void;

	/**
	 * Called on the server when this `AirshipNetworkBehaviour` starts networking
	 */
	public OnStartServer?(): void;
	/**
	 * Called when the ownership of this object is changed on the server
	 */
	public OnOwnershipServer?(ownership: AirshipNetworkOwnership): void;

	/**
	 * Called on the client when this `AirshipNetworkBehaviour` starts networking
	 */
	public OnStartClient?(): void;
	/**
	 * Called when the ownership of this object is changed on the client
	 */
	public OnOwnershipClient?(ownership: AirshipNetworkOwnership): void;

	/**
	 * Called when this `AirshipNetworkBehaviour` stops being networked on the server
	 */
	public OnStopServer?(): void;
	/**
	 * Called when this `AirshipNetworkBehaviour` stops being networked on the client
	 */
	public OnStopClient?(): void;

	/**
	 * Called when this `AirshipNetworkBehaviour` is spawned on the server
	 */
	public OnSpawnServer?(): void;
	/**
	 * Called when this `AirshipNetworkBehaviour` is despawned on the server
	 */
	public OnDespawnServer?(): void;

	/**
	 * Called when this object is destroyed locally
	 */
	public OnNetworkDestroy?(): void;

	/**
	 * Returns true if this object is owned by the server
	 */
	public IsServerOwned() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.OwnerId === -1;
	}

	/**
	 * Despawns this object
	 */
	public ServerDespawn() {
		if (Game.IsServer()) NetworkUtil.Despawn(this.gameObject);
	}

	/**
	 * Returns true if the caller is the owner of this object
	 */
	public IsOwner() {
		if (Game.IsClient()) {
			return this.networkObject.IsOwner || this.networkObject.OwnerId === (Game.localPlayer?.connectionId ?? -1);
		}

		return this.networkObject.OwnerId === -1;
	}

	/**
	 * Gets the player who owns this object (if applicable)
	 *
	 * - Will return `undefined` if the object is server-owned or the owner is no longer in the server
	 * - If you want to verify the owner isn't the server, use {@link IsServerOwned}. or if the caller is the owner {@link IsOwner}
	 */
	public GetPlayerOwner() {
		return Airship.Players.FindByConnectionId(this.networkObject.OwnerId);
	}

	/**
	 * @deprecated This method is used by `AirshipNetworkBehaviour` - please see {@link OnNetworkDestroy}
	 */
	public OnDestroy(): void {
		this.networkBin.Clean();
		this.OnNetworkDestroy?.();
	}
}
