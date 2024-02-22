import { Airship } from "Shared/Airship";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Controller, OnStart, Service } from "Shared/Flamework";
import { Player } from "Shared/Player/Player";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalPriority } from "Shared/Util/Signal";
import Character from "./Character";
import { CustomMoveData } from "./CustomMoveData";
import { LocalCharacterSingleton } from "./LocalCharacter/LocalCharacterSingleton";

const characterPrefab = AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Character/Character.prefab");

@Service()
@Controller()
export class CharactersSingleton implements OnStart {
	private characters = new Set<Character>();

	public onCharacterSpawned = new Signal<Character>();
	public onCharacterDespawned = new Signal<Character>();

	/**
	 * **SERVER ONLY**
	 *
	 * [Advanced]
	 *
	 * Custom data that the client sends in their move packet.
	 */
	public onServerCustomMoveCommand = new Signal<CustomMoveData>();

	/**
	 * If true, when a player disconnects their character will automatically be despawned.
	 */
	public autoDespawnCharactersOnPlayerDisconnect = true;

	private idCounter = 0;

	constructor(public readonly localCharacterManager: LocalCharacterSingleton) {
		Airship.characters = this;

		if (RunUtil.IsClient() && !RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Character.Spawn.client.OnServerEvent(
				(characterId, objectId, ownerClientId, outfitDto) => {
					const characterNetworkObj = NetworkUtil.WaitForNetworkObject(objectId);
					const character = characterNetworkObj.gameObject.GetAirshipComponent<Character>();
					assert(character, "Spawned character was missing a Character component.");
					let player: Player | undefined;
					if (ownerClientId !== undefined) {
						player = Airship.players.FindByClientId(ownerClientId);
						assert(player, "Failed to find player when spawning character. clientId=" + ownerClientId);
						characterNetworkObj.gameObject.name = "Character_" + player.username;
					}
					character.Init(player, characterId, outfitDto);
					Airship.characters.RegisterCharacter(character);
					player?.SetCharacter(character);
					Airship.characters.onCharacterSpawned.Fire(character);
				},
			);
		}
	}

	OnStart(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				for (let character of this.characters) {
					CoreNetwork.ServerToClient.Character.Spawn.server.FireClient(
						player,
						character.id,
						character.networkObject.ObjectId,
						character.player?.clientId,
					);
				}
			});

			// Auto disconnect
			Airship.players.onPlayerDisconnected.Connect((player) => {
				if (!this.autoDespawnCharactersOnPlayerDisconnect) return;

				player.character?.Despawn();
			});
		}

		Airship.damage.onDamage.ConnectWithPriority(SignalPriority.MONITOR, (damageInfo) => {
			if (RunUtil.IsServer() && Airship.damage.applyKnockback && damageInfo.data["knockback"]) {
				const knockback = damageInfo.data["knockback"] as Vector3;
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
				if (character) {
					character.movement.ApplyImpulse(knockback);
				}
			}
		});

		Airship.characters.ObserveCharacters((character) => {
			character.onDeath.ConnectWithPriority(SignalPriority.MONITOR, () => {
				if (RunUtil.IsServer()) {
					NetworkUtil.Despawn(character.gameObject);
				}
			});
		});

		if (RunUtil.IsClient()) {
			CoreNetwork.ServerToClient.Character.SetHealth.client.OnServerEvent((id, health) => {
				this.FindById(id)?.SetHealth(health);
			});
			CoreNetwork.ServerToClient.Character.SetMaxHealth.client.OnServerEvent((id, maxHealth) => {
				this.FindById(id)?.SetHealth(maxHealth);
			});
			CoreNetwork.ServerToClient.Character.Death.client.OnServerEvent((id) => {
				this.FindById(id)?.onDeath.Fire();
			});
		}
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
	 * Airship.characters.ObserveCharacters((character) => {
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
		if (!RunUtil.IsServer()) {
			error("Player.SpawnCharacter must be called on the server.");
		}

		const go = Object.Instantiate(characterPrefab);
		go.name = `Character`;
		const characterComponent = go.GetAirshipComponent<Character>()!;
		characterComponent.Init(undefined, Airship.characters.MakeNewId(), undefined);
		go.transform.position = position;
		NetworkUtil.Spawn(go);
		this.RegisterCharacter(characterComponent);
		this.onCharacterSpawned.Fire(characterComponent);
		return characterComponent;
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
			if (character.player?.clientId === clientId) {
				return character;
			}
		}
		return undefined;
	}

	public FindByCollider(collider: Collider): Character | undefined {
		// todo: optimize
		for (let character of this.characters) {
			// print(
			// 	"comparing " +
			// 		character.gameObject.GetInstanceID() +
			// 		" to " +
			// 		collider.gameObject.GetInstanceID() +
			// 		" or " +
			// 		character.gameObject.transform.parent?.gameObject.GetInstanceID(),
			// );
			if (
				character.gameObject.GetInstanceID() === collider.gameObject.GetInstanceID() ||
				character.gameObject.transform.parent?.gameObject.GetInstanceID() ===
					collider.gameObject.GetInstanceID()
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

		if (RunUtil.IsServer() && character.player) {
			// Custom move command data handling:
			const customDataConn = character.movement.OnDispatchCustomData((tick, customData) => {
				const allData = customData.Decode() as { key: unknown; value: unknown }[];
				for (const data of allData) {
					const player = character.player;
					if (!player) continue;
					const moveEvent = new CustomMoveData(player, tick, data.key, data.value);
					this.onServerCustomMoveCommand.Fire(moveEvent);
				}
			});
			character.bin.Add(() => {
				Bridge.DisconnectEvent(customDataConn);
			});
		}

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.Character.Spawn.server.FireAllClients(
				character.id,
				character.networkObject.ObjectId,
				character.player?.clientId,
			);
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
}
