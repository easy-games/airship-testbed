import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { BlockArchetype, ItemMeta } from "Shared/Item/ItemMeta";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { CoreSound } from "Shared/Sound/CoreSound";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SignalPriority } from "Shared/Util/Signal";

const coreSoundPath = "@Easy/Core/Shared/Resources/Sound/";

const maxDistance = 50;

@Controller()
export class BlockEffectsController implements OnStart {
	OnStart(): void {
		CoreClientSignals.BlockPlace.Connect((event) => {
			if (event.isGroupEvent || event.block.IsAir()) {
				return;
			}
			if (event.block.blockId === "@Easy/Core:CHILD_OF_BLOCK") return;
			let sound = event.block.itemMeta?.block?.placeSound;
			if (sound === undefined) {
				switch (event.block.itemMeta?.block?.blockArchetype) {
					case BlockArchetype.STONE:
						sound = CoreSound.blockPlaceStone;
						break;
					case BlockArchetype.WOOD:
						sound = CoreSound.blockPlaceWood;
						break;
					case BlockArchetype.FABRIC:
						sound = CoreSound.blockPlaceWool;
						break;
					default:
						sound = CoreSound.blockPlaceGeneric;
						break;
				}
			}
			AudioManager.PlayAtPosition(RandomUtil.FromArray(sound), event.pos, {
				volumeScale: event.placer?.IsLocalCharacter() ? 1 : 0.5,
				maxDistance,
			});
		});

		CoreClientSignals.AfterBlockHit.Connect((event) => {
			const itemType = ItemUtil.GetItemTypeFromBlockId(event.blockId);
			let itemMeta: ItemMeta | undefined;
			if (itemType) {
				itemMeta = ItemUtil.GetItemMeta(itemType);
			}

			let sound: string[] | undefined;
			if (event.broken) {
				sound = itemMeta?.block?.breakSound;
				if (sound === undefined) {
					switch (itemMeta?.block?.blockArchetype) {
						case BlockArchetype.STONE:
							sound = CoreSound.blockBreakStone;
							break;
						case BlockArchetype.WOOD:
							sound = CoreSound.blockBreakWood;
							break;
						case BlockArchetype.FABRIC:
							sound = CoreSound.blockBreakWool;
							break;
						default:
							sound = CoreSound.blockBreakGeneric;
							break;
					}
				}
			} else {
				// sound will be played in BeforeBlockHit for local player
				if (event.entity?.IsLocalCharacter()) return;

				sound = itemMeta?.block?.hitSound;
				if (sound === undefined) {
					switch (itemMeta?.block?.blockArchetype) {
						case BlockArchetype.STONE:
							sound = CoreSound.blockHitStone;
							break;
						case BlockArchetype.WOOD:
							sound = CoreSound.blockHitWood;
							break;
						case BlockArchetype.FABRIC:
							sound = CoreSound.blockHitWool;
							break;
						default:
							sound = CoreSound.blockHitGeneric;
							break;
					}
				}
			}

			AudioManager.PlayAtPosition(RandomUtil.FromArray(sound), event.pos, {
				volumeScale: 0.5,
				maxDistance,
			});
		});

		CoreClientSignals.BeforeBlockHit.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			let sound = event.block.itemMeta?.block?.hitSound;
			if (sound === undefined) {
				switch (event.block.itemMeta?.block?.blockArchetype) {
					case BlockArchetype.STONE:
						sound = CoreSound.blockHitStone;
						break;
					case BlockArchetype.WOOD:
						sound = CoreSound.blockHitWood;
						break;
					case BlockArchetype.FABRIC:
						sound = CoreSound.blockHitWool;
						break;
					default:
						sound = CoreSound.blockHitGeneric;
						break;
				}
			}
			AudioManager.PlayAtPosition(RandomUtil.FromArray(sound), event.blockPos, {
				maxDistance,
			});
		});
	}
}
