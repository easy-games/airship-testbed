import { Airship } from "../../Airship";
import Character from "../../Character/Character";
import { Bin } from "../../Util/Bin";
import PredictedCustomCommand from "./PredictedCustomCommand";

export interface CommandConfiguration {
	priority?: number;
	tickTiming?: "BeforeMove" | "AfterMove";
	handler: typeof PredictedCustomCommand<unknown, unknown>;
}

interface ActiveCommand {
	config: CommandConfiguration;
	customDataKey: string;
	started: boolean;
	instance: PredictedCustomCommand<unknown, unknown>;
	bin: Bin;
}

interface CustomSnapshotData {
	data: Readonly<unknown>;
}

interface CustomInputData {
	finished: boolean;
	data: Readonly<unknown>;
}

export default class PredictedCommandManager extends AirshipSingleton {
	private CUSTOM_COMMAND_PREFIX = "cc:";
	private commandHandlerMap: Record<string, CommandConfiguration> = {};
	private activeCommands: Map<number, Map<string, ActiveCommand>>;
	private globalBin = new Bin();

	protected Start(): void {
		Airship.Characters.ObserveCharacters((character) => {
			// Handles creating new commands to process inputs the first time the input for a command is seen.
			character.bin.Add(
				character.PreProcessCommand.Connect((customInputData, input) => {
					(customInputData as Map<string, Readonly<CustomInputData>>).forEach((value, key) => {
						// If it's not custom data controlled by us, ignore it
						if (key.sub(0, 3) !== this.CUSTOM_COMMAND_PREFIX) return;
						const commandId = key.sub(3);

						// See if the command is already running
						const activeCommand = this.GetActiveCommandOnCharacter(character, commandId);
						if (activeCommand) return;

						// Run the command if it's not already running
						this.SetupCommand(character, commandId);
					});
				}),
			);

			// Handles comparing snapshot custom data
			character.bin.Add(
				character.OnCompareSnapshots.Connect((aCustom, a, bCustom, b) => {
					const commands = this.activeCommands.get(character.id);
					commands?.forEach((command, key) => {
						// Get the data for this command. If we don't have data on each side, then it definitely doesn't match
						const aCommandData = (aCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);
						const bCommandData = (bCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);
						if (!aCommandData || !bCommandData) {
							character.SetComparisonResult(false);
							return;
						}

						// TODO: check for tombstone?

						// Call the compare function and set the result for C# to use later
						const result = command.instance.CompareSnapshots(aCommandData.data, bCommandData.data);
						character.SetComparisonResult(result);
					});
				}),
			);

			// Handles setting snapshot state for commands. This is handled here because we may need to re-create
			// instances of the command that have already been cleaned up if we roll back to a time when the command
			// was still running.
			character.bin.Add(
				character.OnResetToSnapshot.Connect((customSnapshotData) => {
					// TODO: for all active commands that aren't part of the snapshot we are resetting to, we need to
					// reset them to a null snapshot so that they disable themselves. Should we should mark these all as started =false
					// so that we re-run the start functions? When we re set them back to their correct state, do we re-run the start/end
					// functions and if so, would they be replays?
					// Should we be doing the Start/End functions at all?
					// It seems like set state would probably not be where you would want to do things like create a rigidbody or
					// entity in the world, but it could be ok, just more checks
					// I could change the implied meaning of start/end to Create()/Destroy() so that you know that's where those
					// actions should happen. If I don't allow you to know it's a replay, then I can assume you will be creating and
					// destroying the effects of the command and then setState will come in the middle of those.

					// I think order matters here because we want to make sure that all existing active command reset everything to default
					// first, then we create and set all the commands that are supposed to be active during that snapshot

					(customSnapshotData as Map<string, Readonly<CustomSnapshotData>>).forEach((value, key) => {
						// If it's not custom data controlled by us, ignore it
						if (key.sub(0, 3) !== this.CUSTOM_COMMAND_PREFIX) return;
						const commandId = key.sub(3);

						// See if the command is already running
						let activeCommand = this.GetActiveCommandOnCharacter(character, commandId);
						if (!activeCommand) {
							// If it's not running, create it
							activeCommand = this.SetupCommand(character, commandId);
							if (!activeCommand) {
								warn(
									`Failed to set up command ${commandId} for replay. This may cause unusual replay behavior.`,
								);
								return;
							}
						}

						// Reset the command to the provided state snapshot.
						activeCommand.instance.ResetToSnapshot(value.data);
					});
				}),
			);

			// Clean the top level character entry when a character is removed.
			// This handles cleaning each active command
			character.bin.Add(() => {
				let commands = this.activeCommands.get(character.id);
				commands?.forEach((command) => {
					command.bin.Clean();
				});
				this.activeCommands.delete(character.id);
			});
		});
	}

	public RegisterCommands(map: Record<string, CommandConfiguration>) {
		this.commandHandlerMap = {
			...this.commandHandlerMap,
			...map,
		};
	}

	/**
	 * Sets up the provided command on the given player's character. This function will
	 * not perform any action if the player does not have a character.
	 * @param player
	 * @param commandId
	 * @returns
	 */
	private SetupCommand(character: Character, commandId: string) {
		const config = this.commandHandlerMap[commandId];
		if (!config) {
			warn(`Unable to find custom command with key ${commandId}. Has it been registered?`);
			return;
		}

		const existingCommand = this.GetActiveCommandOnCharacter(character, commandId);
		if (existingCommand) {
			warn(`Command ${commandId} is already running on character ${character.id}`);
			return;
		}

		const activeCommand: ActiveCommand = {
			config: config,
			customDataKey: this.CUSTOM_COMMAND_PREFIX + commandId,
			started: false,
			instance: new config.handler(character),
			bin: new Bin(),
		};

		character.bin.Add(activeCommand.bin);

		// Handles GetCommand call
		activeCommand.bin.Add(
			character.OnAddCustomInputData.Connect(() => {
				const input = activeCommand.instance.GetCommand();
				const inputWrapper: CustomInputData = {
					finished: !!input,
					data: input as Readonly<unknown>,
				};

				character.AddCustomInputData(activeCommand.customDataKey, inputWrapper);
			}),
		);

		// Decide which input function we use based on configuration.
		const onUseInput =
			config.tickTiming === "AfterMove"
				? character.OnUseCustomInputDataAfterMove
				: character.OnUseCustomInputData;
		// Handles OnTick call
		activeCommand.bin.Add(
			onUseInput.Connect((customData, input, replay) => {
				// TODO: extract input for custom command
				const customInput = (customData as Map<string, CustomInputData>).get(activeCommand.customDataKey);
				// We are running a tick where we didn't have input for this command
				if (!customInput) return;
				if (customInput && !activeCommand.started) {
					activeCommand.started = true;
					activeCommand.instance.Create?.();
				}
				// The command was finished. Call complete and don't tick.
				if (customInput.finished) {
					activeCommand.started = false;
					activeCommand.instance.Destroy?.();
					activeCommand.bin.Clean();
					return;
				}
				activeCommand.instance.OnTick(customInput, replay);
			}),
		);

		// Handles OnCaptureSnapshot call
		activeCommand.bin.Add(
			character.OnAddCustomSnapshotData.Connect(() => {
				const state = activeCommand.instance.OnCaptureSnapshot();
				const stateWrapper: CustomSnapshotData = {
					data: state as Readonly<unknown>,
				};
				character.AddCustomSnapshotData(activeCommand.customDataKey, stateWrapper);
			}),
		);

		// // Handles ResetToSnapshot
		// activeCommand.bin.Add(
		// 	// TODO: this might actually need to be handled on a long lived connection so that we can create the command to handle
		// 	// the rollback if we've already cleaned it up. Or we would have to find a way to keep the connection around until it's no
		// 	// longer possible to need it again. Maybe AirshipSimulationManger could expose that as an event?
		// 	character.OnResetToSnapshot.Connect((customSnapshotData) => {
		// 		const state = (customSnapshotData as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);

		// 		if (!state) {
		// 			// we reset the started variable here since we only go backwards in time. That means that a state with no
		// 			// data is a state where this command wasn't started yet. If it was after the command finished, we would
		// 			// have cleaned up this event connection already. TODO: is that a problem?? what if we clean up then need to roll
		// 			// back to when it was running....
		// 			activeCommand.started = false;
		// 		}

		// 		activeCommand.instance.ResetToSnapshot(state);
		// 	}),
		// );

		activeCommand.bin.Add(
			character.OnInterpolateSnapshot.Connect((a, a_, b, b_, delta) => {
				const aData = (a as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				const bData = (b as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				if (aData === undefined) {
					// Skip interpolating since we haven't reached a base state yet.
					return;
				}
				if (bData === undefined) {
					//activeCommand.instance.OnObserverEnded?.();
					activeCommand.bin.Clean();
					return;
				}
				activeCommand.instance.OnObserverUpdate?.(aData, bData, delta);
			}),
		);

		activeCommand.bin.Add(
			character.OnInterpolateReachedSnapshot.Connect((customData) => {
				// if (!activeCommand.started) {
				// 	activeCommand.started = true;
				// 	activeCommand.instance.OnObserverStart?.(customData.get(activeCommand.key) as Readonly<unknown>);
				// }
				const commandData = (customData as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				if (!commandData && activeCommand.started) {
					// We reached a tick where this command is no longer running. Complete it.
					activeCommand.instance.Destroy?.();
					return;
				}

				if (!commandData && !activeCommand.started) {
					// We reached a tick where the command hasn't started yet. Don't do anything yet.
					return;
				}

				if (!activeCommand.started) {
					// We reached a tick where we do have command data, but we haven't started the command yet.
					activeCommand.started = true;
					activeCommand.instance.Create?.();
				}
				activeCommand.instance.OnObserverReachedState?.(customData);
			}),
		);

		// TODO: this needs to be in a place where we know if it's a replay
		// Handles OnCommandEnded so that it fires when the command is complete
		// activeCommand.bin.Add(() => {
		// 	activeCommand.instance.OnCommandEnded?.(false);
		// });

		this.AddActiveCommandToCharacter(character, activeCommand);
		return activeCommand;
	}

	public GetActiveCommandOnCharacter(character: Character, commandId: string): ActiveCommand | undefined {
		const characterCommands = this.activeCommands.get(character.id);
		if (!characterCommands) return;

		const activeCommand = characterCommands.get(commandId);
		if (!commandId) return;

		return activeCommand;
	}

	/**
	 * Adds a command to the character's active command map. Also ensures that the command will be removed
	 * when the command is cleaned.
	 * @param character
	 * @param activeCommand
	 */
	private AddActiveCommandToCharacter(character: Character, activeCommand: ActiveCommand) {
		let activeCommandsOnCharacter = this.activeCommands.get(character.id);
		if (!activeCommandsOnCharacter) {
			activeCommandsOnCharacter = new Map();
			this.activeCommands.set(character.id, activeCommandsOnCharacter);
		}
		activeCommandsOnCharacter.set(activeCommand.customDataKey, activeCommand);
		activeCommand.bin.Add(() => {
			activeCommandsOnCharacter.delete(activeCommand.customDataKey);
		});
	}

	protected OnDestroy(): void {
		this.globalBin.Clean();
	}
}
