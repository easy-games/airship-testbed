import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { Network } from "../../Network";
import { RunUtil } from "../../Util/RunUtil";
import { HeldItemManager, HeldItemState } from "./HeldItemManager";

export class EntityItemManager {
	//SINGLETON
	private static instance: EntityItemManager;
	public static Get(): EntityItemManager {
		if (this.instance === undefined) {
			this.instance = new EntityItemManager();
		}
		return this.instance;
	}

	//Private
	private entityItems = new Map<number, HeldItemManager>();
	private localEntity?: CharacterEntity;
	private mouseIsDown = false;

	private Log(message: string) {
		return;
		print("EntityItemManager: " + message);
	}

	constructor() {
		try {
			if (RunUtil.IsClient()) {
				this.InitializeClient();
			} else if (RunUtil.IsServer()) {
				this.InitializeServer();
			}
		} catch (e) {
			error("EntityItemManager ERROR: " + e);
		}
	}

	private InitializeClient() {
		//Listen to mouse inputs
		import("../../../Client/UserInput").then((userInputRef) => {
			this.Log("UserInput");
			//Process Inputs locally
			const mouse = new userInputRef.Mouse();
			mouse.LeftDown.Connect(() => {
				this.Log("LeftDown");
				if (CanvasAPI.IsPointerOverUI()) {
					return;
				}
				if (this.localEntity) {
					this.mouseIsDown = true;
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_START);
				}
			});

			mouse.LeftUp.Connect(() => {
				this.Log("LeftUp");
				if (!this.mouseIsDown) {
					return;
				}
				this.mouseIsDown = false;
				if (this.localEntity) {
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_END);
				}
			});
		});

		import("../../../Client/ClientSignals").then((clientSignalRef) => {
			this.Log("ClientSignals");
			//Listen to new entities
			clientSignalRef.ClientSignals.EntitySpawn.Connect((event) => {
				this.Log("EntitySpawn: " + event.entity.id);
				if (event.entity instanceof CharacterEntity && event.entity.id !== undefined) {
					//Create the Item Manager on the Client
					this.GetOrCreateItemManager(event.entity as CharacterEntity);

					//Local Events
					if (event.entity.IsLocalCharacter()) {
						this.localEntity = event.entity;
					}
				}
			});

			//Clean up destroyed entities
			clientSignalRef.ClientSignals.EntityDespawn.Connect((entity) => {
				this.Log("EntityDespawn: " + entity.id);
				if (entity instanceof CharacterEntity) {
					this.DestroyItemManager(entity);
				}
			});

			//Server Events
			Network.ServerToClient.HeldItemStateChanged.Client.OnServerEvent((entityId, newState) => {
				const heldItem = this.entityItems.get(entityId);
				if (heldItem) {
					heldItem.OnNewState(newState);
				}
			});
		});
	}

	private InitializeServer() {
		this.Log("InitializeServer");
		import("../../../Server/ServerSignals").then((serverSignalsRef) => {
			this.Log("serverSignalsRef");

			//Listen to new entity spawns
			serverSignalsRef.ServerSignals.EntitySpawn.Connect((event) => {
				this.Log("EntitySpawn: " + event.entity.id);
				if ((event.entity as CharacterEntity) && event.entity.id !== undefined) {
					//Create the Item Manager on the Server
					this.GetOrCreateItemManager(event.entity as CharacterEntity);
				}
			});

			//Clean up destroyed entities
			serverSignalsRef.ServerSignals.EntityDespawn.Connect((entity) => {
				this.Log("EntityDespawn: " + entity.id);
				if (entity instanceof CharacterEntity) {
					this.DestroyItemManager(entity);
				}
			});

			//Listen to state changes triggered by client
			serverSignalsRef.ServerSignals.CustomMoveCommand.Connect((event) => {
				if (event.is("HeldItemState")) {
					this.Log("NewState: " + event.value.state);
					const heldItem = this.entityItems.get(event.value.entityId);
					if (heldItem) {
						heldItem.OnNewState(event.value.state);
						Network.ServerToClient.HeldItemStateChanged.Server.FireExcept(
							event.clientId,
							event.value.entityId,
							event.value.state,
						);
					} else {
						error("Reading custom move command from entity without held items???");
					}
				}
			});
		});
	}

	private GetOrCreateItemManager(entity: CharacterEntity): HeldItemManager {
		this.Log("GetOrCreateItemManager: " + entity.id);
		let items = this.entityItems.get(entity.id ?? 0);
		if (items === undefined) {
			this.Log("New Item: " + entity.id);
			items = new HeldItemManager(entity);
			this.entityItems.set(entity.id ?? 0, items);
		}
		this.Log("Returning Item: " + items.GetLabel());
		return items;
	}

	//Called by both client and server based on entity death events
	private DestroyItemManager(entity: CharacterEntity) {
		let entityId = entity.id ?? 0;
		let items = this.entityItems.get(entityId);
		if (items) {
			items.OnNewState(HeldItemState.ON_DESTROY);
			this.entityItems.delete(entityId);
		}
	}
}
