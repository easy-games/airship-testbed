import { OnStart, Singleton } from "../Flamework";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "../Util/Timer";

@Singleton()
export class AirshipDriverSingleton implements OnStart {
	OnStart(): void {
		const fullGo = gameObject as GameObject & {
			OnUpdate(callback: () => void): void;
			OnLateUpdate(callback: () => void): void;
			OnFixedUpdate(callback: () => void): void;
		};
		// Drive timer:
		fullGo.OnUpdate(() => {
			OnUpdate.Fire(Time.deltaTime);
		});
		fullGo.OnLateUpdate(() => {
			OnLateUpdate.Fire(Time.deltaTime);
		});
		fullGo.OnFixedUpdate(() => {
			OnFixedUpdate.Fire(Time.fixedDeltaTime);
		});
	}
}
