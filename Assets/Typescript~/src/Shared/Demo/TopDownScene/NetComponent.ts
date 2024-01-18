export default class NetComponent extends AirshipBehaviour {

    public override Awake(): void {
        print("NetComponent.Awake");
    }
	override Start(): void {
        // print("NetComponent.Start");
		// const nob = this.gameObject.GetComponent<NetworkObject>();
		// print("Nob: " + nob.ObjectId);
		// nob.OnStartClient(() => {
		// 	print("OnStartClient");
		// });
		// nob.OnStartServer(() => {
		// 	print("OnStartServer");
		// });
		// nob.OnStartNetwork(() => {
		// 	print("OnStartNetwork");
		// });
		// nob.OnSpawnServer((conn) => {
		// 	print("OnSpawnServer");
		// });
		// nob.OnOwnershipClient((conn) => {
		// 	print("OnOwnershipClient " + conn.ClientId);
		// });
		// nob.OnOwnershipServer((conn) => {
		// 	print("OnOwnershipServer " + conn.ClientId);
		// });
	}

    public override OnEnable(): void {
        print("NetComponent.OnEnable");
    }

    override OnDisable(): void {
        print("NetComponent.OnDisable");
    }

	override OnDestroy(): void {}
}
