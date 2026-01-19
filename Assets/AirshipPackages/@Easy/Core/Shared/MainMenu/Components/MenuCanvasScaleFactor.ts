import { Game } from "../../Game";

export default class MenuCanvasScaleFactor extends AirshipBehaviour {
	override Awake(): void {
		const canvasScaler = this.gameObject.GetComponent<CanvasScaler>();
		if (canvasScaler) {
			const scaleFactor = Game.GetScaleFactor();
			canvasScaler.scaleFactor = scaleFactor;
		}
	}
}
