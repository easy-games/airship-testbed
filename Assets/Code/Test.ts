import { Game } from "@Easy/Core/Shared/Game";
import TestScriptableObject from "./TestScriptableObject";
import PredictedCommandManager from "@Easy/Core/Shared/Network/PredictedCommands/PredictedCommandManager";
import PlayerShipDefinition from "./Examples/PlayerShipDefinition";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class Test extends AirshipBehaviour {
	testScriptableObject: TestScriptableObject;
	testSerializable: TestSerializable;

	protected Start(): void {
		print("The text is", this.testScriptableObject.textToDisplay);
	}

	@Client()
	public Test() {
		// this.gameObject.AddComponent<Test>();
	}

	@Server()
	@Client()
	public CantBeBoth() {}
}

@Serializable()
export class TestSerializable {
	public value: number;
}
