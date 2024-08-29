import { CameraReferences } from "@Easy/Core/Shared/Camera/CameraReferences";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";

/** Prompt poll rate, how frequently we update `activatableProximityPrompts`. */
const PROMPT_POLL_RATE = 0.1;

/**
 * @internal
 */
@Controller({})
export class ProximityPromptController {
	/** All active proximity prompts in world. */
	private allPrompts: ProximityPrompt[] = [];
	/** Proximity prompts in activation range. */
	public shownPrompts = new Set<ProximityPrompt>();
	public promptFolder: Transform;
	private idCounter = 1;

	private promptDistanceLogging = false;

	constructor() {
		const go = GameObject.Create("Proximity Prompts");
		this.promptFolder = go.transform;
		this.promptFolder.SetParent(CoreRefs.rootTransform);
	}

	protected OnStart(): void {
		this.StartPromptTicker();
	}

	public RegisterProximityPrompt(prompt: ProximityPrompt): void {
		this.allPrompts.push(prompt);
		prompt.id = this.idCounter;
		this.idCounter++;
	}

	public UnregisterProximityPrompt(prompt: ProximityPrompt): void {
		this.allPrompts = this.allPrompts.filter((p) => p !== prompt);
	}

	/** Returns distance between local player and a proximity prompt. */
	private GetDistanceToPrompt(prompt: ProximityPrompt): number {
		/* If local character does _not_ have a position, fallback to `math.huge`. */
		const localCharacterPosition = Game.localPlayer.character?.gameObject.transform.position;
		if (!localCharacterPosition) return math.huge;

		const mainCamera = CameraReferences.mainCamera;
		if (mainCamera) {
			if (!(prompt.canvas.transform as RectTransform).IsVisibleFrom(mainCamera)) {
				return math.huge;
			}
		}

		/* Otherwise, return distance. */
		return localCharacterPosition.sub(prompt.transform.position).magnitude;
	}

	/** Displays and hides prompts based on `activationRange`. */
	private StartPromptTicker(): void {
		task.spawn(() => {
			let promptActionMap = new Map<string, ProximityPrompt[]>();
			let distanceMap = new Map<ProximityPrompt, number>();

			while (task.unscaledWait(PROMPT_POLL_RATE)) {
				for (let prompt of this.allPrompts) {
					if (promptActionMap.has(prompt.actionName)) {
						promptActionMap.get(prompt.actionName)!.push(prompt);
					} else {
						promptActionMap.set(prompt.actionName, [prompt]);
					}
				}
				for (let prompt of this.allPrompts) {
					const distToPrompt = this.GetDistanceToPrompt(prompt);
					distanceMap.set(prompt, distToPrompt);
					if (this.promptDistanceLogging) {
						print("[Proximity Prompt]: " + prompt.gameObject.name + " distance: " + distToPrompt);
					}
				}

				this.allPrompts.forEach((prompt) => {
					const distToPrompt = distanceMap.get(prompt)!;
					if (distToPrompt <= prompt.maxRange) {
						// check if closest
						let closest = true;
						let promptsOfSameAction = promptActionMap.get(prompt.actionName)!;
						if (promptsOfSameAction.size() > 1) {
							for (let other of promptsOfSameAction) {
								if (other === prompt) continue;
								const otherDistance = distanceMap.get(other)!;
								if (otherDistance < distToPrompt) {
									closest = false;
									break;
								}
							}
						}

						if (closest) {
							this.shownPrompts.add(prompt);
							prompt.Show();
							return;
						}
					}

					// fallback to hide
					this.shownPrompts.delete(prompt);
					prompt.Hide();
				});

				distanceMap.clear();
				promptActionMap.clear();
			}
		});
	}
}
