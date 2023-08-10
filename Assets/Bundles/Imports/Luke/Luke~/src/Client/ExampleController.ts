import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller()
export class ExampleController implements OnStart {
	OnStart(): void {
		print("ExampleController says hello!");
	}
}
