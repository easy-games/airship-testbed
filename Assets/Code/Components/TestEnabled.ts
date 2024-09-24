@AirshipComponentMenu("Enabled Troll")
export default class TestEnabled extends AirshipBehaviour {
	protected Awake(): void {
		print("Awake", this.enabled);
		this.enabled = false;
	}

	protected OnEnable(): void {
		print("[OnEnable] Enabled is", this.enabled);

		this.SetEnabled(false);
	}

	protected OnDisable(): void {
		print("[OnDisable] Enabled is", this.enabled);
	}
}
