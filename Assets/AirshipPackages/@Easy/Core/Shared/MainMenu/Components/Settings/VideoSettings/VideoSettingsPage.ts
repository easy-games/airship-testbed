import SettingsToggle from "../Controls/SettingsToggle";

export default class VideoSettingsPage extends AirshipBehaviour {
	public msaaToggle: SettingsToggle;
	public hdShadowsToggle: SettingsToggle;
	public vsyncToggle: SettingsToggle;

	override Start(): void {
		const pipelineAsset = GraphicsSettings.currentRenderPipeline as UniversalRenderPipelineAsset;

		this.msaaToggle.Init("Anti Aliasing", pipelineAsset.msaaSampleCount === 4);
		this.msaaToggle.toggle.onValueChanged.Connect((val) => {
			pipelineAsset.msaaSampleCount = val ? 4 : 1;
		});

		this.hdShadowsToggle.Init("HD Shadows", QualitySettings.shadows === ShadowQuality.All);
		this.hdShadowsToggle.toggle.onValueChanged.Connect((val) => {
			if (val) {
				// High Quality Settings
				QualitySettings.shadows = ShadowQuality.All;
				QualitySettings.shadowResolution = ShadowResolution.VeryHigh;
				QualitySettings.shadowDistance = 100;

				pipelineAsset.shadowCascadeCount = 4;
				pipelineAsset.cascade4Split = new Vector3(0.067, 0.2, 0.467);
				pipelineAsset.shadowDepthBias = 0.8;
				pipelineAsset.shadowNormalBias = 0.6;
			} else {
				QualitySettings.shadowResolution = ShadowResolution.Low;
				QualitySettings.shadowDistance = 50;

				pipelineAsset.msaaSampleCount = 1;
				pipelineAsset.shadowCascadeCount = 1;
				pipelineAsset.shadowDepthBias = 1.5;
				pipelineAsset.shadowNormalBias = 1.5;
			}
		});

		this.vsyncToggle.Init("VSync", QualitySettings.vSyncCount === 1);
		this.vsyncToggle.toggle.onValueChanged.Connect((val) => {
			QualitySettings.vSyncCount = val ? 1 : 0;
		});
	}

	override OnDestroy(): void {}
}
