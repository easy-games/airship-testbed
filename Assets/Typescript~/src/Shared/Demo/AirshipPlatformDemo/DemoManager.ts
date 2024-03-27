import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Tags } from "Shared/Tags";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public useTaggedSpawns = false;
	private deathCount = 0;

	public cleanupOnStart!: GameObject[];

	override Start(): void {
		ItemUtil.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			usable: {
				startUpInSeconds: 0,
				minChargeSeconds: 0,
				maxChargeSeconds: 0,
				cooldownSeconds: 0.25,
				canHoldToUse: false,
				onUseSound: [
					"Shared/Resources/Sound/s_Sword_Swing_Wood_01.wav",
					"Shared/Resources/Sound/s_Sword_Swing_Wood_02.wav",
					"Shared/Resources/Sound/s_Sword_Swing_Wood_03.wav",
					"Shared/Resources/Sound/s_Sword_Swing_Wood_04.wav",
				],
				onUseSoundVolume: 0.3,
			},
			accessoryPaths: ["Shared/Resources/Accessories/Weapons/Swords/WoodSword/wood_sword.prefab"],
			image: "Shared/Resources/ItemRenders/wood_sword.png",
			melee: {
				instantDamage: true,
				// hitDelay: 0.1345,
				onHitPrefabPath: "Shared/Resources/Yos/Prefab/SwordHitVFX.prefab",
				onUseVFX: [
					"Shared/Resources/Yos/Prefab/SwordSwingVFX01.prefab",
					"Shared/Resources/Yos/Prefab/SwordSwingVFX02.prefab",
				],
				onUseVFX_FP: [
					"Shared/Resources/Yos/Prefab/SwordSwingVFX_FP01.prefab",
					"Shared/Resources/Yos/Prefab/SwordSwingVFX_FP02.prefab",
				],
				canHitMultipleTargets: false,
				damageType: DamageType.SWORD,
				damage: 18,
			},
		});

		if (Game.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			Airship.damage.onDeath.Connect((damageInfo) => {
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
				if (character?.player) {
					task.delay(2, () => {
						this.SpawnPlayer(character.player!);
					});
				}
			});
		}
		if (Game.IsClient()) {
			// Optional: use locked camera mode for first person support
			// Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
			// Airship.characterCamera.SetFirstPerson(true);

			Airship.loadingScreen.FinishLoading();

			// Display local player deaths
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
			});
		}

		// cleanup
		for (let go of this.cleanupOnStart) {
			Object.Destroy(go);
		}
	}

	public SpawnPlayer(player: Player): void {
		// fun little experiment
		if (this.useTaggedSpawns) {
			const taggedSpawns = Airship.tags.GetTagged(Tags.AirshipTest_Spawn);
			if (taggedSpawns.size() > 0) {
				player.SpawnCharacter(RandomUtil.FromArray(taggedSpawns.map((v) => v.transform.position)));
				return;
			}
		}

		const character = player.SpawnCharacter(this.spawnPosition.transform.position);
		character.inventory.AddItem(new ItemStack("WoodSword"));
	}
}
