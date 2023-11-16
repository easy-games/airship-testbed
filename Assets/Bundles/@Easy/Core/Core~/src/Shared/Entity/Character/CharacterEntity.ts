import { Inventory } from "Shared/Inventory/Inventory";
import { Entity, EntityDto } from "../Entity";
import { EntitySerializer } from "../EntitySerializer";
import { CharacterAbilities } from "Shared/Abilities/CharacterAbilities";
import { AbilityDto } from "Shared/Abilities/Ability";
import { Ability } from "Shared/Strollers/Abilities/AbilityRegistry";

export interface CharacterEntityDto extends EntityDto {
	invId: number;
	abilities: AbilityDto[];
}

export class CharacterEntity extends Entity {
	private inventory: Inventory;
	private abilities: CharacterAbilities;

	private armor = 0;

	constructor(
		id: number,
		networkObject: NetworkObject,
		clientId: number | undefined,
		inventory: Inventory,
		abilities?: readonly Ability[],
	) {
		super(id, networkObject, clientId);
		this.inventory = inventory;
		this.abilities = new CharacterAbilities(this);

		this.bin.Add(
			this.inventory.SlotChanged.Connect((slot, itemStack) => {
				this.CalcArmor();
			}),
		);
		this.CalcArmor();

		if (abilities) {
			for (const ability of abilities) {
				this.abilities.AddAbilityWithId(ability.id, ability, ability.config);
			}
		}
	}

	public IsMoving() {
		switch (this.GetState()) {
			case EntityState.Idle:
			case EntityState.Crouching:
				break;
		}
	}

	public GetInventory(): Inventory {
		return this.inventory;
	}

	public GetAbilities() {
		return this.abilities;
	}

	public Encode(): CharacterEntityDto {
		return {
			...super.Encode(),
			serializer: EntitySerializer.CHARACTER,
			invId: this.inventory.Id,
			abilities: this.abilities.Encode(),
		};
	}

	private CalcArmor(): void {
		let armor = 0;
		for (let i = 0; i < this.inventory.GetMaxSlots(); i++) {
			const itemStack = this.inventory.GetItem(i);
			if (i >= 45) {
				const itemMeta = itemStack?.GetMeta();
				if (itemMeta?.armor) {
					armor += itemMeta.armor.protectionAmount;
				}
			}
		}
		if (armor !== this.armor) {
			this.armor = armor;
			this.OnArmorChanged.Fire(this.armor);
		}
	}

	public GetArmor(): number {
		return this.armor;
	}
}
