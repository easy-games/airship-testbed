import { OnStart, Singleton } from "@Easy/Core/Shared/Flamework";
import { Airship } from "../../Airship";
import { AssetCache } from "../../AssetCache/AssetCache";
import { CameraReferences } from "../../Camera/CameraReferences";
import { Game } from "../../Game";
import StringUtils from "../../Types/StringUtil";
import { RandomUtil } from "../../Util/RandomUtil";
import { Signal } from "../../Util/Signal";
import { SetInterval } from "../../Util/Timer";
import Character from "../Character";
import { CharacterFootstepSignal } from "./CharacterFootstepSignal";

@Singleton({})
export class AirshipCharacterFootstepsSingleton implements OnStart {
	private entityLastFootstepTime = new Map<number, number>();

	public onFootstep = new Signal<CharacterFootstepSignal>();
	public baseFootstepVolumeScale = 0.1;
	public foostepSoundsEnabled = true;

	private materialMap = new Map<string, string[]>();

	constructor() {
		task.spawn(() => {
			const stonePaths = [
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Stone_01.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Stone_02.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Stone_03.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Stone_04.ogg",
			];
			this.materialMap.set("Stone_Clean", stonePaths);

			const woodPaths = [
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wood_01.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wood_02.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wood_03.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wood_04.ogg",
			];
			this.materialMap.set("Wood_Cherry_Natural", woodPaths);
			this.materialMap.set("Wood_Cherry_Toon", woodPaths);
			this.materialMap.set("Wood_Cherry_Natural_UV", woodPaths);
			this.materialMap.set("Wood_Cherry_Painted", woodPaths);
			this.materialMap.set("Wood_Cherry_Painted_Toon", woodPaths);
			this.materialMap.set("Wood_Cherry_Painted_UV", woodPaths);

			const woolPaths = [
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wool_01.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wool_02.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wool_03.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Wool_04.ogg",
			];
			this.materialMap.set("Denim_UV", woolPaths);

			const grassPaths = [
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Grass_01.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Grass_02.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Grass_03.ogg",
				"Assets/AirshipPackages/@Easy/Core/Sound/Footsteps/Footstep_Grass_04.ogg",
			];
			this.materialMap.set("Grass", grassPaths);
			this.materialMap.set("Dirt", grassPaths);
		});
	}

	OnStart(): void {
		if (!Game.IsClient()) return;

		task.delay(0.1, () => {
			const camTransform = CameraReferences.Instance().mainCamera?.transform;
			SetInterval(0.05, () => {
				if (!this.foostepSoundsEnabled) return;
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

					if (!character.movement.groundedRaycastHit.collider) {
						continue;
					}

					Profiler.BeginSample("PlayFootstepSound");
					try {
						// todo: footsteps
						// character.animator.PlayFootstepSound(volumeScale, camPos);
						this.PlayFootstepSound(character, camPos);
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

	private PlayFootstepSound(character: Character, camPos: Vector3): void {
		const raycastHit = character.movement.groundedRaycastHit;
		const renderer = raycastHit.collider.GetComponent<Renderer>()!;
		if (renderer) {
			const material = renderer.material;
			let [materialName] = material.name.gsub("%s*%([^)]+%)", "");
			let materialNameLower = materialName.lower();
			// print("footstep material: " + material.name + ', shortened: "' + materialName + '"');
			let volumeScale = character.state === CharacterState.Crouching ? 0.3 : 1;
			if (!character.IsLocalCharacter()) {
				volumeScale *= 2;
			}
			let volume = this.baseFootstepVolumeScale * volumeScale;

			let clips: AudioClip[] = [];
			let foundPaths = this.materialMap.get(materialName);
			if (!foundPaths) {
				if (
					StringUtils.includes(materialNameLower, "dirt") ||
					StringUtils.includes(materialNameLower, "grass")
				) {
					foundPaths = this.materialMap.get("Dirt");
				}
			}
			if (!foundPaths) {
				foundPaths = this.materialMap.get("Stone_Clean");
			}
			if (foundPaths) {
				for (let path of foundPaths) {
					const clip = AssetCache.LoadAssetIfExists<AudioClip>(path);
					if (clip) {
						clips.push(clip);
					}
				}
			}

			const signal = new CharacterFootstepSignal(character, material, raycastHit, clips, camPos, volume);
			this.onFootstep.Fire(signal);
			if (signal.IsCancelled()) return;
			if (signal.audioClips.size() === 0) return;

			const audioClip = RandomUtil.FromArray(signal.audioClips);

			// print("playing footstep sound: " + audioClip.name);
			character.footstepAudioSource.PlayOneShot(audioClip, signal.volume);
		}
	}
}
