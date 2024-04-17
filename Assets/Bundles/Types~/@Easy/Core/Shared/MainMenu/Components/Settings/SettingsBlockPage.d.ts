/// <reference types="compiler-types" />
export default class SettingsBlockPage extends AirshipBehaviour {
    gameContent: RectTransform;
    blockedGamePrefab: GameObject;
    blockedUserPrefab: GameObject;
    userContent: RectTransform;
    OnEnable(): void;
    OnDisable(): void;
}
