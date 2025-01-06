import { CameraReferences } from "@Easy/Core/Shared/Camera/CameraReferences";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import ProximityPrompt from "@Easy/Core/Shared/Input/ProximityPrompts/ProximityPrompt";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";

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

	/** Displays and hides prompts based on `activationRange`. */
	private StartPromptTicker(): void {
		task.spawn(() => {
			let promptActionMap = new Map<string, ProximityPrompt[]>();
			let distanceMap = new Map<ProximityPrompt, number>();

			while (task.unscaledWait(PROMPT_POLL_RATE)) {
				/* If local character does _not_ have a position, fallback to `math.huge`. */
				const localCharacterPosition = Game.localPlayer.character?.gameObject.transform.position;
				if (!localCharacterPosition) continue;

				const mainCamera = CameraReferences.mainCamera;

				let possiblePrompts = new Map<string, ProximityPrompt[]>();
				for (let prompt of this.allPrompts) {
					if (promptActionMap.has(prompt.actionName)) {
						promptActionMap.get(prompt.actionName)!.push(prompt);
					} else {
						promptActionMap.set(prompt.actionName, [prompt]);
					}

					const distToPrompt = localCharacterPosition.sub(prompt.GetPosition()).magnitude;
					if (distToPrompt > prompt.maxRange) continue;

					const actionPrompts = MapUtil.GetOrCreate(possiblePrompts, prompt.actionName, []);
					actionPrompts.push(prompt);
					distanceMap.set(prompt, distToPrompt);
					if (this.promptDistanceLogging) {
						print("[Proximity Prompt]: " + prompt.gameObject.name + " distance: " + distToPrompt);
					}
				}
				
				const newlyVisiblePrompts = new Set<ProximityPrompt>();
				for (const [actionName, promptList] of possiblePrompts) {
					const sortedPrompts = promptList.sort((a, b) => distanceMap.get(a)! < distanceMap.get(b)!);
					let toDisplayPrompt = sortedPrompts[0];
					// If main camera exists filter out prompts that aren't visible
					if (mainCamera) {
						let foundVisiblePrompt = false;
						for (const prompt of sortedPrompts) {
							if (!(prompt.canvas.transform as RectTransform).IsVisibleFrom(mainCamera)) {
								continue;
							}
							foundVisiblePrompt = true;
							toDisplayPrompt = prompt;
							break
						}

						if (!foundVisiblePrompt) continue; // No prompts visible with this action
					}

					newlyVisiblePrompts.add(toDisplayPrompt);
					this.shownPrompts.add(toDisplayPrompt);
					(
						toDisplayPrompt as unknown as {
							Show(): void;
						}
					).Show();
				}

				// Hide all non-shown prompts
				for (const prompt of this.shownPrompts) {
					if (newlyVisiblePrompts.has(prompt)) continue;

					(
						prompt as unknown as {
							Hide(): void;
						}
					).Hide();
				}

				distanceMap.clear();
				promptActionMap.clear();
			}
		});
	}
}
