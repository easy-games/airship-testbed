import { Airship } from "@Easy/Core/Shared/Airship";
import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { CanClientDamageInfo } from "./CanClientDamageInfo";
import { DamageInfo, DamageInfoCustomData } from "./DamageInfo";

@Singleton()
export class DamageSingleton implements OnStart {
	public readonly onDamage = new Signal<DamageInfo>();
	public readonly onCanClientDamage = new Signal<CanClientDamageInfo>();
	public readonly onDeath = new Signal<DamageInfo>();

	/**
	 * If true, knockback will be applied using the "knockback" Vector3 property in data.
	 * Knockback is only applied to Characters.
	 *
	 * @deprecated
	 */
	public applyKnockback = true;

	public autoNetwork = true;

	private damageRemote = new RemoteEvent<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>("DamageRemote");

	private deathRemote = new RemoteEvent<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>("DeathRemote");

	constructor() {
		Airship.damage = this;
	}

	OnStart(): void {
		this.damageRemote.client.OnServerEvent((nobId, damage, attackerNobId, data) => {
			if (RunUtil.IsHosting()) return;
			const nob = NetworkUtil.GetNetworkObject(nobId);
			if (nob === undefined) return;

			let attackerNob: NetworkObject | undefined;
			if (attackerNobId !== undefined) {
				attackerNob = NetworkUtil.GetNetworkObject(attackerNobId);
			}

			this.InflictDamage(nob.gameObject, damage, attackerNob?.gameObject, data);
		});

		this.deathRemote.client.OnServerEvent((nobId, damage, attackerNobId, data) => {
			if (RunUtil.IsHosting()) return;

			const nob = NetworkUtil.GetNetworkObject(nobId);
			if (nob === undefined) return;

			let attackerNob: NetworkObject | undefined;
			if (attackerNobId !== undefined) {
				attackerNob = NetworkUtil.GetNetworkObject(attackerNobId);
			}

			const damageInfo = new DamageInfo(nob.gameObject, damage, attackerNob?.gameObject, data);
			this.BroadcastDeath(damageInfo);
		});
	}

	/**
	 *
	 * @param gameObject If this GameObject has an attached NetworkObject, this damage signal will be replicated to the client.
	 * @param damage
	 * @param attacker
	 * @param data
	 */
	public InflictDamage(gameObject: GameObject, damage: number, attacker?: GameObject, data?: DamageInfoCustomData) {
		const damageInfo = new DamageInfo(gameObject, damage, attacker, data ?? {});
		if (RunUtil.IsServer() && this.autoNetwork) {
			const nob = damageInfo.gameObject.GetComponent<NetworkObject>();
			const attackerNob = damageInfo.attacker?.GetComponent<NetworkObject>();
			if (nob) {
				this.damageRemote.server.FireAllClients(
					nob.ObjectId,
					damageInfo.damage,
					attackerNob?.ObjectId,
					damageInfo.data,
				);
			}
		}
		this.onDamage.Fire(damageInfo);
	}

	/**
	 * Call this when a gameobject has died.
	 * @param damageInfo
	 */
	public BroadcastDeath(damageInfo: DamageInfo): void {
		if (RunUtil.IsServer() && this.autoNetwork) {
			const nob = damageInfo.gameObject.GetComponent<NetworkObject>();
			const attackerNob = damageInfo.attacker?.GetComponent<NetworkObject>();
			if (nob) {
				this.deathRemote.server.FireAllClients(
					nob.ObjectId,
					damageInfo.damage,
					attackerNob?.ObjectId,
					damageInfo.data,
				);
			}
		}
		this.onDeath.Fire(damageInfo);
	}

	/**
	 * Call on the client to check if an attacker can damage a gameobject.
	 * @param gameObject
	 * @param attacker
	 * @param data
	 * @returns
	 */
	public CanClientDamage(gameObject: GameObject, attacker: GameObject, data?: DamageInfoCustomData): boolean {
		const canClientDamageInfo = new CanClientDamageInfo(gameObject, attacker, data ?? {});
		this.onCanClientDamage.Fire(canClientDamageInfo);
		return !canClientDamageInfo.IsCancelled();
	}
}
