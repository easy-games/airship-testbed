import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AbilityCooldown, AbilityCooldownDto, AbilityDto } from "Shared/Abilities/Ability";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Duration } from "Shared/Util/Duration";
import { TimeUtil } from "Shared/Util/TimeUtil";

@Controller({})
export class AbilityController implements OnStart {
	/** **All** of the local client's abilities. */
	private localAbilitySet = new Set<string>();
	/** Local client ability cooldown states. */
	private localCooldownMap = new Map<string, AbilityCooldown>();
	/** Local client ability enabled states. */
	private localStateMap = new Map<string, boolean>();
	/** Whether or not the local client is **currently** charging an ability. */
	private chargingAbility = false;

	constructor(private readonly abilityRegistry: AbilityRegistry) {}

	OnStart(): void {
		CoreClientSignals.LocalAbilityActivateRequest.Connect((event) => {
			if (this.LocalClientCanUseAbility(event.abilityId)) {
				CoreNetwork.ClientToServer.AbilityActivateRequest.client.FireServer(event.abilityId);
			}
		});

		CoreNetwork.ServerToClient.AbilityUsed.client.OnServerEvent((clientId, abilityId) => {
			CoreClientSignals.AbilityUsed.Fire({ clientId: clientId, abilityId: abilityId });
		});

		CoreNetwork.ServerToClient.AbilityAdded.client.OnServerEvent((clientId, abilityDto) => {
			if (clientId === Game.localPlayer.clientId) {
				this.AddAbilityToLocalClient(abilityDto);
			} else {
				CoreClientSignals.AbilityAdded.Fire({
					clientId: clientId,
					abilityId: abilityDto.abilityId,
				});
			}
		});

		CoreNetwork.ServerToClient.AbilityRemoved.client.OnServerEvent((clientId, abilityId) => {
			if (clientId === Game.localPlayer.clientId) {
				this.RemoveAbilityFromLocalClient(abilityId);
			} else {
				CoreClientSignals.AbilityRemoved.Fire({
					clientId: clientId,
					abilityId: abilityId,
				});
			}
		});

		CoreNetwork.ServerToClient.AbilityCooldownStateChange.client.OnServerEvent((abilityCooldownDto) => {
			this.SetLocalAbilityOnCooldown(abilityCooldownDto);
		});

		CoreNetwork.ServerToClient.AbilityStateChange.client.OnServerEvent((clientId, abilityId, enabled) => {
			if (clientId === Game.localPlayer.clientId) {
				this.SetLocalAbilityEnabledState(abilityId, enabled);
			} else {
				this.FireAbilityEnabledStateUpdateSignal(clientId, abilityId, enabled);
			}
		});

		CoreNetwork.ServerToClient.AbilityChargeStarted.client.OnServerEvent((clientId, chargingAbilityDto) => {
			if (clientId === Game.localPlayer.clientId) this.chargingAbility = true;
			CoreClientSignals.AbilityChargeStarted.Fire({
				clientId: clientId,
				chargingAbilityDto: chargingAbilityDto,
			});
		});

		CoreNetwork.ServerToClient.AbilityChargeEnded.client.OnServerEvent((clientId, chargingAbilityEndedDto) => {
			if (clientId === Game.localPlayer.clientId) this.chargingAbility = false;
			CoreClientSignals.AbilityChargeEnded.Fire({
				clientId: clientId,
				chargingAbilityDto: chargingAbilityEndedDto,
			});
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
		CoreClientSignals.AbilityAdded.Fire({
			clientId: Game.localPlayer.clientId,
			abilityId: abilityDto.abilityId,
		});
		if (abilityDto.enabled) {
			CoreClientSignals.AbilityEnabled.Fire({
				clientId: Game.localPlayer.clientId,
				abilityId: abilityDto.abilityId,
			});
		}
	}

	/**
	 * Removes the provided ability to the local client. Fires `AbilityRemoved` event.
	 *
	 * @param abilityId The ability being removed.
	 */
	private RemoveAbilityFromLocalClient(abilityId: string): void {
		this.localAbilitySet.delete(abilityId);
		this.localStateMap.delete(abilityId);
		CoreClientSignals.AbilityRemoved.Fire({
			clientId: Game.localPlayer.clientId,
			abilityId: abilityId,
		});
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
			length: Duration.FromSeconds(abilityCooldownDto.length),
		});
		return true;
	}

	/**
	 * Sets the local client's ability enabled state. Returns whether or not the enabled state was
	 * successfully applied.
	 *
	 * @param abilityId The ability that is being updated.
	 * @param enabled The new enabled state.
	 * @returns Whether or not the enabled state was successfully set.
	 */
	private SetLocalAbilityEnabledState(abilityId: string, enabled: boolean): boolean {
		if (!this.LocalClientHasAbility(abilityId)) return false;
		const currentEnabledState = this.localStateMap.get(abilityId);
		if (currentEnabledState === enabled) return false;
		this.localStateMap.set(abilityId, enabled);
		this.FireAbilityEnabledStateUpdateSignal(Game.localPlayer.clientId, abilityId, enabled);
		return true;
	}

	/**
	 * Fires either `AbilityEnabled` or `AbilityDisabled` signal based on updated ability
	 * state.
	 *
	 * @param clientId The client whose ability had a state update.
	 * @param abilityId The ability that had a state update.
	 * @param enabled The ability's new enabled state.
	 */
	private FireAbilityEnabledStateUpdateSignal(clientId: number, abilityId: string, enabled: boolean): void {
		if (enabled) {
			CoreClientSignals.AbilityEnabled.Fire({ clientId: clientId, abilityId: abilityId });
		} else {
			CoreClientSignals.AbilityDisabled.Fire({ clientId: clientId, abilityId: abilityId });
		}
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
			!this.chargingAbility &&
			Game.localPlayer.character !== undefined
		);
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
