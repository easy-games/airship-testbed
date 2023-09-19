/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { Projectile } from "../../../../Shared/Projectile/Projectile";
import { DamageService } from "../DamageService";
import { BlockInteractService } from "../../Block/BlockInteractService";
export declare class ProjectileService implements OnStart {
    private readonly damageService;
    private readonly blockService;
    constructor(damageService: DamageService, blockService: BlockInteractService);
    private projectilesById;
    OnStart(): void;
    HandleCollision(projectile: Projectile, collider: Collider, hitPoint: Vector3, normal: Vector3, velocity: Vector3): boolean;
    GetProjectileById(projectileId: number): Projectile | undefined;
}
