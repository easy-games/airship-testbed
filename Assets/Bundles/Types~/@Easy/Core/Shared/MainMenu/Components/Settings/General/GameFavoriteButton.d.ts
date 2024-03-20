/// <reference types="compiler-types" />
export default class GameFavoriteButton extends AirshipBehaviour {
    image: Image;
    text: TMP_Text;
    startPrefab: GameObject;
    particleCount: number;
    particleVelBase: Vector3;
    particleVelRandomized: Vector3;
    particleDrag: number;
    private bin;
    private favorited;
    private favoriteCount;
    private rectTransform;
    Awake(): void;
    Start(): void;
    private SpawnParticle;
    OnDestroy(): void;
}
