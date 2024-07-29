import { Airship } from "@Easy/Core/Shared/Airship";
import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { CoreContext } from "../CoreClientContext";
import { Game } from "../Game";
import { Viewmodel } from "../Viewmodel/Viewmodel";
import Character from "./Character";
import { CharacterDto } from "./CharacterDto";
import { AirshipCharacterFootstepsSingleton } from "./Footstep/AirshipCharacterFootstepsSingleton";
import { LocalCharacterSingleton } from "./LocalCharacter/LocalCharacterSingleton";

const characterPrefab = AssetCache.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Character/AirshipCharacter.prefab");

/**
 * Access using {@link Airship.Characters}. Characters singleton provides utilities for working with the {@link Character}
 * object.
 *
 * To control your game's default character see {@link CharacterConfigSetup}.
 */
@Singleton()
export class AirshipCharactersSingleton {
	private characters = new Set<Character>();

	public onCharacterSpawned = new Signal<Character>();
	public onCharacterDespawned = new Signal<Character>();

	private pendingCharacterDtos = new Map<number, CharacterDto>();

	/**
	 * If true, when a player disconnects their character will automatically be despawned.
	 */
	public autoDespawnCharactersOnPlayerDisconnect = true;

	public allowMidGameOutfitChanges = true;

	/**
	 * Default: true.
	 *
	 * If true, this enables Proximity Voice Chat. The AudioSource is parented to Character and is configured as 3D.
	 *
	 * If false, VoiceChatAudioSource will be parented to the Player instead of Character. AudioSource is configured as 2D.
	 */
	public autoParentVoiceChatAudioSourceToCharacter = true;

	/** If true, a character viewmodel will be instantiated as a child of the ViewmodelCamera */
	public instantiateViewmodel = true;
	public viewmodel?: Viewmodel;
	/**
	 * Fires before view model updates with position and rotation. Change these values to adjust view model position.
	 *
	 * Transform is the Spine Transform.
	 */
	public onViewModelUpdate = new Signal<[viewmodelTransform: Transform]>();

	private idCounter = 0;
	private customCharacterTemplate?: GameObject;
	private customViewmodelTemplate?: GameObject;

	constructor(
		public readonly localCharacterManager: LocalCharacterSingleton,
		public readonly footsteps: AirshipCharacterFootstepsSingleton,
	) {
		Airship.Characters = this;
	}

	protected OnStart(): void {
		if (Game.coreContext === CoreContext.MAIN_MENU) return;
		if (Game.IsClient() && !Game.IsServer()) {
			// Because the same character can come through `RequestCharacters` and `Character.Spawn`,
			// simply enqueue the DTOs and process them sequentially.
			task.spawn(() => {
				const dtos = CoreNetwork.ClientToServer.Character.RequestCharacters.client.FireServer();
				for (const dto of dtos) {
					this.pendingCharacterDtos.set(dto.id, dto);
				}
			});

			CoreNetwork.ServerToClient.Character.Spawn.client.OnServerEvent((dto) => {
				this.pendingCharacterDtos.set(dto.id, dto);
			});

			task.spawn(() => {
				while (true) {
					task.unscaledWait(0.05);
					for (const [_cid, dto] of this.pendingCharacterDtos) {
						this.InitCharacter(dto);
					}
					// Flush the queue.
					this.pendingCharacterDtos.clear();
				}
			});
		}

		if (Game.IsClient()) {
			CoreNetwork.ServerToClient.Character.ChangeOutfit.client.OnServerEvent((characterId, outfitDto) => {
				const character = this.FindById(characterId);
				if (!character) return;

				if (outfitDto) {
					Airship.Avatar.LoadUserOutfit(outfitDto, character.accessoryBuilder, {
						removeOldClothingAccessories: true,
					});
				}
			});
		}

		if (Game.IsServer()) {
			CoreNetwork.ClientToServer.Character.RequestCharacters.server.SetCallback(() => {
				const characters: CharacterDto[] = [];
				for (const character of this.characters) {
					characters.push({
						id: character.id,
						netId: character.networkIdentity.netId,
						ownerClientId: character.player?.connectionId,
						outfitDto: character.outfitDto,
					});
				}
				return characters;
			});

			// Auto disconnect
			Airship.Players.onPlayerDisconnected.Connect((player) => {
				if (!this.autoDespawnCharactersOnPlayerDisconnect) return;
				player.character?.Despawn();
			});
		}

		Airship.Characters.ObserveCharacters((character) => {
			character.onDeath.ConnectWithPriority(SignalPriority.MONITOR, () => {
				if (Game.IsServer()) {
					character.Despawn();
				}
			});
		});

		if (Game.IsClient()) {
			CoreNetwork.ServerToClient.Character.SetHealth.client.OnServerEvent((id, health) => {
				if (Game.IsHosting()) return;
				this.FindById(id)?.SetHealth(health);
			});
			CoreNetwork.ServerToClient.Character.SetMaxHealth.client.OnServerEvent((id, maxHealth) => {
				if (Game.IsHosting()) return;
				this.FindById(id)?.SetHealth(maxHealth);
			});
		}

		// Voice Chat
		if (Game.IsClient()) {
			this.onCharacterSpawned.Connect((character) => {
				if (this.autoParentVoiceChatAudioSourceToCharacter && character.player) {
					const audioSource = character.player.voiceChatAudioSource;
					audioSource.transform.SetParent(character.transform);
					audioSource.transform.localPosition = new Vector3(0, 1.4, 0);
					audioSource.spatialBlend = 1;
					audioSource.maxDistance = 50;
					audioSource.rolloffMode = AudioRolloffMode.Linear;
				}
			});
			this.onCharacterDespawned.Connect((character) => {
				if (character.player) {
					if (character.player.voiceChatAudioSource.transform.IsChildOf(character.transform)) {
						character.player.voiceChatAudioSource.transform.SetParent(
							character.player.networkIdentity.transform,
						);
					}
				}
			});
		}

		this.WatchForHeldItemAccessories();
	}

	private WatchForHeldItemAccessories() {
		this.ObserveCharacters((character) => {
			character.inventory.ObserveHeldItem((itemStack) => {
				const itemDef = itemStack?.itemDef;

				let viewmodelAccessoryBuilder: AccessoryBuilder | undefined;
				if (character.IsLocalCharacter()) {
					viewmodelAccessoryBuilder = this.viewmodel?.accessoryBuilder;
				}

				//Spawn the accessories graphics
				let accessoryTemplates: AccessoryComponent[] = [];
				if (itemDef) {
					accessoryTemplates = [...Airship.Inventory.GetAccessoriesForItemType(itemDef.itemType)];
				}

				character.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand, false);
				character.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand, false);
				if (viewmodelAccessoryBuilder) {
					viewmodelAccessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand, false);
					viewmodelAccessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand, false);
				}

				// const firstPerson = this.character.animator.IsFirstPerson();
				// let layer = firstPerson ? Layer.FIRST_PERSON : Layer.CHARACTER;
				let i = 0;
				// this.activeAccessoriesWorldmodel.clear();
				// this.activeAccessoriesViewmodel.clear();
				for (const accessoryTemplate of accessoryTemplates) {
					character.accessoryBuilder.AddSingleAccessory(accessoryTemplate, false);
					if (viewmodelAccessoryBuilder) {
						viewmodelAccessoryBuilder.AddSingleAccessory(accessoryTemplate, false);
					}

					//Load the animator for the held item if one exists
					// const go = this.activeAccessoriesWorldmodel[i].rootTransform.gameObject;
					// this.currentItemGOs.push(go);
					// const anim = go.GetComponent<Animator>();
					// if (anim) {
					// 	this.currentItemAnimations.push(anim);
					// }
					i++;
				}

				//We aren't combineing held items
				// this.entity.accessoryBuilder.TryCombineMeshes();
			});
		});
	}

	/**
	 * Observe every character in the game. The returned function can be
	 * called to stop observing.
	 *
	 * The `observer` function is fired for every character currently in the game and
	 * every future character that spawns. The `observer` function must return another
	 * function which is called when said character despawned (_or_ the top-level observer
	 * function was called to stop the observation process).
	 *
	 * ```ts
	 * Airship.Characters.ObserveCharacters((character) => {
	 *      character.SetMaxHealth(500);
	 * });
	 * ```
	 */
	public ObserveCharacters(
		observer: (character: Character) => (() => void) | void,
		signalPriority?: SignalPriority,
	): () => void {
		const cleanupPerCharacter = new Map<Character, () => void>();
		const observe = (character: Character) => {
			const cleanup = observer(character);
			if (cleanup !== undefined) {
				cleanupPerCharacter.set(character, cleanup);
			}
		};
		for (const character of this.characters) {
			observe(character);
		}
		const stopCharacterSpawned = this.onCharacterSpawned.ConnectWithPriority(
			signalPriority ?? SignalPriority.NORMAL,
			(character) => {
				observe(character);
			},
		);
		const stopCharacterDespawned = this.onCharacterDespawned.ConnectWithPriority(
			signalPriority ?? SignalPriority.NORMAL,
			(character) => {
				const cleanup = cleanupPerCharacter.get(character);
				if (cleanup !== undefined) {
					cleanup();
					cleanupPerCharacter.delete(character);
				}
			},
		);
		return () => {
			stopCharacterSpawned();
			stopCharacterDespawned();
			for (const [character, cleanup] of cleanupPerCharacter) {
				cleanup();
			}
		};
	}

	public SpawnNonPlayerCharacter(position: Vector3): Character {
		if (!Game.IsServer()) {
			error("Player.SpawnCharacter must be called on the server.");
		}

		const go = Object.Instantiate(this.GetDefaultCharacterTemplate());
		go.name = `Character`;
		const characterComponent = go.GetAirshipComponent<Character>();
		if (!characterComponent) {
			error("Trying to spawn a character prefab without a character component on it!");
		}
		characterComponent.Init(undefined, Airship.Characters.MakeNewId(), undefined);
		go.transform.position = position;
		NetworkServer.Spawn(go);
		this.RegisterCharacter(characterComponent);
		this.onCharacterSpawned.Fire(characterComponent);
		return characterComponent;
	}

	private InitCharacter(dto: CharacterDto): void {
		// This can happen when client receives spawn character packet before client retrieves list of all existing characters.
		if (this.FindById(dto.id)) return;

		task.spawn(() => {
			const characterNetworkObj = NetworkUtil.WaitForNetworkIdentity(dto.netId);
			const character = characterNetworkObj.gameObject.GetAirshipComponent<Character>();
			assert(
				character,
				"Spawned character was missing a Character component. GameObject=" +
					characterNetworkObj.gameObject.name,
			);
			let player: Player | undefined;
			if (dto.ownerClientId !== undefined) {
				player = Airship.Players.FindByConnectionId(dto.ownerClientId);
				assert(player, "Failed to find player when spawning character. clientId=" + dto.ownerClientId);
				characterNetworkObj.gameObject.name = "Character_" + player.username;
			}
			character.Init(player, dto.id, dto.outfitDto);
			Airship.Characters.RegisterCharacter(character);
			player?.SetCharacter(character);
			Airship.Characters.onCharacterSpawned.Fire(character);
		});
	}

	public FindById(characterId: number): Character | undefined {
		for (let character of this.characters) {
			if (character.id === characterId) {
				return character;
			}
		}
		return undefined;
	}

	public FindByPlayer(player: Player): Character | undefined {
		for (let character of this.characters) {
			if (character.player === player) {
				return character;
			}
		}
		return undefined;
	}

	public FindByClientId(clientId: number): Character | undefined {
		for (let character of this.characters) {
			if (character.player?.connectionId === clientId) {
				return character;
			}
		}
		return undefined;
	}

	public FindByCollider(collider: Collider): Character | undefined {
		for (let character of this.characters) {
			if (
				character.gameObject === collider.gameObject ||
				character.gameObject === collider.gameObject.transform.parent?.parent?.gameObject
			) {
				return character;
			}
		}
		return undefined;
	}

	/**
	 * Internal method for spawning a character.
	 * @param character
	 */
	public RegisterCharacter(character: Character): void {
		this.characters.add(character);

		if (Game.IsServer()) {
			CoreNetwork.ServerToClient.Character.Spawn.server.FireAllClients({
				id: character.id,
				netId: character.networkIdentity.netId,
				ownerClientId: character.player?.connectionId,
				outfitDto: character.outfitDto,
			});
		}
	}

	public UnregisterCharacter(character: Character): void {
		this.characters.delete(character);
	}

	public GetCharacters() {
		return this.characters;
	}

	public MakeNewId(): number {
		this.idCounter++;
		return this.idCounter;
	}

	public SetDefaultCharacterPrefab(prefabTemplate: GameObject | undefined) {
		this.customCharacterTemplate = prefabTemplate;
	}

	public GetDefaultCharacterTemplate() {
		return this.customCharacterTemplate === undefined ? characterPrefab : this.customCharacterTemplate;
	}

	public SetDefaultViewmodelPrefab(prefab: GameObject | undefined) {
		this.customViewmodelTemplate = prefab;
	}

	public GetDefaultViewmodelPrefab() {
		if (this.customViewmodelTemplate !== undefined) {
			return this.customViewmodelTemplate;
		}
		return AssetCache.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Character/CharacterViewmodel.prefab");
	}
}
