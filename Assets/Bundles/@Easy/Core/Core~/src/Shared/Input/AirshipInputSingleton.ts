import { OnStart, Singleton } from "Shared/Flamework";

@Singleton({})
export class AirshipInputSingleton implements OnStart {
	OnStart(): void {}

	public CreateButtonInput(name: string, defaultKey: KeyCode): void {}
}
