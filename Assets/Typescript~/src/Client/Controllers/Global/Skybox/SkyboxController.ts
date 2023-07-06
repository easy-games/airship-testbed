import { Controller, OnStart } from "@easy-games/flamework-core";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class SkyboxController implements OnStart {
	constructor() {
		SetTimeout(3, () => {
			// print("loading skybox");
			// const skyboxMat = AssetBridge.LoadAsset<Material>("Shared/Skybox/Skybox.mat");
			// RenderSettings.skybox = skyboxMat;
			// print("updated skybox!");
		});
	}
	OnStart(): void {}
}
