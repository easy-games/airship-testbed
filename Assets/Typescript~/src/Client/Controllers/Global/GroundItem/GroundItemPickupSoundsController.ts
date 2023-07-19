import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { ItemType } from "Shared/Item/ItemType";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { AudioManager } from "Shared/Audio/AudioManager";
import { ItemUtil } from "../../../../Shared/Item/ItemUtil";

const PICKUP_ITEM_DEFAULT_SOUND = ["Pickup_Item"];

@Controller({})
export class GroundItemPickupSoundsController implements OnStart {
	OnStart(): void {
		ClientSignals.EntityPickupItem.Connect((event) => {
			if (!event.entity.IsLocalCharacter()) return;

			const itemMeta = ItemUtil.GetItemMeta(event.itemType);
			const pickupSound = RandomUtil.FromArray(itemMeta.PickupSound ?? PICKUP_ITEM_DEFAULT_SOUND);
			AudioManager.PlayGlobal(pickupSound, {
				volumeScale: 0.6,
			});

			// Extra sound layers
			if (event.itemType === ItemType.EMERALD) {
				AudioManager.PlayGlobal("PickupItemLayer_Emerald");
			} else if (event.itemType === ItemType.DIAMOND) {
				AudioManager.PlayGlobal("PickupItemLayer_Diamond");
			}
		});
	}
}
