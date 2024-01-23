import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { Player } from "Shared/Player/Player";
import { Signal } from "Shared/Util/Signal";
import Character from "./Character";

@Service()
@Controller()
export class CharacterManager implements OnStart {
	private characters = new Set<Character>();

	public onCharacterSpawned = new Signal<Character>();
	public onCharacterDespawned = new Signal<Character>();

	constructor() {
		Airship.characters = this;
	}

	OnStart(): void {}

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

	public RegisterCharacter(character: Character): void {
		this.characters.add(character);
	}

	public UnregisterCharacter(character: Character): void {
		this.characters.delete(character);
	}

	public GetCharacters() {
		return this.characters;
	}
}
