import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { Game } from "Shared/Game";
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
	private localCharacter?: Character;
	private mouseIsDownLeft = false;
	private mouseIsDownRight = false;

	private Log(message: string) {
		// return;
		// print("EntityItemManager: " + message);
	}

	constructor() {
		if (RunUtil.IsClient()) {
			this.InitializeClient();
		}
		if (RunUtil.IsServer()) {
			this.InitializeServer();
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
				if (CanvasAPI.IsPointerOverUI() || EventSystem.current.currentSelectedGameObject) {
					return;
				}
				if (this.localCharacter) {
					this.mouseIsDownLeft = true;
					let items = this.GetOrCreateItemManager(this.localCharacter);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_START);
				}
			});

			mouse.leftUp.Connect(() => {
				this.Log("LeftUp");
				if (!this.mouseIsDownLeft) {
					return;
				}
				this.mouseIsDownLeft = false;
				if (this.localCharacter) {
					let items = this.GetOrCreateItemManager(this.localCharacter);
					items.TriggerNewState(HeldItemState.CALL_TO_ACTION_END);
				}
			});

			mouse.rightDown.Connect(() => {
				this.Log("RightDown");
				if (CanvasAPI.IsPointerOverUI()) {
					return;
				}
				if (this.localCharacter) {
					this.mouseIsDownRight = true;
					let items = this.GetOrCreateItemManager(this.localCharacter);
					items.TriggerNewState(HeldItemState.SECONDARY_ACTION_START);
				}
			});

			mouse.rightUp.Connect(() => {
				this.Log("RightUp");
				if (!this.mouseIsDownRight) {
					return;
				}
				this.mouseIsDownRight = false;
				if (this.localCharacter) {
					let items = this.GetOrCreateItemManager(this.localCharacter);
					items.TriggerNewState(HeldItemState.SECONDARY_ACTION_END);
				}
			});

			keyboard.OnKeyDown(KeyCode.Y, (event) => {
				if (event.uiProcessed) return;
				if (this.localCharacter) {
					let items = this.GetOrCreateItemManager(this.localCharacter);
					items.TriggerNewState(HeldItemState.INSPECT);
				}
			});
		});

		import("../../../Client/CoreClientSignals").then((clientSignalRef) => {
			this.Log("ClientSignals");
			//Listen to new entities
			Airship.characters.onCharacterSpawned.Connect((character) => {
				this.GetOrCreateItemManager(character);
				if (character.IsLocalCharacter()) {
					this.localCharacter = character;
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
			Airship.characters.onCharacterSpawned.Connect((character) => {
				this.GetOrCreateItemManager(character);
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
					const player = Airship.players.FindByClientId(event.clientId);
					if (RunUtil.IsClient() && player?.userId === Game.localPlayer.userId) {
						return;
					}
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

	public GetOrCreateItemManager(character: Character): HeldItemManager {
		this.Log("GetOrCreateItemManager: " + character.id);
		let items = this.entityItems.get(character.id ?? 0);
		if (items === undefined) {
			this.Log("New Item: " + character.id);
			items = new HeldItemManager(character);
			this.entityItems.set(character.id ?? 0, items);
		}
		this.Log("Returning Item: " + items.GetLabel());
		return items;
	}

	//Called by both client and server based on entity death events
	private DestroyItemManager(entity: CharacterEntity) {
		let entityId = entity.id ?? 0;
		let items = this.entityItems.get(entityId);
		if (items) {
			items.OnNewState(HeldItemState.ON_DESTROY, entity.movement.GetLookVector());
			items.Destroy();
			this.entityItems.delete(entityId);
		}
	}
}
