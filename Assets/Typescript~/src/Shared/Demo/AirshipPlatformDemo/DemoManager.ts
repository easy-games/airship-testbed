import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public useTaggedSpawns = false;
	private deathCount = 0;
	public cleanupOnStart!: GameObject[];

	@Header("Network Ball")
	public ballPrefab!: GameObject;
	public ballSpawnPoint!: Transform;
	public cubePrefab!: GameObject;

	override Start(): void {
		ItemUtil.RegisterItem("sniper", {
			displayName: "Sniper",
			accessoryPaths: ["Shared/Resources/Items/Sniper.prefab"],
			holdConfig: {
				viewmodel: {
					idleAnim: ["Shared/Resources/Items/ScopedAKADSLoop.anim"],
				},
			},
		});

		Airship.input.CreateAction("interact", Binding.Key(Key.F));

		const p = Airship.input.CreateProximityPrompt("interact", undefined, {
			primaryText: "????",
			secondaryText: "Poke",
			maxRange: 10,
		});
		p.transform.position = new Vector3(0, 5, 0);

		ItemUtil.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			maxStackSize: 1,
			usable: {
				startUpInSeconds: 0,
				minChargeSeconds: 0,
				maxChargeSeconds: 0,
				cooldownSeconds: 0.25,
				canHoldToUse: false,
				onUseSound: [
					//"Shared/Resources/Sound/s_Sword_Swing_Wood_01.wav",
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
			Airship.chat.BroadcastMessage("test broadcast");
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

			// spawn ball
			task.spawn(() => {
				for (let i = 0; i < 3; i++) {
					const ballGo = Object.Instantiate<GameObject>(
						this.ballPrefab,
						this.ballSpawnPoint.position,
						this.ballSpawnPoint.rotation,
					);
					NetworkUtil.Spawn(ballGo);

					const cubeGo = Object.Instantiate<GameObject>(
						this.cubePrefab,
						ballGo.transform.position.add(new Vector3(0, 1, 0)),
						Quaternion.identity,
					);
					NetworkUtil.Spawn(cubeGo);
					cubeGo.GetComponent<NetworkObject>()!.SetParent(ballGo.GetComponent<NetworkObject>()!);
					task.wait(1);
				}
			});
		}
		if (Game.IsClient()) {
			// Optional: use locked camera mode for first person support
			// Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
			// Airship.characterCamera.SetFirstPerson(true);
			Airship.inventory.SetUIEnabled(false);

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

        // pen testing
        // const go = GameObject.Create("test");
        // go.transform.SetParent(PlayerManagerBridge.Instance.transform);
	}

	public SpawnPlayer(player: Player): void {
		// fun little experiment
		// if (this.useTaggedSpawns) {
		// 	const taggedSpawns = Airship.tags.GetTagged(Tags.AirshipTest_Spawn);
		// 	if (taggedSpawns.size() > 0) {
		// 		player.SpawnCharacter(RandomUtil.FromArray(taggedSpawns.map((v) => v.transform.position)));
		// 		return;
		// 	}
		// }
		const character = player.SpawnCharacter(this.spawnPosition.transform.position, {
			// customCharacterTemplate: AssetCache.LoadAsset("Shared/Resources/CharacterWithLight Variant.prefab"),
		});
		const collider = character.transform.Find("ProximityReceiver")?.GetComponent<Collider>();
		if (collider) {
			collider.isTrigger = false;
		}

		// const cubeGo = Object.Instantiate(this.cubePrefab);
		// NetworkUtil.Spawn(cubeGo);
		// cubeGo.GetComponent<NetworkObject>()!.SetParent(character.networkObject);
		// cubeGo.transform.localPosition = new Vector3(0, 1, 0);

		// character.inventory.AddItem(new ItemStack("WoodSword"));
	}
}
