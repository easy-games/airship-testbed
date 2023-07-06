import { GENERATOR_PICKUP_RANGE, GeneratorDto } from "./GeneratorMeta";

/** Set of utilities pertaining to generators. */
export class GeneratorUtil {
	/**
	 * Check if an entity position is in pick up range of generator stack.
	 * @param generatorStateDto A generator state.
	 * @param entityPosition Position of entity querying generator.
	 * @returns Whether or not entity is close enough to pick up generator stack.
	 */
	public static CanPickupGeneratorStack(generatorStateDto: GeneratorDto, entityPosition: Vector3): boolean {
		const generatorPosition = generatorStateDto.pos;
		const distFromGenerator = generatorPosition.sub(entityPosition).magnitude;
		return distFromGenerator <= GENERATOR_PICKUP_RANGE;
	}
}
