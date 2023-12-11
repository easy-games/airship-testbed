import { OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { MatchService } from "Server/Services/Match/MatchService";
import { Network } from "Shared/Network";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectDto } from "Shared/StatusEffect/StatusEffectMeta";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

@Service({})
export class StatusEffectService implements OnStart {
	/** Mapping of client to **currently active** status effects. */
	private statusEffectMap = new Map<number, StatusEffectDto[]>();

	constructor(private readonly matchService: MatchService) {}

	OnStart(): void {
		// If a player joins _after_ the match has started, send over a full
		// status effect snapshot.
		ServerSignals.PlayerJoin.Connect((event) => {
			if (!this.matchService.IsRunning()) return;
			Network.ServerToClient.StatusEffectSnapshot.Server.FireClient(
				event.player.clientId,
				this.EncodeStatusEffects(),
			);
		});
		// Handle clean up on player leave.
		ServerSignals.PlayerLeave.Connect((event) => {
			this.statusEffectMap.delete(event.player.clientId);
		});
	}

	/**
	 * Adds provided status effect to client, if request is valid. Returns whether or not the status effect was
	 * successfully given to client. If the `tier` argument is greater than the `maxTier` property
	 * specified in the status effect's meta, `false` is returned.
	 *
	 * @param clientId The client who is receiving the status effect.
	 * @param statusEffect The status effect to give to client.
	 * @param tier The tier of the status effect.
	 * @returns Whether or not the status effect was successfully added to client.
	 */
	public AddStatusEffectToClient(clientId: number, statusEffect: StatusEffectType, tier: number): boolean {
		const statusEffectMeta = GetStatusEffectMeta(statusEffect);
		if (tier > statusEffectMeta.maxTier) return false;

		const statusEffects = this.statusEffectMap.get(clientId);
		const statusEffectDto = { clientId: clientId, statusEffectType: statusEffect, tier: tier };
		if (!statusEffects) {
			this.statusEffectMap.set(clientId, [statusEffectDto]);
		} else {
			const existingStatusEffect = this.GetStatusEffectForClient(clientId, statusEffect);
			if (existingStatusEffect) this.RemoveStatusEffectFromClient(clientId, statusEffect);
			statusEffects.push(statusEffectDto);
		}
		Network.ServerToClient.StatusEffectAdded.Server.FireAllClients(clientId, statusEffect, tier);
		ServerSignals.StatusEffectAdded.Fire(clientId, statusEffect, tier);
		return true;
	}

	/**
	 * Removes provided status effect from client, if request is valid. Returns whether or not
	 * the status effect was successfully removed. If the client did not have the status effect,
	 * `false` is returned.
	 *
	 * @param clientId The client the status effect is being removed from.
	 * @param statusEffect The status effect being removed.
	 * @returns Whether or not the status effect was successfully removed.
	 */
	public RemoveStatusEffectFromClient(clientId: number, statusEffect: StatusEffectType): boolean {
		const statusEffects = this.statusEffectMap.get(clientId);
		if (!statusEffects) return false;
		const existingStatusEffect = this.GetStatusEffectForClient(clientId, statusEffect);
		if (!existingStatusEffect) return false;
		const updatedStatusEffects = statusEffects.filter((effect) => effect.statusEffectType !== statusEffect);
		this.statusEffectMap.set(clientId, updatedStatusEffects);
		Network.ServerToClient.StatusEffectRemoved.Server.FireAllClients(clientId, statusEffect);
		ServerSignals.StatusEffectRemoved.Fire(clientId, statusEffect);
		return true;
	}

	/**
	 * Returns status effect data transfer object that corresponds to provided status effect type, if it exists.
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
	 * Returns flattened array of *all* active status effects for this
	 * match.
	 *
	 * @returns Flat array of **all** active status effects.
	 */
	private EncodeStatusEffects(): StatusEffectDto[] {
		const allStatusEffects = ObjectUtils.values(this.statusEffectMap);
		const flatStatusEffects: StatusEffectDto[] = [];
		for (const statusEffectsForClient of allStatusEffects) {
			for (const statusEffect of statusEffectsForClient) {
				flatStatusEffects.push(statusEffect);
			}
		}
		return flatStatusEffects;
	}
}
