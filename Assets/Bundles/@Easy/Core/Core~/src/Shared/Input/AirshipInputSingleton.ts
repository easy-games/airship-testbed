import { Controller, OnStart, Service } from "Shared/Flamework";

@Service({})
@Controller({})
export class AirshipInputSingleton implements OnStart {
	OnStart(): void {}

	public CreateButtonInput(name: string, defaultKey: KeyCode): void {}
}
