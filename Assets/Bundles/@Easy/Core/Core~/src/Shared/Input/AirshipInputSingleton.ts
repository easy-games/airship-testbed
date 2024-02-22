import { Controller, OnStart, Service } from "Shared/Flamework";
import { Airship } from "../Airship";
import { Keyboard } from "../UserInput";
import { KeySignal } from "../UserInput/Drivers/Signals/KeySignal";
import { Bin } from "../Util/Bin";
import { RunUtil } from "../Util/RunUtil";
import { Signal } from "../Util/Signal";
import { TimeUtil } from "../Util/TimeUtil";
import { InputAction, InputActionSchema } from "./InputAction";
import { Keybind } from "./Keybind";

/**
 *
 */
const DuplicateInputThreshold = 0.05;

@Controller({})
@Service({})
export class AirshipInputSingleton implements OnStart {
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
	private actionUnbound = new Signal<InputAction>();
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
	private complexActionLastDown = new Map<string, number>();

	constructor() {
		Airship.input = this;
	}

	OnStart(): void {
		if (!RunUtil.IsClient()) return;
		// const clientSettingsController = Dependency<ClientSettingsController>();
		// clientSettingsController.WaitForSettingsLoaded().then((settings) => {
		// 	print(`Settings here?: ${settings}`);
		// });
		Airship.input.CreateActions([
			{ name: "MoveLeft", keybind: new Keybind(KeyCode.A) },
			{ name: "MoveRight", keybind: new Keybind(KeyCode.D) },
			{ name: "MoveUp", keybind: new Keybind(KeyCode.W) },
			{ name: "MoveDown", keybind: new Keybind(KeyCode.S) },
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
		const action = new InputAction(name, keybind, category);
		this.UnbindActions(action);
		this.AddActionToTable(action);
		this.CreateActionListeners(action);
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

		signalCleanup.Add(
			this.actionUnbound.Connect((unbound) => {
				if (action === unbound) {
					signalCleanup.Clean();
				}
			}),
		);

		if (action.IsComplexKeybind()) {
			signalCleanup.Add(
				this.inputDevice.OnKeyDown(action.keybind.primaryKey, (event) => {
					const lastDown = this.complexActionLastDown.get(action.name);
					if (lastDown !== undefined) {
						const timeSince = TimeUtil.GetServerTime() - lastDown;
						if (timeSince <= DuplicateInputThreshold) {
							return;
						}
					}
					this.actionDownState.add(action.name);
					this.complexActionLastDown.set(action.name, TimeUtil.GetServerTime());
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
	 * @param signalIndices
	 * @param signals
	 */
	private ClearInactiveSignals(signalIndices: number[], signals: Signal<KeySignal>[]): void {
		for (const index of signalIndices) {
			signals.remove(index);
		}
	}

	/**
	 *
	 * @param newAction
	 */
	private UnbindActions(newAction: InputAction): void {
		for (const [name, actions] of this.actionTable) {
			let innerIndex = 0;
			for (const action of actions) {
				if (newAction.DoKeybindsMatch(action)) {
					const isActionDown = this.actionDownState.has(action.name);
					if (isActionDown) {
						const actionUpSignals = this.actionUpSignals.get(action.name) ?? [];
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								const mockKeySignal = new KeySignal(action.keybind.primaryKey, false);
								signal.Fire(mockKeySignal);
							}
						}
					}
					this.actionDownState.delete(action.name);
					this.actionUnbound.Fire(action);
					actions.remove(innerIndex);
					break;
				}
				if (name === newAction.name && action.IsDesktopPeripheral() === newAction.IsDesktopPeripheral()) {
					const isActionDown = this.actionDownState.has(action.name);
					if (isActionDown) {
						const actionUpSignals = this.actionUpSignals.get(action.name) ?? [];
						for (const signal of actionUpSignals) {
							if (signal.HasConnections()) {
								const mockKeySignal = new KeySignal(action.keybind.primaryKey, false);
								signal.Fire(mockKeySignal);
							}
						}
					}
					this.actionDownState.delete(action.name);
					this.actionUnbound.Fire(action);
					actions.remove(innerIndex);
					break;
				}
				innerIndex++;
			}
		}
	}
}
