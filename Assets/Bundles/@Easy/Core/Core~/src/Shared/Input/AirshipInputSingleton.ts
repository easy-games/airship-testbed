import ObjectUtils from "@easy-games/unity-object-utils";
import { Controller, OnStart, Service } from "Shared/Flamework";
import { Airship } from "../Airship";
import { AssetCache } from "../AssetCache/AssetCache";
import { CoreContext } from "../CoreClientContext";
import { CoreRefs } from "../CoreRefs";
import { Game } from "../Game";
import { ControlScheme, Keyboard, Preferred } from "../UserInput";
import { KeySignal } from "../UserInput/Drivers/Signals/KeySignal";
import { Bin } from "../Util/Bin";
import { CanvasAPI, PointerDirection } from "../Util/CanvasAPI";
import { Signal } from "../Util/Signal";
import { InputAction, InputActionConfig, InputActionSchema } from "./InputAction";
import { ActionInputType, InputUtil, KeyType } from "./InputUtil";
import { Keybind } from "./Keybind";
import { MobileButtonConfig } from "./Mobile/MobileButton";

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
	private inputDevice = new Keyboard();
	/**
	 *
	 */
	private controlManager = new Preferred();
	/**
	 *
	 */
	private actionTable = new Map<string, InputAction[]>();
	/**
	 *
	 */
	private actionDownSignals = new Map<string, Signal<KeySignal>[]>();
	/**
	 *
	 */
	private actionUpSignals = new Map<string, Signal<KeySignal>[]>();
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

	constructor() {
		Airship.input = this;
	}

	OnStart(): void {
		if (!Game.IsClient()) return;

		if (Game.coreContext === CoreContext.GAME) {
			this.CreateMobileControlCanvas();
		}

		Airship.input.onActionBound.Connect((action) => {
			if (!action.keybind.IsUnset()) {
				if (this.unsetOnDuplicateKeybind) {
					this.UnsetDuplicateKeybinds(action);
				}
				this.CreateActionListeners(action);
			}
		});

		Airship.input.CreateActions([
			{ name: "Forward", keybind: new Keybind(KeyCode.W) },
			{ name: "Left", keybind: new Keybind(KeyCode.A) },
			{ name: "Back", keybind: new Keybind(KeyCode.S) },
			{ name: "Right", keybind: new Keybind(KeyCode.D) },
			{ name: "Jump", keybind: new Keybind(KeyCode.Space) },
			{ name: "Sprint", keybind: new Keybind(KeyCode.LeftShift) },
			{
				name: "Crouch",
				keybind: new Keybind(KeyCode.LeftControl),
				secondaryKeybind: new Keybind(KeyCode.C),
			},
			{ name: "UseItem", keybind: new Keybind(KeyCode.Mouse0) },
			{ name: "SecondaryUseItem", keybind: new Keybind(KeyCode.Mouse1) },
			{ name: "Inventory", keybind: new Keybind(KeyCode.E) },
			{ name: "DropItem", keybind: new Keybind(KeyCode.Q) },
			{ name: "Inspect", keybind: new Keybind(KeyCode.Y) },
		]);

		if (Game.coreContext === CoreContext.GAME) {
			Airship.input.CreateMobileButton("Jump", new Vector2(-200, 290));
			Airship.input.CreateMobileButton("UseItem", new Vector2(-250, 490));
			Airship.input.CreateMobileButton("Crouch", new Vector2(-200, 690));
		}
	}

	/**
	 *
	 * @param actions
	 */
	public CreateActions(actions: InputActionSchema[]): void {
		for (const action of actions) {
			this.CreateAction(action.name, action.keybind, {
				category: action.category ?? "General",
				secondaryKeybind: action.secondaryKeybind,
			});
		}
	}

	/**
	 *
	 * @param name
	 * @param keybind
	 * @param category
	 */
	public CreateAction(name: string, keybind: Keybind, config?: InputActionConfig): void {
		const action = new InputAction(name, keybind, false, config?.category ?? "General");
		this.AddActionToTable(action);
		this.onActionBound.Fire(action);
	}

	/**
	 *
	 */
	private CreateMobileControlCanvas(): void {
		const mobileControlsCanvas = Object.Instantiate(
			AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/MobileControls/MobileControlsCanvas.prefab"),
		);
		mobileControlsCanvas.transform.SetParent(CoreRefs.rootTransform);
		this.mobileControlsContainer = mobileControlsCanvas;
		const controlSchemeBin = new Bin();
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
			return () => controlSchemeBin.Clean();
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

		const rect = mobileButton.GetComponent<RectTransform>();
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
				const img = mobileButton.transform.GetChild(0).GetComponent<Image>();
				img.sprite = Bridge.MakeSprite(iconTexture);
			}
		}

		CanvasAPI.OnPointerEvent(mobileButton, (dir) => {
			if (dir === PointerDirection.DOWN) {
				this.actionDownState.add(name);
				const actionDownSignals = this.actionDownSignals.get(name);
				if (!actionDownSignals) return;
				const inactiveSignalIndices = [];
				let signalIndex = 0;
				for (const signal of actionDownSignals) {
					if (signal.HasConnections()) {
						const mobileSignal = new KeySignal(KeyCode.None, false);
						signal.Fire(mobileSignal);
					} else {
						inactiveSignalIndices.push(signalIndex);
					}
					signalIndex++;
				}
				this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
			} else if (dir === PointerDirection.UP) {
				this.actionDownState.delete(name);
				const actionUpSignals = this.actionUpSignals.get(name);
				if (!actionUpSignals) return;
				const inactiveSignalIndices = [];
				let signalIndex = 0;
				for (const signal of actionUpSignals) {
					if (signal.HasConnections()) {
						const mobileSignal = new KeySignal(KeyCode.None, false);
						signal.Fire(mobileSignal);
					} else {
						inactiveSignalIndices.push(signalIndex);
					}
					signalIndex++;
				}
				this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
			}
		});

		const mobileButtonsForAction = this.actionToMobileButtonTable.get(name) ?? [];
		mobileButtonsForAction.push(mobileButton);
		this.actionToMobileButtonTable.set(name, mobileButtonsForAction);
	}

	/**
	 *
	 * @param name
	 */
	public HideMobileButtons(name: string): void {
		const mobileButtonsForAction = this.actionToMobileButtonTable.get(name) ?? [];
		for (const mobileButton of mobileButtonsForAction) {
			mobileButton.SetActive(false);
		}
		const isDown = this.actionDownState.has(name);
		if (isDown) {
			const upSignals = this.actionUpSignals.get(name) ?? [];
			for (const signal of upSignals) {
				const mockKeySignal = new KeySignal(KeyCode.None, false);
				signal.Fire(mockKeySignal);
			}
			this.actionDownState.delete(name);
		}
	}
	/**
	 *
	 * @param name
	 */
	public ShowMobileButtons(name: string): void {
		const mobileButtonsForAction = this.actionToMobileButtonTable.get(name) ?? [];
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
		return this.actionTable.get(name) ?? [];
	}

	/**
	 *
	 * @param name
	 * @param inputType
	 * @returns
	 */
	public GetActionByInputType(name: string, inputType: ActionInputType): InputAction | undefined {
		const actions = this.actionTable.get(name);
		if (!actions) return undefined;
		return actions.find(
			(action) => InputUtil.GetInputTypeFromKeybind(action.defaultKeybind, KeyType.Primary) === inputType,
		);
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public OnDown(name: string): Signal<KeySignal> {
		const downSignal = new Signal<KeySignal>();
		const existingSignals = this.actionDownSignals.get(name);
		if (!existingSignals) {
			this.actionDownSignals.set(name, [downSignal]);
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
	public OnUp(name: string): Signal<KeySignal> {
		const upSignal = new Signal<KeySignal>();
		const existingSignals = this.actionUpSignals.get(name);
		if (!existingSignals) {
			this.actionUpSignals.set(name, [upSignal]);
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
		return this.actionDownState.has(name);
	}

	/**
	 *
	 * @param name
	 */
	public IsUp(name: string) {
		return !this.IsDown(name);
	}

	/**
	 *
	 * @returns
	 */
	public GetKeybinds(): InputAction[] {
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
					const mockKeySignal = new KeySignal(action.keybind.primaryKey, false);
					signal.Fire(mockKeySignal);
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

		if (action.IsComplexKeybind()) {
			signalCleanup.Add(
				this.inputDevice.OnKeyDown(action.keybind.primaryKey, (event) => {
					const isModifierKeyDown = this.inputDevice.IsKeyDown(action.keybind.GetModifierKeyCode());
					if (!isModifierKeyDown) return;
					this.actionDownState.add(action.name);
					const actionDownSignals = this.actionDownSignals.get(action.name);
					if (!actionDownSignals) return;
					const inactiveSignalIndices = [];
					let signalIndex = 0;
					for (const signal of actionDownSignals) {
						if (signal.HasConnections()) {
							signal.Fire(event);
						} else {
							inactiveSignalIndices.push(signalIndex);
						}
						signalIndex++;
					}
					this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
				}),
			);
			signalCleanup.Add(
				this.inputDevice.OnKeyUp(action.keybind.primaryKey, (event) => {
					const isDown = this.actionDownState.has(action.name);
					if (!isDown) return;
					this.actionDownState.delete(action.name);
					const actionUpSignals = this.actionUpSignals.get(action.name);
					if (!actionUpSignals) return;
					const inactiveSignalIndices = [];
					let signalIndex = 0;
					for (const signal of actionUpSignals) {
						if (signal.HasConnections()) {
							signal.Fire(event);
						} else {
							inactiveSignalIndices.push(signalIndex);
						}
						signalIndex++;
					}
					this.ClearInactiveSignals(inactiveSignalIndices, actionUpSignals);
				}),
			);
			signalCleanup.Add(
				this.inputDevice.OnKeyUp(action.keybind.GetModifierKeyCode(), (event) => {
					const isDown = this.actionDownState.has(action.name);
					if (!isDown) return;
					this.actionDownState.delete(action.name);
					const actionUpSignals = this.actionUpSignals.get(action.name);
					if (!actionUpSignals) return;
					const inactiveSignalIndices = [];
					let signalIndex = 0;
					for (const signal of actionUpSignals) {
						if (signal.HasConnections()) {
							signal.Fire(event);
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
				this.inputDevice.OnKeyDown(action.keybind.primaryKey, (event) => {
					if (
						action.keybind.GetInputType() === ActionInputType.Mouse &&
						(CanvasAPI.IsPointerOverUI() || this.controlManager.GetControlScheme() === ControlScheme.Touch)
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
							signal.Fire(event);
						} else {
							inactiveSignalIndices.push(signalIndex);
						}
						signalIndex++;
					}
					this.ClearInactiveSignals(inactiveSignalIndices, actionDownSignals);
				}),
			);
			signalCleanup.Add(
				this.inputDevice.OnKeyUp(action.keybind.primaryKey, (event) => {
					const wasDown = this.actionDownState.has(action.name);
					if (!wasDown) return;
					this.actionDownState.delete(action.name);
					const actionUpSignals = this.actionUpSignals.get(action.name);
					if (!actionUpSignals) return;
					const inactiveSignalIndices = [];
					let signalIndex = 0;
					for (const signal of actionUpSignals) {
						if (signal.HasConnections()) {
							signal.Fire(event);
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

	/**
	 *
	 * @param action
	 */
	private UnsetDuplicateKeybinds(action: InputAction): void {
		const duplicateKeybind = this.GetKeybinds().find((binding) => {
			return action.DoKeybindsMatch(binding) && binding.id !== action.id;
		});
		if (!duplicateKeybind) return;
		duplicateKeybind.UnsetKeybind();
	}

	/**
	 *
	 * @param signalIndices
	 * @param signals
	 */
	private ClearInactiveSignals(signalIndices: number[], signals: Signal<KeySignal>[]): void {
		for (const index of signalIndices) {
			signals.remove(index);
		}
	}
}
