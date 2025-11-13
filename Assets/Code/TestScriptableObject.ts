import PlayerShipDefinition from "./Examples/PlayerShipDefinition";

export default class TestScriptableObject extends AirshipScriptableObject {
	public textToDisplay: string;
	public example: TestSerializable2;

	Test() {}
}

@Serializable()
export class TestSerializable2 {
	public value: number;
}
