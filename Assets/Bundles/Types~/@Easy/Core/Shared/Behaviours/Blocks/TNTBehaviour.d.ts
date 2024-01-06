/// <reference types="@easy-games/compiler-types" />
export default class TntBehaviour extends AirshipBehaviour {
    renderModelOnServer: boolean;
    secondsToDetonate: number;
    private rigidBody;
    private blockMeshObject?;
    Awake(): void;
    LightFuse(): void;
    Detonate(): void;
}
