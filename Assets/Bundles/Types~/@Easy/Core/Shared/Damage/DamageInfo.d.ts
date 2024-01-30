import { Cancellable } from "../Util/Cancellable";
export declare class DamageInfo extends Cancellable {
    gameObject: GameObject;
    damage: number;
    attacker: GameObject | undefined;
    data: DamageInfoCustomData;
    constructor(gameObject: GameObject, damage: number, attacker: GameObject | undefined, data: DamageInfoCustomData);
}
export type DamageInfoCustomData = {
    [key: string]: unknown;
};
