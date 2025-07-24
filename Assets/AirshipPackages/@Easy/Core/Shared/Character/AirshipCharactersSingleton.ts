import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Asset } from "../Asset";
import { CoreContext } from "../CoreClientContext";
import { Game } from "../Game";
import { Viewmodel } from "../Viewmodel/Viewmodel";
import Character from "./Character";
import { CharacterDto } from "./CharacterDto";
import { AirshipCharacterFootstepsSingleton } from "./Footstep/AirshipCharacterFootstepsSingleton";
import { LocalCharacterSingleton } from "./LocalCharacter/LocalCharacterSingleton";

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
			task.spawn(() => {
				const dtos = CoreNetwork.ClientToServer.Character.RequestCharacters.client.FireServer();
				for (const dto of dtos) {
					this.InitCharacter(dto);
				}
			});

			CoreNetwork.ServerToClient.Character.Spawn.client.OnServerEvent((dto) => {
				this.InitCharacter(dto);
			});

			CoreNetwork.ServerToClient.Character.SetCharacter.client.OnServerEvent((connId, characterId) => {
				const player = Airship.Players.FindByConnectionId(connId);
				if (!player) return;

				type PlayerInternal = {
					SetCharacterInternal(character: Character | undefined): void;
				};

				if (characterId === undefined) {
					(player as unknown as PlayerInternal).SetCharacterInternal(undefined);
					return;
				}

				const character = Airship.Characters.FindById(characterId);
				(player as unknown as PlayerInternal).SetCharacterInternal(character);
			});
		}

		if (Game.IsClient()) {
			CoreNetwork.ServerToClient.Character.ChangeOutfit.client.OnServerEvent((characterId, outfitDto) => {
				const character = this.FindById(characterId);
				if (!character || !character.accessoryBuilder) {
					return;
				}
				if (character.player) {
					character.player.selectedOutfit = outfitDto;
					Airship.Characters.RemoveMeshCacheId("Player:" + character.player?.userId);
				}

				if (outfitDto) {
					character.LoadOutfit(outfitDto);
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
						ownerConnectionId: character.player?.connectionId,
						outfitDto: character.outfitDto,
						displayName: character.GetDisplayName(),
						health: character.GetHealth(),
						maxHealth: character.GetMaxHealth(),
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

		//Let individual games manage what to do on character death
		// Airship.Characters.ObserveCharacters((character) => {
		// 	character.onDeath.ConnectWithPriority(SignalPriority.MONITOR, () => {
		// 		if (Game.IsServer()) {
		// 			character.Despawn();
		// 		}
		// 	});
		// });

		if (Game.IsClient()) {
			CoreNetwork.ServerToClient.Character.SetHealth.client.OnServerEvent((id, health) => {
				if (Game.IsHosting()) return;
				this.FindById(id)?.SetHealth(health);
			});
			CoreNetwork.ServerToClient.Character.SetNametag.client.OnServerEvent((id, name) => {
				if (Game.IsHosting()) return;
				this.FindById(id)?.SetDisplayName(name);
			});
			CoreNetwork.ServerToClient.Character.SetMaxHealth.client.OnServerEvent((id, maxHealth) => {
				if (Game.IsHosting()) return;
				this.FindById(id)?.SetMaxHealth(maxHealth);
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
					audioSource.dopplerLevel = 0;
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

	public RemoveMeshCacheId(cacheId: string): void {
		// MeshCombiner.RemoveMeshCache(cacheId);
	}

	private WatchForHeldItemAccessories() {
		this.ObserveCharacters((character) => {
			character.ObserveHeldItem((itemStack) => {
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

				character.accessoryBuilder?.RemoveBySlot(AccessorySlot.LeftHand);
				character.accessoryBuilder?.RemoveBySlot(AccessorySlot.RightHand);
				if (viewmodelAccessoryBuilder) {
					viewmodelAccessoryBuilder.RemoveBySlot(AccessorySlot.LeftHand);
					viewmodelAccessoryBuilder.RemoveBySlot(AccessorySlot.RightHand);
				}

				// const firstPerson = this.character.animator.IsFirstPerson();
				// let layer = firstPerson ? Layer.FIRST_PERSON : Layer.CHARACTER;
				let i = 0;
				// this.activeAccessoriesWorldmodel.clear();
				// this.activeAccessoriesViewmodel.clear();
				for (const accessoryTemplate of accessoryTemplates) {
					character.accessoryBuilder?.Add(accessoryTemplate);
					if (viewmodelAccessoryBuilder) {
						viewmodelAccessoryBuilder.Add(accessoryTemplate);
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
			}, SignalPriority.HIGHEST);
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
			task.spawn(() => {
				const cleanup = observer(character);
				if (cleanup !== undefined) {
					cleanupPerCharacter.set(character, cleanup);
				}
			});
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

	public SpawnNonPlayerCharacter(
		position: Vector3,
		config?: {
			customCharacterTemplate?: GameObject;
			lookDirection?: Vector3;
		},
	): Character {
		if (!Game.IsServer()) {
			error("Player.SpawnCharacter must be called on the server.");
		}

		const go = Object.Instantiate(config?.customCharacterTemplate ?? this.GetDefaultCharacterTemplate());
		go.name = `Character`;

		const characterComponent = go.GetAirshipComponent<Character>();
		if (!characterComponent) {
			error("Trying to spawn a character prefab without a character component on it!");
		}
		if (config?.lookDirection && characterComponent.movement) {
			// try catch to not require c# update
			try {
				characterComponent.movement.startingLookVector = config.lookDirection;
			} catch (err) {}
		}
		characterComponent.Init(undefined, Airship.Characters.MakeNewId(), undefined, 100, 100, go.name);
		const rb = go.GetComponent<Rigidbody>();
		if (rb) rb.position = position;
		go.transform.position = position;
		NetworkServer.Spawn(go);
		this.RegisterCharacter(characterComponent);
		this.onCharacterSpawned.Fire(characterComponent);
		return characterComponent;
	}

	private InitCharacter(dto: CharacterDto): void {
		// This can happen when client receives spawn character packet before client retrieves list of all existing characters.
		if (this.FindById(dto.id)) return;

		// print("InitCharacter " + inspect(dto));

		task.spawn(() => {
			const characterNetworkObj = NetworkUtil.WaitForNetworkIdentity(dto.netId);
			const character = characterNetworkObj.gameObject.GetAirshipComponent<Character>();
			assert(
				character,
				"Spawned character was missing a Character component. GameObject=" +
					characterNetworkObj.gameObject.name,
			);
			let player: Player | undefined;
			if (dto.ownerConnectionId !== undefined) {
				player = Airship.Players.WaitForPlayerByConnectionId(dto.ownerConnectionId).expect();
				assert(
					player,
					"Failed to find player when spawning character. ownerConnectionId=" + dto.ownerConnectionId,
				);
				characterNetworkObj.gameObject.name = "Character_" + player.username;
			}
			character.Init(player, dto.id, dto.outfitDto, dto.health, dto.maxHealth, dto.displayName);
			Airship.Characters.RegisterCharacter(character);
			player?.SetCharacter(character);
			Airship.Characters.onCharacterSpawned.Fire(character);
		});
	}

	public WaitForId(characterId: number): Character;
	public WaitForId(characterId: number, timeoutSeconds: number): Character | undefined;
	public WaitForId(characterId: number, timeout?: number): Character | undefined {
		let character: Character | undefined;

		if (timeout !== undefined) {
			let startTime = Time.time;

			while (!(character = this.FindById(characterId)) && Time.time < startTime + timeout) {
				task.wait();
			}

			return character;
		} else {
			while (!(character = this.FindById(characterId))) {
				task.wait();
			}

			return character;
		}
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

	public FindByplayerConnectionId(connectionId: number): Character | undefined {
		for (let character of this.characters) {
			if (character.player?.connectionId === connectionId) {
				return character;
			}
		}
		return undefined;
	}

	public FindByCollider(collider: Collider): Character | undefined {
		return collider.gameObject.GetAirshipComponentInParent<Character>();
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
				ownerConnectionId: character.player?.connectionId,
				outfitDto: character.outfitDto,
				displayName: character.GetDisplayName(),
				health: character.GetHealth(),
				maxHealth: character.GetMaxHealth(),
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
		return this.customCharacterTemplate === undefined
			? Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Character/AirshipCharacter.prefab")
			: this.customCharacterTemplate;
	}

	public SetDefaultViewmodelPrefab(prefab: GameObject | undefined) {
		this.customViewmodelTemplate = prefab;
	}

	public GetDefaultViewmodelPrefab() {
		if (this.customViewmodelTemplate !== undefined) {
			return this.customViewmodelTemplate;
		}
		return Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Character/CharacterViewmodel.prefab");
	}
}
