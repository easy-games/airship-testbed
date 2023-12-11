import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Network } from "Shared/Network";
import { StatusEffectDto } from "Shared/StatusEffect/StatusEffectMeta";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

@Controller({})
export class StatusEffectController implements OnStart {
	/** Mapping of client to **currently active** status effects. */
	private statusEffectMap = new Map<number, StatusEffectDto[]>();

	OnStart(): void {
		Network.ServerToClient.StatusEffectSnapshot.Client.OnServerEvent((snapshot) => {
			this.HandleStatusEffectSnapshot(snapshot);
		});

		Network.ServerToClient.StatusEffectAdded.Client.OnServerEvent((clientId, statusEffectType, tier) => {
			this.HandleStatusEffectAdded(clientId, statusEffectType, tier);
		});
		Network.ServerToClient.StatusEffectRemoved.Client.OnServerEvent((clientId, statusEffectType) => {
			this.HandleStatusEffectRemoved(clientId, statusEffectType);
		});
	}

	/**
	 * Handles status effect added, updates `statusEffectMap` and fires `StatusEffectAdded`.
	 *
	 * @param clientId The client the status effect was added to.
	 * @param statusEffectType The status effect that was added.
	 * @param tier The tier of the status effect.
	 */
	private HandleStatusEffectAdded(clientId: number, statusEffectType: StatusEffectType, tier: number): void {
		const statusEffects = this.statusEffectMap.get(clientId);
		const statusEffectDto = { clientId: clientId, statusEffectType: statusEffectType, tier: tier };
		if (!statusEffects) {
			this.statusEffectMap.set(clientId, [statusEffectDto]);
		} else {
			statusEffects.push(statusEffectDto);
		}
		ClientSignals.StatusEffectAdded.Fire(clientId, statusEffectType, tier);
	}

	/**
	 * Handles status effect removed, updates `statusEffectMap` and fires `StatusEffectRemoved`.
	 *
	 * @param clientId The client the status effect was removed from.
	 * @param statusEffectType The status effect that was removed.
	 */
	private HandleStatusEffectRemoved(clientId: number, statusEffectType: StatusEffectType): void {
		const statusEffects = this.statusEffectMap.get(clientId);
		if (!statusEffects) return;
		const updatedStatusEffects = statusEffects.filter((effect) => effect.statusEffectType !== statusEffectType);
		this.statusEffectMap.set(clientId, updatedStatusEffects);
		ClientSignals.StatusEffectRemoved.Fire(clientId, statusEffectType);
	}

	/**
	 * Handles incoming status effect snapshot. Fires `StatusEffectAdded` for each status effect
	 * and constructs `statusEffectMap`.
	 *
	 * @param snapshot Full status effect snapshot.
	 */
	private HandleStatusEffectSnapshot(snapshot: StatusEffectDto[]): void {
		const statusEffectMapFromSnapshot = new Map<number, StatusEffectDto[]>();
		for (const statusEffect of snapshot) {
			const statusEffectsForClient = statusEffectMapFromSnapshot.get(statusEffect.clientId);
			if (!statusEffectsForClient) {
				statusEffectMapFromSnapshot.set(statusEffect.clientId, [statusEffect]);
			} else {
				statusEffectsForClient.push(statusEffect);
			}
			ClientSignals.StatusEffectAdded.Fire(
				statusEffect.clientId,
				statusEffect.statusEffectType,
				statusEffect.tier,
			);
		}
		this.statusEffectMap = statusEffectMapFromSnapshot;
	}
}
