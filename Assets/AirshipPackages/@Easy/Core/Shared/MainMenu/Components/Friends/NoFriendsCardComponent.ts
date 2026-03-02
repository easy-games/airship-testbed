import { SteamFriendsProtectedController } from "@Easy/Core/Client/ProtectedControllers/Social/SteamFriendsProtectedController";
import { Asset } from "@Easy/Core/Shared/Asset";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";

export default class NoFriendsCardComponent extends AirshipBehaviour {
	public addFriendsBtn: Button;
	public steamFriendsTmp: TextMeshProUGUI;
	public inner: RectTransform;

	protected Start(): void {
		this.steamFriendsTmp.gameObject.SetActive(false);
		task.spawn(() => {
			const numSteamFriends = Dependency<SteamFriendsProtectedController>()
				.WaitForSteamFriendsWithAirship()
				.size();
			if (this.gameObject.IsDestroyed()) return;
			if (numSteamFriends > 0) {
				this.steamFriendsTmp.gameObject.SetActive(true);
				if (numSteamFriends === 1) {
					this.steamFriendsTmp.text = `<color=#32FF37>1</color> Steam friend plays Airship`;
				} else {
					this.steamFriendsTmp.text = `<color=#32FF37>${numSteamFriends}</color> Steam friends play Airship`;
				}
			}
		});

		this.addFriendsBtn.onClick.Connect(() => {
			VibrationManager.Play(VibrationFeedbackType.Heavy);
			AppManager.OpenModal(
				Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/Modals/AirshipAddFriendModal.prefab"),
			);
		});
	}
}
