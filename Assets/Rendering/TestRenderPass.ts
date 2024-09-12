export default class ExampleBlurPass extends AirshipScriptableRenderPass {
	@Header("Profiling")
	public profilerTag = "Template Pass";

	@Header("Pass Settings")
	@Range(1, 4)
	@int
	public downsample = 1;

	@Range(0, 20)
	@int
	public blurStrength = 5;

	private colorBuffer: RenderTexture;
	private temporaryBufferId = Shader.PropertyToID("_TemporaryBuffer");

	private material: Material;

	constructor() {
		super();
		print("Constructed");
		this.blurStrength = 10;
	}

	// protected Configure(cmd: CommandBuffer, descriptor: RenderTextureDescriptor): void {
	// 	print("Configure", cmd, descriptor.width, descriptor.width, descriptor.height);
	// }
	protected Execute(cmd: CommandBuffer, renderingData: RenderingData): void {
		print("cmd is", cmd.name, "data is", renderingData.lightData);
	}

	// protected OnCameraSetup(cmd: CommandBuffer, renderingData: RenderingData): void {
	// 	print(cmd, renderingData, renderingData.cameraData, renderingData.postProcessingData);
	// }

	// protected Execute(command: CommandBuffer): void {
	// 	print("Execute", command);
	// 	//print("Executing", command.name);
	// }

	// protected OnCameraSetup(cmd: CommandBuffer): void {
	// 	print("Camera Setup ", cmd);
	// 	// const descriptor = rd.cameraData.cameraTargetDescriptor;
	// 	// descriptor.width /= this.downsample;
	// 	// descriptor.height /= this.downsample;

	// 	// descriptor.depthBufferBits = 0;

	// 	// this.colorBuffer = rd.cameraData.targetTexture;
	// }

	// protected OnCameraCleanup(cmd: CommandBuffer): void {
	// 	print("Camera cleanup", cmd);
	// }
}

class Test extends AirshipBehaviour {}
