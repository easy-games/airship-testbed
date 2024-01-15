import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { CoreNetwork } from "../../CoreNetwork";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { RunUtil } from "../../Util/RunUtil";
import { HeldItemManager } from "./HeldItemManager";
import { HeldItemState } from "./HeldItemState";

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
	private mouseIsDownLeft = false;
	private mouseIsDownRight = false;

	private Log(message: string) {
		return;
		print("EntityItemManager: " + message);
	}

	constructor() {
		try {
			if (RunUtil.IsClient()) {
				this.InitializeClient();
			}
			if (RunUtil.IsServer()) {
				this.InitializeServer();
			}
		} catch (e) {
			error("EntityItemManager ERROR: " + e);
		}
	}

	private InitializeClient() {
		//Listen to mouse inputs
		import("Shared/UserInput").then((userInputRef) => {
			this.Log("UserInput");
			//Process Inputs locally
			const mouse = new userInputRef.Mouse();
			const keyboard = new userInputRef.Keyboard();
			mouse.leftDown.Connect(() => {
				this.Log("LeftDown");
				if (CanvasAPI.IsPointerOverUI()) {
					return;
				}
				if (this.localEntity) {
					this.mouseIsDownLeft = true;
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_START);
				}
			});

			mouse.leftUp.Connect(() => {
				this.Log("LeftUp");
				if (!this.mouseIsDownLeft) {
					return;
				}
				this.mouseIsDownLeft = false;
				if (this.localEntity) {
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_END);
				}
			});

			mouse.rightDown.Connect(() => {
				this.Log("RightDown");
				if (CanvasAPI.IsPointerOverUI()) {
					return;
				}
				if (this.localEntity) {
					this.mouseIsDownRight = true;
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.SECONDARY_ACTION_START);
				}
			});

			mouse.rightUp.Connect(() => {
				this.Log("RightUp");
				if (!this.mouseIsDownRight) {
					return;
				}
				this.mouseIsDownRight = false;
				if (this.localEntity) {
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.SECONDARY_ACTION_END);
				}
			});

			keyboard.OnKeyDown(KeyCode.Y, (event) => {
				if (event.uiProcessed) return;
				if (this.localEntity) {
					let items = this.GetOrCreateItemManager(this.localEntity);
					items.TriggerNewState(HeldItemState.INSPECT);
				}
			});
		});

		import("../../../Client/CoreClientSignals").then((clientSignalRef) => {
			this.Log("ClientSignals");
			//Listen to new entities
			clientSignalRef.CoreClientSignals.EntitySpawn.Connect((event) => {
				this.Log("EntitySpawn: " + event.entity.id);
				if (event.entity instanceof CharacterEntity && event.entity.id !== undefined) {
					Profiler.BeginSample("EntityItemManager.GetOrCreateItemManager");
					//Create the Item Manager on the Client
					this.GetOrCreateItemManager(event.entity as CharacterEntity);

					//Local Events
					if (event.entity.IsLocalCharacter()) {
						this.localEntity = event.entity;
					}
					Profiler.EndSample();
				}
			});

			//Clean up destroyed entities
			clientSignalRef.CoreClientSignals.EntityDespawn.Connect((entity) => {
				this.Log("EntityDespawn: " + entity.id);
				if (entity instanceof CharacterEntity) {
					this.DestroyItemManager(entity);
				}
			});

			//Server Events
			CoreNetwork.ServerToClient.HeldItemStateChanged.client.OnServerEvent((entityId, newState, lookVector) => {
				const heldItem = this.entityItems.get(entityId);
				if (heldItem) {
					heldItem.OnNewState(newState, lookVector);
				}
			});
		});
	}

	private InitializeServer() {
		this.Log("InitializeServer");
		import("../../../Server/CoreServerSignals").then((serverSignalsRef) => {
			this.Log("serverSignalsRef");

			//Listen to new entity spawns
			serverSignalsRef.CoreServerSignals.EntitySpawn.Connect((event) => {
				this.Log("EntitySpawn: " + event.entity.id);
				if ((event.entity as CharacterEntity) && event.entity.id !== undefined) {
					//Create the Item Manager on the Server
					this.GetOrCreateItemManager(event.entity as CharacterEntity);
				}
			});

			//Clean up destroyed entities
			serverSignalsRef.CoreServerSignals.EntityDespawn.Connect((entity) => {
				this.Log("EntityDespawn: " + entity.id);
				if (entity instanceof CharacterEntity) {
					this.DestroyItemManager(entity);
				}
			});

			//Listen to state changes triggered by client
			serverSignalsRef.CoreServerSignals.CustomMoveCommand.Connect((event) => {
				if (event.Is("HeldItemState")) {
					this.Log("NewState: " + event.value.s);
					const heldItemManager = this.entityItems.get(event.value.e);
					if (heldItemManager) {
						const lookVec = event.value.l;
						heldItemManager.OnNewState(event.value.s, lookVec);
						CoreNetwork.ServerToClient.HeldItemStateChanged.server.FireExcept(
							event.clientId,
							event.value.e,
							event.value.s,
							lookVec,
						);
					} else {
						error("Reading custom move command from entity without held items???");
					}
				}
			});
		});
	}

	public GetOrCreateItemManager(entity: CharacterEntity): HeldItemManager {
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
			items.OnNewState(HeldItemState.ON_DESTROY, entity.entityDriver.GetLookVector());
			items.Destroy();
			this.entityItems.delete(entityId);
		}
	}
}
