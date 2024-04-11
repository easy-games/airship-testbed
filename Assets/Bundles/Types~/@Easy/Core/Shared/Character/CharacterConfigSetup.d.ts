/// <reference types="compiler-types" />
export default class CharacterConfigSetup extends AirshipBehaviour {
    customCharacterPrefab?: GameObject;
    movementSpace: Space;
    enableJumping: boolean;
    enableSprinting: boolean;
    enableCrouching: boolean;
    useAirshipCameraSystem: boolean;
    startInFirstPerson: boolean;
    allowFirstPersonToggle: boolean;
    showChat: boolean;
    showHealthbar: boolean;
    showInventoryHotbar: boolean;
    showInventoryBackpack: boolean;
    OnEnable(): void;
}
