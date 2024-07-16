import { Airship } from "@Easy/Core/Shared/Airship";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { AirshipNetworkBehaviour, ServerRpc } from "@Easy/Core/Shared/Network";
import { NetworkedField, NetworkedFieldPermissions } from "@Easy/Core/Shared/Network/NetworkedField";
import { Player } from "@Easy/Core/Shared/Player/Player";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class NetworkedVariables extends AirshipNetworkBehaviour {
	@NetworkedField({
		Hook: "SetNumber",
		Permissions: NetworkedFieldPermissions.Owner,
	})
	public testNumber = 10;

	private toggled = false;

	@ServerRpc({ RequiresOwnership: false })
	public IncrementNumber(_: Player | undefined, value: boolean) {
		this.toggled = value;
		// this.testNumber += 10;

		// this.testNumber += 1;
		// this.stringValue = string.format("%.6x", this.testNumber);
		// this.objectTest.name = "hi there " + this.stringValue;
	}

	public SetNumber(value: number, value2: number) {
		print("testNumber changed to", value, "from", value2);
	}

	public Update(dt: number): void {
		if (this.toggled) {
			this.testNumber += 1 * dt;
		}
	}

	public Start(): void {
		Airship.Input.CreateAction("IncrementNumber", Binding.Key(Key.P));
		Airship.Input.OnDown("IncrementNumber").Connect(() => {
			this.IncrementNumber(undefined, true);
		});

		Airship.Input.OnUp("IncrementNumber").Connect(() => {
			this.IncrementNumber(undefined, false);
		});
	}
}
