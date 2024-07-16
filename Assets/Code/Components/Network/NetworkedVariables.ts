import { Airship } from "@Easy/Core/Shared/Airship";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { AirshipNetworkBehaviour, ServerRpc } from "@Easy/Core/Shared/Network";
import { NetworkedField } from "@Easy/Core/Shared/Network/NetworkedField";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class NetworkedVariables extends AirshipNetworkBehaviour {
	@NetworkedField({
		OnChanged(value) {
			print("testNumber changed to", value);
		},
	})
	public testNumber = 10;

	@NetworkedField({
		OnChanged(value) {
			print("string value changed to", inspect(value));
		},
	})
	public stringValue = "";

	@NetworkedField({
		OnChanged(value) {
			print("objectTest changed to", inspect(value));
		},
	})
	public objectTest = { name: "vorlias" };

	@ServerRpc()
	public IncrementNumber() {
		this.testNumber += 1;
		this.stringValue = string.format("%.6x", this.testNumber);
		this.objectTest.name = "hi there " + this.stringValue;
		print("number is now", this.testNumber);
	}

	public Start(): void {
		Airship.Input.CreateAction("IncrementNumber", Binding.Key(Key.P));
		Airship.Input.OnUp("IncrementNumber").Connect(() => {
			this.IncrementNumber();
		});
	}
}
