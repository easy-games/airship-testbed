import { Controller, OnStart } from "@easy-games/flamework-core";
import { MainMenuController } from "./MainMenuController";

@Controller({})
export class MainMenuSocialController implements OnStart {
	constructor(private readonly mainMenuController: MainMenuController) {}

	OnStart(): void {
		this.Setup();
	}

	private Setup(): void {}
}
