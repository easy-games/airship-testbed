import { FriendsController } from "@Easy/Core/Client/MainMenuControllers/Social/FriendsController";
import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class LobbyController implements OnStart {
	OnStart(): void {
		Dependency<FriendsController>().SetCustomGameTitle("BedWars | In Lobby");
	}
}
