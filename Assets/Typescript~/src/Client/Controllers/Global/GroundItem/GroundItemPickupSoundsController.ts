import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SoundUtil } from "Shared/Util/SoundUtil";

const PICKUP_ITEM_DEFAULT_SOUND = ["Pickup_Item"];

@Controller({})
export class GroundItemPickupSoundsController implements OnStart {
	OnStart(): void {
		ClientSignals.EntityPickupItem.Connect((event) => {
			if (!event.entity.IsLocalCharacter()) return;

			const itemMeta = GetItemMeta(event.itemType);
			const pickupSound = RandomUtil.FromArray(itemMeta.PickupSound ?? PICKUP_ITEM_DEFAULT_SOUND);
			SoundUtil.PlayGlobal(pickupSound, {
				volumeScale: 0.6,
			});

			// Extra sound layers
			if (event.itemType === ItemType.EMERALD) {
				SoundUtil.PlayGlobal("PickupItemLayer_Emerald");
			} else if (event.itemType === ItemType.DIAMOND) {
				SoundUtil.PlayGlobal("PickupItemLayer_Diamond");
			}
		});
	}
}
