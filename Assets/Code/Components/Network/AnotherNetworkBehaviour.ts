import { AirshipNetworkBehaviour } from "@Easy/Core/Shared/Network";
import { NetworkedField } from "@Easy/Core/Shared/Network/NetworkedField";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export default class AnotherNetworkBehaviour extends AirshipNetworkBehaviour {
	@NetworkedField()
	public testNumber = 0;

	public OnStartServer(): void {
		SetInterval(10, () => {
			this.testNumber += 10;
		});
	}
}
