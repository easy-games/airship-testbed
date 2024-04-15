import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import { CoreRefs } from "Shared/CoreRefs";
import { Controller, OnStart } from "Shared/Flamework";
import { Game } from "Shared/Game";
import { Keyboard } from "Shared/UserInput";
import { Task } from "Shared/Util/Task";

/** Prompt poll rate, how frequently we update `activatableProximityPrompts`. */
const PROMPT_POLL_RATE = 0.1;

/**
 * @internal
 */
@Controller({})
export class ProximityPromptController implements OnStart {
	/** Keyboard instance. */
	private keyboard = new Keyboard();
	/** All active proximity prompts in world. */
	private proximityPrompts: ProximityPrompt[] = [];
	/** Proximity prompts in activation range. */
	public activatableProximityPrompts: ProximityPrompt[] = [];
	public promptFolder: Transform;
	private idCounter = 1;

	constructor() {
		const go = GameObject.Create("Proximity Prompts");
		this.promptFolder = go.transform;
		this.promptFolder.SetParent(CoreRefs.rootTransform);
	}

	OnStart(): void {
		this.StartPromptTicker();
	}

	public RegisterProximityPrompt(prompt: ProximityPrompt): void {
		this.proximityPrompts.push(prompt);
		prompt.id = this.idCounter;
		this.idCounter++;
	}

	public UnregisterProximityPrompt(prompt: ProximityPrompt): void {
		this.proximityPrompts = this.proximityPrompts.filter((p) => p !== prompt);
	}

	/** Returns distance between local player and a proximity prompt. */
	private GetDistanceToPrompt(prompt: ProximityPrompt): number {
		/* If local character does _not_ have a position, fallback to `math.huge`. */
		const localCharacterPosition = Game.localPlayer.character?.gameObject.transform.position;
		if (!localCharacterPosition) return math.huge;
		/* Otherwise, return distance. */
		return localCharacterPosition.sub(prompt.transform.position).magnitude;
	}

	/** Displays and hides prompts based on `activationRange`. */
	private StartPromptTicker(): void {
		task.spawn(() => {
			Task.Repeat(PROMPT_POLL_RATE, () => {
				this.proximityPrompts.forEach((prompt) => {
					const distToPrompt = this.GetDistanceToPrompt(prompt);
					if (distToPrompt <= prompt.maxRange) {
						const alreadyActive = this.GetActivePromptIndexById(prompt.id) > -1;
						// const keycodeActive = this.activatableKeycodes.has(prompt.data.activationKey);
						/*
						 * If prompt is already active or prompt with same keycode is active,
						 * do nothing. Otherwise, display prompt.
						 */
						if (!alreadyActive) {
							// this.activatableKeycodes.add(prompt.data.activationKey);
							this.activatableProximityPrompts.push(prompt);
							prompt.Show();
							prompt.SetCanActivate(true);
						}
					} else {
						const promptIndex = this.GetActivePromptIndexById(prompt.id);
						const wasActive = promptIndex > -1;
						/* If prompt was active, but is now out of range, hide prompt. */
						if (wasActive) {
							// this.activatableKeycodes.delete(prompt.data.activationKey);
							this.activatableProximityPrompts.remove(promptIndex);
							prompt.Hide();
							prompt.SetCanActivate(false);
						}
					}
				});
			});
		});
	}

	/**
	 * Returns an active proximity prompt's index.
	 * @param promptId An active proximity prompt id.
	 * @returns Index that corresponds to active prompt with `promptId`. If prompt is _not_ active, the function returns -1.
	 */
	private GetActivePromptIndexById(promptId: number): number {
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
