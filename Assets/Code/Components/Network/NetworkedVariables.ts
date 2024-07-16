import { Airship } from "@Easy/Core/Shared/Airship";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { AirshipNetworkBehaviour, ServerRpc } from "@Easy/Core/Shared/Network";
import { NetworkedField } from "@Easy/Core/Shared/Network/NetworkedField";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class NetworkedVariables extends AirshipNetworkBehaviour {
	@NetworkedField({
		Hook: "SetNumber",
	})
	public testNumber = 10;

	@NetworkedField()
	public stringValue = "";

	@NetworkedField()
	public objectTest = { name: "vorlias" };

	@ServerRpc()
	public IncrementNumber() {
		this.testNumber += 1;
		this.stringValue = string.format("%.6x", this.testNumber);
		this.objectTest.name = "hi there " + this.stringValue;
	}

	public SetNumber(value: number, value2: number) {
		print("testNumber changed to", value, "from", value2);
	}

	public Start(): void {
		Airship.Input.CreateAction("IncrementNumber", Binding.Key(Key.P));
		Airship.Input.OnUp("IncrementNumber").Connect(() => {
			this.IncrementNumber();
		});
	}
}
