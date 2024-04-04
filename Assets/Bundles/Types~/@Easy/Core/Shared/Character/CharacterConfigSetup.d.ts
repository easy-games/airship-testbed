/// <reference types="compiler-types" />
export default class CharacterConfigSetup extends AirshipBehaviour {
    customCharacterPrefab?: GameObject;
    movementSpace: Space;
    useAirshipCameraSystem: boolean;
    startInFirstPerson: boolean;
    allowFirstPersonToggle: boolean;
    showInventory: boolean;
    showHealthbar: boolean;
    showBackpack: boolean;
    OnEnable(): void;
}
