import { MainMenuBlockSingleton } from "@Easy/Core/Client/MainMenuControllers/Settings/MainMenuBlockSingleton";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import BlockedGame from "./BlockedGame";

export default class SettingsBlockPage extends AirshipBehaviour {
	public content!: RectTransform;
	public blockedGamePrefab!: GameObject;

	override OnEnable(): void {
		this.content.gameObject.ClearChildren();
		const blockSingleton = Dependency<MainMenuBlockSingleton>();
		for (let game of blockSingleton.blockedGames) {
			const go = Object.Instantiate(this.blockedGamePrefab, this.content);
			const blockedGame = go.GetAirshipComponent<BlockedGame>();
			blockedGame?.Init(game.id, game.name);
		}
	}

	override OnDisable(): void {}
}
