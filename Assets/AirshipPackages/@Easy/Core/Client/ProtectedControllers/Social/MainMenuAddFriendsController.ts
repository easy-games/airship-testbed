import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { Controller, Dependency } from "@Easy/Core/Shared/Flamework";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class MainMenuAddFriendsController {
	private sentRequests = new Set<string>();

	private canvas: Canvas | undefined;
	private inputFieldSelected = false;

	constructor() {}

	protected OnStart(): void {}

	public Open(): void {
		const go = Object.Instantiate(
			AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/AirshipAddFriendModal.prefab"),
			Dependency<MainMenuController>().mainContentCanvas.transform,
		);
		AppManager.OpenModal(go, {
			sortingOrderOffset: 100,
		});
	}
}
