export class OcclusionCameraManager {
	public static ExcludedLayers = [
		"TransparentFX",
		"Ignore Raycast",
		"Character",
		"Water",
		"UI",
		"WorldUI",
		"Viewmodel",
		"VisuallyHidden",
		"IgnoreCollision",
		"AvatarEditor",
	];

	public static ExcludeLayer(layerName: string): void {
		OcclusionCameraManager.ExcludedLayers.push(layerName);
	}

	public static IncludeLayer(layerName: string): void {
		OcclusionCameraManager.ExcludedLayers = this.ExcludedLayers.filter((name) => layerName !== name);
	}

	public static ClearLayers(): void {
		OcclusionCameraManager.ExcludedLayers = [];
	}

	public static GetMask(): number {
		return LayerMask.InvertMask(LayerMask.GetMask(...OcclusionCameraManager.ExcludedLayers));
	}
}
