import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";

export class DamageInfo extends Cancellable {
	constructor(
		public gameObject: GameObject,
		public damage: number,
		public attacker: GameObject | undefined,
		public data: DamageInfoCustomData,
	) {
		super();
	}
}

export type DamageInfoCustomData = {
	[key: string]: unknown;
};
