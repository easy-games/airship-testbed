import { ClientSettingsController } from "@Easy/Core/Client/ProtectedControllers/Settings/ClientSettingsController";
import { Dependency, Singleton } from "@Easy/Core/Shared/Flamework";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { Airship } from "../Airship";
import { Asset } from "../Asset";
import { CoreContext } from "../CoreClientContext";
import { CoreRefs } from "../CoreRefs";
import { Game } from "../Game";
import AirshipButton from "../MainMenu/Components/AirshipButton";
import { ControlScheme, Keyboard, Mouse, Preferred as PreferredControls } from "../UserInput";
import { Bin } from "../Util/Bin";
import { CanvasAPI, PointerDirection } from "../Util/CanvasAPI";
import { Signal } from "../Util/Signal";
import { CoreAction } from "./AirshipCoreAction";
import { Binding, KeyBindingConfig, MouseBindingConfig } from "./Binding";
import { InputAction, InputActionConfig, InputActionSchema, SerializableAction } from "./InputAction";
import { InputActionEvent } from "./InputActionEvent";
import { ActionInputType, InputUtil, KeyType, ModifierKey } from "./InputUtil";
import { MobileButtonConfig } from "./Mobile/MobileButton";
import MobileControlsCanvas from "./Mobile/MobileControlsCanvas";
import TouchJoystick from "./Mobile/TouchJoystick";
import ProximityPrompt from "./ProximityPrompts/ProximityPrompt";

export enum InputActionDirection {
	/**
	 * Action is triggered by an up event.
	 */
	Up,
	/**
	 * Action is triggered by a down event.
	 */
	Down,
}

interface ContextKeybindUpdate {
	action: string;
	id: number;
}

/**
 * Access using {@link Airship.Input}. Input singleton contains functions to work with
 * player input (including mouse, keyboard, and touch screen).
 *
 * Ex:
 * ```ts
 * Airship.Input.CreateAction("Attack", Binding.MouseButton(MouseButton.LeftButton));
 * Airship.Input.OnDown("Attack").Connect(() => {
 * 	print("Attacked!");
 * });
 * ```
 */
@Singleton()
export class AirshipInputSingleton {
	/**
	 * Whether or not creating a duplicate keybind should immediately unbind matching keybinds.
	 */
	public unsetOnDuplicateKeybind = false;
	/**
	 * This signal fires when an action is bound, either through code or through the
	 * keybind menu.
	 */
	public onActionBound = new Signal<InputAction>();
	/**
	 * This signal fires when an action is unbound, either through code or through the
	 * keybind menu.
	 */
	public onActionUnbound = new Signal<InputAction>();
	/**
	 *
	 */
	private controlManager = new PreferredControls();
	/**
	 *
	 */
	private actionTable = new Map<string, InputAction[]>();
	/**
	 * Mapping of action name to down signal listeners.
	 */
	private actionDownSignals = new Map<string, Signal<[event: InputActionEvent]>[]>();
	/**
	 * Mapping of action name to up signal listeners.
	 */
	private actionUpSignals = new Map<string, Signal<[event: InputActionEvent]>[]>();
	/**
	 * All actions that are **currently** down.
	 */
	private actionDownState = new Set<string>();
	/**
	 * Container that holds mobile control buttons.
	 */
	private mobileControlsContainer!: GameObject;
	/**
	 * The default mobile button prefab.
	 */
	private mobileButtonPrefab = Asset.LoadAsset(
		"AirshipPackages/@Easy/Core/Prefabs/UI/MobileControls/MobileButton.prefab",
	);
	/**
	 * Mapping of action names to associated mobile buttons.
	 */
	private actionToMobileButtonTable = new Map<string, GameObject[]>();
	/**
	 * Sensitivty multiplier maintained by game.
	 */
	private gameSensitivityMultiplier = 1;

	public preferredControls = new PreferredControls();

	constructor() {
		Airship.Input = this;
	}

	protected OnStart(): void {
		if (!Game.IsClient()) return;

		// If the client loses focus, force all actions in the down state
		// into the up state.
		Application.OnFocusChanged((focused) => {
			if (!focused) {
				for (const downAction of this.actionDownState) {
					this.SetUp(downAction);
				}
			}
		});

		if (Game.coreContext === CoreContext.GAME && Game.IsGameLuauContext()) {
			this.CreateMobileControlCanvas();
			// A Game keybind was updated from the keybind menu.
			contextbridge.subscribe(
				"ProtectedKeybind:Updated",
				(
					from: LuauContext,
					name: string,
					id: number,
					isKeyBinding: boolean,
					key?: Key,
					modifierKey?: ModifierKey,
					mouseButton?: MouseButton,
				) => {
					if (from !== LuauContext.Protected) return;
					const matchingGameAction = this.GetActions(name).find((a) => a.id === id);
					if (!matchingGameAction) return;
					let binding: Binding | undefined;
					if (isKeyBinding && key) binding = Binding.Key(key, modifierKey);
					if (!isKeyBinding && mouseButton !== undefined && mouseButton > -1) {
						binding = Binding.MouseButton(mouseButton, modifierKey);
					}
					if (binding) matchingGameAction.UpdateBinding(binding);
				},
			);
		}

		if (Game.IsProtectedLuauContext()) {
			contextbridge.subscribe(
				"ProtectedKeybind:CreateAction",
				(from: LuauContext, name: string, id: number, binding: Binding) => {
					if (from !== LuauContext.Game) return;
					const action = this.RegisterAction(name, Binding.Clone(binding));
					this.TryOverrideGameKeybind(action);
				},
			);

			contextbridge.subscribe("ProtectedKeybind:UnregisterAction", (from: LuauContext, name: string) => {
				if (from !== LuauContext.Game) return;
				this.DisableCoreActions([name as CoreAction]);
			});
		}

		Airship.Input.onActionBound.Connect((action) => {
			if (!action.binding.IsUnset()) {
				if (this.unsetOnDuplicateKeybind) {
					this.UnsetDuplicateBindings(action);
				}
				this.CreateActionListeners(action);
			}
		});

		Airship.Input.RegisterActions([
			{ name: CoreAction.Forward, binding: Binding.Key(Key.W) },
			{ name: CoreAction.Left, binding: Binding.Key(Key.A) },
			{ name: CoreAction.Back, binding: Binding.Key(Key.S) },
			{ name: CoreAction.Right, binding: Binding.Key(Key.D) },
			{ name: CoreAction.Jump, binding: Binding.Key(Key.Space) },
			{ name: CoreAction.Sprint, binding: Binding.Key(Key.LeftShift) },
			{
				name: CoreAction.Crouch,
				binding: Binding.Key(Key.LeftCtrl),
				secondaryBinding: Binding.Key(Key.C),
			},
			{ name: CoreAction.PrimaryAction, binding: Binding.MouseButton(MouseButton.LeftButton) },
			{
				name: CoreAction.SecondaryAction,
				binding: Binding.MouseButton(MouseButton.RightButton),
			},
			{ name: CoreAction.Inventory, binding: Binding.Key(Key.E) },
			{ name: CoreAction.Interact, binding: Binding.Key(Key.F) },
			{ name: CoreAction.PushToTalk, binding: Binding.Key(Key.V) },
		]);

		if (Game.IsProtectedLuauContext()) {
			// Read **Core** keybinds from `ClientSettings.json` & apply overrides.
			task.spawn(() => {
				const clientSettings = Dependency<ClientSettingsController>().WaitForSettingsLoaded().expect();
				const overrides = clientSettings.coreKeybindOverrides;
				if (!overrides) return;
				this.DeserializeCoreKeybinds(overrides);
			});
		}
	}

	/**
	 * Creates a touch joystick.
	 *
	 * Alternatively, you can place a `TouchJoystick.prefab` in your scene and reference that directly.
	 *
	 * Note: touch joysticks will not work when the mouse is locked.
	 *
	 * @param parent This should be a parent transform that you have positioned in your canvas. The joystick will be instiated as a child at (0,0,0).
	 *
	 * @returns The created TouchJoystick. TouchJoystick contains `input` and `dragging` properties you can read every frame. TouchJoystick is an AirshipBehaviour.
	 */
	public CreateTouchJoystick(parent: Transform): TouchJoystick {
		const go = Object.Instantiate(
			Asset.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/MobileControls/TouchJoystick.prefab"),
			parent,
		);
		const joystick = go.GetAirshipComponent<TouchJoystick>()!;
		return joystick;
	}

	/**
	 * Creates a `ProximityPrompt` that fires action events when interacted with. Pressing the prompt's
	 * activation key while in range will fire the `InputActionDirection.Up` event, and releasing it will
	 * fire the `InputActionDirection.Down` event.
	 *
	 * @param actionName The action name associated with _this_ prompt.
	 * @param parent An optional parent `Transform` that this prompt will live underneath.
	 * @param config A `ProximityPrompt` configuration. Describes prompt text and distance required to activate.
	 * @returns The created `ProximityPrompt`.
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
				Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Input/ProximityPrompt.prefab"),
				parent,
			);
		} else {
			go = Object.Instantiate(Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/Input/ProximityPrompt.prefab"));
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
	 * Creates an action for each provided schema.
	 *
	 * @param actions A collection of `InputActionSchema`s.
	 */
	public CreateActions(actions: InputActionSchema[]): void {
		for (const action of actions) {
			this.CreateAction(action.name, action.binding, {
				category: action.category ?? "General",
				secondaryBinding: action.secondaryBinding,
			});
		}
	}

	/** Bulk register action */
	private RegisterActions(actions: InputActionSchema[]): void {
		for (const action of actions) {
			this.RegisterAction(
				action.name,
				action.binding,
				{
					category: action.category ?? "General",
					secondaryBinding: action.secondaryBinding,
				},
				true,
			);
		}
	}

	/**
	 * Unsets a list of core actions. The player will not be able
	 * to see these actions in their settings UI while in your game.
	 *
	 * @param coreActions List of actions to unbind and hide
	 */
	public DisableCoreActions(coreActions: CoreAction[]) {
		for (const actionName of coreActions) {
			if (Game.IsGameLuauContext()) {
				contextbridge.broadcast("ProtectedKeybind:UnregisterAction", actionName);
			} else {
				this.UnregisterAction(actionName);
			}
			this.GetActions(actionName).forEach((a) => {
				a.UnsetBinding();
			});
		}
	}

	/** Same as CreateAction (except it won't broadcast over context bridge) */
	private RegisterAction(name: string, binding: Binding, config?: InputActionConfig, isCore = false): InputAction {
		const action = new InputAction(name, binding, false, config?.category ?? "General", isCore);
		this.AddActionToTable(action);
		this.onActionBound.Fire(action);
		return action;
	}

	/** Unregisters an action (removes binding, clears from settings menu) */
	private UnregisterAction(name: string) {
		this.actionTable.delete(name.lower());
	}

	/**
	 * Creates an action with respect to the provided name and binding. After this action is created,
	 * it will immediately start firing up and down events. This action's binding can be updated through Airship's
	 * keybind menu.
	 *
	 * @param name The name of this action.
	 * @param binding The `Binding` associated with this action. Use `Binding.Key` to bind this action to
	 * a keyboard key, use `Binding.MouseButton` to bind this action to a mouse button.
	 * @param category The category this action belongs to.
	 */
	public CreateAction(name: string, binding: Binding, config?: InputActionConfig): void {
		const action = this.RegisterAction(name, binding, config);
		// Tell game context about new binding
		if (Game.IsProtectedLuauContext() && !action.binding.IsUnset()) {
			this.BroadcastProtectedKeybindUpdate(action);
		}
		// Tell protected context of new action
		if (Game.IsGameLuauContext()) {
			contextbridge.broadcast("ProtectedKeybind:CreateAction", name, action.id, action.binding);
		}
	}

	/**
	 * Broadcasts a protected keybind update from the Protected context to
	 * the game context.
	 *
	 * @param action The action whose binding is being updated.
	 * @internal
	 */
	public BroadcastProtectedKeybindUpdate(action: InputAction): void {
		if (!Game.IsProtectedLuauContext()) return;
		if (action.binding.config.isKeyBinding) {
			const castedBinding = action.binding.config as KeyBindingConfig;
			contextbridge.broadcast(
				"ProtectedKeybind:Updated",
				action.name,
				action.id,
				castedBinding.isKeyBinding,
				castedBinding.key,
				castedBinding.modifierKey,
			);
		} else {
			const castedBinding = action.binding.config as MouseBindingConfig;
			contextbridge.broadcast(
				"ProtectedKeybind:Updated",
				action.name,
				action.id,
				castedBinding.isKeyBinding,
				undefined,
				undefined,
				castedBinding.mouseButton,
			);
		}
	}

	/**
	 * Creates mobile UI canvas container.
	 */
	private CreateMobileControlCanvas(): void {
		const mobileControlsCanvas = Object.Instantiate(
			Asset.LoadAsset("AirshipPackages/@Easy/Core/Prefabs/UI/MobileControls/MobileControlsCanvas.prefab"),
			CoreRefs.rootTransform,
		);
		this.mobileControlsContainer = mobileControlsCanvas;
		const controls = this.mobileControlsContainer.GetAirshipComponent<MobileControlsCanvas>()!;

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

		controls.Init();
	}

	/**
	 * Creates a mobile button that triggers the provided action.
	 *
	 * @param actionName The name of the action this button is associated with.
	 * @param anchoredPosition The anchored position of this button.
	 * @param config A `MobileButtonConfig` that describes the look and feel of this button.
	 */
	public CreateMobileButton(actionName: string, anchoredPosition: Vector2, config?: MobileButtonConfig): GameObject {
		const mobileButton = Object.Instantiate(this.mobileButtonPrefab);
		mobileButton.name = "Mobile Button (" + actionName + ")";
		mobileButton.transform.SetParent(this.mobileControlsContainer.transform);
		mobileButton
			.GetAirshipComponent<AirshipButton>()
			?.SetStartingScale(config?.scale ? new Vector3(config.scale.x, config.scale.y, 1) : Vector3.one);
		const lowerName = actionName.lower();

		const rect = mobileButton.GetComponent<RectTransform>()!;
		rect.localScale = new Vector3(config?.scale?.x ?? 1, config?.scale?.y ?? 1, 1);
		if (config?.anchorMin) rect.anchorMin = config.anchorMin;
		if (config?.anchorMax) rect.anchorMax = config.anchorMax;
		if (config?.pivot) rect.pivot = config.pivot;
		rect.anchoredPosition = anchoredPosition;

		if (config?.icon) {
			// Assets/AirshipPackages/@Easy/Core/Prefabs/Images/crouch-pose.png
			const iconTexture = Asset.LoadAssetIfExists<Texture2D>(config.icon);
			if (iconTexture) {
				const img = mobileButton.transform.GetChild(0).GetComponent<Image>()!;
				img.sprite = Bridge.MakeSprite(iconTexture);
			} else {
				warn(`Unable to create icon for mobile button (${actionName}). Invalid icon path: ${config.icon}`);
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
				this.ClearDestroyedSignals(
					lowerName,
					InputActionDirection.Down,
					inactiveSignalIndices,
					actionDownSignals,
				);
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
				this.ClearDestroyedSignals(lowerName, InputActionDirection.Up, inactiveSignalIndices, actionUpSignals);
			}
		});

		const mobileButtonsForAction = this.actionToMobileButtonTable.get(lowerName) ?? [];
		mobileButtonsForAction.push(mobileButton);
		this.actionToMobileButtonTable.set(lowerName, mobileButtonsForAction);

		return mobileButton;
	}

	/**
	 * Hides all mobile buttons that trigger the action `name`.
	 *
	 * @param name An action name.
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
	 * Hides all mobile buttons that trigger the action `name`.
	 *
	 * @param name An action name.
	 */
	public ShowMobileButtons(name: string): void {
		const mobileButtonsForAction = this.actionToMobileButtonTable.get(name.lower()) ?? [];
		for (const mobileButton of mobileButtonsForAction) {
			mobileButton.SetActive(true);
		}
	}

	/**
	 * Returns all `InputAction`s associated with the provided name. Use the
	 * returned `InputAction`s to unset and modify action bindings.
	 *
	 * @param name An action name.
	 * @returns All `InputAction`s associated with the provided name.
	 */
	public GetActions(name: string): InputAction[] {
		return this.actionTable.get(name.lower()) ?? [];
	}

	/**
	 * Returns the `InputAction` that matches the provided name and type. This function is useful
	 * when an action has multiple bindings of different types associated with it.
	 *
	 * @param name An action name.
	 * @param inputType An `ActionInputType`.
	 * @returns The `InputAction` that matches the provided name and type, if it exists, otherwise `undefined`.
	 */
	public GetActionByInputType(name: string, inputType: ActionInputType): InputAction | undefined {
		const actions = this.actionTable.get(name.lower());
		if (!actions) return undefined;
		return actions.find(
			(action) => InputUtil.GetInputTypeFromBinding(action.binding, KeyType.Primary) === inputType,
		);
	}

	/**
	 * Creates and returns a new `Signal` that is fired when the provided action enters the
	 * down state.
	 *
	 * @param name An action name.
	 * @returns A `Signal` that can be connected to, to listen for action down events.
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
	 * Sets the provided action to the down state and fires **all** active `OnDown` signals. If the
	 * action is already in the down state, active `OnDown` signals are **not** fired.
	 *
	 * @param name An action name.
	 */
	public SetDown(name: string): void {
		if (this.actionDownState.has(name)) return;
		const lowerName = name.lower();
		this.actionDownState.add(lowerName);
		const signals = this.actionDownSignals.get(lowerName);
		if (!signals) return;
		for (const signal of signals) {
			signal.Fire(new InputActionEvent(lowerName, false));
		}
	}

	/**
	 * Creates and returns a new `Signal` that is fired when the provided action enters the
	 * up state. If an action is in the down state and it is unset or rebound, the up event
	 * **will** fire.
	 *
	 * @param name An action name.
	 * @returns A `Signal` that can be connected to, to listen for action down events.
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
	 * Sets the provided action to the up state and fires **all** active `OnUp` signals. If the
	 * action is not in the down state, active `OnUp` signals are **not** fired.
	 *
	 * @param name An action name.
	 */
	public SetUp(name: string): void {
		const lowerName = name.lower();
		if (!this.actionDownState.has(lowerName)) return;
		this.actionDownState.delete(lowerName);
		const signals = this.actionUpSignals.get(lowerName);
		if (!signals) return;
		for (const signal of signals) {
			signal.Fire(new InputActionEvent(lowerName, false));
		}
	}

	/**
	 * Returns whether or not the provided action is in the down state.
	 *
	 * @param name An action name.
	 * @returns Whether or not the provided action is the down state.
	 */
	public IsDown(name: string): boolean {
		return this.actionDownState.has(name.lower());
	}

	/**
	 * Returns whether or not the provided action is in the up state.
	 *
	 * @param name An action name.
	 */
	public IsUp(name: string) {
		return !this.IsDown(name.lower());
	}

	/**
	 * Returns all active `InputAction`s.
	 *
	 * @returns All active `InputAction`s.
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
	 * Adds the provided `InputAction` to the internal action table.
	 *
	 * @param action An `InputAction`.
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
	 * Creates listeners for provided `InputAction` based on it's binding.
	 *
	 * @param action An `InputAction`.
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
					Keyboard.OnKeyDown(action.binding.config.key, (event) => {
						const isModifierKeyDown = Keyboard.IsKeyDown(action.binding.GetModifierAsKey());
						if (!isModifierKeyDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Down,
							inactiveSignalIndices,
							actionDownSignals,
						);
					}),
				);
				signalCleanup.Add(
					Keyboard.OnKeyUp(action.binding.config.key, (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
				signalCleanup.Add(
					Keyboard.OnKeyUp(action.binding.GetModifierAsKey(), (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
			} else {
				signalCleanup.Add(
					Mouse.OnButtonDown(action.binding.config.mouseButton, (event) => {
						const isModifierKeyDown = Keyboard.IsKeyDown(action.binding.GetModifierAsKey());
						if (!isModifierKeyDown) return;
						this.actionDownState.add(action.name);
						const actionDownSignals = this.actionDownSignals.get(action.name);
						if (!actionDownSignals) return;
						const inactiveSignalIndices = [];
						let signalIndex = 0;
						for (const signal of actionDownSignals) {
							if (signal.HasConnections()) {
								signal.Fire(new InputActionEvent(action.name, event.uiProcessed));
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Down,
							inactiveSignalIndices,
							actionDownSignals,
						);
					}),
				);
				signalCleanup.Add(
					Mouse.OnButtonUp(action.binding.config.mouseButton, (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
				signalCleanup.Add(
					Keyboard.OnKeyUp(action.binding.GetModifierAsKey(), (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
			}
		} else {
			if (action.binding.config.isKeyBinding) {
				signalCleanup.Add(
					Keyboard.OnKeyDown(action.binding.config.key, (event) => {
						if (
							action.binding.GetInputType() === ActionInputType.Mouse &&
							(CanvasAPI.IsPointerOverUI() ||
								this.controlManager.GetControlScheme() === ControlScheme.Touch)
						) {
							// If this is keybind a mouse keybind, and we're over UI that is a raycast target,
							// do not propagate action event. Do not ever propagate if control scheme is touch.
							return;
						}
						// Do not fire down events when chat is open and selected.
						const isChatOpen = contextbridge.invoke<() => boolean>(
							"ClientChatSingleton:IsOpen",
							LuauContext.Protected,
						);
						if (isChatOpen && action.binding.GetInputType() === ActionInputType.Keyboard) {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Down,
							inactiveSignalIndices,
							actionDownSignals,
						);
					}),
				);
				signalCleanup.Add(
					Keyboard.OnKeyUp(action.binding.config.key, (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
			} else {
				signalCleanup.Add(
					Mouse.OnButtonDown(action.binding.config.mouseButton, (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Down,
							inactiveSignalIndices,
							actionDownSignals,
						);
					}),
				);
				signalCleanup.Add(
					Mouse.OnButtonUp(action.binding.config.mouseButton, (event) => {
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
							} else if (signal.isDestroyed) {
								inactiveSignalIndices.push(signalIndex);
							}
							signalIndex++;
						}
						this.ClearDestroyedSignals(
							action.name,
							InputActionDirection.Up,
							inactiveSignalIndices,
							actionUpSignals,
						);
					}),
				);
			}
		}
	}

	/**
	 * Unsets all actions who share the same binding as the provided `InputAction`.
	 *
	 * @param action An `InputAction`.
	 */
	private UnsetDuplicateBindings(action: InputAction): void {
		const duplicateBinding = this.GetBindings().find((binding) => {
			return action.DoBindingsMatch(binding) && binding.id !== action.id;
		});
		if (!duplicateBinding) return;
		duplicateBinding.UnsetBinding();
	}

	/**
	 * Clears all signals that have been destroyed.
	 *
	 * @param actionName An action name.
	 * @param actionDirection The input direction of signals being cleared.
	 * @param signalIndices The indices of signals that are ready to be cleared.
	 * @param signals The signal set that is being modified.
	 */
	private ClearDestroyedSignals(
		actionName: string,
		actionDirection: InputActionDirection,
		signalIndices: number[],
		signals: Signal<[event: InputActionEvent]>[],
	): void {
		const targetSignals =
			actionDirection === InputActionDirection.Up ? this.actionUpSignals : this.actionDownSignals;
		const newSignals: Signal<[event: InputActionEvent]>[] = [];
		for (let i = 0; i < signals.size(); i++) {
			if (!signalIndices.includes(i)) {
				const signal = signals[i];
				newSignals.push(signal);
			}
		}
		targetSignals.set(actionName, newSignals);
	}

	/**
	 * Serializes core keybind overrides to `ClientSettings.json`. Keybinds are serialized when
	 * a keybind is updated through the keybind menu.
	 *
	 * @internal
	 */
	public SerializeCoreKeybinds(): void {
		if (!Game.IsProtectedLuauContext()) return;
		const coreKeybinds: { [key in CoreAction]?: SerializableAction } = {};
		for (const coreAction of ObjectUtils.values(CoreAction)) {
			const actions = this.GetActions(coreAction);
			for (const action of actions) {
				const serialized = action.GetSerializable();
				coreKeybinds[coreAction] = serialized;
			}
		}
		Dependency<ClientSettingsController>().SetCoreKeybindOverrides(coreKeybinds);
	}

	/**
	 * Deserializes and binds core keybind overrides. These overrides are set when a keybind
	 * is updated through the keybind menu.
	 *
	 * @param keybinds Keybinds parsed from `ClientSettings.json`.
	 */
	private DeserializeCoreKeybinds(keybinds: { [key in CoreAction]?: SerializableAction }): void {
		for (const [name, data] of ObjectUtils.entries(keybinds)) {
			const binding = this.CreateBindingFromSerializedAction(data);
			const matchingAction = this.GetActions(name)[0];
			if (!matchingAction || !matchingAction.isCore) return;
			matchingAction.UpdateBinding(binding);
			this.BroadcastProtectedKeybindUpdate(matchingAction);
		}
	}

	/**
	 * Serializes game keybind to `ClientSettings.json`. A game Keybind is serialized when
	 * updated through the keybind menu.
	 *
	 * @param action The Game action that is being serialized.
	 * @internal
	 */
	public SerializeGameKeybind(action: InputAction): void {
		if (!Game.IsProtectedLuauContext()) return;
		task.spawn(() => {
			const gameId = Game.IsEditor() ? Game.gameId : Game.WaitForGameData().id;
			Dependency<ClientSettingsController>().UpdateGameKeybindOverrides(gameId, action.GetSerializable());
		});
	}

	/**
	 * Deserializes and binds game keybind override, if it exists for provided action.
	 *
	 * @param action The Game action that we an override is being searched for.
	 * @internal
	 */
	public TryOverrideGameKeybind(action: InputAction): void {
		if (!Game.IsProtectedLuauContext()) return;
		task.spawn(() => {
			const gameId = Game.IsEditor() ? Game.gameId : Game.WaitForGameData().id;
			const clientSettings = Dependency<ClientSettingsController>().WaitForSettingsLoaded().expect();
			const gameOverrides = clientSettings.gameKeybindOverrides[gameId];
			if (!gameOverrides) return;
			const actionOverride = gameOverrides[action.name];
			if (!actionOverride) return;
			const bindingFromSettings = this.CreateBindingFromSerializedAction(actionOverride);
			action.UpdateBinding(bindingFromSettings);
			this.BroadcastProtectedKeybindUpdate(action);
		});
	}

	/**
	 * Creates a `Binding` from a deserialized action. The returned `Binding` can be used to update an
	 * existing action.
	 *
	 * @param action A deserialized action.
	 * @returns A `Binding` that matches the deserialized action data.
	 */
	private CreateBindingFromSerializedAction(action: SerializableAction): Binding {
		const isKeybind = (action.mouseButton as number) === -1;
		if (isKeybind) return Binding.Key(action.primaryKey, action.modifierKey);
		return Binding.MouseButton(action.mouseButton, action.modifierKey);
	}

	/**
	 * Returns mouse sensitivity based on player's setting & game's sensitivity multiplier.
	 *
	 * @returns Mouse sensitivity based on player's setting & game's sensitivity multiplier.
	 */
	public GetMouseSensitivity(): number {
		return (
			this.gameSensitivityMultiplier *
			contextbridge.invoke<() => number>("ClientSettings:GetMouseSensitivity", LuauContext.Protected)
		);
	}

	/**
	 * Returns mouse smoothing (0 is no smoothing).
	 *
	 * @returns Mouse smoothing (0 is no smoothing).
	 */
	public GetMouseSmoothing(): number {
		return contextbridge.invoke<() => number>("ClientSettings:GetMouseSmoothing", LuauContext.Protected);
	}

	/**
	 * Returns touch sensitivity based on player's setting & game's sensitivity multiplier.
	 *
	 * @returns Touch sensitivity based on player's setting & game's sensitivity multiplier.
	 */
	public GetTouchSensitivity(): number {
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
	public SetSensitivityMultiplier(sensitivity: number): void {
		this.gameSensitivityMultiplier = sensitivity;
	}
}
