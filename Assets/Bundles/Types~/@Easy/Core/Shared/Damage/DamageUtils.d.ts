import { Entity } from "../Entity/Entity";
export declare class DamageUtils {
    static readonly MinDamageFallSpeed = 35;
    static readonly MaxDamageFallSpeed = 60;
    static readonly MinFallDamage = 10;
    static readonly MaxFallDamage = 100;
    static readonly MaxHitstunDamage = 50;
    static readonly MinHitStunRadius = 0.08;
    static readonly MaxHitStunRadius = 0.1;
    static GetFallDamage(verticalSpeed: number): number;
    static GetFallDelta(verticalSpeed: number): number;
    static AddHitstun(entity: Entity, damageAmount: number, OnComplete: () => void): number;
    private static GetStunDuration;
    static AddAttackStun(entity: Entity, damageDealt: number, disableMovement: boolean, vfx: GameObject[] | undefined): void;
}
