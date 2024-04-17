import { MainMenuBlockSingleton } from "@Easy/Core/Client/MainMenuControllers/Settings/MainMenuBlockSingleton";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import BlockedGame from "./BlockedGame";
import BlockedUser from "./BlockedUser";

export default class SettingsBlockPage extends AirshipBehaviour {
	public gameContent!: RectTransform;
	public blockedGamePrefab!: GameObject;

	public blockedUserPrefab!: GameObject;
	public userContent!: RectTransform;

	override OnEnable(): void {
		this.gameContent.gameObject.ClearChildren();
		this.userContent.gameObject.ClearChildren();
		const blockSingleton = Dependency<MainMenuBlockSingleton>();
		for (let game of blockSingleton.blockedGames) {
			const go = Object.Instantiate(this.blockedGamePrefab, this.gameContent);
			const blockedGame = go.GetAirshipComponent<BlockedGame>();
			blockedGame?.Init(game.id, game.name);
		}
		for (let user of blockSingleton.blockedUsers) {
			const go = Object.Instantiate(this.blockedUserPrefab, this.userContent);
			const blockedUser = go.GetAirshipComponent<BlockedUser>();
			blockedUser?.Init(user.uid, user.name);
		}
		Bridge.UpdateLayout(this.transform, true);
	}

	override OnDisable(): void {}
}
