import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SignalPriority } from "Shared/Util/Signal";

const coreSoundPath = "Imports/Core/Shared/Resources/Sound/";

@Controller()
export class BlockEffectsController implements OnStart {
	private hitSoundDefault = [coreSoundPath + "Block_Stone_Hit_01", coreSoundPath + "Block_Stone_Hit_02"];
	private breakSoundDefault = [coreSoundPath + "Block_Stone_Break"];
	private placeSoundDefault = [
		coreSoundPath + "Block_Stone_Place_01",
		coreSoundPath + "Block_Stone_Place_02",
		coreSoundPath + "Block_Stone_Place_03",
	];

	OnStart(): void {
		CoreClientSignals.BlockPlace.Connect((event) => {
			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta?.block?.placeSound ?? this.placeSoundDefault),
				event.pos,
			);
		});

		CoreClientSignals.AfterBlockHit.Connect((event) => {
			if (event.entity?.IsLocalCharacter()) return;

			const itemType = ItemUtil.GetItemTypeFromBlockId(event.blockId);
			let itemMeta: ItemMeta | undefined;
			if (itemType) {
				itemMeta = ItemUtil.GetItemMeta(itemType);
			}
			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(itemMeta?.block?.hitSound ?? this.hitSoundDefault),
				event.pos,
			);
		});

		CoreClientSignals.BeforeBlockHit.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			AudioManager.PlayAtPosition(
				RandomUtil.FromArray(event.block.itemMeta?.block?.hitSound ?? this.hitSoundDefault),
				event.blockPos,
			);
		});
	}
}
