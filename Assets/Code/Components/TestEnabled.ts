@AirshipComponentMenu("Enabled Troll")
export default class TestEnabled extends AirshipBehaviour {
	someOtherRef: TestEnabled;

	protected Awake(): void {
		print("Enabled is", this.enabled);
		this.enabled = true;
		print("Enabled is now", this.enabled);

		this.someOtherRef.enabled = false;
	}

	protected OnEnable(): void {}

	protected OnDisable(): void {
		print("[OnDisable] Enabled is", this.enabled);
	}
}
