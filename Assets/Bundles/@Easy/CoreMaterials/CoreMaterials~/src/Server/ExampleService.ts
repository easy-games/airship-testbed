import { OnStart, Service } from "@easy-games/flamework-core";

@Service()
export class ExampleService implements OnStart {
	OnStart(): void {
		print("ExampleService says hello!");
	}
}
