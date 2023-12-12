import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { Game } from "@Easy/Core/Shared/Game";
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

		// Handle clean up on player leave.
		CoreClientSignals.PlayerLeave.Connect((player) => {
			this.statusEffectMap.delete(player.clientId);
		});
	}

	/**
	 * Returns status effect object that corresponds to provided status effect type, if it exists.
	 *
	 * @param statusEffect The status effect type.
	 * @returns The status effect data transfer object, if it exists.
	 */
	public GetStatusEffectForLocalClient(statusEffect: StatusEffectType): StatusEffectDto | undefined {
		const statusEffects = this.statusEffectMap.get(Game.LocalPlayer.clientId);
		if (!statusEffects) return undefined;
		return statusEffects.find((effect) => effect.statusEffectType === statusEffect);
	}

	/**
	 * Returns status effect object that corresponds to provided status effect type, if it exists.
	 *
	 * @param clientId The client being queried.
	 * @param statusEffect The status effect type.
	 * @returns The status effect data transfer object, if it exists.
	 */
	public GetStatusEffectForClient(clientId: number, statusEffect: StatusEffectType): StatusEffectDto | undefined {
		const statusEffects = this.statusEffectMap.get(clientId);
		if (!statusEffects) return undefined;
		return statusEffects.find((effect) => effect.statusEffectType === statusEffect);
	}

	/**
	 * Returns all **currently active** status effects for local client. If local client has _no_
	 * status effects, empty array is returned.
	 *
	 * @returns All **currently active** status effects for local client.
	 */
	public GetAllStatusEffectsForLocalClient(): StatusEffectDto[] {
		return this.GetAllStatusEffectsForClient(Game.LocalPlayer.clientId);
	}

	/**
	 * Returns all **currently active** status effects for provided client. If client has _no_
	 * status effects, empty array is returned.
	 *
	 * @param clientId The client being queried.
	 * @returns All **currently active** status effects for client.
	 */
	public GetAllStatusEffectsForClient(clientId: number): StatusEffectDto[] {
		return this.statusEffectMap.get(clientId) ?? [];
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
