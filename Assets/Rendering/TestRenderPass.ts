import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class ExampleBlurPass extends AirshipScriptableRenderPass {
	@Header("Profiling")
	// The profiler tag that will show up in the frame debugger.
	public profilerTag = "Template Pass";

	@Header("Pass Settings")
	public renderPassEvent: RenderPassEvent;

	/**
	 * @summary The downsampling size of the blur
	 */
	@Range(1, 4)
	@int
	public downsample = 1;

	/**
	 * @summary The strength of this blur
	 */
	@Range(0, 20)
	@int
	public blurStrength = 5;

	private colorBuffer: RenderBuffer;

	// It is good to cache the shader property IDs here.
	readonly blurStrengthId = Shader.PropertyToID("_BlurStrength");

	@Header("Material")
	public material: Material;

	private temporaryBufferID = Shader.PropertyToID("_TemporaryBuffer");
	private temporaryBuffer: RenderTargetIdentifier;

	protected Create(): void {
		print(this.renderPass, "is the renderPass");
		print("props", inspect(this));

		this.material.SetInt(this.blurStrengthId, this.blurStrength);
	}

	// // Gets called by the renderer before executing the pass.
	// // Can be used to configure render targets and their clearing state.
	// // Can be user to create temporary render target textures.
	// // If this method is not overriden, the render pass will render to the active camera render target.
	// protected OnCameraSetup(cmd: CommandBuffer, renderingData: RenderingData): void {
	// 	// Grab the camera target descriptor. We will use this when creating a temporary render texture.
	// 	const descriptor = renderingData.cameraData.cameraTargetDescriptor;

	// 	// Downsample the original camera target descriptor.
	// 	// You would do this for performance reasons or less commonly, for aesthetics.
	// 	descriptor.width /= this.downsample;
	// 	descriptor.height /= this.downsample;

	// 	// Set the number of depth bits we need for our temporary render texture.
	// 	descriptor.depthBufferBits = 0;

	// 	// Grab the color buffer from the renderer camera color target.
	// 	this.colorBuffer = renderingData.cameraData.targetTexture.colorBuffer;

	// 	// Create a temporary render texture using the descriptor from above.
	// 	cmd.GetTemporaryRT(this.temporaryBufferID, descriptor, FilterMode.Bilinear);
	// 	this.temporaryBuffer = new RenderTargetIdentifier(this.temporaryBufferID);
	// }

	// protected Execute(cmd: CommandBuffer, renderingData: RenderingData): void {
	// 	// Blit from the color buffer to a temporary buffer and back. This is needed for a two-pass shader.
	// 	this.renderPass.Blit(cmd, this.colorBuffer, this.temporaryBuffer, this.material, 0); // shader pass 0
	// 	this.renderPass.Blit(cmd, this.temporaryBuffer, this.colorBuffer, this.material, 1); // shader pass 1
	// }

	// protected OnCameraCleanup(cmd: CommandBuffer): void {
	// 	// Since we created a temporary render texture in OnCameraSetup, we need to release the memory here to avoid a leak.
	// 	cmd.ReleaseTemporaryRT(this.temporaryBufferID);
	// }
}
