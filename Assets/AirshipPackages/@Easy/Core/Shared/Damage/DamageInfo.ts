import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";
import Character from "../Character/Character";

export class DamageInfo extends Cancellable {
	public character: Character | undefined;
	public attackerCharacter: Character | undefined;

	constructor(
		public gameObject: GameObject,
		public damage: number,
		public attacker: GameObject | undefined,
		public data: DamageInfoCustomData,
	) {
		super();

		this.character = this.gameObject.GetAirshipComponent<Character>();
		this.attackerCharacter = this.attacker?.GetAirshipComponent<Character>();
	}
}

export type DamageInfoCustomData = {
	[key: string]: unknown;
};
