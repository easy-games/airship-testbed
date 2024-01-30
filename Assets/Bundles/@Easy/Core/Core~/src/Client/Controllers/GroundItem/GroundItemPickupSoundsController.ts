import { Controller, OnStart } from "@easy-games/flamework-core";

const PICKUP_ITEM_DEFAULT_SOUND = ["@Easy/Core/Shared/Resources/Sound/Pickup_Item.ogg"];

@Controller({})
export class GroundItemPickupSoundsController implements OnStart {
	OnStart(): void {
		// CoreClientSignals.EntityPickupItem.Connect((event) => {
		// 	if (!event.entity.IsLocalCharacter()) return;
		// 	const itemMeta = ItemUtil.GetItemDef(event.groundItem.itemStack.GetItemType());
		// 	const pickupSound = RandomUtil.FromArray(itemMeta.pickupSound ?? PICKUP_ITEM_DEFAULT_SOUND);
		// 	AudioManager.PlayGlobal(pickupSound, {
		// 		volumeScale: 0.6,
		// 	});
		// 	// Extra sound layers
		// 	if (itemMeta.itemType === ItemType.EMERALD) {
		// 		AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/PickupItemLayer_Emerald");
		// 	} else if (itemMeta.itemType === ItemType.DIAMOND) {
		// 		AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/PickupItemLayer_Diamond");
		// 	}
		// });
	}
}
