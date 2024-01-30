import Character from "../Character/Character";
export declare class DamageUtils {
    static readonly minDamageFallSpeed = 35;
    static readonly maxDamageFallSpeed = 60;
    static readonly minFallDamage = 10;
    static readonly maxFallDamage = 100;
    static readonly maxHitstunDamage = 50;
    static readonly minHitStunRadius = 0.08;
    static readonly maxHitStunRadius = 0.1;
    static GetFallDamage(verticalSpeed: number): number;
    static GetFallDelta(verticalSpeed: number): number;
    static AddHitstun(character: Character, damageAmount: number, OnComplete: () => void): number;
    private static GetStunDuration;
    static AddAttackStun(character: Character, damageDealt: number, disableMovement: boolean, vfx: GameObject[] | undefined): void;
}
