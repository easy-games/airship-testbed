import { Airship } from "../Airship";
import { Game } from "../Game";
import { InventoryUIVisibility } from "../Inventory/InventoryUIVisibility";
import { CharacterCameraMode } from "./LocalCharacter/CharacterCameraMode";

/**
 * Use to configure basic properties of Airship character system.
 *
 * Usage: add this component to any game object in your scene.
 */
export default class CharacterConfigSetup extends AirshipBehaviour {
	/** Must include a Character component. Make sure this prefab is also assigned in the Resources/NetworkPrefabCollection.asset */
	@Header("Character")
	@Tooltip(
		"Must include a Character component. Make sure this prefab is also assigned in the Resources/NetworkPrefabCollection.asset",
	)
	public customCharacterPrefab?: GameObject;
	public movementSpace = Space.Self;
	public enableJumping = true;
	public enableSprinting = true;
	public enableCrouching = true;
	public footstepSounds = true;

	@Header("Viewmodel")
	@Tooltip("If true, a character viewmodel will be instantiated under the ViewmodelCamera")
	public instantiateViewmodel = true;
	public customViewmodelPrefab?: GameObject;

	@Header("Camera System")
	public useAirshipCameraSystem = true;
	public characterCameraMode = CharacterCameraMode.Fixed;
	public startInFirstPerson = false;
	public allowFirstPersonToggle = true;
	public useSprintFOV = true;
	public sprintFOVMultiplier = 1.08;

	@Header("UI")
	public showChat = true;
	public inventoryVisibility = InventoryUIVisibility.WhenHasItems;
	public inventoryUIPrefab?: GameObject;

	public Awake(): void {
		//Character
		//Set the default prefab to use whenever a character is spawned
		Airship.Characters.instantiateViewmodel = this.instantiateViewmodel;
		Airship.Characters.SetDefaultCharacterPrefab(this.customCharacterPrefab);
		Airship.Characters.SetDefaultViewmodelPrefab(this.customViewmodelPrefab);
		if (this.customViewmodelPrefab !== undefined && Airship.Characters.viewmodel !== undefined) {
			Airship.Characters.viewmodel.InstantiateFromPrefab(this.customViewmodelPrefab);
		}
		if (this.inventoryUIPrefab !== undefined) {
			Airship.Inventory.SetInventoryUIPrefab(this.inventoryUIPrefab);
		}
		Airship.Characters.footsteps.foostepSoundsEnabled = this.footstepSounds;
	}

	public OnEnable() {
		//Local Character Configs
		if (Game.IsClient()) {
			//Movement
			//Control how client inputs are recieved by the movement system
			Airship.Characters.localCharacterManager.SetMoveDirWorldSpace(this.movementSpace === Space.World);

			//Camera
			//Toggle the core camera system
			Airship.Camera.SetEnabled(this.useAirshipCameraSystem);
			if (this.useAirshipCameraSystem) {
				//Allow clients to toggle their view model
				Airship.Camera.canToggleFirstPerson = this.allowFirstPersonToggle;
				if (this.startInFirstPerson) {
					//Change to a new camera mode
					Airship.Camera.characterCameraMode = CharacterCameraMode.Fixed;
					//Force first person view model
					Airship.Camera.SetFirstPerson(this.startInFirstPerson);
				}
				//Camera FOV
				Airship.Camera.SetSprintFOVEnabled(this.useSprintFOV);
				Airship.Camera.SetSprintFOVMultiplier(this.sprintFOVMultiplier);
			}

			//UI visual toggles
			Airship.Chat.SetUIEnabled(this.showChat);
			Airship.Inventory.SetUIVisibility(this.inventoryVisibility);
		}

		//Stop any input for some movement options we don't use
		if (!this.enableJumping || !this.enableCrouching || !this.enableSprinting) {
			//Listen to input event
			Airship.Characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
				//Force the event off if we don't want that feature
				if (!this.enableJumping) {
					event.jump = false;
				}
				if (!this.enableCrouching) {
					event.crouch = false;
				}
				if (!this.enableSprinting) {
					event.sprinting = false;
				}
			});

			if (!this.enableJumping) {
				Airship.Input.HideMobileButtons("Jump");
			}

			if (!this.enableCrouching) {
				Airship.Input.HideMobileButtons("Crouch");
			}
		}
	}
}
