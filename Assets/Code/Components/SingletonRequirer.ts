import TestSingleton from "./SingletonTest";

export default class SingletonRequirer extends AirshipBehaviour {
	override Start(): void {
		const aSingleton = TestSingleton.Get();
		aSingleton.PrintHelloWorld();
	}

	override OnDestroy(): void {}

	toString() {
		return "hi";
	}
}
