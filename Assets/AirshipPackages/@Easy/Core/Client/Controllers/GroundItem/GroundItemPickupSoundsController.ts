import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

const PICKUP_ITEM_DEFAULT_SOUND = ["AirshipPackages/@Easy/Core/Sound/Pickup_Item.ogg"];

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
		// 		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/PickupItemLayer_Emerald");
		// 	} else if (itemMeta.itemType === ItemType.DIAMOND) {
		// 		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/PickupItemLayer_Diamond");
		// 	}
		// });
	}
}
