import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import inspect from "@easy-games/unity-inspect";
import { ClientBehaviourListeners, ObserverBuffers } from "./RPC/ObserversRpc";
import { ServerBehaviourListeners } from "./RPC/ServerRpc";
import { ClientTargetedBehaviourListeners } from "./RPC/TargetRpc";

const INIT_HACK = true;

/**
 * An AirshipBehaviour with Networking Capabilities
 */
export abstract class AirshipNetworkBehaviour extends AirshipBehaviour {
	private static objIdToNb = new Map<number, AirshipNetworkBehaviour>();

	private rpcConnectionBin = new Bin();

	@NonSerialized()
	public networkObject!: NetworkObject;

	@NonSerialized()
	public ownerId!: number;

	@NonSerialized()
	public isReady = false;

	private InitClientRpc() {
		const networkObject = this.networkObject;

		const broadcastListeners = ClientBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);
		const targetedListeners = ClientTargetedBehaviourListeners.get(getmetatable(this) as AirshipNetworkBehaviour);

		if (broadcastListeners) {
			const listenerSet = new Set<string>();
			for (const listener of broadcastListeners) {
				if (listenerSet.has(listener.Id)) continue;

				this.rpcConnectionBin.Add(
					listener.Event.client.OnServerEvent((objId, ...params) => {
						const allowRequest =
							!listener.IgnoreOwner || this.networkObject.OwnerId !== Game.localPlayer.clientId;

						if (objId === networkObject.ObjectId && allowRequest) {
							listener.Callback(this, ...(params as unknown[]));
						}
					}),
				);

				listenerSet.add(listener.Id);
			}
		}

		if (targetedListeners) {
			for (const listener of targetedListeners) {
				this.rpcConnectionBin.Add(
					listener.Event.client.OnServerEvent((clientId, objId, ...params) => {
						if (objId === networkObject.ObjectId && clientId === Game.localPlayer.clientId) {
							listener.Callback(this, Game.localPlayer, ...(params as unknown[]));
						}
					}),
				);
			}
		}
	}

	private InitServerRpc() {
		const networkObject = this.networkObject;

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

				this.rpcConnectionBin.Add(
					listener.Event.server.OnClientEvent((player, objId, ...params) => {
						const hasPermission = !listener.RequiresOwner || this.networkObject.OwnerId === player.clientId;

						if (objId === networkObject.ObjectId && hasPermission) {
							listener.Callback(this, ...(params as unknown[]));
						}
					}),
				);

				listenerSet.add(listener.Id);
			}
		}
	}

	public Awake(): void {
		if (INIT_HACK) this.gameObject.GetComponent<NetworkObject>();

		let networkObject = this.gameObject.GetComponent<NetworkObject>();
		if (!networkObject) {
			Debug.LogError("AirshipNetworkBehaviour requires a NetworkObject component");
			warn(tostring(getmetatable(this)), this.gameObject.name);
			Debug.Break();
			return;
		}

		this.networkObject = networkObject;

		this.rpcConnectionBin.AddEngineEventConnection(networkObject.OnStartNetwork(() => this.OnStartNetwork()));

		let startedServer = false;
		let startedClient = false;

		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnStartServer(() => {
				if (startedServer) return;
				startedServer = true;

				this.InitServerRpc();
				this.OnStartServer();
			}),
		);
		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnStartClient(() => {
				if (startedClient) return;
				startedClient = true;

				this.InitClientRpc();
				this.OnStartClient();
			}),
		);

		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnOwnershipClient((conn) => {
				const previousOwner = conn.ClientId !== -1 ? Airship.players.FindByClientId(conn.ClientId) : undefined;
				const ownerPlayer =
					this.networkObject.OwnerId !== -1
						? Airship.players.FindByClientId(this.networkObject.OwnerId)
						: undefined;
				this.OnOwnershipClient(ownerPlayer, previousOwner);
			}),
		);

		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnOwnershipServer((conn) => {
				const previousOwner = conn.ClientId !== -1 ? Airship.players.FindByClientId(conn.ClientId) : undefined;
				const ownerPlayer =
					this.networkObject.OwnerId !== -1
						? Airship.players.FindByClientId(this.networkObject.OwnerId)
						: undefined;
				this.OnOwnershipServer(ownerPlayer, previousOwner);
			}),
		);

		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnStopClient(() => {
				startedClient = false;
				this.OnStopClient();
				this.rpcConnectionBin.Clean();
			}),
		);
		this.rpcConnectionBin.AddEngineEventConnection(
			networkObject.OnStopServer(() => {
				startedServer = false;
				this.OnStopServer();
				this.rpcConnectionBin.Clean();
			}),
		);

		this.rpcConnectionBin.AddEngineEventConnection(networkObject.OnStopNetwork(() => this.OnStopNetwork()));
		this.rpcConnectionBin.AddEngineEventConnection(networkObject.OnDespawnServer((conn) => this.OnDespawnServer()));
	}

	/**
	 * @deprecated **USE THE NETWORKING METHODS**
	 * - {@link OnStartServer}
	 * - {@link OnStartNetwork}
	 * - {@link OnStartClient}
	 */
	public Start(): void {}

	public OnStartNetwork() {}
	public OnStopNetwork() {}

	public OnStartServer() {}
	public OnStartClient() {}

	public OnStopServer() {}
	public OnStopClient() {}

	/**
	 * - Called when the ownership of this {@link AirshipNetworkBehaviour} is changed on the client with the {@link owner} being the client player who owns this behaviour.
	 * - If ownership is set to the server, {@link owner} will be `undefined`
	 *
	 * - {@link previousOwner} contains the previous owner, or `undefined` if the object was owned by the server
	 * @param owner The current owner
	 * @param previousOwner The previous owner
	 */
	public OnOwnershipClient(owner: Player | undefined, previousOwner: Player | undefined) {}

	/**
	 * - Called when the ownership of this {@link AirshipNetworkBehaviour} is changed on the server with the {@link owner} being the client player who owns this behaviour.
	 * - If ownership is set to the server, {@link owner} will be `undefined`
	 *
	 * - {@link previousOwner} contains the previous owner, or `undefined` if the object was owned by the server
	 * @param owner The current owner
	 * @param previousOwner The previous owner
	 */
	public OnOwnershipServer(owner: Player | undefined, previousOwner: Player | undefined) {}

	public OnDespawnServer() {
		ObserverBuffers.delete(this);
	}

	public IsOwner() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>();
		if (networkObject === undefined) {
			return false;
		}

		return networkObject.IsOwner || (RunCore.IsServer() && this.IsServerOwned());
	}

	public IsServer() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.IsServer;
	}

	public IsClient() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.IsClient;
	}

	public GetObjectId() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.ObjectId;
	}

	public IsServerOwned() {
		const networkObject = this.gameObject.GetComponent<NetworkObject>()!;
		return networkObject.OwnerId === -1;
	}

	public IsObjectActive() {
		return !this.gameObject.IsDestroyed();
	}

	public OnDestroy(): void {
		this.rpcConnectionBin.Clean();
	}
}
