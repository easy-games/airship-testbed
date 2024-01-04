export default class TntBehaviour extends AirshipBehaviour {
	public test = true;

	public OnEnable(): void {
		this.gameObject.AddComponent<Rigidbody>();
		print("tnt is awake");
	}

	public constructor() {
		super();
		print("i was added");
	}
}
