import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AbilityCooldownDto, AbilityDto } from "Shared/Abilities/Ability";
import { AbilityCooldown } from "Shared/Abilities/CharacterAbilities";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Duration } from "Shared/Util/Duration";
import { TimeUtil } from "Shared/Util/TimeUtil";

@Controller({})
export class AbilityController implements OnStart {
	/** **All** of the local user's abilities. */
	private localAbilitySet = new Set<string>();
	/** Local user ability cooldown states. */
	private localCooldownMap = new Map<string, AbilityCooldown>();
	/** Local user ability enabled states. */
	private localStateMap = new Map<string, boolean>();

	constructor(private readonly abilityRegistry: AbilityRegistry) {}

	OnStart(): void {
		CoreNetwork.ServerToClient.AbilityAddedNew.Client.OnServerEvent((clientId, abilityDto) => {
			if (clientId === Game.LocalPlayer.clientId) {
				this.AddAbilityToLocalClient(abilityDto);
			} else {
				CoreClientSignals.AbilityAddedNew.Fire({
					clientId: clientId,
					abilityId: abilityDto.abilityId,
				});
			}
		});

		CoreNetwork.ServerToClient.AbilityRemovedNew.Client.OnServerEvent((clientId, abilityId) => {
			if (clientId === Game.LocalPlayer.clientId) {
				this.RemoveAbilityFromLocalClient(abilityId);
			} else {
				CoreClientSignals.AbilityRemovedNew.Fire({
					clientId: clientId,
					abilityId: abilityId,
				});
			}
		});

		CoreClientSignals.LocalAbilityActivateRequest.Connect((event) => {
			if (this.LocalClientCanUseAbility(event.abilityId)) {
				print(`Local client is sending ability request: ${event.abilityId}`);
				CoreNetwork.ClientToServer.AbilityActivateRequest.Client.FireServer(event.abilityId);
			}
		});

		CoreNetwork.ServerToClient.AbilityUsedNew.Client.OnServerEvent((clientId, abilityId) => {
			CoreClientSignals.AbilityUsedNew.Fire({ clientId: clientId, abilityId: abilityId });
			print(`Ability was used: ${abilityId} by: ${clientId}`);
		});

		CoreNetwork.ServerToClient.AbilityCooldownStateChangeNew.Client.OnServerEvent((abilityCooldownDto) => {
			this.SetLocalAbilityOnCooldown(abilityCooldownDto);
		});
	}

	/**
	 * Adds the provided ability to the local client. Fires `AbilityAdded` event. _If_ the ability is enabled,
	 * this also fires the `AbilityEnabled` event.
	 *
	 * @param abilityDto The ability's data transfer object representation.
	 */
	private AddAbilityToLocalClient(abilityDto: AbilityDto): void {
		this.localAbilitySet.add(abilityDto.abilityId);
		this.localStateMap.set(abilityDto.abilityId, abilityDto.enabled);
		CoreClientSignals.AbilityAddedNew.Fire({
			clientId: Game.LocalPlayer.clientId,
			abilityId: abilityDto.abilityId,
		});
		if (abilityDto.enabled) {
			CoreClientSignals.AbilityEnabled.Fire({
				clientId: Game.LocalPlayer.clientId,
				abilityId: abilityDto.abilityId,
			});
		}
	}

	/**
	 * Removes the provided ability to the local client. Fires `AbilityRemoved` event
	 * @param abilityId The ability being removed.
	 */
	private RemoveAbilityFromLocalClient(abilityId: string): void {
		this.localAbilitySet.delete(abilityId);
		this.localStateMap.delete(abilityId);
		CoreClientSignals.AbilityRemovedNew.Fire({
			clientId: Game.LocalPlayer.clientId,
			abilityId: abilityId,
		});
	}

	/**
	 * Returns whether or not the provided ability is _currently_ usable by the local client. An ability
	 * is usable if it is **not** disabled, **not** on cooldown, and an entity **currently** belongs to
	 * the local client.
	 *
	 * @param abilityId The ability that is being queried.
	 * @returns Whether or not the provided ability is _currently_ usable by the local client.
	 */
	public LocalClientCanUseAbility(abilityId: string): boolean {
		if (!this.LocalClientHasAbility(abilityId)) return false;
		return (
			!this.IsLocalAbilityDisabled(abilityId) &&
			!this.IsLocalAbilityOnCooldown(abilityId) &&
			Game.LocalPlayer.character !== undefined
		);
	}

	/**
	 * Sets the local client's ability on cooldown for the provided duration. Returns whether or not the cooldown was
	 * successfully applied.
	 *
	 * @param abilityCooldownDto The ability cooldown data transfer object representation.
	 * @returns Whether or not the cooldown was successfully applied.
	 */
	private SetLocalAbilityOnCooldown(abilityCooldownDto: AbilityCooldownDto): boolean {
		if (!this.LocalClientHasAbility(abilityCooldownDto.abilityId)) return false;
		this.localCooldownMap.set(abilityCooldownDto.abilityId, {
			startTimestamp: abilityCooldownDto.timeStart,
			endTimestamp: abilityCooldownDto.timeEnd,
			length: Duration.fromSeconds(abilityCooldownDto.length),
		});
		return true;
	}

	/**
	 * Returns whether or not the provided ability is on cooldown for local client. If the client does
	 * **not** have the provided ability, this function returns `false`.
	 *
	 * @param abilityId The ability that is being queried for cooldown.
	 * @returns Whether or not the provided ability on cooldown for local client.
	 */
	public IsLocalAbilityOnCooldown(abilityId: string): boolean {
		const abilityMeta = this.abilityRegistry.GetAbilityById(abilityId);
		if (!abilityMeta) return false;
		if (abilityMeta.config.cooldownTimeSeconds === undefined) return false;
		if (!this.LocalClientHasAbility(abilityId)) return false;
		const localCooldown = this.localCooldownMap.get(abilityId);
		if (!localCooldown) return false;
		const now = TimeUtil.GetServerTime();
		return localCooldown.endTimestamp > now;
	}

	/**
	 * Returns whether or not the provided ability is disabled for local client. If the client does
	 * **not** have the provided ability, this function returns `true`.
	 *
	 * @param abilityId The ability that is being queried for enabled state.
	 * @returns Whether or not the provided ability is disabled for local client.
	 */
	public IsLocalAbilityDisabled(abilityId: string): boolean {
		if (!this.LocalClientHasAbility(abilityId)) return true;
		const abilityState = this.localStateMap.get(abilityId);
		if (abilityState === undefined) return true;
		return abilityState === false;
	}

	/**
	 * Returns whether or not the local client has the provided abiltiy.
	 * @param abilityId The ability that is being queried.
	 * @returns Whether or not the local client has the provided ability.
	 */
	public LocalClientHasAbility(abilityId: string): boolean {
		return this.localAbilitySet.has(abilityId);
	}
}
