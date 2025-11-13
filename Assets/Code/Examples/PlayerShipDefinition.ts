export const enum ShipClass {
	Small,
	Medium,
	Large,
}

@CreateAssetMenu("PlayerShipDefinition.asset", "Assets/Create/Player Ship Definition")
export default class PlayerShipDefinition extends AirshipScriptableObject {
	public name = "Ship name";
	public shipClass: ShipClass;
}
