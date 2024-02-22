import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { SharedTime } from "@Easy/Core/Shared/Util/TimeUtil";
import CubeMover from "./CubeMover";

export default class TagDemo extends AirshipBehaviour {
	public override Start(): void {
		Airship.tags.GetTagAddedSignal("GameTagTest").Connect((gameObject) => {
			print("Game object added to tag 'GameTagTest'", gameObject.name);

			task.delay(5, () => {
				Airship.tags.AddTag(gameObject, "GameGeneratedTagTest");
			});
		});

		Airship.tags.GetTagAddedSignal("GameGeneratedTagTest").Connect((gameObject) => {
			print("'GameGeneratedTagTest' tag added", gameObject.name);
			Game.BroadcastMessage(`GameObject added to tag: ${gameObject.name}`);

			gameObject.AddAirshipComponent<CubeMover>();
		});
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
