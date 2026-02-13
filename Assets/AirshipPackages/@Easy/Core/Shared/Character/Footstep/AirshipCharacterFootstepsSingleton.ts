import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Asset } from "../../Asset";
import StringUtils from "../../Types/StringUtil";
import { RandomUtil } from "../../Util/RandomUtil";
import { Signal } from "../../Util/Signal";
import Character from "../Character";
import { CharacterFootstepSignal } from "./CharacterFootstepSignal";

@Singleton({})
export class AirshipCharacterFootstepsSingleton {
	public onFootstep = new Signal<CharacterFootstepSignal>();
	public baseFootstepVolumeScale = 0.1;
	public foostepSoundsEnabled = true;
	public checkForVoxelWorld = true;

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
			this.materialMap.set("Wood", woodPaths);
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
			this.materialMap.set("Wool", woolPaths);
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

	public PlayFootstepSound(character: Character): void {
		if (!this.foostepSoundsEnabled) return;
		if (!character.movement) return; // TODO remove dependency on movement for footsteps

		const raycastHit = character.movement.groundedRaycastHit;
		const renderer = raycastHit.collider?.GetComponent<Renderer>();

		const materialName = "grass";
		let material: Material | undefined;
		const clips: AudioClip[] = [];
		const crouching = character.state === CharacterState.Crouching;
		let volumeScale = crouching ? 0.3 : 1;
		if (!character.IsLocalCharacter()) {
			volumeScale *= 2;
		}
		const volume = this.baseFootstepVolumeScale * volumeScale;
		let foundPaths: string[] | undefined = [];

		if (renderer) {
			const material = renderer.material;
			let matName = material.name;
			matName = material.name.gsub("%s*%([^)]+%)", "")[0];
			if (this.checkForVoxelWorld && LayerMask.LayerToName(renderer.gameObject.layer) === "VoxelWorld") {
				const world = renderer.gameObject.GetComponentInParent<VoxelWorld>();
				const def = world?.GetVoxelBlockDefAt(
					raycastHit.point.sub(new Vector3(0, 0.05, 0)).sub(world.transform.position),
				);
				if (def) {
					matName = def.definition.name;
				}
			}

			const materialNameLower = matName.lower();

			// print("footstep material: " + material.name + ', shortened: "' + materialName + '"');

			foundPaths = this.materialMap.get(materialName);
			if (!foundPaths) {
				if (
					StringUtils.includes(materialNameLower, "dirt") ||
					StringUtils.includes(materialNameLower, "grass") ||
					StringUtils.includes(materialNameLower, "sand")
				) {
					foundPaths = this.materialMap.get("Dirt");
				} else if (
					StringUtils.includes(materialNameLower, "wood") ||
					StringUtils.includes(materialNameLower, "plank")
				) {
					foundPaths = this.materialMap.get("Wood");
				} else if (StringUtils.includes(materialNameLower, "wool")) {
					foundPaths = this.materialMap.get("Wool");
				}
			}
			if (!foundPaths) {
				foundPaths = this.materialMap.get("Stone_Clean");
			}
		} else {
			foundPaths = this.materialMap.get("Grass");
		}

		if (foundPaths) {
			for (const path of foundPaths) {
				const clip = Asset.LoadAssetIfExists<AudioClip>(path);
				if (clip) {
					clips.push(clip);
				}
			}
		}

		const signal = new CharacterFootstepSignal(
			character,
			raycastHit,
			material,
			RandomUtil.FromArray(clips),
			volume,
			crouching,
		);
		this.onFootstep.Fire(signal);
		if (signal.IsCancelled()) return;

		const audioClip = signal.audioClip;

		// print("playing footstep sound: " + audioClip.name);
		if (character.footstepAudioSource) {
			character.footstepAudioSource.PlayOneShot(audioClip, signal.volume);
		}
	}
}
