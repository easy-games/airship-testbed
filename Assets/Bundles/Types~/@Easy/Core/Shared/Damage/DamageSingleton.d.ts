import { OnStart } from "../Flamework";
import { Signal } from "../Util/Signal";
import { CanClientDamageInfo } from "./CanClientDamageInfo";
import { DamageInfo, DamageInfoCustomData } from "./DamageInfo";
export declare class DamageSingleton implements OnStart {
    readonly onDamage: Signal<DamageInfo>;
    readonly onCanClientDamage: Signal<CanClientDamageInfo>;
    readonly onDeath: Signal<DamageInfo>;
    /**
     * If true, knockback will be applied using the "knockback" Vector3 property in data.
     * Knockback is only applied to Characters.
     *
     * @deprecated
     */
    applyKnockback: boolean;
    autoNetwork: boolean;
    private damageRemote;
    private deathRemote;
    constructor();
    OnStart(): void;
    /**
     *
     * @param gameObject If this GameObject has an attached NetworkObject, this damage signal will be replicated to the client.
     * @param damage
     * @param attacker
     * @param data
     */
    InflictDamage(gameObject: GameObject, damage: number, attacker?: GameObject, data?: DamageInfoCustomData): void;
    /**
     * Call this when a gameobject has died.
     * @param damageInfo
     */
    BroadcastDeath(damageInfo: DamageInfo): void;
    /**
     * Call on the client to check if an attacker can damage a gameobject.
     * @param gameObject
     * @param attacker
     * @param data
     * @returns
     */
    CanClientDamage(gameObject: GameObject, attacker: GameObject, data?: DamageInfoCustomData): boolean;
}
