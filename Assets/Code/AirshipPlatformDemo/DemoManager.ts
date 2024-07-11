import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
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

		// const a: CharacterMovement = undefined!;
		// a.OnAdjustMove()
		
		// Tween.ValueFloat(this.gameObject, 1, 1, (a: unknown, b: unknown) => {
		// 	print("Obj a: " + a);
		// 	print("Obj b: " + b);
		// });

		Airship.Input.CreateAction("interact", Binding.Key(Key.F));

		Airship.Inventory.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			maxStackSize: 1,
			accessoryPaths: ["Assets/Resources/Accessories/Weapons/Swords/WoodSword/wood_sword.prefab"],
			image: "Assets/Resources/ItemRenders/wood_sword.png",
		});

		if (Game.IsServer()) {
			this.bin.Add(
				Airship.Players.ObservePlayers((player) => {
					this.SpawnPlayer(player);
				}),
			);
			this.bin.Add(
				Airship.Damage.onDeath.Connect((damageInfo) => {
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
			Airship.CharacterCamera.SetCharacterCameraMode(CharacterCameraMode.Orbit);
			// Airship.CharacterCamera.SetFirstPerson(false);
			// Airship.inventory.SetUIEnabled(false);

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

			const keyboard = new Keyboard();
			keyboard.OnKeyDown(Key.O, (event) => {
				if (event.uiProcessed) return;

				const cube = Object.Instantiate(AssetCache.LoadAsset("Assets/Resources/OfflineCube.prefab"));
				cube.transform.position = Game.localPlayer.character!.rig.head.position.add(new Vector3(0, 1, 0));
				const rb = cube.gameObject.GetComponent<Rigidbody>()!;
				rb.velocity = Game.localPlayer.character!.movement.GetLookVector().add(new Vector3(0, 1, 0)).mul(5);
			});
		}

		// cleanup
		for (let go of this.cleanupOnStart) {
			Object.Destroy(go);
		}
	}

	public override Update(dt: number): void {
		Airship.Characters.GetCharacters().forEach((character) => {
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
