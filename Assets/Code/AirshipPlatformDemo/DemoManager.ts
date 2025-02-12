import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Asset } from "@Easy/Core/Shared/Asset";

import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { Network } from "Code/Network";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public useTaggedSpawns = false;
	private deathCount = 0;
	public cleanupOnStart!: GameObject[];
	public TestSound!: AudioClip;
	public testUserIds: string[] = [];
	public testCharacterBuilders: AccessoryBuilder[] = [];
	public joystickContainer: RectTransform;

	public spawnCharacter = false;

	private bin = new Bin();
	private lookDir = new Vector3(-1, 0.5, 1);
	private npcCharacter: Character;

	override Start(): void {
		if (Game.IsEditor()) {
			Airship.Menu.AddLeaveMatchButton("Back to Lobby", () => {
				Game.localPlayer.SendMessage(ChatColor.Green("Teleporting back to the Lobby..."));
			});
		}

		Airship.Settings.AddSlider("Background Music", 1, 0, 2);
		Airship.Settings.ObserveSlider("Background Music", (val) => {
			print("music: " + val);
		});
		Airship.Settings.AddToggle("Potato Graphics Mode", false);
		Airship.Settings.ObserveToggle("Potato Graphics Mode", (val) => {
			print("potato mode: " + val);
		});
		Airship.Settings.AddSpacer();
		Airship.Settings.AddToggle("Secret Toggle", false);

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
		for (let i = 0; i < this.testUserIds.size(); i++) {
			let builder = this.testCharacterBuilders[i];
			let userId = this.testUserIds[i];
			if (builder && userId !== "") {
				Airship.Avatar.LoadOutfitByUserId(userId, builder, {
					removeOldClothingAccessories: true,
				});
			}
		}

		Airship.Input.CreateAction("interact", Binding.Key(Key.F));

		Airship.Inventory.RegisterItem("WoodSword", {
			displayName: "Wood Sword",
			maxStackSize: 1,
			accessoryPaths: ["Assets/Resources/Prefabs/WoodSword.prefab"],
			// image: "Assets/Resources/ItemRenders/wood_sword.png",
		});
		Airship.Characters.ObserveCharacters((c) => {
			c.inventory.AddItem(new ItemStack("WoodSword"));
		});

		this.HideAccessoriesWhileEmoting();

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
						task.delay(6, () => {
							//this.SpawnPlayer(character.player!);
						});
					}
				}),
			);

			// this.npcCharacter = Airship.Characters.SpawnNonPlayerCharacter(this.spawnPosition.transform.position);

			this.bin.Add(
				Network.ClientToServer.TestServer.server.OnClientEvent((player, value) => {
					this.TestServer(player.character);
				}),
			);
		}
		if (Game.IsClient()) {
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

			this.bin.Add(
				Keyboard.OnKeyDown(Key.O, (event) => {
					if (event.uiProcessed) return;

					const cube = Object.Instantiate(Asset.LoadAsset("Assets/Resources/OfflineCube.prefab"));
					cube.transform.position = Game.localPlayer.character!.rig.head.position.add(new Vector3(0, 1, 0));
					const rb = cube.gameObject.GetComponent<Rigidbody>()!;
					rb.velocity = Game.localPlayer
						.character!.movement!.GetLookVector()
						.add(new Vector3(0, 1, 0))
						.mul(5);
				}),
			);

			this.bin.Add(
				Keyboard.OnKeyDown(Key.R, (event) => {
					if (event.uiProcessed) return;
					// Game.localPlayer.character?.movement.SetLookVector(this.lookDir);
					// this.lookDir = Quaternion.AngleAxis(90, Vector3.up).mul(this.lookDir);
					print("Going to test server");
					Network.ClientToServer.TestServer.client.FireServer(true);
				}),
			);
		}

		// cleanup
		for (let go of this.cleanupOnStart) {
			Object.Destroy(go);
		}
	}

	private HideAccessoriesWhileEmoting(): void {
		Airship.Characters.ObserveCharacters((character) => {
			const emoteBin = new Bin();
			character.onEmoteStart.Connect((e) => {
				const renderers = character.accessoryBuilder.GetActiveAccessoryBySlot(
					AccessorySlot.RightHand,
				).renderers;
				for (let r of renderers) {
					const prevEnabled = r.enabled;
					r.enabled = false;
					emoteBin.Add(() => {
						if (r) {
							r.enabled = prevEnabled;
						}
					});
				}
			});
			character.onEmoteEnd.Connect(() => {
				emoteBin.Clean();
			});
		});
	}

	private TestServer(character: Character | undefined) {
		//Runs on the server when the client presses R
		print("Test Server");
		if (character) {
			print("Testing from character: " + character.id);
			character.Teleport(new Vector3(0, 10, 0), Vector3.forward);
		}
	}

	private testDirFlip = 1;
	private testImpulseForce = 8;
	public override Update(dt: number): void {
		// if (Game.IsServer() || this.npcCharacter?.networkIdentity?.isOwned) {
		// 	const xAnchor = this.spawnPosition.transform.position.x;
		// 	if (
		// 		(this.testDirFlip > 0 && this.npcCharacter.transform.position.x > xAnchor + 5) ||
		// 		(this.testDirFlip < 0 && this.npcCharacter.transform.position.x < xAnchor - 5)
		// 	) {
		// 		this.testDirFlip *= -1;
		// 	}
		// 	let dir = new Vector3(this.testDirFlip, 0, 0);
		// 	let time = Time.time * 0.4;
		// 	//FORCE TEST
		// 	// if (math.random() > 1 - Time.deltaTime) {
		// 	// 	this.npcCharacter.movement.AddImpulse(
		// 	// 		new Vector3(
		// 	// 			math.random() * this.testImpulseForce * 2 - this.testImpulseForce,
		// 	// 			math.lerp(0, this.testImpulseForce * 2, math.random()),
		// 	// 			math.random() * this.testImpulseForce * 2 - this.testImpulseForce,
		// 	// 		),
		// 	// 	);
		// 	// }
		// 	//MOVE TEST
		// 	this.npcCharacter.movement.SetMoveInput(
		// 		dir,
		// 		false, //math.random() > 1 - Time.deltaTime * 2,
		// 		math.sin(time) > 0.2,
		// 		math.cos(time) < 0.2,
		// 		true,
		// 	);
		// }
	}

	public SpawnPlayer(player: Player): void {
		if (!this.spawnCharacter) return;

		// print("[demo] spawning player");
		// const character = player.SpawnCharacter(this.spawnPosition.transform.position, {
		// 	lookDirection: this.spawnPosition.transform.forward,
		// 	// customCharacterTemplate: Asset.LoadAsset("Shared/Resources/CharacterWithLight Variant.prefab"),
		// });

		// character.inventory.AddItem(new ItemStack("WoodSword"));

		// for (let i = 0; i < 10; i++) {
		// 	Airship.chat.BroadcastMessage("Hello " + i);
		// }
	}

	public OnDestroy(): void {
		this.bin.Clean();
	}
}
