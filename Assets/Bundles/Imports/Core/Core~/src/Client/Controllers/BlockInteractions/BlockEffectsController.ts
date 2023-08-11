import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SignalPriority } from "Shared/Util/Signal";

@Controller({})
export class BlockEffectsController implements OnStart {
	private hitSoundDefault = ["Block_Stone_Hit_01", "Block_Stone_Hit_02"];
	private breakSoundDefault = ["Block_Stone_Break"];
	private placeSoundDefault = ["Block_Stone_Place_01", "Block_Stone_Place_02", "Block_Stone_Place_03"];

	OnStart(): void {
		ClientSignals.BlockPlace.Connect((event) => {
			print("block place event. placer:", event.placer?.GetDisplayName());

			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta?.block?.placeSound ?? this.placeSoundDefault),
				event.pos,
			);
		});

		ClientSignals.AfterBlockHit.Connect((event) => {
			if (event.entity?.IsLocalCharacter()) return;

			const itemType = ItemUtil.GetItemTypeFromBlockId(event.blockId);
			if (!itemType) return;

			const itemMeta = ItemUtil.GetItemMeta(itemType);
			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(itemMeta?.block?.hitSound ?? this.hitSoundDefault),
				event.pos,
			);
		});

		ClientSignals.BeforeBlockHit.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			if (!event.block.itemMeta) return;

			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta.block?.hitSound ?? this.hitSoundDefault),
				event.blockPos,
			);
		});
	}
}
