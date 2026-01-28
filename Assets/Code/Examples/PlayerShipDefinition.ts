export const enum ShipClass {
	Small,
	Medium,
	Large,
}

// export abstract class AbstractComponent extends AirshipBehaviour {}
// export abstract class AbstractComponent2 extends AbstractComponent {}

@CreateAssetMenu("Player Ship Definition", "PlayerShipDefinition.asset")
export default class PlayerShipDefinition extends AirshipScriptableObject {
	public name = "Ship name";
	public shipClass: ShipClass;
}
