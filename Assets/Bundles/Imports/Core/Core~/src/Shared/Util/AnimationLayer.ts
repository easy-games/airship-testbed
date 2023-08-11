export class AnimationLayer {
	private static layerCounter = 10;
	public static AllocateLayer(): number {
		const layer = this.layerCounter;
		this.layerCounter++;
		return layer;
	}
}
