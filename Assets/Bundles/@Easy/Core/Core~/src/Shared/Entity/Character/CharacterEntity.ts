import { Inventory } from "Shared/Inventory/Inventory";
import { Ability } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Entity, EntityDto } from "../Entity";
import { EntitySerializer } from "../EntitySerializer";

export interface CharacterEntityDto extends EntityDto {
	invId: number;
}

export class CharacterEntity extends Entity {
	private inventory: Inventory;

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

		this.bin.Add(
			this.inventory.slotChanged.Connect((slot, itemStack) => {
				this.CalcArmor();
			}),
		);
		this.CalcArmor();
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

	public Encode(): CharacterEntityDto {
		return {
			...super.Encode(),
			serializer: EntitySerializer.CHARACTER,
			invId: this.inventory.id,
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
			this.onArmorChanged.Fire(this.armor);
		}
	}

	public GetArmor(): number {
		return this.armor;
	}
}
