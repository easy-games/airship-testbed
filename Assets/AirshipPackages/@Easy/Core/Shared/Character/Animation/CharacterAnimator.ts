﻿import { AudioBundleSpacialMode, AudioClipBundle } from "@Easy/Core/Shared/Audio/AudioClipBundle";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import StringUtils from "@Easy/Core/Shared/Types/StringUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { Game } from "../../Game";


export default class CharacterAnimator extends AirshipBehaviour {
	@Header("References")
	public character!: Character;
	public flinchClip?: AnimationClip;
	public flinchClipViewmodel?: AnimationClip;
	private deathClip?: AnimationClip;
	private deathClipViewmodel?: AnimationClip;

	@Header("Variables")
	public baseFootstepVolumeScale = 0.1;

	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly defaultTransitionTime: number = 0.15;

	protected bin = new Bin();
	private damageEffectTemplate?: GameObject;
	private deathEffectTemplate?: GameObject;
	private deathEffectVoidTemplate?: GameObject;
	private isFlashing = false;
	protected isFirstPerson = false;

	protected viewModelEnabled = false;

	private footstepAudioBundle: AudioClipBundle | undefined;
	private slideAudioBundle: AudioClipBundle | undefined;
	private steppedOnBlockType = 0;
	private lastFootstepSoundTime = 0;

	private Log(message: string) {
		// print("Animator " + this.character.id + ": " + message);
	}

	public Start() {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		this.isFlashing = false;

		if (Game.IsClient()) {
			//AUDIO
			this.footstepAudioBundle = new AudioClipBundle([]);
			this.footstepAudioBundle.volumeScale = this.baseFootstepVolumeScale;
			this.footstepAudioBundle.soundOptions.maxDistance = 15;
			this.footstepAudioBundle.spacialMode = this.character.IsLocalCharacter()
				? AudioBundleSpacialMode.GLOBAL
				: AudioBundleSpacialMode.SPACIAL;

			// this.slideAudioBundle = new AudioClipBundle(this.refs.slideSoundPaths);
			// this.slideAudioBundle.volumeScale = 0.2;
			// this.slideAudioBundle.useFullPath = true;
			// this.slideAudioBundle.playMode = AudioBundlePlayMode.RANDOM_TO_LOOP;
			// this.slideAudioBundle.spacialMode = character.IsLocalCharacter()
			// 	? AudioBundleSpacialMode.GLOBAL
			// 	: AudioBundleSpacialMode.SPACIAL;

			//ANIMATIONS
			this.bin.Add(
				this.character.onHealthChanged.Connect((newHealth, oldHealth) => {
					if (newHealth < oldHealth) {
						this.PlayTakeDamage();
					}
				}),
			);

			//VFX
		}

		// todo: is this needed?
		this.gameObject.SetActive(true);
	}

	public SetViewModelEnabled(enabled: boolean): void {
		this.viewModelEnabled = enabled;
	}

	public SetFirstPerson(isFirstPerson: boolean) {
		this.isFirstPerson = isFirstPerson;
		this.character.animationHelper.SetFirstPerson(isFirstPerson);
	}

	public PlayTakeDamage() {
		//this.PlayDamageFlash();

		//Animate flinch
		let foundFlinchClip = this.isFirstPerson ? this.flinchClipViewmodel : this.flinchClip;
		if (foundFlinchClip) {
			this.character.animationHelper.PlayAnimation(foundFlinchClip, CharacterAnimationLayer.OVERRIDE_1);
		}
	}

	public PlayDeath() {
		//Play death animation
		if (this.character.IsLocalCharacter()) {
			//Lock Inputs
			this.character.movement.disableInput = true;
		}
		const deathClip = this.isFirstPerson ? this.deathClipViewmodel : this.deathClip;
		if (deathClip) {
			this.character.animationHelper.PlayAnimation(deathClip, CharacterAnimationLayer.OVERRIDE_1);
		}
	}

	private PlayDamageFlash() {
		if (this.character.IsDestroyed() || this.isFlashing) return;
		let allMeshes = this.character.accessoryBuilder.GetAllAccessoryMeshes();
		const duration = this.flashTransitionDuration + this.flashOnTime;
		this.isFlashing = true;
		for (let i = 0; i < allMeshes.Length; i++) {
			const renderer = allMeshes.GetValue(i);
			if (renderer && renderer.enabled) {
				renderer
					.TweenMaterialsFloatProperty("_OverrideStrength", 0, 1, this.flashTransitionDuration)
					.SetPingPong();
			}
		}
		task.delay(duration, () => {
			this.isFlashing = false;
		});
	}

	public SetFresnelColor(color: Color, power: number, strength: number) {
		// if (this.character.) return;
		// let allMeshes = ArrayUtil.Combine(
		// 	CSArrayUtil.Convert(this.character.accessoryBuilder.GetAccessoryMeshes(AccessorySlot.Root)),
		// 	this.refs.meshes,
		// );
		// //TODO: Material property block AddColor doesn't seem to be working???
		// /* const propertyBlock: MaterialPropertyBlock = Bridge.MakeMaterialPropertyBlock();
		// propertyBlock.AddFloat("_RimPower", power);
		// propertyBlock.AddFloat("_RimIntensity", strength);
		// propertyBlock.AddColor("_RimColor", color); */
		// allMeshes.forEach((renderer) => {
		// 	if (renderer && renderer.enabled) {
		// 		const materials = renderer.materials;
		// 		for (let i = 0; i < materials.Length; i++) {
		// 			const mat = materials.GetValue(i);
		// 			mat.EnableKeyword("RIM_LIGHT_ON");
		// 			mat.SetColor("_RimColor", color);
		// 			mat.SetFloat("_RimPower", power);
		// 			mat.SetFloat("_RimIntensity", strength);
		// 			//renderer.SetPropertyBlock(propertyBlock);
		// 		}
		// 	}
		// });
	}

	/**
	 *
	 * @param volumeScale
	 * @param cameraPos Pass in cached camera position if playing lots of sounds to improve performance.
	 * @returns
	 */
	public PlayFootstepSound(volumeScale: number, cameraPos?: Vector3): void {
		// Check if we should play
		if (os.clock() - this.lastFootstepSoundTime < 0.18) {
			return;
		}
		const blockId = this.character.movement.groundedBlockId;
		if (blockId === 0) return;

		if (!cameraPos) {
			cameraPos = Camera.main.transform.position;
		}
		if (cameraPos.sub(this.character.model.transform.position).magnitude > 20) {
			return;
		}

		// Finished checks. We are playing.
		this.lastFootstepSoundTime = os.clock();

		let itemType = ItemUtil.GetItemTypeFromBlockId(blockId);
		if (!itemType) {
			itemType = CoreItemType.STONE;
		}

		const itemMeta = ItemUtil.GetItemDef(itemType);

		// fallback to stone sounds.
		let stepSounds = itemMeta.block?.stepSound ?? ItemUtil.GetItemDef(CoreItemType.STONE).block?.stepSound;
		if (stepSounds === undefined) {
			stepSounds = [];
		}

		if (stepSounds.size() > 0 && this.footstepAudioBundle) {
			let soundPath = RandomUtil.FromArray(stepSounds);
			if (!StringUtils.includes(soundPath, ".")) {
				soundPath += ".ogg";
			}
			// let audioClip = AssetCache.LoadAsset<AudioClip>(soundPath);
			// let volume = this.baseFootstepVolumeScale * volumeScale;
			// this.refs.footstepAudioSource.PlayOneShot(audioClip, volume);
		}
	}

	private OnAnimationEvent(key: EntityAnimationEventKey) {
		switch (key) {
			case EntityAnimationEventKey.SLIDE_START:
				if (this.slideAudioBundle) {
					this.slideAudioBundle.spacialPosition = this.character.model.transform.position;
					this.slideAudioBundle.Stop();
					this.slideAudioBundle.PlayNext();
				}
				break;
			case EntityAnimationEventKey.SLIDE_END:
				this.slideAudioBundle?.Stop(1);
				break;
			case EntityAnimationEventKey.JUMP:
				// if (this.refs.jumpSound) {
				// 	if (this.character.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.refs.jumpSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(this.refs.jumpSound, this.character.model.transform.position, {
				// 			volumeScale: 0.2,
				// 		});
				// 	}
				// }
				break;
			case EntityAnimationEventKey.LAND:
				this.PlayFootstepSound(1.4);
				// if (this.refs.landSound) {
				// 	if (this.character.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.refs.landSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(this.refs.landSound, this.character.model.transform.position, {
				// 			volumeScale: 0.2,
				// 		});
				// 	}
				// }
				break;
		}
	}

	public IsFirstPerson(): boolean {
		return this.isFirstPerson;
	}

	public SetPlaybackSpeed(newSpeed: number) {
		this.character.animator.SetPlaybackSpeed(newSpeed);
	}

	public IsViewModelEnabled(): boolean {
		return this.viewModelEnabled;
	}

	public Destroy(): void {
		this.bin.Clean();
	}
}
