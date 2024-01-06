/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
export default class ProjectileHitBehaviour extends AirshipBehaviour {
    knockbackOnHit: boolean;
    knockbackModifier: Vector3;
    knockbackForce: number;
    ProjectileHit(direction: Vector3): void;
}
