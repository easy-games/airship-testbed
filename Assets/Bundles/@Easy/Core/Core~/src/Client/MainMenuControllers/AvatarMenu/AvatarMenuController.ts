import { Controller, OnStart } from "@easy-games/flamework-core";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class AvatarMenuController implements OnStart {
	constructor(private readonly mainMenuController: MainMenuController) {}

	OnStart() {}
}
