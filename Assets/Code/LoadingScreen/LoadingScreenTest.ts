import { Airship } from "@Easy/Core/Shared/Airship";

export default class LoadingScreenTest extends AirshipBehaviour {
	override Start(): void {
		Airship.LoadingScreen.SetProgress("Big Wait", 0.1);

		task.wait(3);

		Airship.LoadingScreen.ShowSkipButton();
		while (task.wait()) {
			if (Airship.LoadingScreen.IsSkipRequested()) break;
		}

		Airship.LoadingScreen.FinishLoading();
	}
}
