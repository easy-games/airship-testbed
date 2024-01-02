import { OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";
import { SignalPriority } from "Shared/Util/Signal";
import { SetInterval } from "Shared/Util/Timer";

interface DamageCredit {
	creditToEntityId: number;
	time: number;
}

@Service({})
export class KillCreditService implements OnStart {
	private entityIdToDamageCreditMap = new Map<number, DamageCredit>();
	private expireTime = 4;
	private damageTypes = new Set<DamageType>([DamageType.VOID, DamageType.FALL]);

	OnStart(): void {
		CoreServerSignals.EntityDamage.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			if (event.fromEntity) {
				this.entityIdToDamageCreditMap.set(event.entity.Id, {
					creditToEntityId: event.fromEntity.Id,
					time: os.clock(),
				});
			}
		});

		CoreServerSignals.EntityDeath.ConnectWithPriority(SignalPriority.HIGHEST, (event) => {
			if (this.damageTypes.has(event.damageEvent.damageType) && event.killer === undefined) {
				const credit = this.entityIdToDamageCreditMap.get(event.entity.Id);
				if (credit) {
					const killerEntity = Entity.FindById(credit.creditToEntityId);
					if (killerEntity) {
						event.killer = killerEntity;
					}
				}
			}
		});

		// Expire old entries
		SetInterval(2, () => {
			const toRemove = new Array<number>();
			for (const key of Object.keys(this.entityIdToDamageCreditMap)) {
				const credit = this.entityIdToDamageCreditMap.get(key)!;
				if (os.clock() - credit.time > this.expireTime) {
					toRemove.push(key);
				}
			}
			for (const id of toRemove) {
				this.entityIdToDamageCreditMap.delete(id);
			}
		});
	}
}
