import { Airship } from "@Easy/Core/Shared/Airship";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class CharacterAccessoryController implements OnStart {
	constructor() {}

	private AutoEquipArmor() {
		Airship.characters.onCharacterSpawned.Connect((character) => {
			// if (character.player) {
			// 	//Load Users Equipped Outfit
			// 	AvatarUtil.LoadEquippedUserOutfit(character.accessoryBuilder);
			// 	if (character.IsLocalCharacter()) {
			// 		AvatarUtil.LoadEquippedUserOutfit(Dependency<ViewmodelController>().accessoryBuilder);
			// 	}
			// } else {
			// 	AvatarUtil.LoadDefaultOutfit(character.accessoryBuilder);
			// }
		});
	}

	OnStart(): void {
		this.AutoEquipArmor();
	}
}
