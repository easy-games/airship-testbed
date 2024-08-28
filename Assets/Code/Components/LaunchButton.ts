import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";

export default class LaunchButton extends AirshipBehaviour {
	public prompt: ProximityPrompt;
	public rocketPrefab: GameObject;
	public launchPosition: Transform;
	public duration = 6.5;

	override Start(): void {
		this.prompt.onActivated.Connect(() => {
			this.LaunchRocket();
		});
	}

	private LaunchRocket(): void {
		const go = Object.Instantiate(this.rocketPrefab);
		go.transform.position = this.launchPosition.position;

		NativeTween.PositionY(go.transform, this.launchPosition.position.y + 150, this.duration).SetEaseQuadOut();
		task.delay(this.duration, () => {
			Object.Destroy(go);
		});
	}

	override OnDestroy(): void {}
}
