import { CameraReferences } from "@Easy/Core/Shared/Camera/CameraReferences";
import { Airship } from "Shared/Airship";
import { Controller, OnStart } from "Shared/Flamework";
import { SetInterval } from "Shared/Util/Timer";

@Controller({})
export class EntityFootstepController implements OnStart {
	private entityLastFootstepTime = new Map<number, number>();

	constructor() {}

	OnStart(): void {
		task.delay(0.1, () => {
			const camTransform = CameraReferences.Instance().mainCamera?.transform;
			SetInterval(0.05, () => {
				if (camTransform === undefined) return;
				const currentTime = Time.time;
				const camPos = camTransform.position;
				Profiler.BeginSample("Footsteps");
				let footstepCount = 0;
				for (const character of Airship.characters.GetCharacters()) {
					if (character.IsDead()) continue;
					let cooldown = -1;
					const state = character.state;
					if (state === CharacterState.Sprinting) {
						cooldown = 0.23;
					} else if (state === CharacterState.Running) {
						cooldown = 0.36;
					}
					if (cooldown === -1) {
						continue;
					}
					const lastTime = this.entityLastFootstepTime.get(character.id) || 0;
					if (currentTime - lastTime < cooldown) {
						continue;
					}
					this.entityLastFootstepTime.set(character.id, currentTime);

					let volumeScale = character.state === CharacterState.Crouching ? 0.3 : 1;
					if (!character.IsLocalCharacter()) {
						volumeScale *= 2;
					}
					Profiler.BeginSample("PlayFootstepSound");
					try {
						// todo: footsteps
						character.animator.PlayFootstepSound(volumeScale, camPos);
					} catch (err) {
						Debug.LogError("footstep error: " + err);
					}
					footstepCount++;
					if (footstepCount >= 5) {
						break;
					}
					Profiler.EndSample();
				}
				Profiler.EndSample();
			});
		});
	}
}
