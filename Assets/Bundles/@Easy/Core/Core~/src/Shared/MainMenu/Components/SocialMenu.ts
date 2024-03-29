import { Game } from "../../Game";

export default class SocialMenu extends AirshipBehaviour {
	public liveStats!: GameObject;

	override Start(): void {
		if (Game.IsMobile()) {
			this.liveStats.gameObject.SetActive(false);
		}

		// if (Game.IsMobile() && Game.IsLandscape()) {
		// 	const rect = this.gameObject.GetComponent<RectTransform>();
		// 	rect.sizeDelta = rect.sizeDelta.add(new Vector2(120, 0));
		// }
	}

	override OnDestroy(): void {}
}
