import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { RemoteEvent } from "Shared/Network/RemoteEvent";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import { CanClientDamageInfo } from "./CanClientDamageInfo";
import { DamageInfo, DamageInfoCustomData } from "./DamageInfo";

@Service()
@Controller()
export class DamageSingleton implements OnStart {
	public readonly onDamage = new Signal<DamageInfo>();
	public readonly onCanClientDamage = new Signal<CanClientDamageInfo>();
	public readonly onDeath = new Signal<DamageInfo>();

	/**
	 * If true, knockback will be applied using the "knockback" Vector3 property in data.
	 * Knockback is only applied to Characters.
	 */
	public applyKnockback = true;

	public autoNetwork = true;

	private damageRemote = new RemoteEvent<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>();

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

		this.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
			print("damageInfo data: " + inspect(damageInfo.data));
			if (RunUtil.IsServer() && this.applyKnockback && damageInfo.data["knockback"]) {
				const knockback = damageInfo.data["knockback"] as Vector3;
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
				if (character) {
					print("applying knockback to character: " + knockback);
					character.movement.ApplyImpulse(knockback);
				}
			}
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
		print("inflicting damage on " + gameObject.name);
		const damageInfo = new DamageInfo(gameObject, damage, attacker, data ?? {});
		this.onDamage.Fire(damageInfo);

		if (RunUtil.IsServer() && this.autoNetwork) {
			const nob = damageInfo.gameObject.GetComponent<NetworkObject>() as NetworkObject | undefined;
			const attackerNob = damageInfo.attacker?.GetComponent<NetworkObject>() as NetworkObject | undefined;
			if (nob) {
				this.damageRemote.server.FireAllClients(
					nob.ObjectId,
					damageInfo.damage,
					attackerNob?.ObjectId,
					damageInfo.data,
				);
			}
		}
	}

	public BroadcastDeath(damageInfo: DamageInfo): void {
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
