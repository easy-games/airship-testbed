import { Airship } from "@Easy/Core/Shared/Airship";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Game } from "../Game";
import { NetworkSignal } from "../Network/NetworkSignal";
import { OnUpdate } from "../Util/Timer";
import { CanClientDamageInfo } from "./CanClientDamageInfo";
import { DamageInfo, DamageInfoCustomData } from "./DamageInfo";
import { HealInfo, HealInfoCustomData } from "./HealInfo";

@Singleton()
export class DamageSingleton {
	public readonly onDamage = new Signal<DamageInfo>();
	public readonly onCanClientDamage = new Signal<CanClientDamageInfo>();
	public readonly onDeath = new Signal<DamageInfo>();
	public readonly onHeal = new Signal<HealInfo>();

	public autoNetwork = true;

	private damageRemote = new NetworkSignal<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>("DamageRemote");

	private deathRemote = new NetworkSignal<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>("DeathRemote");

	private healRemote = new NetworkSignal<
		[nobId: number, healAmount: number, data: HealInfoCustomData]>("HealRemote");

	constructor() {
		Airship.Damage = this;
	}

	protected OnStart(): void {
		OnUpdate.Connect(() => {});

		this.damageRemote.client.OnServerEvent((nobId, damage, attackerNobId, data) => {
			if (Game.IsHosting()) return;
			const nob = NetworkUtil.GetNetworkIdentity(nobId);
			if (nob === undefined) return;

			let attackerNob: NetworkIdentity | undefined;
			if (attackerNobId !== undefined) {
				attackerNob = NetworkUtil.GetNetworkIdentity(attackerNobId);
			}

			const damageInfo = new DamageInfo(nob.gameObject, damage, attackerNob?.gameObject, data ?? {});
			this.onDamage.Fire(damageInfo);
		});

		this.deathRemote.client.OnServerEvent((nobId, damage, attackerNobId, data) => {
			if (Game.IsHosting()) return;

			const nob = NetworkUtil.GetNetworkIdentity(nobId);
			if (nob === undefined) return;

			let attackerNob: NetworkIdentity | undefined;
			if (attackerNobId !== undefined) {
				attackerNob = NetworkUtil.GetNetworkIdentity(attackerNobId);
			}

			const damageInfo = new DamageInfo(nob.gameObject, damage, attackerNob?.gameObject, data);
			this.BroadcastDeath(damageInfo);
		});

		this.healRemote.client.OnServerEvent((nobId, healAmount, data) => {
			if (Game.IsHosting()) return;
			const nob = NetworkUtil.GetNetworkIdentity(nobId);
			if (nob === undefined) return;
			const healInfo = new HealInfo(nob.gameObject, healAmount, data);
			this.onHeal.Fire(healInfo);
		});
	}

	/**
	 *
	 * @param gameObject If this GameObject has an attached NetworkObject, this damage signal will be replicated to the client.
	 * @param damage
	 * @param attacker
	 * @param data
	 */
	public InflictDamage(
		gameObject: GameObject,
		damage: number,
		attacker?: GameObject,
		data?: DamageInfoCustomData,
	): DamageInfo {
		assert(damage >= 0, "Unable to InflictDamage with a negative damage amount.");
		assert(Game.IsServer(), "InflictDamage: Should only be called on the server.");

		const damageInfo = new DamageInfo(gameObject, damage, attacker, data ?? {});
		if (damageInfo.character === undefined || damageInfo.character.IsDead()) return damageInfo;
		this.onDamage.Fire(damageInfo);
		if (damageInfo.IsCancelled()) return damageInfo;
		
		if (Game.IsServer() && this.autoNetwork) {
			const nob = damageInfo.gameObject.GetComponentInParent<NetworkIdentity>();
			const attackerNob = damageInfo.attacker?.GetComponentInParent<NetworkIdentity>();
			if (nob) {
				this.damageRemote.server.FireAllClients(
					nob.netId,
					damageInfo.damage,
					attackerNob?.netId,
					damageInfo.data,
				);
			}
		}
		
		if (damageInfo.character && damageInfo.character.GetHealth() <= 0 && Game.IsServer()) {
			this.BroadcastDeath(damageInfo);
		}
		
		return damageInfo;
	}

	/**
	 * 
	 * @param gameObject If this GameObject has an attached NetworkObject, this heal signal will be replicated to the client.
	 * @param healAmount 
	 * @param data 
	 */
	public Heal(gameObject: GameObject, healAmount: number, data?: HealInfoCustomData) {
		assert(healAmount >= 0, "Unable to Heal with a negative heal amount.");
		assert(Game.IsServer(), "Heal: Should only be called on the server.");

		const healInfo = new HealInfo(gameObject, healAmount, data ?? {});
		if (healInfo.character === undefined || healInfo.character.IsDead()) return healInfo;
		this.onHeal.Fire(healInfo);
		if (healInfo.IsCancelled()) return healInfo;

		// Clamp the heal amount to return if player is max health after the event.
		healInfo.healAmount = math.clamp(healInfo.healAmount, 0, healInfo.character.GetMaxHealth() - healInfo.character.GetHealth());

		if (Game.IsServer() && this.autoNetwork) {
			const nob = healInfo.gameObject.GetComponentInParent<NetworkIdentity>();
			if (nob) {
				this.healRemote.server.FireAllClients(nob.netId, healInfo.healAmount, healInfo.data);
			}
		}

		return healInfo;
	}

	/**
	 * Call this when a gameobject has died.
	 * @param damageInfo
	 */
	public BroadcastDeath(damageInfo: DamageInfo): void {
		this.onDeath.Fire(damageInfo);
		if (Game.IsServer() && this.autoNetwork) {
			const nob = damageInfo.gameObject.GetComponentInParent<NetworkIdentity>();
			const attackerNob = damageInfo.attacker?.GetComponentInParent<NetworkIdentity>();
			if (nob) {
				this.deathRemote.server.FireAllClients(
					nob.netId,
					damageInfo.damage,
					attackerNob?.netId,
					damageInfo.data,
				);
			}
		}
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
