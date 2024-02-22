import { Airship } from "@Easy/Core/Shared/Airship";
import { SharedTime } from "@Easy/Core/Shared/Util/TimeUtil";
import CubeMover from "./CubeMover";
import { Tags } from "Shared/Tags";

export default class TagDemo extends AirshipBehaviour {
	public override Start(): void {
		Airship.tags.ObserveTag(Tags.AirshipTest_AddCubeMover, (cube) => {
			cube.AddAirshipComponent<CubeMover>();
		});

		Airship.tags.ObserveTag(Tags.AirshipTest_Flashy, (gameObject) => {
			print("flashy added to", gameObject.name);
			return () => {
				print("flashy removed from", gameObject.name);
			};
		});
	}

	/**
	 * Yes this is inefficient as hell and better as a component, but it gets across the idea
	 */
	public override FixedUpdate(dt: number): void {
		for (const tagged of Airship.tags.GetTagged(Tags.AirshipTest_Flashy)) {
			const material = tagged.GetComponentsInChildren<MaterialColor>().GetValue(0);
			if (!material) continue;
			const color = material.GetColor(0);
			color.materialColor = Color.HSVToRGB(math.abs(math.sin(SharedTime())), 1, 1);
			material.SetColor(color, 0);
			// material.SetColor(, ) = ;
		}
	}
}
