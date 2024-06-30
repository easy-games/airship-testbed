import { Airship } from "../Airship";
import { CameraReferences } from "../Camera/CameraReferences";
import { Game } from "../Game";
import { Layer } from "../Util/Layer";
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

	@Header("Viewmodel")
	public customViewmodelPrefab?: GameObject;

	@Header("Camera System")
	public useAirshipCameraSystem = true;
	public startInFirstPerson = false;
	public allowFirstPersonToggle = true;

	@Header("UI Displays")
	public showChat = true;
	public showHealthbar = true;
	public showInventoryHotbar = true;
	public showInventoryBackpack = true;

	public Awake(): void {
		//Character
		//Set the default prefab to use whenever a character is spawned
		Airship.Characters.SetDefaultCharacterPrefab(this.customCharacterPrefab);
		Airship.Characters.SetDefaultViewmodelPrefab(this.customViewmodelPrefab);
		if (this.customViewmodelPrefab !== undefined && CameraReferences.viewmodel !== undefined) {
			CameraReferences.viewmodel.SetViewmodelGameObject(Object.Instantiate(this.customViewmodelPrefab));
		}
	}

	public OnEnable() {
		Physics.IgnoreLayerCollision(17, 18, false);
		Layer.CHARACTER;

		//Local Character Configs
		if (Game.IsClient()) {
			//Movement
			//Control how client inputs are recieved by the movement system
			Airship.Characters.localCharacterManager.SetMoveDirWorldSpace(this.movementSpace === Space.World);

			//Camera
			//Toggle the core camera system
			Airship.CharacterCamera.SetEnabled(this.useAirshipCameraSystem);
			if (this.useAirshipCameraSystem) {
				//Allow clients to toggle their view model
				Airship.CharacterCamera.canToggleFirstPerson = this.allowFirstPersonToggle;
				if (this.startInFirstPerson) {
					//Change to a new camera mode
					Airship.CharacterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
					//Force first person view model
					Airship.CharacterCamera.SetFirstPerson(this.startInFirstPerson);
				}
			}

			//UI visual toggles
			Airship.Chat.SetUIEnabled(this.showChat);
			Airship.Inventory.SetBackpackVisible(this.showInventoryBackpack);
			if (this.showInventoryHotbar || this.showHealthbar) {
				Airship.Inventory.SetUIEnabled(true);
				Airship.Inventory.SetHealtbarVisible(this.showHealthbar);
				Airship.Inventory.SetHotbarVisible(this.showInventoryHotbar);
			} else {
				Airship.Inventory.SetUIEnabled(false);
			}
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
					event.crouchOrSlide = false;
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
