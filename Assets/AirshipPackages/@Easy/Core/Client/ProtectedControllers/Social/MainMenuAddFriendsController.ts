import { Asset } from "@Easy/Core/Shared/Asset";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";

@Controller({})
export class MainMenuAddFriendsController {
	private sentRequests = new Set<string>();

	private canvas: Canvas | undefined;
	private inputFieldSelected = false;

	constructor() {}

	protected OnStart(): void {}

	public Open(): void {
		AppManager.OpenModal(
			Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/AirshipAddFriendModal.prefab"),
		);
	}
}
