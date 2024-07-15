import { AirshipNetworkBehaviour } from "@Easy/Core/Shared/Network";
import { NetworkedField } from "@Easy/Core/Shared/Network/NetworkedField";

export default class NetworkedVariables extends AirshipNetworkBehaviour {
	@NetworkedField({
		OnChanged(value) {},
	})
	public testNumber = 10;

	public DoSomething(name: number) {}
}
 