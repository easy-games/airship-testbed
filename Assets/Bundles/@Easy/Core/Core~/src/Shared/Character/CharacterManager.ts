import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { Player } from "Shared/Player/Player";
import Character from "./Character";

@Service()
@Controller()
export class CharacterManager implements OnStart {
	private characters = new Set<Character>();

	constructor() {
		Airship.Characters = this;
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

	public RegisterCharacter(character: Character): void {
		this.characters.add(character);
	}

	public UnregisterCharacter(character: Character): void {
		this.characters.delete(character);
	}
}
