import { Airship } from "../Airship";
import { AirshipCameraSingleton } from "../Camera/AirshipCameraSingleton";
import { CameraConstants } from "../Camera/CameraConstants";
import { FixedCameraMode } from "../Camera/DefaultCameraModes/FixedCameraMode";
import { OrbitCameraMode } from "../Camera/DefaultCameraModes/OrbitCameraMode";
import { Dependency } from "../Flamework";
import { Game } from "../Game";
import { CoreAction } from "../Input/AirshipCoreAction";
import { Binding } from "../Input/Binding";
import { InputKeybindCategory } from "../Input/InputAction";
import { CoreMobileButton } from "../Input/Mobile/MobileButton";
import Inventory from "../Inventory/Inventory";
import { InventoryHotbarAction } from "../Inventory/InventoryHotbarAction";
import { InventoryUIVisibility } from "../Inventory/InventoryUIVisibility";
import { CharacterCameraMode } from "./LocalCharacter/CharacterCameraMode";

let hasRun = false;

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
	public fixedXOffset = 0.75;
	public fixedYOffset = 1.7;
	public fixedZOffset = 2.5;
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
		if (Game.IsClient() && Airship.Characters.GetDefaultCharacterTemplate()?.GetAirshipComponents<Inventory>() !== undefined)
		{
			this.CreateHotbarActions();
		}
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
		if (Game.IsClient()) {
			if (hasRun) {
				error(
					"Tried to run CharacterConfigSetup twice. You should only have one instance of CharacterConfigSetup in your scene. This script is running on gameobject " +
						this.gameObject.name,
				);
			}
			hasRun = true;

			// Movement
			// Control how client inputs are recieved by the movement system
			Airship.Characters.localCharacterManager.SetDefaultMovementEnabled(this.useDefaultMovement);

			// Camera
			// Toggle the core camera system
			Airship.Camera.SetEnabled(this.useAirshipCameraSystem);

			// Change to a new camera mode
			Airship.Camera.characterCameraMode = this.characterCameraMode;

			if (this.useAirshipCameraSystem) {
				// Allow clients to toggle their view model
				Airship.Camera.canToggleFirstPerson = this.allowFirstPersonToggle;
				if (this.startInFirstPerson && this.characterCameraMode === CharacterCameraMode.Fixed) {
					// Force first person view model
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
					characterLocked: false,
				});

				const activeCameraMode = Dependency<AirshipCameraSingleton>().activeCameraMode;
				if (activeCameraMode && activeCameraMode instanceof FixedCameraMode) {
					activeCameraMode.UpdateProperties(CameraConstants.DefaultFixedCameraConfig);
				}

				if (activeCameraMode && activeCameraMode instanceof OrbitCameraMode) {
					activeCameraMode.UpdateProperties(CameraConstants.DefaultOrbitCameraConfig);
				}

				// Camera FOV
				Airship.Camera.SetSprintFOVEnabled(this.useSprintFOV);
				Airship.Camera.SetSprintFOVMultiplier(this.sprintFOVMultiplier);
			}

			// UI visual toggles
			Airship.Chat.SetUIEnabled(this.showChat);
			Airship.Inventory.SetUIVisibility(this.inventoryVisibility);
		}

		// Stop any input for some movement options we don't use
		if (!this.enableJumping || !this.enableCrouching || !this.enableSprinting) {
			// Listen to input event
			Airship.Characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
				// Force the event off if we don't want that feature
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
				Airship.Input.HideMobileButtons(CoreMobileButton.Jump);
			}

			if (!this.enableCrouching) {
				Airship.Input.HideMobileButtons(CoreMobileButton.CrouchToggle);
			}
		}
	}

	/** Sets up keybinds for hotbar slots if the character prefab has an inventory */
	private CreateHotbarActions(): void {
		const hotbarActions = [
			{ name: CoreAction.Inventory, binding: Binding.Key(Key.E), category: InputKeybindCategory.Actions },
			{
				name: InventoryHotbarAction.HotbarSlot1,
				binding: Binding.Key(Key.Digit1),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot2,
				binding: Binding.Key(Key.Digit2),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot3,
				binding: Binding.Key(Key.Digit3),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot4,
				binding: Binding.Key(Key.Digit4),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot5,
				binding: Binding.Key(Key.Digit5),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot6,
				binding: Binding.Key(Key.Digit6),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot7,
				binding: Binding.Key(Key.Digit7),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot8,
				binding: Binding.Key(Key.Digit8),
				category: InputKeybindCategory.Hotbar,
			},
			{
				name: InventoryHotbarAction.HotbarSlot9,
				binding: Binding.Key(Key.Digit9),
				category: InputKeybindCategory.Hotbar,
			},
		];
		Airship.Input.CreateActions(hotbarActions);
	}
}
