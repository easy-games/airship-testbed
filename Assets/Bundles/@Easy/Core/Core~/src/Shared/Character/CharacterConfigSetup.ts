import { Airship } from "../Airship";
import Character from "./Character";
import { CharacterCameraMode } from "./LocalCharacter/CharacterCameraMode";

export default class CharacterConfigSetup extends AirshipBehaviour {
	@Header("Character")
	@Tooltip(
		"Must include a Character component. Make sure this prefab is also assigned in the NetworkPrefabCollection in Shared/Resources",
	)
	public customCharacterPrefab?: GameObject;
	public movementSpace = Space.Self;

	@Header("Camera System")
	public useAirshipCameraSystem = true;
	public startInFirstPerson = false;
	public allowFirstPersonToggle = true;

	@Header("UI Displays")
	public showInventory = true;
	public showHealthbar = true;

	public OnEnable() {
		//Character
		Airship.characters.SetDefaultCharacterPrefab(this.customCharacterPrefab);

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
		if (this.showInventory || this.showHealthbar) {
			Airship.inventory.SetUIEnabled(true);
			Airship.inventory.SetHealtbarVisible(this.showHealthbar);
			Airship.inventory.SetHotbarVisible(this.showInventory);
		} else {
			Airship.inventory.SetUIEnabled(false);
		}
	}
}
