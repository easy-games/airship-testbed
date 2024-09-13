/// <reference no-default-lib="true"/>

type CastsToRTHandle = RTHandle | RenderTargetIdentifier | Texture | RenderTexture;

type ScriptableRenderPassInput = unknown;
type SortingCriteria = unknown;

declare interface ScriptableRenderPass {
	readonly clearColor: Color;
	readonly clearFlag: RTClearFlags;
	readonly colorAttachmentHandle: RTHandle;
	readonly depthAttachmentHandle: RTHandle;
	readonly colorAttachmentHandles: CSArray<RTHandle>;
	readonly colorStoreActions: CSArray<RenderBufferStoreAction>;
	readonly depthStoreAction: RenderBufferStoreAction;
	readonly input: ScriptableRenderPassInput;
	readonly profilingSampler: never;
	readonly renderPassEvent: RenderPassEvent;

	Blit(
		cmd: CommandBuffer,
		source: CastsToRTHandle,
		target: CastsToRTHandle,
		material: Material,
		passIndex: int,
	): void;
	Blit(cmd: CommandBuffer, data: RenderingData, material: Material, passIndex?: int);
	Blit(cmd: CommandBuffer, data: RenderingData, source: CastsToRTHandle, material: Material, passIndex?: int);

	ConfigureClear(clearFlag: int, color: Color): void;
	ConfigureInput(input: ScriptableRenderPassInput): void;
	ConfigureColorStoreActions(actions: CSArray<RenderBufferStoreAction>): void;
	ConfigureDepthStoreAction(action: RenderBufferStoreAction): void;
	ResetTarget(): void;

	CreateDrawingSettings(
		shaderTagIdList: CSArray<ShaderTagId>,
		renderingData: RenderingData,
		sortingCriteria: unknown,
	): void;
	CreateDrawingSettings(
		shaderTagId: ShaderTagId,
		renderingData: RenderingData,
		sortingCriteria: SortingCriteria,
	): void;
}

declare abstract class AirshipScriptableRenderPass {
	readonly renderPass: ScriptableRenderPass;
	// readonly clearColor: Color;
	// readonly clearFlag: RTClearFlags;
	// readonly colorAttachmentHandle: RTHandle;
	// readonly depthAttachmentHandle: RTHandle;
	// readonly colorAttachmentHandles: CSArray<RTHandle>;
	// readonly colorStoreActions: CSArray<RenderBufferStoreAction>;
	// readonly depthStoreAction: RenderBufferStoreAction;
	// readonly input: never;
	// readonly profilingSampler: never;
	// @SerializeField()
	// readonly renderPassEvent: RenderPassEvent;

	/**
	 * @deprecated Use {@link Create} to handle anything that needs to be executed on the render pass creation
	 */
	protected constructor();

	protected Create(): void;

	/**
	 * Execute the pass. This is where custom rendering occurs. Specific details are left to the implementation
	 */
	protected Execute?(cmd: CommandBuffer, renderingData: RenderingData): void;
	protected OnCameraSetup?(cmd: CommandBuffer, renderingData: RenderingData): void;
	protected OnCameraCleanup?(cmd: CommandBuffer): void;
	protected Configure?(cmd: CommandBuffer, descriptor: RenderTextureDescriptor): void;
}
