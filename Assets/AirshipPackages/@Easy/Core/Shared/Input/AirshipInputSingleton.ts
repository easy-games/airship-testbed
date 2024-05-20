import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework";
import ObjectUtils from "@easy-games/unity-object-utils";
import { Airship } from "../Airship";
import { AssetCache } from "../AssetCache/AssetCache";
import { CoreContext } from "../CoreClientContext";
import { CoreRefs } from "../CoreRefs";
import { Game } from "../Game";
import { ControlScheme, Keyboard, Mouse, Preferred as PreferredControls } from "../UserInput";
import { Bin } from "../Util/Bin";
import { CanvasAPI, PointerDirection } from "../Util/CanvasAPI";
import { Signal } from "../Util/Signal";
import { Binding } from "./Binding";
import { InputAction, InputActionConfig, InputActionSchema } from "./InputAction";
import { InputActionEvent } from "./InputActionEvent";
import { ActionInputType, InputUtil, KeyType } from "./InputUtil";
import { MobileButtonConfig } from "./Mobile/MobileButton";
import ProximityPrompt from "./ProximityPrompts/ProximityPrompt";
import { CoreIcon } from "./UI/CoreIcon";

@Controller({})
@Service({})
export class AirshipInputSingleton implements OnStart {
	/**
	 * Whether or not creating a duplicate keybind should immediately unbind matching keybinds.
	 */
	public unsetOnDuplicateKeybind = false;
	/**
	 *
	 */
	public onActionBound = new Signal<InputAction>();
	/**
	 *
	 */
	public onActionUnbound = new Signal<InputAction>();
	/**
	 *
	 */
	private keyboard = new Keyboard();
	/**
	 *
	 */
	private mouse = new Mouse();
	/**
	 *
	 */
	private controlManager = new PreferredControls();
	/**
	 *
	 */
	private actionTable = new Map<string, InputAction[]>();
	/**
	 *
	 */
	private actionDownSignals = new Map<string, Signal<[event: InputActionEvent]>[]>();
	/**
	 *
	 */
	private actionUpSignals = new Map<string, Signal<[event: InputActionEvent]>[]>();
	/**
	 *
	 */
	private actionDownState = new Set<string>();
	/**
	 *
	 */
	private mobileControlsContainer!: GameObject;
	/**
	 *
	 */
	private mobileButtonPrefab = AssetCache.LoadAsset(
		"@Easy/Core/Shared/Resources/Prefabs/UI/MobileControls/MobileButton.prefab",
	);
	/**
	 *
	 */
	private actionToMobileButtonTable = new Map<string, GameObject[]>();
	/** Sensitivty multiplier maintained by game */
	private gameSensitivityMultiplier = 1;

	public preferredControls = new PreferredControls();

	constructor() {
		Airship.input = this;
	}

	OnStart(): void {
		if (!Game.IsClient()) return;

		if (Game.coreContext === CoreContext.GAME && Game.IsGameLuauContext()) {
			this.CreateMobileControlCanvas();
		}

		Airship.input.onActionBound.Connect((action) => {
			if (!action.binding.IsUnset()) {
				if (this.unsetOnDuplicateKeybind) {
					this.UnsetDuplicateBindings(action);
				}
				this.CreateActionListeners(action);
			}
		});

		Airship.input.CreateActions([
			{ name: "Forward", binding: Binding.Key(Key.W) },
			{ name: "Left", binding: Binding.Key(Key.A) },
			{ name: "Back", binding: Binding.Key(Key.S) },
			{ name: "Right", binding: Binding.Key(Key.D) },
			{ name: "Jump", binding: Binding.Key(Key.Space) },
			{ name: "Sprint", binding: Binding.Key(Key.LeftShift) },
			{
				name: "Crouch",
				binding: Binding.Key(Key.LeftCtrl),
				secondaryBinding: Binding.Key(Key.C),
			},
			{ name: "UseItem", binding: Binding.MouseButton(MouseButton.LeftButton) },
			{ name: "SecondaryUseItem", binding: Binding.MouseButton(MouseButton.RightButton) },
			{ name: "Inventory", binding: Binding.Key(Key.E) },
			{ name: "DropItem", binding: Binding.Key(Key.Q) },
			{ name: "Inspect", binding: Binding.Key(Key.Y) },
			{ name: "Interact", binding: Binding.Key(Key.F) },
			{ name: "PushToTalk", binding: Binding.Key(Key.V) },
		]);

		if (Game.coreContext === CoreContext.GAME && Game.IsGameLuauContext()) {
			Airship.input.CreateMobileButton("Jump", new Vector2(-220, 180));
			// Airship.input.CreateMobileButton("UseItem", new Vector2(-250, 490));
			Airship.input.CreateMobileButton("Crouch", new Vector2(-140, 340), {
				icon: CoreIcon.CHEVRON_DOWN,
			});
		}
	}

	/**
	 *
	 * @param actionName
	 * @param parent
	 * @param config
	 * @returns
	 */
	public CreateProximityPrompt(
		actionName: string,
		parent?: Transform,
		config?: {
			primaryText?: string;
			secondaryText?: string;
			maxRange?: number;
		},
	): ProximityPrompt {
		let go: GameObject;
		if (parent) {
			go = Object.Instantiate(
				AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/Input/ProximityPrompt.prefab"),
				parent,
			);
		} else {
			go = Object.Instantiate(
				AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/Input/ProximityPrompt.prefab"),
			);
		}
		const prompt = go.GetAirshipComponent<ProximityPrompt>()!;
		prompt.actionName = actionName.lower();
		if (config?.primaryText !== undefined) {
			prompt.SetPrimaryText(config.primaryText);
		}
		if (config?.secondaryText !== undefined) {
			prompt.SetSecondaryText(config.secondaryText);
		}
		if (config?.maxRange !== undefined) {
			prompt.SetMaxRange(config.maxRange);
		}
		return prompt;
	}

	/**
	 *
	 * @param actions
	 */
	public CreateActions(actions: InputActionSchema[]): void {
		for (const action of actions) {
			this.CreateAction(action.name, action.binding, {
				category: action.category ?? "General",
				secondaryBinding: action.secondaryBinding,
			});
		}
	}

	/**
	 *
	 * @param name
	 * @param keybind
	 * @param category
	 */
	public CreateAction(name: string, binding: Binding, config?: InputActionConfig): void {
		const action = new InputAction(name.lower(), binding, false, config?.category ?? "General");
		this.AddActionToTable(action);
		this.onActionBound.Fire(action);
	}

	/**
	 *
	 */
	private CreateMobileControlCanvas(): void {
		const mobileControlsCanvas = Object.Instantiate(
			AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/MobileControls/MobileControlsCanvas.prefab"),
			CoreRefs.rootTransform,
		);
		this.mobileControlsContainer = mobileControlsCanvas;

		this.controlManager.ObserveControlScheme((controlScheme) => {
			if (controlScheme === ControlScheme.Touch) {
				this.mobileControlsContainer.SetActive(true);
				for (const [name, _] of this.actionToMobileButtonTable) {
					this.ShowMobileButtons(name);
				}
			}
			if (controlScheme === ControlScheme.MouseKeyboard) {
				this.mobileControlsContainer.SetActive(false);
				for (const [name, _] of this.actionToMobileButtonTable) {
					this.HideMobileButtons(name);
				}
			}
		});
	}

	/**
	 *
	 * @param name
	 * @param anchoredPosition
	 * @param config
	 */
	public CreateMobileButton(name: string, anchoredPosition: Vector2, config?: MobileButtonConfig): void {
		const mobileButton = Object.Instantiate(this.mobileButtonPrefab);
		mobileButton.transform.SetParent(this.mobileControlsContainer.transform);
		const lowerName = name.lower();

		const rect = mobileButton.GetComponent<RectTransform>()!;
		rect.localScale = new Vector3(config?.scale?.x ?? 1, config?.scale?.y ?? 1, 1);
		if (config?.anchorMin) rect.anchorMin = config.anchorMin;
		if (config?.anchorMax) rect.anchorMax = config.anchorMax;
		if (config?.pivot) rect.pivot = config.pivot;
		rect.anchoredPosition = anchoredPosition;

		if (config?.icon) {
			const iconTexture = AssetCache.LoadAssetIfExists<Texture2D>(
				`@Easy/Core/Shared/Resources/Images/CoreIcons/${config.icon}.png`,
			);
			if (iconTexture) {
				const img = mobileButton.transform.GetChild(0).GetComponent<Image>()!;
				img.sprite = Bridge.MakeSprite(iconTexture);
			}
		}

		CanvasAPI.OnPointerEvent(mobileButton, (dir) => {
			if (dir === PointerDirection.DOWN) {
				this.actionDownState.add(lowerName);
				const actionDownSignals = this.actionDownSignals.get(lowerName);
				if (!actionDownSignals) return;
				const inactiveSignalIndices = [];
				let signalIndex = 0;
				for (const signal of actionDownSignals) {
					if (signal.HasConnections()) {
						signal.Fire(new InputActionEvent(lowerName, false));
					} else {
						inactiveSignalIndices.push(signalIndex);
					}
					signalIndex++;
				}
				this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
			} else if (dir === PointerDirection.UP) {
				this.actionDownState.delete(lowerName);
				const actionUpSignals = this.actionUpSignals.get(lowerName);
				if (!actionUpSignals) return;
				const inactiveSignalIndices = [];
				let signalIndex = 0;
				for (const signal of actionUpSignals) {
					if (signal.HasConnections()) {
						signal.Fire(new InputActionEvent(lowerName, false));
					} else {
						inactiveSignalIndices.push(signalIndex);
					}
					signalIndex++;
				}
				this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
			}
		});

		const mobileButtonsForAction = this.actionToMobileButtonTable.get(lowerName) ?? [];
		mobileButtonsForAction.push(mobileButton);
		this.actionToMobileButtonTable.set(lowerName, mobileButtonsForAction);
	}

	/**
	 *
	 * @param name
	 */
	public HideMobileButtons(name: string): void {
		const lowerName = name.lower();
		const mobileButtonsForAction = this.actionToMobileButtonTable.get(lowerName) ?? [];
		for (const mobileButton of mobileButtonsForAction) {
			mobileButton.SetActive(false);
		}
		const isDown = this.actionDownState.has(lowerName);
		if (isDown) {
			const upSignals = this.actionUpSignals.get(lowerName) ?? [];
			for (const signal of upSignals) {
				signal.Fire(new InputActionEvent(lowerName, false));
			}
			this.actionDownState.delete(lowerName);
		}
	}
	/**
	 *
	 * @param name
	 */
	public ShowMobileButtons(name: string): void {
		const mobileButtonsForAction = this.actionToMobileButtonTable.get(name.lower()) ?? [];
		for (const mobileButton of mobileButtonsForAction) {
			mobileButton.SetActive(true);
		}
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public GetActions(name: string): InputAction[] {
		return this.actionTable.get(name.lower()) ?? [];
	}

	/**
	 *
	 * @param name
	 * @param inputType
	 * @returns
	 */
	public GetActionByInputType(name: string, inputType: ActionInputType): InputAction | undefined {
		const actions = this.actionTable.get(name.lower());
		if (!actions) return undefined;
		return actions.find(
			(action) => InputUtil.GetInputTypeFromBinding(action.binding, KeyType.Primary) === inputType,
		);
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public OnDown(name: string): Signal<[event: InputActionEvent]> {
		const downSignal = new Signal<[event: InputActionEvent]>();
		const existingSignals = this.actionDownSignals.get(name.lower());
		if (!existingSignals) {
			this.actionDownSignals.set(name.lower(), [downSignal]);
		} else {
			existingSignals.push(downSignal);
		}
		return downSignal;
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public OnUp(name: string): Signal<[event: InputActionEvent]> {
		const upSignal = new Signal<[event: InputActionEvent]>();
		const existingSignals = this.actionUpSignals.get(name.lower());
		if (!existingSignals) {
			this.actionUpSignals.set(name.lower(), [upSignal]);
		} else {
			existingSignals.push(upSignal);
		}
		return upSignal;
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public IsDown(name: string): boolean {
		return this.actionDownState.has(name.lower());
	}

	/**
	 *
	 * @param name
	 */
	public IsUp(name: string) {
		return !this.IsDown(name.lower());
	}

	/**
	 *
	 * @returns
	 */
	public GetBindings(): InputAction[] {
		const flatActions: InputAction[] = [];
		const actions = ObjectUtils.values(this.actionTable);
		for (const actionList of actions) {
			for (const action of actionList) {
				flatActions.push(action);
			}
		}
		return flatActions.sort((a, b) => a.id < b.id);
	}

	/**
	 *
	 * @param action
	 */
	private AddActionToTable(action: InputAction): void {
		let existingActions = this.actionTable.get(action.name) ?? [];
		if (existingActions.size() > 0) {
			existingActions.push(action);
		} else {
			existingActions = [action];
		}
		this.actionTable.set(action.name, existingActions);
	}
	/**
	 *
	 * @param action
	 */
	private CreateActionListeners(action: InputAction): void {
		const signalCleanup = new Bin();

		const fireUpSignalIfDown = () => {
			const isDown = this.actionDownState.has(action.name);
			if (isDown) {
				const upSignals = this.actionUpSignals.get(action.name) ?? [];
				for (const signal of upSignals) {
					signal.Fire(new InputActionEvent(action.name, false));
				}
				this.actionDownState.delete(action.name);
			}
		};

		fireUpSignalIfDown();

		signalCleanup.Add(
			this.onActionUnbound.Connect((unbound) => {
				if (action === unbound) {
					fireUpSignalIfDown();
					signalCleanup.Clean();
				}
			}),
		);

		signalCleanup.Add(
			this.onActionBound.Connect((bound) => {
				if (action === bound) {
					signalCleanup.Clean();
				}
			}),
		);

		if (action.IsComplexBinding()) {
			if (action.binding.config.isKeyBinding) {
				signalCleanup.Add(
					this.keyboard.OnKeyDown(action.binding.config.key, (event) => {
						const isModifierKeyDown = this.keyboard.IsKeyDown(action.binding.GetModifierKey());
						if (!isModifierKeyDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
					}),
				);
				signalCleanup.Add(
					this.keyboard.OnKeyUp(action.binding.config.key, (event) => {
						const isDown = this.actionDownState.has(action.name);
						if (!isDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
				signalCleanup.Add(
					this.keyboard.OnKeyUp(action.binding.GetModifierKey(), (event) => {
						const isDown = this.actionDownState.has(action.name);
						if (!isDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
			} else {
				signalCleanup.Add(
					this.mouse.OnButtonDown(action.binding.config.mouseButton, (event) => {
						const isModifierKeyDown = this.keyboard.IsKeyDown(action.binding.GetModifierKey());
						if (!isModifierKeyDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
					}),
				);
				signalCleanup.Add(
					this.mouse.OnButtonUp(action.binding.config.mouseButton, (event) => {
						const isDown = this.actionDownState.has(action.name);
						if (!isDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
				signalCleanup.Add(
					this.keyboard.OnKeyUp(action.binding.GetModifierKey(), (event) => {
						const isDown = this.actionDownState.has(action.name);
						if (!isDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
			}
		} else {
			if (action.binding.config.isKeyBinding) {
				signalCleanup.Add(
					this.keyboard.OnKeyDown(action.binding.config.key, (event) => {
						if (
							action.binding.GetInputType() === ActionInputType.Mouse &&
							(CanvasAPI.IsPointerOverUI() ||
								this.controlManager.GetControlScheme() === ControlScheme.Touch)
						) {
							// If this is keybind a mouse keybind, and we're over UI that is a raycast target,
							// do not propagate action event. Do not ever propagate if control scheme is touch.
							return;
						}
						const isDown = this.actionDownState.has(action.name);
						if (isDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
					}),
				);
				signalCleanup.Add(
					this.keyboard.OnKeyUp(action.binding.config.key, (event) => {
						const wasDown = this.actionDownState.has(action.name);
						if (!wasDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
			} else {
				signalCleanup.Add(
					this.mouse.OnButtonDown(action.binding.config.mouseButton, (event) => {
						if (
							CanvasAPI.IsPointerOverUI() ||
							this.controlManager.GetControlScheme() === ControlScheme.Touch
						) {
							// If this is keybind a mouse keybind, and we're over UI that is a raycast target,
							// do not propagate action event. Do not ever propagate if control scheme is touch.
							return;
						}
						const isDown = this.actionDownState.has(action.name);
						if (isDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
					}),
				);
				signalCleanup.Add(
					this.mouse.OnButtonUp(action.binding.config.mouseButton, (event) => {
						const wasDown = this.actionDownState.has(action.name);
						if (!wasDown) return;
						this.actionDownState.delete(action.name);
						const actionUpSignals = this.actionUpSignals.get(action.name);
						if (!actionUpSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
					}),
				);
			}
		}
	}

	/**
	 *
	 * @param action
	 */
	private UnsetDuplicateBindings(action: InputAction): void {
		const duplicateBinding = this.GetBindings().find((binding) => {
			return action.DoBindingsMatch(binding) && binding.id !== action.id;
		});
		if (!duplicateBinding) return;
		duplicateBinding.UnsetBinding();
	}

	/**
	 *
	 * @param signalIndices
	 * @param signals
	 */
	private ClearInactiveSignals(signalIndices: number[], signals: Signal<[event: InputActionEvent]>[]): void {
		for (const index of signalIndices) {
			signals.remove(index);
		}
	}

	/** Returns mouse sensitivity based on player's setting & game's sensitivity multiplier. */
	public GetMouseSensitivity() {
		return (
			this.gameSensitivityMultiplier *
			contextbridge.invoke<() => number>("ClientSettings:GetMouseSensitivity", LuauContext.Protected)
		);
	}

	/** Returns touch sensitivity based on player's setting & game's sensitivity multiplier. */
	public GetTouchSensitivity() {
		return (
			this.gameSensitivityMultiplier *
			contextbridge.invoke<() => number>("ClientSettings:GetTouchSensitivity", LuauContext.Protected)
		);
	}

	/**
	 * Register a multiplier on user's set sensitivity
	 *
	 * @param sensitivity Set to 1 for no effect, >1 for increased sensitivty.
	 */
	public SetSensitivityMultiplier(sensitivity: number) {
		this.gameSensitivityMultiplier = sensitivity;
	}
}
