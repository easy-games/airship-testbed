import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public useTaggedSpawns = false;
	private deathCount = 0;
	public cleanupOnStart!: GameObject[];
	public TestSound!: AudioClip;

	public spawnCharacter = false;

	private bin = new Bin();

	override Start(): void {
		// task.spawn(() => {
		// 	while (task.wait(1)) {
		// 		AudioManager.PlayClipGlobal(this.TestSound);
		// 	}
		// })

		Airship.input.CreateAction("interact", Binding.Key(Key.F));

		ItemUtil.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			maxStackSize: 1,
			accessoryPaths: ["Assets/Resources/Accessories/Weapons/Swords/WoodSword/wood_sword.prefab"],
			image: "Assets/Resources/ItemRenders/wood_sword.png",
		});

		if (Game.IsServer()) {
			this.bin.Add(
				Airship.players.ObservePlayers((player) => {
					this.SpawnPlayer(player);
				}),
			);
			this.bin.Add(
				Airship.damage.onDeath.Connect((damageInfo) => {
					const character = damageInfo.gameObject.GetAirshipComponent<Character>();
					if (character?.player) {
						// task.delay(2, () => {
						this.SpawnPlayer(character.player!);
						// });
					}
				}),
			);
		}
		if (Game.IsClient()) {
			// Optional: use locked camera mode for first person support
			Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
			Airship.characterCamera.SetFirstPerson(false);
			// Airship.inventory.SetUIEnabled(false);

			Airship.loadingScreen.FinishLoading();

			// Display local player deaths
			this.bin.Add(
				Game.localPlayer.ObserveCharacter((character) => {
					if (!character) return;

					const bin = new Bin();
					bin.Add(
						character?.onDeath.Connect(() => {
							this.deathCount++;
							SteamRichPresence.SetStatus(`Deaths: ${this.deathCount}`);
						}),
					);
					return () => {
						bin.Clean();
					};
				}),
			);
		}

		// cleanup
		for (let go of this.cleanupOnStart) {
			Object.Destroy(go);
		}
	}

	public override Update(dt: number): void {
		Airship.characters.GetCharacters().forEach((character) => {
			if (character.transform.position.y < -25) {
				character.Teleport(this.spawnPosition.transform.position);
			}
		});
	}

	public SpawnPlayer(player: Player): void {
		if (!this.spawnCharacter) return;

		print("[demo] spawning player");
		const character = player.SpawnCharacter(this.spawnPosition.transform.position, {
			lookDirection: this.spawnPosition.transform.forward,
			// customCharacterTemplate: AssetCache.LoadAsset("Shared/Resources/CharacterWithLight Variant.prefab"),
		});

		character.inventory.AddItem(new ItemStack("WoodSword"));

		// for (let i = 0; i < 10; i++) {
		// 	Airship.chat.BroadcastMessage("Hello " + i);
		// }
	}

	public OnDestroy(): void {
		this.bin.Clean();
	}
}
