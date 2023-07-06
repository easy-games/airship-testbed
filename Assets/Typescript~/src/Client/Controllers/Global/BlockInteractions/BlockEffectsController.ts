import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { GetItemMeta, GetItemTypeFromBlockId } from "Shared/Item/ItemDefinitions";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { SoundUtil } from "Shared/Util/SoundUtil";

@Controller({})
export class BlockEffectsController implements OnStart {
	private hitSoundDefault = ["Block_Stone_Hit_01", "Block_Stone_Hit_02"];
	private breakSoundDefault = ["Block_Stone_Break"];
	private placeSoundDefault = ["Block_Stone_Place_01", "Block_Stone_Place_02", "Block_Stone_Place_03"];

	OnStart(): void {
		ClientSignals.BlockPlace.Connect((event) => {
			if (!event.placer) return;

			SoundUtil.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta?.block?.placeSound ?? this.placeSoundDefault),
				event.pos,
			);
		});

		ClientSignals.AfterBlockHit.Connect((event) => {
			if (event.entity?.IsLocalCharacter()) return;

			const itemType = GetItemTypeFromBlockId(event.blockId);
			if (!itemType) return;

			const itemMeta = GetItemMeta(itemType);
			SoundUtil.PlayAtPosition(
				RandomUtil.FromArray(itemMeta?.block?.hitSound ?? this.hitSoundDefault),
				event.pos,
			);
		});

		ClientSignals.BeforeBlockHit.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			if (!event.block.itemMeta) return;

			SoundUtil.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta.block?.hitSound ?? this.hitSoundDefault),
				event.blockPos,
			);
		});
	}
}
