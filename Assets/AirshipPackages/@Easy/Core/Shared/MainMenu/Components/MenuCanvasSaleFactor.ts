import { Game } from "../../Game";

export default class MenuCanvasSaleFactor extends AirshipBehaviour {
	override Awake(): void {
		const canvasScaler = this.gameObject.GetComponent<CanvasScaler>();
		if (canvasScaler) {
			const scaleFactor = Game.GetScaleFactor();
			canvasScaler.scaleFactor = scaleFactor;
		}
	}
}
