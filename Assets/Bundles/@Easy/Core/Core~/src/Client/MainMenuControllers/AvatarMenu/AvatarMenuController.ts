import { Controller, OnStart } from "@easy-games/flamework-core";
import { MainMenuController } from "../MainMenuController";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";

@Controller({})
export class AvatarMenuController implements OnStart {
	private AvatarRefKey = "Avatar";
	constructor(private readonly mainMenuController: MainMenuController) {}

	OnStart() {
		print("Starting avatar menu");
		let scene3D = GameObjectUtil.Instantiate(
			this.mainMenuController.refs.GetValue<GameObject>("Avatar", "Avatar3DSceneTemplate"),
		);
		scene3D.SetActive(true);
		print("Scene 3D: " + scene3D.name);
	}
}
