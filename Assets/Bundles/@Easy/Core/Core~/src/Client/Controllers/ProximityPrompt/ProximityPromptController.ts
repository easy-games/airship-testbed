import { Controller, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Task } from "Shared/Util/Task";
import { SetTimeout } from "Shared/Util/Timer";
import { ProximityPrompt } from "./ProximityPrompt";

/** Prompt poll rate, how frequently we update `activatableProximityPrompts`. */
const PROMPT_POLL_RATE = 0.1;

@Controller({})
export class ProximityPromptController implements OnStart {
	/** Keyboard instance. */
	private keyboard = new Keyboard();
	/** All active proximity prompts in world. */
	private proximityPrompts: ProximityPrompt[] = [];
	/** Proximity prompts in activation range. */
	private activatableProximityPrompts: ProximityPrompt[] = [];

	OnStart(): void {
		this.FindActivatablePrompts();

		// Hacked in to only support [F] keycode for now :)
		this.keyboard.OnKeyDown(KeyCode.F, (event) => {
			if (event.uiProcessed) return;
			if (this.activatableProximityPrompts.size() === 0) return;

			const eligiblePrompt = this.activatableProximityPrompts[0];
			eligiblePrompt.ActivatePrompt();
		});
	}

	public RegisterProximityPrompt(prompt: ProximityPrompt): void {
		this.proximityPrompts.push(prompt);
	}

	/** Returns distance between local player and a proximity prompt. */
	private GetDistanceToPrompt(prompt: ProximityPrompt): number {
		// If local character does _not_ have a position, fallback to `math.huge`.
		const localCharacterPosition = Game.localPlayer.character?.gameObject.transform.position;
		if (!localCharacterPosition) return math.huge;
		// Otherwise, return distance.
		return localCharacterPosition.sub(prompt.data.promptPosition).magnitude;
	}

	/** Displays and hides prompts based on `activationRange`. */
	private FindActivatablePrompts(): void {
		Task.Spawn(() => {
			Task.Repeat(PROMPT_POLL_RATE, () => {
				this.proximityPrompts.forEach((prompt) => {
					const distToPrompt = this.GetDistanceToPrompt(prompt);
					if (distToPrompt <= prompt.data.activationRange) {
						const alreadyActive = this.GetActivePromptIndexById(prompt.id) > -1;
						// If prompt is already active or prompt with same keycode is active,
						// do nothing. Otherwise, display prompt.
						if (!alreadyActive) {
							this.activatableProximityPrompts.push(prompt);
							this.ShowPrompt(prompt);
							prompt.SetCanActivate(true);
						}
					} else {
						const promptIndex = this.GetActivePromptIndexById(prompt.id);
						const wasActive = promptIndex > -1;
						//If prompt was active, but is now out of range, hide prompt.
						if (wasActive) {
							this.activatableProximityPrompts.remove(promptIndex);
							this.HidePrompt(prompt);
							prompt.SetCanActivate(false);
						}
					}
				});
			});
		});
	}

	/** Shows a proximity prompt. */
	private ShowPrompt(prompt: ProximityPrompt): void {
		if (prompt.promptGameObject) {
			prompt.promptGameObject.SetActive(true);

			const duration = 0.12;

			const t = prompt.promptGameObject.transform;
			const pos = prompt.data.promptPosition;
			t.localPosition = pos.add(new Vector3(0, -0.12, 0));
			t.TweenLocalPosition(pos, duration);

			const canvasGroup = prompt.promptGameObject.transform.GetChild(0).GetComponent<CanvasGroup>();
			canvasGroup.alpha = 0;
			canvasGroup.TweenCanvasGroupAlpha(1, duration);
		}
	}

	/** Hides a proximity prompt. */
	private HidePrompt(prompt: ProximityPrompt): void {
		if (prompt.promptGameObject) {
			const duration = 0.12;

			const t = prompt.promptGameObject.transform;
			t.TweenLocalPosition(t.localPosition.add(new Vector3(0, -0.12, 0)), duration);

			const canvasGroup = prompt.promptGameObject.transform.GetChild(0).GetComponent<CanvasGroup>();
			canvasGroup.TweenCanvasGroupAlpha(0, duration);

			SetTimeout(duration, () => {
				prompt.promptGameObject?.SetActive(false);
			});
		}
	}

	/**
	 * Returns an active proximity prompt's index.
	 *
	 * @param promptId An active proximity prompt id.
	 * @returns Index that corresponds to active prompt with `promptId`. If prompt is _not_ active, the function returns -1.
	 */
	private GetActivePromptIndexById(promptId: string): number {
		let promptIndex = -1;
		for (let i = 0; i < this.activatableProximityPrompts.size(); i++) {
			const promptAtIndex = this.activatableProximityPrompts[i];
			if (promptAtIndex.id === promptId) {
				promptIndex = i;
				break;
			}
		}
		return promptIndex;
	}

	/**
	 * Removes prompt from `proximityPrompts` and `activatableProximityPrompts`.
	 *
	 * @param prompt The prompt to remove.
	 */
	public RemovePrompt(prompt: ProximityPrompt): void {
		this.proximityPrompts = this.proximityPrompts.filter((p) => p.id !== prompt.id);
		this.activatableProximityPrompts = this.activatableProximityPrompts.filter((p) => p.id !== prompt.id);
	}
}
