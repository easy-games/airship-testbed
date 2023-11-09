import { Entity } from "../Entity/Entity";
export declare class DamageUtils {
    static readonly minDamageFallSpeed = 35;
    static readonly maxDamageFallSpeed = 60;
    static readonly minFallDamage = 10;
    static readonly maxFallDamage = 50;
    static readonly maxHitstunDamage = 50;
    static readonly minHitStunRadius = 0.08;
    static readonly maxHitStunRadius = 0.15;
    static GetFallDamage(verticalSpeed: number): number;
    static GetFallDelta(verticalSpeed: number): number;
    static AddHitstun(entity: Entity, damageAmount: number, OnComplete: () => void): number;
    private static GetStunDuration;
    static AddAttackStun(entity: Entity, damageDealt: number): void;
}
