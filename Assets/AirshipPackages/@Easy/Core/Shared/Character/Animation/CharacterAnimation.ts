﻿import Character from "@Easy/Core/Shared/Character/Character";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Signal } from "../../Util/Signal";
import { Game } from "../../Game";

export default class CharacterAnimation extends AirshipBehaviour {
	@Header("References")
	public character!: Character;
	public flinchClip?: AnimationClip;
	public flinchClipViewmodel?: AnimationClip;
	private deathClip?: AnimationClip;
	private deathClipViewmodel?: AnimationClip;

	public OnAnimationEvent = new Signal<[key: string, strValue?: string, intValue?: number, floatValue?: number]>();

	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly defaultTransitionTime: number = 0.15;

	protected bin = new Bin();
	private isFlashing = false;
	protected isFirstPerson = false;

	protected viewModelEnabled = false;

	private Log(message: string) {
		print("Animator " + this.character.id + ": " + message);
	}

	public Start() {
		this.isFlashing = false;

		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		this.character.WaitForInit();

		if (Game.IsClient()) {
			//ANIMATIONS
			this.bin.Add(
				this.character.onHealthChanged.Connect((newHealth, oldHealth) => {
					if (newHealth < oldHealth) {
						this.PlayTakeDamage();
					}
				}),
			);

			//Animation Events
			const animEvents = this.character.animationHelper.animationEvents;
			if(animEvents){
				this.bin.AddEngineEventConnection(animEvents.OnAnimEvent((key)=>{
					this.HandleAnimationEvents(key);
					if(this.OnAnimationEvent){
						this.OnAnimationEvent.Fire(key);
					}
				}));
	
				this.bin.AddEngineEventConnection(animEvents.OnAnimObjEvent((data)=>{
					this.HandleAnimationEvents(data.key, data.stringValue, data.intValue, data.floatValue);
					if(this.OnAnimationEvent){
						this.OnAnimationEvent.Fire(data.key, data.stringValue, data.intValue, data.floatValue);
					}
				}));
			}
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
			this.character.animationHelper.PlayAnimation(foundFlinchClip, CharacterAnimationLayer.OVERRIDE_4, 0.05);
		}
	}

	public PlayDeath() {
		//Play death animation
		if (this.character.IsLocalCharacter()) {
			//Lock Inputs
			if (this.character.movement) this.character.movement.disableInput = true;
		}
		const deathClip = this.isFirstPerson ? this.deathClipViewmodel : this.deathClip;
		if (deathClip) {
			this.character.animationHelper.PlayAnimation(deathClip, CharacterAnimationLayer.OVERRIDE_1, 0.05);
		}
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

	public IsFirstPerson(): boolean {
		return this.isFirstPerson;
	}

	public SetPlaybackSpeed(newSpeed: number) {
		this.character.animation?.SetPlaybackSpeed(newSpeed);
	}

	public IsViewModelEnabled(): boolean {
		return this.viewModelEnabled;
	}

	public Destroy(): void {
		this.bin.Clean();
	}

	private HandleAnimationEvents(key: string, strValue?: string, intValue?: number, floatValue?: number){
		if (key === "Footstep") {
			if (this.character.movement?.isGrounded) {
				Airship.Characters.footsteps.PlayFootstepSound(this.character);
			}
		}
	}
}
