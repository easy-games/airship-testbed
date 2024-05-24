import { CharactersSingleton } from "@Easy/Core/Shared/Character/CharactersSingleton";
import { Flamework, Singleton } from "@Easy/Core/Shared/Flamework";

@Singleton()
export class TestSingleton {
	private test = Flamework.id<TestSingleton>();
	public constructor(private readonly singleton: CharactersSingleton) {}
}
