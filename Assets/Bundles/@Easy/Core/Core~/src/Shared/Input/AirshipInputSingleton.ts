import ObjectUtils from "@easy-games/unity-object-utils";
import { Controller, OnStart, Service } from "Shared/Flamework";
import { Airship } from "../Airship";
import { Keyboard } from "../UserInput";
import { KeySignal } from "../UserInput/Drivers/Signals/KeySignal";
import { Bin } from "../Util/Bin";
import { RunUtil } from "../Util/RunUtil";
import { Signal } from "../Util/Signal";
import { InputAction, InputActionSchema } from "./InputAction";
import { ActionInputType, InputUtil, KeyType } from "./InputUtil";
import { Keybind } from "./Keybind";

@Controller({})
@Service({})
export class AirshipInputSingleton implements OnStart {
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

	constructor() {
		Airship.input = this;
	}

	OnStart(): void {
		if (!RunUtil.IsClient()) return;
		// const clientSettingsController = Dependency<ClientSettingsController>();
		// clientSettingsController.WaitForSettingsLoaded().then((settings) => {
		// 	print(`Settings here?: ${settings}`);
		// });
		// ObjectNames

		Airship.input.onActionBound.Connect((action) => {
			if (!action.keybind.IsUnset()) {
				this.UnsetDuplicateKeybinds(action);
				this.CreateActionListeners(action);
			}
		});

		Airship.input.CreateActions([
			{ name: "MoveUp", keybind: new Keybind(KeyCode.W) },
			{ name: "MoveLeft", keybind: new Keybind(KeyCode.A) },
			{ name: "MoveDown", keybind: new Keybind(KeyCode.S) },
			{ name: "MoveRight", keybind: new Keybind(KeyCode.D) },
			{ name: "Jump", keybind: new Keybind(KeyCode.Space) },
			{ name: "Sprint", keybind: new Keybind(KeyCode.LeftShift) },
			{ name: "Crouch", keybind: new Keybind(KeyCode.LeftControl) },
			{ name: "UseItem", keybind: new Keybind(KeyCode.Mouse0) },
			{ name: "SecondaryUseItem", keybind: new Keybind(KeyCode.Mouse1) },
			{ name: "Inventory", keybind: new Keybind(KeyCode.E) },
			{ name: "DropItem", keybind: new Keybind(KeyCode.Q) },
			{ name: "Inspect", keybind: new Keybind(KeyCode.Y) },
		]);
	}

	/**
	 *
	 * @param actions
	 */
	public CreateActions(actions: InputActionSchema[]): void {
		for (const action of actions) {
			this.CreateAction(action.name, action.keybind, action.category);
		}
	}

	/**
	 *
	 * @param name
	 * @param keybind
	 * @param category
	 */
	public CreateAction(name: string, keybind: Keybind, category = "General"): void {
		const actionExists = this.GetActionByInputType(
			name,
			InputUtil.GetInputTypeFromKeybind(keybind, KeyType.Primary),
		);
		if (actionExists) {
			warn("Action already exists. TODO: More detail here.");
			return;
		}
		const action = new InputAction(name, keybind, category);
		this.AddActionToTable(action);
		this.onActionBound.Fire(action);
	}

	/**
	 *
	 * @param name
	 * @returns
	 */
	public GetActionsByName(name: string): InputAction[] {
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
		print(`Creating listeners for: ${action.name} | ${action.id} | ${action.keybind.primaryKey}`);

		signalCleanup.Add(
			this.onActionUnbound.Connect((unbound) => {
				if (action === unbound) {
					fireUpSignalIfDown();
					signalCleanup.Clean();
					print(
						`(UNBOUND) Cleaning up listeners for: ${unbound.name} | ${unbound.id} | ${unbound.keybind.primaryKey}`,
					);
				}
			}),
		);

		signalCleanup.Add(
			this.onActionBound.Connect((bound) => {
				if (action === bound) {
					signalCleanup.Clean();
					print(
						`(BOUND) Cleaning up listeners for: ${bound.name} | ${bound.id} | ${bound.keybind.primaryKey}`,
					);
				}
			}),
		);

		if (action.IsComplexKeybind()) {
			signalCleanup.Add(
				this.inputDevice.OnKeyDown(action.keybind.primaryKey, (event) => {
					this.actionDownState.add(action.name);
					const actionDownSignals = this.actionDownSignals.get(action.name);
					if (!actionDownSignals) return;
					const isModifierKeyDown = this.inputDevice.IsKeyDown(action.keybind.GetModifierKeyCode());
					if (!isModifierKeyDown) return;
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
			signalCleanup.Add(
				this.inputDevice.OnKeyUp(action.keybind.GetModifierKeyCode(), (event) => {
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
		} else {
			signalCleanup.Add(
				this.inputDevice.OnKeyDown(action.keybind.primaryKey, (event) => {
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
