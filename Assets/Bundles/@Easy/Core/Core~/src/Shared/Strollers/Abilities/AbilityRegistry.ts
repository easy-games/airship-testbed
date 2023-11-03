import { Controller, Modding, OnStart, Service } from "@easy-games/flamework-core";
import { Ability } from "Shared/Abilities/Ability";
import { AbilitySlot } from "Shared/Abilities/AbilitySlot";

export enum AbilityId {}

export interface AbilityConfig {
	/**
	 * The slot for this ability
	 *
	 * This will bind appropriate bindings on a per-platform basis depending on the slot
	 *
	 * Order:
	 * - Primary (Q, E, R, T)
	 * - Secondary (Q, E, R, T)
	 * - Utility (Z, X, C, V)
	 *
	 * @see {@link AbilitySlot} for more details
	 */
	readonly Slot: AbilitySlot;
	/**
	 * The priority of this ability, will change whether or not this ability
	 */
	readonly Priority?: number;
	/**
	 * The icon for this ability
	 */
	readonly Image?: string;
	/**
	 * The name of this ability
	 */
	readonly Name: string;
}

type AbilityConstructor = new (id: AbilityId, configuration: AbilityConfig) => Ability;

@Service()
@Controller()
export class AbilityRegistry implements OnStart {
	private abilties = new Map<AbilityId, Ability>();

	public RegisterAbility(logicHandler: AbilityConstructor, id: AbilityId, configuration: AbilityConfig): Ability {
		const logic = new logicHandler(id, configuration); // allows DI
		return logic;
	}

	public OnStart(): void {
		print("Loaded ability registry for", RunCore.IsServer() ? "SERVER" : "CLIENT");
	}
}
