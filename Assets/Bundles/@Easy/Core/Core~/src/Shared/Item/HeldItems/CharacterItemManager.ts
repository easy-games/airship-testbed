import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "../../CoreNetwork";
import { Game } from "../../Game";
import { HeldItemActionState, HeldItemManager } from "./HeldItemManager";
import { Bin } from "../../Util/Bin";
import { OnUpdate } from "../../Util/Timer";

export class CharacterItemManager {
	//Private
	private characterItemManagers = new Map<number, HeldItemManager>();
	private localCharacter?: Character;
	private userActionIds: string[] = [];
	private inputBin: Bin = new Bin();

	private Log(message: string) {
		//print("EntityItemManager: " + message);
	}

	public OnStart() {
		if (Game.IsClient()) {
			this.InitializeClient();
		}
		if (Game.IsServer()) {
			this.InitializeServer();
		}
	}

	private InitializeClient() {
		this.OverwriteInputActions(["UseItem", "SecondaryUseItem"]);

		//Listen to character spawns
		Airship.characters.ObserveCharacters((character) => {
			this.GetOrCreateItemManager(character);
			if (character.IsLocalCharacter()) {
				this.localCharacter = character;
			}
		});

		//Clean up destroyed characters
		Airship.characters.onCharacterDespawned.Connect((character) => {
			this.Log("EntityDespawn: " + character.id);
			this.DestroyItemManager(character);
		});

		//Client listens to state changes from server (for other players characters)
		CoreNetwork.ServerToClient.HeldItemStateChanged.client.OnServerEvent(
			(characterId, newState, isActive, lookVector) => {
				const heldItem = this.characterItemManagers.get(characterId);
				if (heldItem) {
					heldItem.OnNewState(newState, isActive, lookVector);
				}
			},
		);
	}

	private TriggerNewState(stateIndex: number, isActive: boolean) {
		this.Log("Triggering new state: " + stateIndex + " isDown: " + isActive);

		if (this.localCharacter) {
			let items = this.GetOrCreateItemManager(this.localCharacter);
			items.TriggerNewState(stateIndex, isActive);
		}
	}

	public OverwriteInputActions(actionIds: string[]) {
		this.userActionIds = actionIds;
		this.ConnectToInputs();
	}

	public AddInputAction(action: string) {
		this.userActionIds.push(action);
		this.ConnectToInputs();
	}

	private ConnectToInputs() {
		//Locally check for inputs
		this.inputBin.Clean();
		for (let i = 0; i < this.userActionIds.size(); i++) {
			let key = this.userActionIds[i];
			this.inputBin.Add(
				Airship.input.OnDown(key).Connect(() => {
					this.TriggerNewState(i, true);
				}),
			);
			this.inputBin.Add(
				Airship.input.OnUp(key).Connect(() => {
					this.TriggerNewState(i, false);
				}),
			);
		}
	}

	private InitializeServer() {
		this.Log("InitializeServer");

		//Listen to new entity spawns
		Airship.characters.onCharacterSpawned.Connect((character) => {
			this.Log("Character Spawn: " + character.id);
			this.GetOrCreateItemManager(character);
		});

		//Clean up destroyed entities
		Airship.characters.onCharacterDespawned.Connect((character) => {
			this.Log("Character Despawn: " + character.id);
			this.DestroyItemManager(character);
		});

		//Listen to state changes triggered by client
		Airship.characters.onServerCustomMoveCommand.Connect((event) => {
			if (event.key === "HeldItemState") {
				if (Game.IsHosting()) return;
				let itemState = event.value as HeldItemActionState;
				if (itemState) {
					const heldItem = this.characterItemManagers.get(itemState.characterId);
					if (heldItem) {
						heldItem.OnNewState(itemState.stateIndex, itemState.isActive, itemState.lookVector);
						//Notify all other clients about this state change
						CoreNetwork.ServerToClient.HeldItemStateChanged.server.FireExcept(
							event.player,
							itemState.characterId,
							itemState.stateIndex,
							itemState.isActive,
							itemState.lookVector,
						);
					}
				}
			}
		});
	}

	public GetOrCreateItemManager(character: Character): HeldItemManager {
		this.Log("GetOrCreateItemManager: " + character.id);
		let items = this.characterItemManagers.get(character.id ?? 0);
		if (items === undefined) {
			this.Log("New Item: " + character.id);
			items = new HeldItemManager(character);
			this.characterItemManagers.set(character.id ?? 0, items);
		}
		this.Log("Returning Item: " + items.GetLabel());
		return items;
	}

	//Called by both client and server based on entity death events
	private DestroyItemManager(character: Character) {
		let entityId = character.id ?? 0;
		let items = this.characterItemManagers.get(entityId);
		if (items) {
			items.OnNewState(-1, false, character.movement.GetLookVector());
			items.Destroy();
			this.characterItemManagers.delete(entityId);
		}
	}
}
