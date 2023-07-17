export class Crosshair {
	private static disablers = new Set<number>();
	private static idCounter = 0;
	private static crosshairImage: Image | undefined;

	public static AddDisabler(): () => void {
		const id = this.idCounter;
		this.idCounter++;
		this.disablers.add(id);
		this.CheckDisabled();

		return () => {
			this.disablers.delete(id);
			this.CheckDisabled();
		};
	}

	public static ClearDisablers(): void {
		this.disablers.clear();
		this.CheckDisabled();
	}

	private static CheckDisabled(): void {
		if (this.crosshairImage === undefined) {
			this.crosshairImage = GameObject.Find("EngineUI/Canvas/Crosshair")?.GetComponent<Image>();
			print("crosshair:", this.crosshairImage);
			if (this.crosshairImage === undefined) return;
		}
		const disabled = this.disablers.size() > 0;
		if (disabled) {
			this.crosshairImage.enabled = false;
		} else {
			this.crosshairImage.enabled = true;
		}
	}
}
