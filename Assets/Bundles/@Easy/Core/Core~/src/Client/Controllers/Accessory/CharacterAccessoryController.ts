import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { ViewmodelController } from "../Viewmodel/ViewmodelController";

@Controller({})
export class CharacterAccessoryController implements OnStart {
	constructor() {}

	private AutoEquipArmor() {
		Airship.characters.onCharacterSpawned.Connect((character) => {
			if (character.player) {
				//Load Users Equipped Outfit
				AvatarUtil.LoadEquippedUserOutfit(character.accessoryBuilder);
				if (character.IsLocalCharacter()) {
					AvatarUtil.LoadEquippedUserOutfit(Dependency<ViewmodelController>().accessoryBuilder);
				}
			} else {
				AvatarUtil.LoadDefaultOutfit(character.accessoryBuilder);
			}
		});
	}

	OnStart(): void {}
}
