import { Airship } from "../Airship";
import { Game } from "../Game";
import { CharacterCameraMode } from "./LocalCharacter/CharacterCameraMode";

export default class CharacterConfigSetup extends AirshipBehaviour {
	@Header("Character")
	@Tooltip(
		"Must include a Character component. Make sure this prefab is also assigned in the NetworkPrefabCollection in Shared/Resources",
	)
	public customCharacterPrefab?: GameObject;
	public movementSpace = Space.Self;
	public enableJumping = true;
	public enableSprinting = true;
	public enableCrouching = true;

	@Header("Camera System")
	public useAirshipCameraSystem = true;
	public startInFirstPerson = false;
	public allowFirstPersonToggle = true;

	@Header("UI Displays")
	public showChat = true;
	public showHealthbar = true;
	public showInventoryHotbar = true;
	public showInventoryBackpack = true;

	public OnEnable() {
		//Character
		Airship.characters.SetDefaultCharacterPrefab(this.customCharacterPrefab);

		//Local Character Configs
		if (Game.IsClient()) {
			//Movement
			Airship.characters.localCharacterManager.SetMoveDirWorldSpace(this.movementSpace === Space.World);

			//Camera
			Airship.characterCamera.SetEnabled(this.useAirshipCameraSystem);
			if (this.useAirshipCameraSystem) {
				Airship.characterCamera.canToggleFirstPerson = this.allowFirstPersonToggle;
				if (this.startInFirstPerson) {
					Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
					Airship.characterCamera.SetFirstPerson(this.startInFirstPerson);
				}
			}

			//UI
			Airship.chat.SetUIEnabled(this.showChat);
			Airship.inventory.SetBackpackVisible(this.showInventoryBackpack);
			if (this.showInventoryHotbar || this.showHealthbar) {
				Airship.inventory.SetUIEnabled(true);
				Airship.inventory.SetHealtbarVisible(this.showHealthbar);
				Airship.inventory.SetHotbarVisible(this.showInventoryHotbar);
			} else {
				Airship.inventory.SetUIEnabled(false);
			}
		}

		//Stop any input for some movement options we don't use
		if (!this.enableJumping || !this.enableCrouching || !this.enableSprinting) {
			Airship.characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
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
		}
	}
}
