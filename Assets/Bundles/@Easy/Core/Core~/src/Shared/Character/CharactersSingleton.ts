import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Player } from "Shared/Player/Player";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import Character from "./Character";
import { CustomMoveData } from "./CustomMoveData";

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

	private idCounter = 0;

	constructor() {
		Airship.characters = this;

		if (RunUtil.IsClient() && !RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.CharacterSpawnedRemote.client.OnServerEvent((objectId, ownerClientId) => {
				const characterNetworkObj = NetworkUtil.WaitForNetworkObject(objectId);
				const character = characterNetworkObj.gameObject.GetAirshipComponent<Character>();
				assert(character, "Spawned character was missing a Character component.");
				let player: Player | undefined;
				if (ownerClientId !== undefined) {
					player = Airship.players.FindByClientId(ownerClientId);
					assert(player, "Failed to find player when spawning character. clientId=" + ownerClientId);
					characterNetworkObj.gameObject.name = "Character_" + player.username;
				}
				character.Init(player, Airship.characters.MakeNewId());
				Airship.characters.RegisterCharacter(character);
				player?.SetCharacter(character);
				Airship.characters.onCharacterSpawned.Fire(character);
			});
		}
	}

	OnStart(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				for (let character of this.characters) {
					CoreNetwork.ServerToClient.CharacterSpawnedRemote.server.FireClient(
						player.clientId,
						character.networkObject.ObjectId,
						character.player?.clientId,
					);
				}
			});
		}
	}

	public SpawnNonPlayerCharacter(position: Vector3): Character {
		if (!RunUtil.IsServer()) {
			error("Player.SpawnCharacter must be called on the server.");
		}

		const go = Object.Instantiate(characterPrefab);
		go.name = `Character`;
		const characterComponent = go.GetAirshipComponent<Character>()!;
		characterComponent.Init(undefined, Airship.characters.MakeNewId());
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
			if (
				character.gameObject === collider.gameObject ||
				character.gameObject.transform.parent?.gameObject === collider.gameObject
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
					const moveEvent = new CustomMoveData(character.player?.clientId ?? -1, tick, data.key, data.value);
					this.onServerCustomMoveCommand.Fire(moveEvent);
				}
			});
			character.bin.Add(() => {
				Bridge.DisconnectEvent(customDataConn);
			});
		}

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.CharacterSpawnedRemote.server.FireAllClients(
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
