import { Cancellable } from "../Util/Cancellable";
import { DamageInfoCustomData } from "./DamageInfo";
export declare class CanClientDamageInfo extends Cancellable {
    gameObject: GameObject;
    attacker: GameObject;
    data: DamageInfoCustomData;
    constructor(gameObject: GameObject, attacker: GameObject, data: DamageInfoCustomData);
}
