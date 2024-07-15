import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ClientBehaviourListeners } from "./ObserversRpc";
import { ServerBehaviourListeners } from "./ServerRpc";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { ClientTargetedBehaviourListeners } from "./TargetRpc";
import { NetworkedFields } from "./NetworkedField";
import AirshipNetworkFieldReplicator from "./AirshipNetworkFieldReplicator";

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
	private static airshipNetworkIds = 0;

	/**
	 * An ID used by Airship for networking (not guaranteed to be ordered)
	 */
	public readonly AirshipNetworkId = AirshipNetworkBehaviour.airshipNetworkIds++;

	private bin = new Bin();

	@NonSerialized()
	public networkObject!: NetworkObject;

	private InitNetworkedFields() {
		const networkedFields = NetworkedFields.get(getmetatable(this) as AirshipNetworkBehaviour);
		if (networkedFields) {
			// Awaken networked fields
			const replicator =
				this.gameObject.GetAirshipComponent<AirshipNetworkFieldReplicator>() ??
				this.gameObject.AddAirshipComponent<AirshipNetworkFieldReplicator>();

			replicator.BindPropertiesToBehaviour(this, networkedFields);
		}
	}

	private InitClientRpc() {
		const nob = this.networkObject;

		const broadcastListeners = ClientBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);
		const targetedListeners = ClientTargetedBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);

		if (broadcastListeners) {
			const listenerSet = new Set<string>();
			for (const listener of broadcastListeners) {
				if (listenerSet.has(listener.Id)) continue;

				this.bin.Add(
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
				this.bin.Add(
					listener.Event.client.OnServerEvent((objId, ...params) => {
						if (objId === nob.ObjectId) {
							listener.Callback(this, Game.localPlayer, ...(params as unknown[]));
						}
					}),
				);
			}
		}

		this.InitNetworkedFields();
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

				this.bin.Add(
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

		this.InitNetworkedFields();
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
			this.bin.AddEngineEventConnection(
				nob.OnStartServer(() => {
					// 	print("OnStartServer", this.gameObject.name);
					if (startedServer) return;
					startedServer = true;

					this.InitServerRpc();
					this.OnStartServer();
				}),
			);

			this.bin.AddEngineEventConnection(
				nob.OnStopServer(() => {
					if (!startedServer) return;
					startedServer = false;

					this.OnStopServer();
				}),
			);
		}

		this.bin.AddEngineEventConnection(
			nob.OnStartNetwork(() => {
				if (startedNetwork) return;
				startedNetwork = true;

				this.OnStartNetwork();
			}),
		);

		this.bin.AddEngineEventConnection(
			nob.OnStopNetwork(() => {
				if (!startedNetwork) return;
				startedNetwork = false;
				this.OnStopNetwork();
			}),
		);

		if (Game.IsClient()) {
			let startedClient = false;
			this.bin.AddEngineEventConnection(
				nob.OnStartClient(() => {
					if (startedClient) return;
					startedClient = true;

					this.InitClientRpc();
					this.OnStartClient();
				}),
			);

			this.bin.AddEngineEventConnection(
				nob.OnStopClient(() => {
					if (!startedClient) return;
					startedClient = false;

					this.OnStopClient();
				}),
			);
		}

		this.bin.AddEngineEventConnection(nob.OnStopNetwork(() => this.OnStopNetwork()));
		this.bin.AddEngineEventConnection(nob.OnDespawnServer((conn) => this.OnServerDespawn()));
	}

	public OnStartNetwork() {}
	public OnStopNetwork() {}

	public OnStartServer() {}
	public OnStartClient() {}

	public OnStopServer() {}
	public OnStopClient() {}

	public OnServerDespawn() {}

	public IsServerOwned() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.OwnerId === -1;
	}

	public ServerDespawn() {
		if (Game.IsServer()) NetworkUtil.Despawn(this.gameObject);
	}

	public IsOwner() {
		return this.networkObject.IsOwner || this.networkObject.OwnerId === (Game.localPlayer?.connectionId ?? -1);
	}

	public OnDestroy(): void {
		this.bin.Clean();
	}
}
