import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { SharedTime } from "@Easy/Core/Shared/Util/TimeUtil";
import CubeMover from "./CubeMover";

export default class TagDemo extends AirshipBehaviour {
	public override Start(): void {
		if (RunCore.IsServer()) {
			Airship.tags.OnTagAdded("GameTagTest").Connect((gameObject) => {
				print("Game object added to tag 'GameTagTest'", gameObject.name);

				task.delay(5, () => {
					Airship.tags.AddTag(gameObject, "GameGeneratedTagTest");
				});
			});

			Airship.tags.OnTagAdded("GameGeneratedTagTest").Connect((gameObject) => {
				if (RunCore.IsServer()) Game.BroadcastMessage(`GameObject added to tag: ${gameObject.name}`);
				gameObject.AddAirshipComponent<CubeMover>();

				task.delay(5, () => {
					Airship.tags.RemoveTag(gameObject, "GameGeneratedTagTest");
				});
			});

			Airship.tags.OnTagRemoved("GameGeneratedTagTest").Connect((gameObject) => {
				print("tag was removed from", gameObject.name);
			});
		}
	}

	/**
	 * Yes this is inefficient as hell and better as a component, but it gets across the idea
	 */
	public override FixedUpdate(dt: number): void {
		for (const tagged of Airship.tags.GetTagged("GameGeneratedTagTest")) {
			const material = tagged.GetComponentsInChildren<MaterialColor>().GetValue(0);
			const color = material.GetColor(0);
			color.materialColor = Color.HSVToRGB(math.abs(math.sin(SharedTime())), 1, 1);
			material.SetColor(color, 0);
			// material.SetColor(, ) = ;
		}
	}
}
