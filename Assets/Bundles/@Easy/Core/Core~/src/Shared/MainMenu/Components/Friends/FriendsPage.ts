import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class FriendsPage extends AirshipBehaviour {
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.Add(Dependency<MainMenuSingleton>().navbarModifier.Add({ hidden: true }));
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
