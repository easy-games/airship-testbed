import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";
import { DamageInfoCustomData } from "./DamageInfo";

export class CanClientDamageInfo extends Cancellable {
	constructor(public gameObject: GameObject, public attacker: GameObject, public data: DamageInfoCustomData) {
		super();
	}
}
