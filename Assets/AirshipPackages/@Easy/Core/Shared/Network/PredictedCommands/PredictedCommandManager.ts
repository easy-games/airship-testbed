import { Airship } from "../../Airship";
import Character from "../../Character/Character";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import PredictedCustomCommand from "./PredictedCustomCommand";

export interface CommandConfiguration {
	priority?: number;
	/** Default is BeforeMove */
	tickTiming?: "BeforeMove" | "AfterMove";
	/**
	 * By default, if a command receives no input for more than a few ticks, we will delete the command and stop processing. If tickWithNoInput is
	 * set to true, the command will continue to process ticks even if no input is recieved from the client (OnTick's input will be undefined).
	 * This means that your OnTick function must return false when you want the command to stop running. Returning false from
	 * GetCommand will still cause the command to terminate even if tickWithNoInput is set to true.
	 *
	 * You may wish to use this option if your command should always run for a certain amount of time/ticks, even if client commands fail
	 * to reach the server.
	 *
	 * Default is false.
	 */
	tickWithNoInput?: boolean;
	handler: typeof PredictedCustomCommand<unknown, unknown>;
}

interface ActiveCommand {
	config: CommandConfiguration;
	customDataKey: string;
	created: boolean;
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

/** Data contained in the custom data key */
interface KeyData {
	commandId: string;
	instanceId: string;
}

export default class PredictedCommandManager extends AirshipSingleton {
	private commandHandlerMap: Record<string, CommandConfiguration> = {};
	private activeCommands: Map<number, Map<string, ActiveCommand>>;
	private globalBin = new Bin();

	// Clients use this number to generate a unique instance id for each command run. The server uses the client instance
	// IDs so we know which command input is for. Instance IDs are character scoped, so we don't have to worry about conflicts
	// across clients.
	private instanceId = 0;

	/** Used by the client to queue commands to be set up on the next tick. */
	private queuedCommands: string[] = [];

	protected Start(): void {
		Airship.Characters.ObserveCharacters((character) => {
			// Handles creating queued commands just before input processing on the client. This ensures we don't connect command callbacks
			// in the middle of processing a tick. Commands should always start at the beginning of a tick before gathering input.
			character.bin.Add(
				character.PreCreateCommand.Connect(() => {
					this.queuedCommands.forEach((commandId) => {
						this.SetupCommand(character, commandId, `${++this.instanceId}`);
					});
					this.queuedCommands.clear();
				}),
			);

			// Handles creating new commands to process inputs the first time the input for a command is seen on the server
			character.bin.Add(
				character.PreProcessCommand.Connect((customInputData, input) => {
					(customInputData as Map<string, Readonly<CustomInputData>>).forEach((value, key) => {
						// If it's not custom data controlled by us, ignore it
						const keyData = this.ParseCustomDataKey(key);
						if (!keyData) return;

						// See if the command is already running
						const activeCommand = this.GetActiveCommandOnCharacter(character, key);
						if (activeCommand) return;

						// Run the command if it's not already running
						this.SetupCommand(character, keyData.commandId, keyData.instanceId);
					});
				}),
			);

			// Handles comparing snapshot custom data
			character.bin.Add(
				character.OnCompareSnapshots.Connect((aCustom, a, bCustom, b) => {
					const commands = this.activeCommands.get(character.id);
					commands?.forEach((command, key) => {
						// Get the data for this command. If we don't have data on each side, then it definitely doesn't match
						// The resulting reconcile will cause any unnecessary commands to be removed and missing commands to
						// be created.
						const aCommandData = (aCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);
						const bCommandData = (bCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);
						if (!aCommandData || !bCommandData) {
							character.SetComparisonResult(false);
							return;
						}

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
					// First, make sure any commands that shouldn't be running at this snapshot are destroyed.
					const currentCommands = this.activeCommands.get(character.id);
					currentCommands?.forEach((activeCommand) => {
						if (customSnapshotData.has(activeCommand.customDataKey)) {
							// This command should be active, so we don't need to clean it up
							return;
						}

						// Remove all other commands.
						activeCommand.bin.Clean();
					});

					// Handle reseting or creating commands that are part of the snapshot we are resetting to.
					(customSnapshotData as Map<string, Readonly<CustomSnapshotData>>).forEach(
						(value, customDataKey) => {
							// If it's not custom data controlled by us, ignore it
							const keyData = this.ParseCustomDataKey(customDataKey);
							if (!keyData) return;

							// See if the command is already running
							let activeCommand = this.GetActiveCommandOnCharacter(character, customDataKey);
							if (!activeCommand) {
								// If it's not running, create it
								activeCommand = this.SetupCommand(character, keyData.commandId, keyData.instanceId);
								if (!activeCommand) {
									warn(
										`Failed to set up command ${keyData.commandId} (instance: ${keyData.instanceId}) for replay. This may cause unusual replay behavior.`,
									);
									return;
								}
							}

							// If we need to use this command and it's not been created yet, create it.
							if (!activeCommand.created) {
								activeCommand.created = true;
								activeCommand.instance.Create?.();
							}

							// Reset the command to the provided state snapshot.
							activeCommand.instance.ResetToSnapshot(value.data);
						},
					);
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
	 * Starts running the provided command on the character on the next tick. Returns a bin that can
	 * be used to stop the command from running.
	 * @param character
	 * @param commandId
	 * @returns
	 */
	public RunCommand(commandId: string) {
		if (Game.IsServer() && !Game.IsHosting()) {
			return error("RunCommand() should not be called from the server.");
		}

		this.queuedCommands.push(commandId);
	}

	/**
	 * Sets up the provided command on the given player's character. This function will
	 * not perform any action if the player does not have a character.
	 * @param commandId string that identifies the handler for the command
	 * @param instanceId string that identifies the instance of this command
	 * @returns
	 */
	private SetupCommand(character: Character, commandId: string, instanceId: string) {
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
			customDataKey: this.BuildCustomDataKey({ commandId, instanceId }),
			created: false,
			instance: new config.handler(character),
			bin: new Bin(),
		};
		let shouldTickAgain = true;

		character.bin.Add(activeCommand.bin);

		// Handles GetCommand call
		activeCommand.bin.Add(
			character.OnAddCustomInputData.Connect(() => {
				// Last tick requested to end processing, so we no longer get input. The server
				// should have also expected to end processing this tick and will not expect new input.
				if (!shouldTickAgain) return;

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
				// The last tick returned false, so we should stop ticking no matter what our input is.
				if (!shouldTickAgain) {
					activeCommand.bin.Clean();
					return;
				}

				const customInput = (customData as Map<string, CustomInputData>).get(activeCommand.customDataKey);
				if (customInput && !activeCommand.created) {
					activeCommand.created = true;
					activeCommand.instance.Create?.();
				}
				// The command was finished. Call complete and don't tick.
				if (customInput && customInput.finished) {
					activeCommand.bin.Clean();
					return;
				}
				shouldTickAgain = activeCommand.instance.OnTick(customInput, replay) === false;
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

		// Handles observer interpolation on each frame.
		activeCommand.bin.Add(
			character.OnInterpolateSnapshot.Connect((a, a_, b, b_, delta) => {
				const aData = (a as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				const bData = (b as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				if (aData === undefined) {
					// Skip interpolating since we haven't reached a base state yet.
					return;
				}
				if (bData === undefined) {
					// Skip interpolating since we have nothing to interpolate to.
					return;
				}
				activeCommand.instance.OnObserverUpdate?.(aData, bData, delta);
			}),
		);

		// Handles when interpolation reaches a new state for an observed character.
		activeCommand.bin.Add(
			character.OnInterpolateReachedSnapshot.Connect((customData) => {
				const commandData = (customData as Map<string, CustomSnapshotData>).get(activeCommand.customDataKey);
				if (!commandData && activeCommand.created) {
					// We reached a tick where this command is no longer running. Complete it.
					activeCommand.bin.Clean();
					return;
				}

				if (!commandData && !activeCommand.created) {
					// We reached a tick where the command hasn't started yet. Don't do anything yet.
					return;
				}

				if (!activeCommand.created) {
					// We reached a tick where we do have command data, but we haven't created the command yet. Create it.
					activeCommand.created = true;
					activeCommand.instance.Create?.();
				}
				activeCommand.instance.OnObserverReachedState?.(customData);
			}),
		);

		// Ensures the destroy callback is done whenever the command is to be cleaned up.
		activeCommand.bin.Add(() => {
			if (!activeCommand.created) return;
			activeCommand.created = false;
			activeCommand.instance.Destroy?.();
		});

		this.AddActiveCommandToCharacter(character, activeCommand);
		return activeCommand;
	}

	public GetActiveCommandOnCharacter(character: Character, customDataKey: string): ActiveCommand | undefined {
		const characterCommands = this.activeCommands.get(character.id);
		if (!characterCommands) return;

		const activeCommand = characterCommands.get(customDataKey);
		if (!activeCommand) return;

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

	private BuildCustomDataKey(keyData: { commandId: string; instanceId: string }) {
		return "cc:" + keyData.commandId + ":" + keyData.instanceId;
	}

	private ParseCustomDataKey(dataKey: string): KeyData | undefined {
		if (dataKey.sub(0, 3) !== "cc:") return;
		const [commandId, instanceId] = dataKey.sub(3).split(":");
		return {
			commandId,
			instanceId,
		};
	}
}
