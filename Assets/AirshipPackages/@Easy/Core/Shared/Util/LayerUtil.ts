export class LayerUtil {
	public static GetLayerMask(layers: number[]): number {
		let mask = 0;

		layers.forEach((layerValue) => (mask |= 1 << layerValue));

		return mask;
	}

	public static LayerIsInMask(layer: number, layerMask: number): boolean {
		const result = layerMask === (layerMask | (1 << layer));

		return result;
	}
}
