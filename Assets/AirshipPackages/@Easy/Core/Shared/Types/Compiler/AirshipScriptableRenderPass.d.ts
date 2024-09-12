/// <reference no-default-lib="true"/>

declare abstract class AirshipScriptableRenderPass {
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
	 * Execute the pass. This is where custom rendering occurs. Specific details are left to the implementation
	 */
	protected Execute?(cmd: CommandBuffer, renderingData: RenderingData): void;
	protected OnCameraSetup?(cmd: CommandBuffer, renderingData: RenderingData): void;
	protected OnCameraCleanup?(cmd: CommandBuffer): void;
	protected Configure?(cmd: CommandBuffer, descriptor: RenderTextureDescriptor): void;

	/**
	 * @deprecated
	 */
	protected Blit?(
		cmd: CommandBuffer,
		source: RTHandle,
		target: RTHandle,
		material: Material,
		passIndex: number,
	): void;
}
