export abstract class baseComponent<T> extends AirshipBehaviour {}

export default class ComponentTest extends baseComponent<number> {
	override Start(): void {}

	override OnDestroy(): void {}
}
