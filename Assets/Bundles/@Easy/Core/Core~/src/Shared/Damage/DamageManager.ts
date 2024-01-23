import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { RemoteEvent } from "Shared/Network/RemoteEvent";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { DamageInfo, DamageInfoCustomData } from "./DamageInfo";

@Service()
@Controller()
export class DamageManager implements OnStart {
	public onDamage = new Signal<DamageInfo>();

	private damageRemote = new RemoteEvent<
		[nobId: number, damage: number, attackerNobId: number | undefined, data: DamageInfoCustomData]
	>();

	constructor() {
		Airship.Damage = this;
	}

	OnStart(): void {
		this.damageRemote.client.OnServerEvent((nobId, damage, attackerNobId, data) => {
			const nob = NetworkUtil.GetNetworkObject(nobId);
			if (nob === undefined) return;

			let attackerNob: NetworkObject | undefined;
			if (attackerNobId !== undefined) {
				attackerNob = NetworkUtil.GetNetworkObject(attackerNobId);
			}

			this.InflictDamage(nob.gameObject, damage, attackerNob?.gameObject, data);
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
		this.onDamage.Fire(damageInfo);

		if (RunUtil.IsServer()) {
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
}
