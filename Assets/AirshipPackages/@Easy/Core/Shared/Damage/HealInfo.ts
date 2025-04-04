import { Cancellable } from "@Easy/Core/Shared/Util/Cancellable";
import Character from "../Character/Character";

export class HealInfo extends Cancellable {
    public character: Character | undefined;

    constructor(
        public gameObject: GameObject,
        public healAmount: number,
        public data: HealInfoCustomData,
    ) {
        super();

        this.character = this.gameObject.GetAirshipComponent<Character>();
    }
}

export type HealInfoCustomData = {
    [key: string]: unknown;
};
