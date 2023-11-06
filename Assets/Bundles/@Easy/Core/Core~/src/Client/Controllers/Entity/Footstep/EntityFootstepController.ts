import { Controller, OnStart } from "@easy-games/flamework-core";
import { Task } from "Shared/Util/Task";
import { SetInterval } from "Shared/Util/Timer";
import { EntityController } from "../EntityController";

@Controller({})
export class EntityFootstepController implements OnStart {
	private entityLastFootstepTime = new Map<number, number>();

	constructor(private readonly entityController: EntityController) {}

	OnStart(): void {
		Task.Spawn(() => {
			const camTransform = Camera.main.transform;
			SetInterval(0.05, () => {
				const currentTime = Time.time;
				const camPos = camTransform.position;
				Profiler.BeginSample("Footsteps");
				for (const entity of this.entityController.GetEntities()) {
					if (entity.IsDead()) continue;
					let cooldown = -1;
					const state = entity.GetState();
					if (state === EntityState.Sprinting) {
						cooldown = 0.23;
					} else if (state === EntityState.Running) {
						cooldown = 0.36;
					}
					if (cooldown === -1) {
						continue;
					}
					const lastTime = this.entityLastFootstepTime.get(entity.id) || 0;
					if (currentTime - lastTime < cooldown) {
						continue;
					}
					this.entityLastFootstepTime.set(entity.id, currentTime);

					let volumeScale = entity.GetState() === EntityState.Crouching ? 0.3 : 1;
					if (!entity.IsLocalCharacter()) {
						volumeScale *= 2;
					}
					try {
						entity.animator.PlayFootstepSound(volumeScale, camPos);
					} catch (err) {
						Debug.LogError(err);
					}
				}
				Profiler.EndSample();
			});
		});
	}
}
