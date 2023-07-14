import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Task } from "Shared/Util/Task";
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
	/** Key codes in activation range. */
	private activatableKeycodes = new Set<Key>();

	OnStart(): void {
		/* Listen for prompt creation. */
		ClientSignals.ProximityPromptCreated.Connect((event) => {
			this.proximityPrompts.push(event.prompt);
		});
		/* Listen for keypresses for prompt activation. */
		// this.keyboard.KeyDown.Connect((event) => {
		// 	this.HandleKeypress(event.Key);
		// });
		/* Start conditionally displaying prompts. */
		this.FindActivatablePrompts();
	}

	/** Handle keypresses and activate prompts if applicable. */
	// private HandleKeypress(key: Key): void {
	// 	const eligiblePrompt = this.activatableProximityPrompts.find((prompt) => prompt.data.activationKey === key);
	// 	if (eligiblePrompt) {
	// 		eligiblePrompt.ActivatePrompt();
	// 	}
	// }

	/** Returns distance between local player and a proximity prompt. */
	private GetDistanceToPrompt(prompt: ProximityPrompt): number {
		/* If local character does _not_ have a position, fallback to `math.huge`. */
		const localCharacterPosition = Game.LocalPlayer.Character?.gameObject.transform.position;
		if (!localCharacterPosition) return math.huge;
		/* Otherwise, return distance. */
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
						// const keycodeActive = this.activatableKeycodes.has(prompt.data.activationKey);
						/*
						 * If prompt is already active or prompt with same keycode is active,
						 * do nothing. Otherwise, display prompt.
						 */
						if (!alreadyActive) {
							// this.activatableKeycodes.add(prompt.data.activationKey);
							this.activatableProximityPrompts.push(prompt);
							this.ShowPrompt(prompt);
							prompt.SetCanActivate(true);
						}
					} else {
						const promptIndex = this.GetActivePromptIndexById(prompt.id);
						const wasActive = promptIndex > -1;
						/* If prompt was active, but is now out of range, hide prompt. */
						if (wasActive) {
							// this.activatableKeycodes.delete(prompt.data.activationKey);
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
		}
	}

	/** Hides a proximity prompt. */
	private HidePrompt(prompt: ProximityPrompt): void {
		if (prompt.promptGameObject) {
			prompt.promptGameObject.SetActive(false);
		}
	}

	/**
	 * Returns an active proximity prompt's index.
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
}
