declare const enum AntialiasingMode {
	None,
	FastApproximateAntialiasing,
	SubpixelMorphologicalAntiAliasing,
	TemporalAntiAliasing,
}

declare const enum AntialiasingQuality {
	Low,
	Medium,
	High,
}

declare const enum RenderPassEvent {
	BeforeRendering = 0,
	BeforeRenderingShadows = 50, // 0x00000032
	AfterRenderingShadows = 100, // 0x00000064
	BeforeRenderingPrePasses = 150, // 0x00000096
	AfterRenderingPrePasses = 200, // 0x000000C8
	BeforeRenderingGbuffer = 210, // 0x000000D2
	AfterRenderingGbuffer = 220, // 0x000000DC
	BeforeRenderingDeferredLights = 230, // 0x000000E6
	AfterRenderingDeferredLights = 240, // 0x000000F0
	BeforeRenderingOpaques = 250, // 0x000000FA
	AfterRenderingOpaques = 300, // 0x0000012C
	BeforeRenderingSkybox = 350, // 0x0000015E
	AfterRenderingSkybox = 400, // 0x00000190
	BeforeRenderingTransparents = 450, // 0x000001C2
	AfterRenderingTransparents = 500, // 0x000001F4
	BeforeRenderingPostProcessing = 550, // 0x00000226
	AfterRenderingPostProcessing = 600, // 0x00000258
	AfterRendering = 1000, // 0x000003E8
}

declare interface PostProcessingData {
	readonly gradingMode: unknown;
	readonly lutSize: number;
	readonly useFastSRGBLinearConversion: boolean;
	readonly supportScreenSpaceLensFlare: boolean;
	readonly supportDataDrivenLensFlare: boolean;
}

declare interface CameraData {
	readonly cameraTargetDescriptor: RenderTextureDescriptor;
	readonly targetTexture: RenderTexture;
}

declare interface LightData {
	readonly mainLightIndex: number;
	readonly additionalLightsCount: number;
	readonly maxPerObjectAdditionalLightsCount: number;
	// public NativeArray<VisibleLight> visibleLights;
	readonly shadeAdditionalLightsPerVertex: boolean;
	readonly supportsMixedLighting: boolean;
	readonly reflectionProbeBoxProjection: boolean;
	readonly reflectionProbeBlending: boolean;
	readonly supportsLightLayers: boolean;
	readonly supportsAdditionalLights: boolean;
}

declare interface RenderingData {
	readonly cameraData: CameraData;
	readonly lightData: LightData;
	readonly postProcessingData: PostProcessingData;
}

declare interface RTHandle {
	readonly name: string;
	readonly isMSAAEnabled: boolean;
	readonly nameID: RenderTargetIdentifier;
	readonly rt: RenderTexture;
}
