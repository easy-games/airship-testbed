import { Airship } from "../Airship";
import { AirshipCameraSingleton } from "../Camera/AirshipCameraSingleton";
import { CameraConstants } from "../Camera/CameraConstants";
import { FixedCameraMode } from "../Camera/DefaultCameraModes/FixedCameraMode";
import { OrbitCameraMode } from "../Camera/DefaultCameraModes/OrbitCameraMode";
import { Dependency } from "../Flamework";
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
	@Spacing(5)
	public useDefaultMovement = true;

	@Spacing(5)
	public movementSpace = Space.Self;

	public enableJumping = true;
	public enableSprinting = true;
	public enableCrouching = true;
	public footstepSounds = true;

	@Header("Viewmodel")
	@Tooltip("If true, a character viewmodel will be instantiated under the ViewmodelCamera")
	public instantiateViewmodel = true;
	public customViewmodelPrefab?: GameObject;

	@Header("UI")
	public showChat = true;
	public inventoryVisibility = InventoryUIVisibility.WhenHasItems;
	public inventoryUIPrefab?: GameObject;

	@Header("Camera System")
	public useAirshipCameraSystem = true;
	public startInFirstPerson = false;
	public allowFirstPersonToggle = true;
	public useSprintFOV = true;
	public sprintFOVMultiplier = 1.08;
	public characterCameraMode = CharacterCameraMode.Fixed;

	@Header("Character Camera Configuration")
	@Header("Fixed Camera")
	public fixedXOffset = 0.45;
	public fixedYOffset = 1.7;
	public fixedZOffset = 3.5;
	public fixedMinRotX = 1;
	public fixedMaxRotX = 179;
	@Header("Orbit Camera")
	public orbitRadius = 4;
	public orbitYOffset = 1.85;
	public orbitMinRotX = 1;
	public orbitMaxRotX = 179;

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
			Airship.Characters.localCharacterManager.SetDefaultMovementEnabled(this.useDefaultMovement);

			//Camera
			//Toggle the core camera system
			Airship.Camera.SetEnabled(this.useAirshipCameraSystem);
			//Change to a new camera mode
			Airship.Camera.characterCameraMode = this.characterCameraMode;

			if (this.useAirshipCameraSystem) {
				//Allow clients to toggle their view model
				Airship.Camera.canToggleFirstPerson = this.allowFirstPersonToggle;
				if (this.startInFirstPerson && this.characterCameraMode === CharacterCameraMode.Fixed) {
					//Force first person view model
					Airship.Camera.SetFirstPerson(this.startInFirstPerson);
				}

				CameraConstants.UpdateDefaultFixedCameraConfig({
					xOffset: this.fixedXOffset,
					yOffset: this.fixedYOffset,
					zOffset: this.fixedZOffset,
					maxRotX: this.fixedMaxRotX,
					minRotX: this.fixedMinRotX,
					shouldOcclusionBump: CameraConstants.DefaultFixedCameraConfig.shouldOcclusionBump,
				});
				CameraConstants.UpdateDefaultOrbitCameraConfig({
					radius: this.orbitRadius,
					yOffset: this.orbitYOffset,
					maxRotX: this.orbitMaxRotX,
					minRotX: this.orbitMinRotX,
					shouldOcclusionBump: CameraConstants.DefaultOrbitCameraConfig.shouldOcclusionBump,
				});

				const activeCameraMode = Dependency<AirshipCameraSingleton>().activeCameraMode;
				if (activeCameraMode && activeCameraMode instanceof FixedCameraMode) {
					activeCameraMode.UpdateProperties(CameraConstants.DefaultFixedCameraConfig);
				}

				if (activeCameraMode && activeCameraMode instanceof OrbitCameraMode) {
					activeCameraMode.UpdateProperties(CameraConstants.DefaultOrbitCameraConfig);
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
				print("before entirt");
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
