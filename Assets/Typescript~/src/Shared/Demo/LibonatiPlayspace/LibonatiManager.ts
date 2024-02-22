import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class LibonatiManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public outfitPath = "@Easy/Core/Shared/Resources/Accessories/AvatarItems/Blacksmith/BlacksmithSet.asset";

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnCharacter(player);
			});
			this.bin.Add(
				Airship.damage.onDeath.Connect((info) => {
					const character = info.gameObject.GetAirshipComponent<Character>();
					if (character?.player) {
						this.SpawnCharacter(character.player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			//Airship.characters.localCharacterManager.SetCharacterCameraMode(CharacterCameraMode.Locked);
			//Airship.characters.localCharacterManager.SetFirstPerson(true);
			Airship.loadingScreen.FinishLoading();
		}
	}

	public SpawnCharacter(player: Player): void {
		const char = player.SpawnCharacter(this.spawnPosition.transform.position);
		char.inventory?.AddItem(new ItemStack(ItemType.WOOD_SWORD, -1));
		char.accessoryBuilder.EquipAccessoryOutfit(
			AssetBridge.Instance.LoadAsset<AccessoryOutfit>(this.outfitPath),
			true,
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
