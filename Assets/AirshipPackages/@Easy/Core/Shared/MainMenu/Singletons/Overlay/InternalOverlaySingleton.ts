import { Asset } from "@Easy/Core/Shared/Asset";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

@Singleton()
export class InternalOverlaySingleton implements OnStart {
	OnStart(): void {
		if (Game.IsInGame()) {
			Object.Instantiate(
				Asset.LoadAsset(
					"Assets/AirshipPackages/@Easy/Core/Prefabs/UI/MobileControls/AirshipOverlayCanvas.prefab",
				),
				CoreRefs.protectedTransform,
			);
		}
	}
}
