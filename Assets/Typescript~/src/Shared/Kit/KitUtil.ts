import { Kit, bedwarsKits } from "./KitMeta";
import { KitType } from "./KitType";

export class KitUtil {
	/**
	 * Returns meta associated with provided kit.
	 * @param kitType The kit type.
	 * @return The kit's meta.
	 */
	public static GetKitMeta(kitType: KitType): Kit {
		return bedwarsKits[kitType];
	}
}
