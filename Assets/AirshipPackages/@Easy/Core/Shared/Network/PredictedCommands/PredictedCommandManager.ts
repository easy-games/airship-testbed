import { Airship } from "../../Airship";
import Character from "../../Character/Character";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { Cancellable } from "../../Util/Cancellable";
import inspect from "../../Util/Inspect";
import { Signal, SignalPriority } from "../../Util/Signal";
import { TaskUtil } from "../../Util/TaskUtil";
import { NetworkChannel } from "../NetworkAPI";
import { NetworkSignal } from "../NetworkSignal";
import PredictedCustomCommand from "./PredictedCustomCommand";

export interface CommandConfiguration {
	priority?: SignalPriority;
	/** Default is BeforeMove */
	tickTiming?: "BeforeMove" | "AfterMove";
	handler: typeof PredictedCustomCommand<unknown, unknown>;
}

interface ActiveCommand {
	commandId: string;
	instanceId: number;
	config: CommandConfiguration;
	customDataKey: string;
	created: boolean;
	instance: PredictedCustomCommand<unknown, unknown>;
	bin: Bin;
	ResetInstance: () => void;
}

type CustomSnapshotData = [finished: boolean, data: Readonly<unknown>];

type CustomInputData = [finished: boolean, data: Readonly<unknown>];

/**
 * Number of commands that should be processed before we decide that a command failed to reach the server. Command
 * start/end signals are on a reliable channel that may take longer to receive than unreliable snapshot results.
 */
const CLIENT_COMMAND_FAILED_DELAY = (NetworkClient.sendInterval / Time.fixedDeltaTime) * 2;

/** Data contained in the custom data key */
export class CommandInstanceIdentifier {
	constructor(public characterId: number, public commandId: string, public instanceId: number) {}

	public stringify() {
		return `${this.characterId}:${this.commandId}:${this.instanceId}`;
	}

	static fromString(str: string): CommandInstanceIdentifier {
		const [chrStr, commandId, intStr] = str.split(":");
		return new CommandInstanceIdentifier(tonumber(chrStr)!, commandId, tonumber(intStr)!);
	}
}

class ValidateCommand extends Cancellable {
	public constructor(public character: Character, public readonly commandId: string) {
		super();
	}
}

const NetworkCommandEnd = new NetworkSignal<
	[commandIdentifier: string, commandNumber: number, lastCapturedState: CustomSnapshotData]
>("PredictedCommands/CommandEnded", NetworkChannel.Reliable);

const NetworkCommandInvaild = new NetworkSignal<[commandIdentifier: string, commandNumber: number]>(
	"PredictedCommands/CommandInvalid",
	NetworkChannel.Reliable,
);

const NetworkCommandStarted = new NetworkSignal<[commandIdentifier: string]>(
	"PredictedCommands/CommandStarted",
	NetworkChannel.Reliable,
);

export default class PredictedCommandManager extends AirshipSingleton {
	/**
	 * Fires when a new command is starting. In server authoritative mode, this signal fires on both
	 * the client and the server. If running in client authoritative mode, this signal will only fire
	 * on the local client.
	 *
	 * Keep in mind that cancelling a command only on the server side will force a reconcile.
	 *
	 * Only fires for the local character on the client.
	 */
	public readonly onValidateCommand = new Signal<ValidateCommand>();

	/**
	 * Fires when a command has authoritatively ended. This fires before processing the next forward tick on the client even
	 * if the command was authoritatively ended one or more ticks before the current tick. This means you can check if the command
	 * is still running locally using IsCommandInstanceActive() when this signal fires. The command will be reconciled after this signal
	 * completes.
	 *
	 * This event may be useful in cases where it's important for external behaviors to know if a command ended and with what
	 * state the command ended with. For example, perhaps you run an effect when the command ends and the efffect depends on the state
	 * of the command when it ended. Keep in mind that this event is _not_ predicted, so there will be ping delay on this signal firing.
	 */
	public readonly onCommandEnded = new Signal<[CommandInstanceIdentifier, Readonly<unknown> | undefined]>();

	private readonly onInstanceCreated = new Signal<[CommandInstanceIdentifier, unknown]>();
	private readonly onInstanceDestroyed = new Signal<[CommandInstanceIdentifier]>();

	private commandHandlerMap: Record<string, CommandConfiguration> = {};
	/** The active commands for the current tick. If read during a replay, it will contain the active command at that tick. */
	private activeCommands: Map<number, Map<string, ActiveCommand>> = new Map();
	private globalBin = new Bin();
	private observerBins = new Set<Bin>();

	// Clients use this number to generate a unique instance id for each command run. The server uses the client instance
	// IDs so we know which command input is for. Instance IDs are character scoped, so we don't have to worry about conflicts
	// across clients.
	private instanceId = 0;

	// The server uses this map to track the highest completed commands. The makes it so we don't recreate and run input for commands
	// that the server has authoritatively completed. The client tracks this as well to make sure that we don't re-run input for a cancelled
	// command when we perform resimulations.
	private highestCompleteIdMap: Record<
		Character,
		{
			[commandId: string]: number;
		}
	> = {};

	/** Used by the client to queue commands to be set up on the next tick. */
	private queuedCommands: CommandInstanceIdentifier[] = [];

	/**
	 * Used by the client to ensure that a started command actually started on the server. Once the server passes the command
	 * number the command began, we should receive a confirmation from the server of the cmd start.
	 */
	private unconfirmedCommands: Map<string, { commandNumber: number }> = new Map();

	/** Used by the client to queue confirm final state data for a command. */
	private unconfirmedFinalState: Map<string, { commandNumber: number; snapshot: CustomSnapshotData; time: number }> =
		new Map();
	/** Used by the client to resimulate the confirmed final stat of a command. */
	private confirmedFinalState: Map<string, { commandNumber: number; snapshot: CustomSnapshotData; time: number }> =
		new Map();

	/** Used to track requests to cancel running commands. */
	private queuedCancellations: CommandInstanceIdentifier[] = [];
	/**
	 * Used on the client to track when a command was cancelled on the client so that it can be re-cancelled during replays.
	 */
	private predictedCancellations: Map<string, { commandNumber: number; time: number }> = new Map();

	protected Start(): void {
		Airship.Characters.ObserveCharacters((character) => {
			// Handles creating queued commands just before input processing on the client. This ensures we don't connect command callbacks
			// in the middle of processing a tick. Commands should always start at the beginning of a tick before gathering input.
			character.bin.Add(
				character.PreCreateCommand.Connect((commandNumber) => {
					this.queuedCommands.forEach((key) => {
						if (this.IsCommandIdActive(key.commandId)) {
							warn(
								`Tried to run command ${key.commandId} on character ID ${key.characterId}, but it was already active. You can only run one command instance at a time.`,
							);
							return;
						}
						const event = this.onValidateCommand.Fire(new ValidateCommand(character, key.commandId));
						if (event.IsCancelled()) return; // Skip creating if something says we shouldn't create this
						this.SetupCommand(character, key.commandId, key.instanceId);
						this.unconfirmedCommands.set(key.stringify(), { commandNumber });
					});
					this.queuedCommands.clear();
				}),
			);

			// Handles creating new commands to process inputs the first time the input for a command is seen. Clients generally
			// have already created the command in PreCreateCommand, but still need to create new commands during replays, so they
			// also run this event. It's important that we don't remove commands on preprocess since we can get empty input data
			// if there's no input available for a tick.
			character.bin.Add(
				character.PreProcessCommand.Connect((customInputData, input, replay) => {
					(customInputData as Map<string, Readonly<CustomInputData>>).forEach((value, key) => {
						// If it's not custom data controlled by us, ignore it
						const commandIdentifier = this.ParseCustomDataKey(character.id, key);
						if (!commandIdentifier) return;

						// Invalid instance ids are ignored. 0 is never used as an instance id.
						if (commandIdentifier.instanceId === 0) return;

						// See if the command is already running
						const activeCommand = this.GetActiveCommandByIdentifier(commandIdentifier);
						if (activeCommand) {
							// Consider cleaning up the command if it has unconfirmed end?
							return;
						}

						if (Game.IsServer() && !Game.IsHosting()) {
							const highestInstance = this.GetHighestCompletedInstance(
								character.id,
								commandIdentifier.commandId,
							);

							// Highest instance is updated when the command _completes_ so if we see it again, that
							// means we should ignore the command since the server has considered it complete.
							if (commandIdentifier.instanceId <= highestInstance) return;
						}

						// Check if the command should run if we are the server. The client already validates command creation in PreCreateCommand, so
						// we don't need to do it again here.
						if (Game.IsServer()) {
							// If the server already has this command ID active, but it isn't the command described by this commandIdentifier, the client is trying to start a new instance before
							// the server has completed the existing one.
							if (this.IsCommandIdActive(commandIdentifier.commandId, character)) {
								warn(
									`Tried to run command ${commandIdentifier.commandId} on character ID ${commandIdentifier.characterId}, but it was already active. You can only run one command instance at a time.`,
								);
								// We notify the client that the command has been invalidated
								if (character.player) {
									NetworkCommandInvaild.server.FireClient(
										character.player,
										commandIdentifier.stringify(),
										input.commandNumber,
									);
								}
								return;
							}
							const result = this.onValidateCommand.Fire(
								new ValidateCommand(character, commandIdentifier.commandId),
							);
							if (result.IsCancelled()) {
								// Ignore input for this command in the future since it failed validation.
								this.SetHighestCompletedInstance(commandIdentifier);
								// We notify the client that the command has been invalidated
								if (character.player) {
									NetworkCommandInvaild.server.FireClient(
										character.player,
										commandIdentifier.stringify(),
										input.commandNumber,
									);
								}
								return;
							}
						}

						// Clients should ignore creating commands that have been cancelled or ended authoritatively.
						const confirmedState = this.confirmedFinalState.get(commandIdentifier.stringify());
						if (confirmedState) {
							// print(
							// 	"confirmed final state for " +
							// 		commandIdentifier.stringify() +
							// 		" is cmd  #" +
							// 		confirmedState.commandNumber,
							// );
							// Our authoritative state saying this command should already have ended, so don't create it.
							if (confirmedState.commandNumber < input.commandNumber) {
								// print("Will not create cmd since we are processing " + input.commandNumber);
								return;
							}
						} else {
							// This saves us from the edge case where a command was mispredicted so far into the future that there are inputs
							// for that command available even after it's confirmedFinalState has been cleared from our local history.
							const highestInstance = this.GetHighestCompletedInstance(
								commandIdentifier.characterId,
								commandIdentifier.commandId,
							);
							// print("highest instance for " + commandIdentifier.stringify() + " is " + highestInstance);
							if (highestInstance >= commandIdentifier.instanceId) {
								// print("Attempting to run command that has been authoritatively completed. Ignoring.");
								return;
							}
						}

						// Our current prediction has decided that this command should no longer run. Don't recreate it even if
						// there are inputs available from previous predictions. This is a confusing side effect of
						// resimulating with previous inputs.
						const unconfirmedFinalState = this.unconfirmedFinalState.get(commandIdentifier.stringify());
						if (unconfirmedFinalState) {
							if (unconfirmedFinalState.commandNumber < input.commandNumber) {
								// print("will not create command because it was predicted to have ended during a resim.");
								return;
							}
						}

						// Run the command if it's not already running
						// print("setting up command " + commandIdentifier.stringify() + " before processing");
						this.SetupCommand(character, commandIdentifier.commandId, commandIdentifier.instanceId);
						if (Game.IsServer() && character.player) {
							NetworkCommandStarted.server.FireClient(character.player, commandIdentifier.stringify());
						}
					});
				}),
			);

			// Handles creating commands for observers.
			character.bin.Add(
				character.OnInterpolateReachedSnapshot.ConnectWithPriority(
					SignalPriority.HIGHEST,
					(customSnapshotData, snapshot) => {
						customSnapshotData.forEach((value, customDataKey) => {
							// If it's not custom data controlled by us, ignore it
							const commandIdentifier = this.ParseCustomDataKey(character.id, customDataKey);
							if (!commandIdentifier) return;

							// See if the command is already running
							let activeCommand = this.GetActiveCommandByIdentifier(commandIdentifier);
							if (activeCommand) return;

							// If it's not running, create it
							activeCommand = this.SetupCommand(
								character,
								commandIdentifier.commandId,
								commandIdentifier.instanceId,
							);
							if (!activeCommand) {
								warn(
									`Failed to set up command ${
										commandIdentifier.commandId
									} (id: ${commandIdentifier.stringify()}) for observer. This may cause unusual behavior.`,
								);
								return;
							}
						});
					},
				),
			);

			// Handles comparing snapshot custom data
			character.bin.Add(
				character.OnCompareSnapshots.Connect((aCustom, a, bCustom, b) => {
					const activeCommandKeys: Set<string> = new Set();
					aCustom.forEach((_, key) => activeCommandKeys.add(key));
					bCustom.forEach((_, key) => activeCommandKeys.add(key));

					// Iterate over active keys for these snapshots and compare.
					activeCommandKeys?.forEach((key) => {
						// If the custom command key wasn't one of our managed keys, ignore it
						const commandIdentifier = this.ParseCustomDataKey(character.id, key);
						if (!commandIdentifier) return;

						// Get the data for this command. If we don't have data on each side, then it definitely doesn't match
						// The resulting reconcile will cause any unnecessary commands to be removed and missing commands to
						// be created.
						const aCommandData = (aCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);
						const bCommandData = (bCustom as Map<string, Readonly<CustomSnapshotData>>).get(key);

						// If we don't have a command running on the client that we should have based on the server, resimulate so
						// we can take that commands result into account on our client.
						if (!aCommandData) {
							warn(
								"Command " +
									commandIdentifier.stringify() +
									" was running on the server, but didn't run on the client for cmd #" +
									a.lastProcessedCommand +
									". Resimulation required.",
							);
							character.SetComparisonResult(false);
							return;
						}

						// If we don't have a command in server state that we have on the client, we'll wait for the authoritative
						// final state to be sent to us by the server before resimming
						if (!bCommandData) {
							return;
						}

						// To find the command instance we need to work on, we first check active commands to see if it's still operating,
						// if it's not, we have to create it, then compare.
						let instance = this.GetActiveCommandByIdentifier(commandIdentifier)?.instance;
						if (!instance) {
							const config = this.commandHandlerMap[commandIdentifier.commandId];
							const handler = config.handler;
							if (!handler) return;

							// Instead of fully creating an active command using SetupCommand, we simply create an instance of it
							// since all we want to do is call CompareSnapshots(). No ticking will be involved on this instance
							// and it should be removed once this function completes.
							instance = new handler(character, commandIdentifier, config);
						}

						// Call the compare function and set the result for C# to use later
						const result = TaskUtil.RunWithoutYield(() =>
							instance.CompareSnapshots(aCommandData[1], bCommandData[1]),
						);
						if (!result) {
							warn(
								"Misprediction for " +
									commandIdentifier.stringify() +
									" on cmd #" +
									a.lastProcessedCommand +
									". Predicted Result: " +
									inspect(aCommandData[1]) +
									" Actual Result: " +
									inspect(bCommandData[1]),
							);
						}
						character.SetComparisonResult(result);
					});

					this.unconfirmedCommands.forEach(({ commandNumber }, commandInstanceIdentifier) => {
						if (b.lastProcessedCommand < commandNumber + CLIENT_COMMAND_FAILED_DELAY) return; // Command hasn't started yet

						// The command should have started, but we got a snapshot after the command should have started and
						// since the command is still unconfirmed, we have to consider the command invalid as it did not
						// reach the server.
						character.SetComparisonResult(false);
						this.unconfirmedCommands.delete(commandInstanceIdentifier);
						this.unconfirmedFinalState.delete(commandInstanceIdentifier);
						const commandIdenfitier = CommandInstanceIdentifier.fromString(commandInstanceIdentifier);
						this.onCommandEnded.Fire(commandIdenfitier, undefined);

						this.confirmedFinalState.set(commandInstanceIdentifier, {
							commandNumber: 0,
							// This time is used for when we should remove the confirmedState, so it needs to be accurate
							time: character.movement.GetLocalSimulationTimeFromCommandNumber(commandNumber),
							snapshot: [true, undefined as unknown as Readonly<unknown>],
						});

						warn(
							"Client attempted to run " +
								commandInstanceIdentifier +
								", but the command did not reach the server. Resimulation required.",
						);
						character.movement.RequestResimulation(commandNumber);
					});
				}),
			);

			// Handles setting snapshot state for commands. This is handled here because we may need to re-create
			// instances of the command that have already been cleaned up if we roll back to a time when the command
			// was still running.
			// For now server will not handle OnResetToSnapshot. This means lag compensation will only reposition
			// characters (and will not reset command state). This is as an optimization.
			if (!Game.IsServer()) {
				character.bin.Add(
					character.OnResetToSnapshot.Connect((customSnapshotData, snapshot) => {
						// First, make sure any commands that shouldn't be running at this snapshot are destroyed.
						const currentCommands = this.activeCommands.get(character.id);
						currentCommands?.forEach((activeCommand) => {
							if (customSnapshotData.has(activeCommand.customDataKey)) {
								// This command should be active, so we don't need to clean it up
								// print(
								// 	"command is active on target snapshot, ignoring. Expect to reset " +
								// 		activeCommand.customDataKey,
								// );
								activeCommand.ResetInstance(); // Resets the internal instance fields so they are fresh for the replay
								return;
							}

							// print("active command is not active on snapshot, removing" + activeCommand.customDataKey);
							// Remove all other commands.
							activeCommand.bin.Clean();
						});

						// Handle reseting or creating commands that are part of the snapshot we are resetting to.
						(customSnapshotData as Map<string, Readonly<CustomSnapshotData>>).forEach(
							(value, customDataKey) => {
								// If it's not custom data controlled by us, ignore it
								const commandIdentifier = this.ParseCustomDataKey(character.id, customDataKey);
								if (!commandIdentifier) return;

								// See if the command is already running
								let activeCommand = this.GetActiveCommandByIdentifier(commandIdentifier);
								if (!activeCommand) {
									// print(
									// 	"command was not active when resetting. Expect to create " +
									// 		commandIdentifier.stringify(),
									// );
									// If it's not running, create it
									activeCommand = this.SetupCommand(
										character,
										commandIdentifier.commandId,
										commandIdentifier.instanceId,
									);
									if (!activeCommand) {
										warn(
											`Failed to set up command ${
												commandIdentifier.commandId
											} (id: ${commandIdentifier.stringify()}) for replay. This may cause unusual replay behavior.`,
										);
										return;
									}
								}

								// Reset the command to the provided state snapshot.
								let data = value[1];
								const confirmedState = this.confirmedFinalState.get(commandIdentifier.stringify());
								// Overwrite with last confirmed data if required
								if (confirmedState) {
									// Our authoritative state is saying this command should already have ended, so don't create it.
									if (confirmedState.commandNumber < snapshot.lastProcessedCommand) {
										// print(
										// 	"Confirmed state for " +
										// 		commandIdentifier.stringify() +
										// 		" exists but it's before this command, ignoring reset.",
										// );
										activeCommand.bin.Clean(); // Remove the command since the snapshot shouldn't have had this command in it.
										return;
									}
									data = confirmedState.snapshot[1];
								}

								// If the command was predicted to end before this snapshot and we are seeing the command
								// as part of the snapshot, reset the unconfirmedFinalState, since our prediction was obviously inaccurate.
								const unconfirmedEnd = this.unconfirmedFinalState.get(commandIdentifier.stringify());
								if (unconfirmedEnd && unconfirmedEnd.commandNumber < snapshot.lastProcessedCommand) {
									// print("deleting invalid unconfirmed state for " + commandIdentifier.stringify());
									this.unconfirmedFinalState.delete(commandIdentifier.stringify());
								}

								if (Game.IsClient()) {
									// If the client predicted a cancellation that didn't occur (since we are seeing snapshot data for it after the cancel
									// should have occured), remove it so that we don't use it in our resimulations.
									const predictedCancel = this.predictedCancellations.get(commandIdentifier.stringify());
									if (predictedCancel && predictedCancel.commandNumber < snapshot.lastProcessedCommand) {
										this.predictedCancellations.delete(commandIdentifier.stringify());
									}
								}

								// If we need to use this command and it's not been created yet, create it.
								if (!activeCommand.created) {
									// print(
									// 	"active command " +
									// 		activeCommand.customDataKey +
									// 		" was not intialized on target snapshot, creating",
									// );
									activeCommand.created = true;
									TaskUtil.RunWithoutYield(() => activeCommand.instance.Create?.());
								}

								// print("resetting " + activeCommand.customDataKey);
								TaskUtil.RunWithoutYield(() => activeCommand.instance.ResetToSnapshot(data));

								// Finished means that the command ended on the tick we are resetting to, so remove it from
								// the active command list so it doesn't continue to tick in our predictions.
								if (value[0]) {
									// print(
									// 	"cmd " +
									// 		activeCommand.customDataKey +
									// 		" finished on this tick. Removing from active command list.",
									// );
									activeCommand.bin.Clean();
								}
							},
						);
					}),
				);
			}

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

		// Handles ending commands on the client when the server authoritatively completes the command.
		NetworkCommandEnd.client.OnServerEvent((commandIdentifierStr, commandNumber, stateData) => {
			this.unconfirmedCommands.delete(commandIdentifierStr);
			// Get the predicted final state on the client
			const lastState = this.unconfirmedFinalState.get(commandIdentifierStr);
			// print(
			// 	"got " +
			// 		inspect(lastState) +
			// 		" from " +
			// 		inspect(this.unconfirmedFinalState) +
			// 		" for " +
			// 		commandIdentifierStr,
			// );
			this.unconfirmedFinalState.delete(commandIdentifierStr);

			const commandIdenfitier = CommandInstanceIdentifier.fromString(commandIdentifierStr);
			const character = Airship.Characters.FindById(commandIdenfitier.characterId);

			if (!character) return; // If the character doesn't exist, then this information is no longer relevant.

			// If we are an observer, we don't have any unconfirmed end state to resimulate and we will need to store
			// the confirmed state for later since we buffer our ticks locally.
			if (!character.IsLocalCharacter()) {
				// If we've already completed the command by the time the final state arrives (unusual for observers due to buffering)
				// then we should fire the command end right away. We don't need to store the final state for later.
				if (
					this.GetHighestCompletedInstance(commandIdenfitier.characterId, commandIdenfitier.commandId) >=
					commandIdenfitier.instanceId
				) {
					this.onCommandEnded.Fire(commandIdenfitier, stateData[1]);
					return;
				}

				// If we are still waiting to run the command, or haven't finished running it yet due to buffering (likely),
				// then store the final state for later.
				this.confirmedFinalState.set(commandIdentifierStr, {
					commandNumber: commandNumber,
					snapshot: stateData,
					time: character.movement.GetLocalSimulationTimeFromCommandNumber(commandNumber),
				});
				return;
			}

			this.confirmedFinalState.set(commandIdentifierStr, {
				commandNumber: commandNumber,
				snapshot: stateData,
				time: character.movement.GetLocalSimulationTimeFromCommandNumber(commandNumber),
			});
			this.onCommandEnded.Fire(commandIdenfitier, stateData[1]);

			// temporary instance just for comparing snapshot data
			const config = this.commandHandlerMap[commandIdenfitier.commandId];
			const tempInstance = new config.handler(character, commandIdenfitier, config);
			print(
				`Client recieved end report for ${commandIdentifierStr}. Server ended cmd on cmd# ${commandNumber}. Client predicted end on cmd# ${
					lastState?.commandNumber
				}. Client predicted state: ${inspect(lastState?.snapshot)} Server Auth State: ${inspect(stateData)}`,
			);
			// if the final states match, then we are good. No resim required
			if (
				lastState &&
				lastState.commandNumber === commandNumber &&
				tempInstance.CompareSnapshots(lastState?.snapshot[1], stateData[1])
			) {
				print("Final states match, no resim required.");
				return;
			}

			// If the states don't match or our local command hasn't stopped running, we have to resimulate
			character.movement.RequestResimulation(commandNumber);
		});

		// Handles commands that did not validate on the server.  These will be cancelled locally and resimulated every time.
		NetworkCommandInvaild.client.OnServerEvent((commandIdentifierStr, commandNumber) => {
			// print("Deleting unconfirmed state for " + commandIdentifierStr + " since it was invalid.");
			this.unconfirmedFinalState.delete(commandIdentifierStr);
			this.unconfirmedCommands.delete(commandIdentifierStr);
			const commandIdenfitier = CommandInstanceIdentifier.fromString(commandIdentifierStr);
			this.onCommandEnded.Fire(commandIdenfitier, undefined);

			const character = Airship.Characters.FindById(commandIdenfitier.characterId);
			if (!character) return; // If the character doesn't exist, then this information is no longer relevant.
			this.confirmedFinalState.set(commandIdentifierStr, {
				commandNumber: 0,
				// This time is used for when we should remove the confirmedState, so it needs to be accurate
				time: character.movement.GetLocalSimulationTimeFromCommandNumber(commandNumber),
				snapshot: [true, undefined as unknown as Readonly<unknown>],
			});

			warn(
				"Client attempted to run " +
					commandIdentifierStr +
					", but the command failed validation on the server. Resimulating.",
			);
			character.movement.RequestResimulation(commandNumber);
		});

		// Handles the confirmation that the server received and started a new command
		NetworkCommandStarted.client.OnServerEvent((commandIdentifier) => {
			const uncomfirmedCmd = this.unconfirmedCommands.get(commandIdentifier);
			if (!uncomfirmedCmd) {
				warn(
					"Server confirmed starting command " +
						commandIdentifier +
						" which either never started on the client or was already confirmed to be started by the server. Report this.",
				);
				return;
			}
			this.unconfirmedCommands.delete(commandIdentifier);
		});

		this.globalBin.Add(() => {
			this.observerBins.forEach((bin) => {
				bin.Clean();
			});
		});

		if (Game.IsClient()) {
			this.globalBin.AddEngineEventConnection(
				AirshipSimulationManager.Instance.OnHistoryLifetimeReached((time) => {
					// Clean up any data we will never need to use again
					this.predictedCancellations.forEach((data, key) => {
						if (data.time < time) this.predictedCancellations.delete(key);
					});

					this.unconfirmedFinalState.forEach((data, key) => {
						if (data.time < time) this.unconfirmedFinalState.delete(key);
					});

					this.confirmedFinalState.forEach((data, key) => {
						if (data.time < time) {
							// print("removing confirmed final state for " + key);
							// We set the highest completed instance here since the client will need to resim up to the confirmed final state
							// during replays. The instance hasn't really "completed" until we can be sure that it will never run again on the
							// client.
							this.SetHighestCompletedInstance(CommandInstanceIdentifier.fromString(key));
							this.confirmedFinalState.delete(key);
						}
					});
				}),
			);
		}
	}

	public RegisterCommands(map: { [commandId: string]: CommandConfiguration }) {
		this.commandHandlerMap = {
			...this.commandHandlerMap,
			...map,
		};
	}

	/**
	 * Starts running the provided command on the local character on the next tick. Returns a bin that can
	 * be used to stop the command from running.
	 * @param character
	 * @param commandId
	 * @returns
	 */
	public RunCommand(commandId: string): CommandInstanceIdentifier {
		if (Game.IsServer() && !Game.IsHosting()) {
			return error("RunCommand() should not be called from the server.");
		}

		const character = Game.localPlayer.character;
		if (!character) {
			return error(`Character did not exist when attempting to run command ${commandId}`);
		}

		const instanceData = new CommandInstanceIdentifier(character.id, commandId, ++this.instanceId);
		this.queuedCommands.push(instanceData);

		return instanceData;
	}

	/**
	 * Cancels the running command on the next tick.
	 */
	public CancelCommand(commandInstance: CommandInstanceIdentifier) {
		const index = this.queuedCommands.findIndex((i) => i.stringify() === commandInstance.stringify());
		if (index !== -1) this.queuedCommands.remove(index);
		this.queuedCancellations.push(commandInstance);
	}

	/** Allows you to retrieve and operate on the specific handler instance for a running command. When a new handler instance matching the
	 * command instance identifier is created, the callback will be called with the handler instance of the command that will be performing tick
	 * operations.
	 */
	public ObserveHandler<T>(
		commandInstance: CommandInstanceIdentifier,
		callback: (instance: T) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	): Bin {
		return this.ObserveCommand(
			commandInstance.characterId,
			commandInstance.commandId,
			(identifier, handler) => {
				if (identifier?.instanceId !== commandInstance.instanceId) return;
				return callback(handler as T);
			},
			priority,
		);
	}

	/**
	 * Observes the command instance currently running for a provided command id. This allows you to track the specific
	 * command instance identifier that is running. This fires when the active command changes, meaning that on the client,
	 * this callback will fire during replays if the command instance being run changes.
	 * @param commandId The command id used to run the command.
	 * @param callback
	 */
	public ObserveCommand<T>(
		character: Character | number,
		commandId: string,
		callback: (commandIdentifier: CommandInstanceIdentifier | undefined, handler: T | undefined) => CleanupFunc,
		priority: SignalPriority = SignalPriority.NORMAL,
	) {
		const characterId = typeIs(character, "number") ? character : character.id;
		const bin = new Bin();
		let callbackBin: CleanupFunc;

		bin.Add(
			this.onInstanceCreated.ConnectWithPriority(priority, (identifier, instance) => {
				if (identifier.characterId !== characterId) return;
				if (identifier.commandId !== commandId) return;
				callbackBin?.();
				callbackBin = callback(identifier, instance as T);
			}),
		);
		bin.Add(
			this.onInstanceDestroyed.ConnectWithPriority(priority, (identifier) => {
				if (identifier.characterId !== characterId) return;
				if (identifier.commandId !== commandId) return;
				callbackBin?.();
				callbackBin = callback(undefined, undefined);
			}),
		);
		bin.Add(() => callbackBin?.());

		const result = this.GetActiveCommandByCommandId(characterId, commandId);
		if (result) callbackBin = callback(result.identifier, result.command.instance as T);

		this.observerBins.add(bin);
		bin.Add(() => {
			this.observerBins.delete(bin);
		});

		return bin;
	}

	/**
	 * Checks if a specific instance of a command is running. Character parameter is required on the server. Will also return true if
	 * the command is pending.
	 * @param commandInstance
	 * @param character
	 * @param includeQueued Include commands that are queued to run, but not yet active. Queued commands may not actually run if they are found to be invalid.
	 */
	public IsCommandInstanceActive(commandInstance: CommandInstanceIdentifier, includeQueued = false): boolean {
		if (!commandInstance) return false;

		if (
			includeQueued &&
			this.queuedCommands.some(
				(cmd) => cmd.commandId === commandInstance.commandId && cmd.instanceId === commandInstance.instanceId,
			)
		) {
			return true;
		}

		const cmd = this.GetActiveCommandByIdentifier(commandInstance);
		return !!cmd;
	}

	/**
	 * Checks if there is at least one instance of the provided command id running. commandId is
	 * the key used in the map provided to the RegisterCommands() function. Will also return true if the command
	 * is pending
	 * @param commandId The command
	 * @param character
	 * @param includeQueued Include commands that are queued to run, but not yet active. Queued commands may not actually run if they are found to be invalid.
	 */
	public IsCommandIdActive(commandId: string, character?: Character, includeQueued = false) {
		if (!character && Game.IsServer() && !Game.IsHosting()) {
			warn(
				"No character instance provided when calling IsCommandIdActive on the server. The character parameter is required on the server. This will always return false.",
			);
			return false;
		}
		const usedCharacter = character ?? Game.localPlayer.character;
		if (!usedCharacter) {
			warn(`Character was undefined when checking for command ${commandId}. Does your character exist?"`);
			return false;
		}

		if (includeQueued && this.queuedCommands.some((cmd) => cmd.commandId === commandId)) {
			return true;
		}

		const commands = this.activeCommands.get(usedCharacter.id);
		if (!commands) return false;

		for (const [customDataKey, command] of commands) {
			if (command.commandId === commandId) return true;
		}

		return false;
	}

	/**
	 * Sets up the provided command on the given player's character. This function will
	 * not perform any action if the player does not have a character.
	 * @param commandId string that identifies the handler for the command
	 * @param instanceId string that identifies the instance of this command
	 * @returns
	 */
	private SetupCommand(character: Character, commandId: string, instanceId: number) {
		const config = this.commandHandlerMap[commandId];
		if (!config) {
			warn(`Unable to find custom command with key ${commandId}. Has it been registered?`);
			return;
		}

		const commandIdentifier = new CommandInstanceIdentifier(character.id, commandId, instanceId);

		const existingCommand = this.GetActiveCommandByIdentifier(commandIdentifier);
		if (existingCommand) {
			warn(`Command ${commandId} is already running on character ${character.id}`);
			return;
		}

		let shouldTickAgain = true;
		let lastProcessedInputCommandNumber: number = 0;
		let lastProcessedInputTime = 0;
		let lastCapturedState: CustomSnapshotData = [false, undefined as unknown as Readonly<unknown>];
		// Note: active command data structure may be destroyed and recreated during replays.
		// only store metadata about the current instance here and know that when retrieving
		// activeCommand later using GetActiveCommandOnCharacter, it may not be the same data
		// structure every time.
		const activeCommand: ActiveCommand = {
			commandId,
			instanceId,
			config: config,
			customDataKey: this.BuildCustomDataKey({ commandId, instanceId }),
			created: false,
			instance: new config.handler(character, commandIdentifier, config),
			bin: new Bin(),
			// We use this to "reset" the instance data when we roll back to a specific snapshot
			// since we will reuse instances during replays. Todo: this is a super confusing setup,
			// and we should redo this. Ideally these instances should send the end command on the tick
			// that the command ended, but we have to wait until capture snapshot completes, so we end up
			// doing it one tick later and need to keep data like this around :/
			ResetInstance: () => {
				lastProcessedInputCommandNumber = 0;
				lastProcessedInputTime = 0;
				lastCapturedState = [false, undefined as unknown as Readonly<unknown>];
			},
		};

		// Ends a command with the expectation that we will never run it again. For the server, that means
		// we record the identifier as complete and send a report to the client that we have officially ended
		// the command and will no longer accept input. On the client, we simply destroy the command. we will send
		// the final onCommandEnded signal when the client recieves the report from the server.
		const CommitEndedCommand = () => {
			const commandIdentifierStr = commandIdentifier.stringify();
			// print("last processed cmd# for " + commandIdentifierStr + ": " + lastProcessedInputCommandNumber);
			if (Game.IsServer()) {
				this.SetHighestCompletedInstance(commandIdentifier);
				this.onCommandEnded.Fire(commandIdentifier, lastCapturedState[1]);
				if (character.player) {
					NetworkCommandEnd.server.FireAllClients(
						commandIdentifierStr,
						lastProcessedInputCommandNumber,
						lastCapturedState,
					);
				}
			}
			if (Game.IsClient()) {
				// If we don't have a confirmed final state and we have ticked at least one command to generate a state
				// then we write it to our unconfirmedFinalState. lastProcessedInputCommandNumber will be zero if we
				// never actually ticked the command.
				if (!this.confirmedFinalState.has(commandIdentifierStr) && lastProcessedInputCommandNumber !== 0) {
					this.unconfirmedFinalState.set(commandIdentifierStr, {
						commandNumber: lastProcessedInputCommandNumber,
						snapshot: lastCapturedState,
						time: lastProcessedInputTime,
					});
					// print(
					// 	"setting unconfirmed state for " +
					// 		commandIdentifierStr +
					// 		" last processed cmd#" +
					// 		lastProcessedInputCommandNumber,
					// );
				}
			}
			const queueCancelIndex = this.queuedCancellations.findIndex((i) => i.stringify() === commandIdentifierStr);
			if (queueCancelIndex !== -1) {
				this.queuedCancellations.remove(queueCancelIndex);
				if (Game.IsClient()) {
					this.predictedCancellations.set(commandIdentifierStr, {
						commandNumber: lastProcessedInputCommandNumber,
						time: lastProcessedInputTime,
					});
				}
			}
			activeCommand.bin.Clean();
		};

		character.bin.Add(activeCommand.bin);

		// Handles GetCommand call
		activeCommand.bin.Add(
			character.OnAddCustomInputData.ConnectWithPriority(config.priority ?? SignalPriority.NORMAL, () => {
				// Last tick requested to end processing, so we no longer get input. The server
				// should have also expected to end processing this tick and will not expect new input.
				if (!shouldTickAgain) return;

				if (!activeCommand.created) {
					activeCommand.created = true;
					TaskUtil.RunWithoutYield(() => activeCommand.instance.Create?.());
				}

				const input = TaskUtil.RunWithoutYield(() => activeCommand.instance.GetCommand());
				const inputWrapper: CustomInputData = [input === false, input as Readonly<unknown>];

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
			onUseInput.ConnectWithPriority(config.priority ?? SignalPriority.NORMAL, (customData, input, replay) => {
				// The last tick returned false, so we should stop ticking no matter what our input is.
				if (!shouldTickAgain) {
					return;
				}

				// If the command is ticking after it's confirmed last processed command, end it. This captures commands invalidated
				// by the server (commandNumber is 0), and commands have been confirmed to have ended.
				const finalCommandData = this.confirmedFinalState.get(commandIdentifier.stringify());
				if (finalCommandData !== undefined && input.commandNumber > finalCommandData.commandNumber) {
					CommitEndedCommand();
					return;
				}

				// Make sure the command is created for processing.
				if (!activeCommand.created) {
					activeCommand.created = true;
					TaskUtil.RunWithoutYield(() => activeCommand.instance.Create?.());
				}

				// If the command has been authoritatively ended on this command number, then we should reset it's state to the
				// authoritative state for the command instead of processing a tick. We also mark it to stop processing on the next
				// tick since this is the last tick that should be processed.
				if (finalCommandData !== undefined && input.commandNumber === finalCommandData.commandNumber) {
					activeCommand.instance.ResetToSnapshot(finalCommandData.snapshot[1]);
					shouldTickAgain = false;
					return;
				}

				// The command was finished. Call complete and don't tick.
				const customInput = (customData as Map<string, CustomInputData>).get(activeCommand.customDataKey);
				if (customInput && customInput[0]) {
					CommitEndedCommand();
					return;
				}

				// Process a normal forward tick
				const tickResult = TaskUtil.RunWithoutYield(() =>
					activeCommand.instance.OnTick(customInput?.[1], replay, input),
				);
				shouldTickAgain = tickResult !== false;
				lastProcessedInputCommandNumber = input.commandNumber;
				lastProcessedInputTime = input.time;

				// If we have a queued cancellation from outside of our command processing functions, apply it here so
				// that we do not tick again.
				const queuedCancel = this.queuedCancellations.findIndex(
					(i) => i.characterId === character.id && i.commandId === commandId && i.instanceId === instanceId,
				);
				if (queuedCancel !== -1) {
					shouldTickAgain = false;
					return;
				}

				// If the client has a predicted cancelation stored for this tick, then cancel the command.
				if (Game.IsClient()) {
					const predictedCancel = this.predictedCancellations.get(commandIdentifier.stringify());
					if (predictedCancel && predictedCancel.commandNumber === lastProcessedInputCommandNumber) {
						shouldTickAgain = false;
						return;
					}
				}
			}),
		);

		// Handles OnCaptureSnapshot call
		// TODO: we are not garuanteed to have a snapshot call after every tick. This may make the server end
		// call delayed by an extra tick due to command catchup. ie. client recieves data in snapshot from tick 6,
		// but the snapshot is marked as last tick 7. (tick 6 OnTick marks as shoulTickAgain false, but tick 7 capture
		// fires CommitEndedCommand() and data is included as tick 7 snapshot. The network event will correctly say tick 6 as
		// end though, so I think this is ok for now.)
		activeCommand.bin.Add(
			character.OnAddCustomSnapshotData.ConnectWithPriority(config.priority ?? SignalPriority.NORMAL, () => {
				const state = TaskUtil.RunWithoutYield(() => activeCommand.instance.OnCaptureSnapshot());
				const stateWrapper: CustomSnapshotData = [!shouldTickAgain, state as Readonly<unknown>];
				lastCapturedState = stateWrapper;
				character.AddCustomSnapshotData(activeCommand.customDataKey, stateWrapper);

				if (!shouldTickAgain) {
					CommitEndedCommand();
				}
			}),
		);

		// Handles observer interpolation on each frame.
		activeCommand.bin.Add(
			character.OnInterpolateSnapshot.ConnectWithPriority(
				config.priority ?? SignalPriority.NORMAL,
				(a, a_, b, b_, delta) => {
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
					TaskUtil.RunWithoutYield(() =>
						activeCommand.instance.OnObserverUpdate?.(aData[1], bData[1], delta),
					);
				},
			),
		);

		// Handles when interpolation reaches a new state for an observed character.
		activeCommand.bin.Add(
			character.OnInterpolateReachedSnapshot.ConnectWithPriority(
				config.priority ?? SignalPriority.NORMAL,
				(customData) => {
					const commandData = (customData as Map<string, CustomSnapshotData>).get(
						activeCommand.customDataKey,
					);

					// We reached a tick where this command is no longer running. Complete it.
					if (!commandData && activeCommand.created) {
						const confirmedFinalState = this.confirmedFinalState.get(commandIdentifier.stringify());
						if (confirmedFinalState) this.onCommandEnded.Fire(commandIdentifier, confirmedFinalState);
						this.SetHighestCompletedInstance(commandIdentifier);
						activeCommand.bin.Clean();
						return;
					}

					// We reached a tick where the command hasn't started yet. Don't do anything yet.
					if (!commandData && !activeCommand.created) {
						return;
					}

					// We reached a tick where we do have command data, but we haven't created the command yet. Create it.
					if (!activeCommand.created) {
						activeCommand.created = true;
						activeCommand.instance.Create?.();
					}
					TaskUtil.RunWithoutYield(() => activeCommand.instance.OnObserverReachedState?.(commandData![1]));
				},
			),
		);

		// Ensures the destroy callback is done whenever the command is to be cleaned up.
		activeCommand.bin.Add(() => {
			if (!activeCommand.created) {
				this.onInstanceDestroyed.Fire(commandIdentifier);
				return;
			}
			activeCommand.created = false;
			TaskUtil.RunWithoutYield(() => activeCommand.instance.Destroy?.());
			this.onInstanceDestroyed.Fire(commandIdentifier);
		});

		this.AddActiveCommandToCharacter(character.id, activeCommand);
		this.onInstanceCreated.Fire(commandIdentifier, activeCommand.instance);
		// print(`Command created ${commandIdentifier.stringify()}`);
		return activeCommand;
	}

	private GetActiveCommandByIdentifier(commandIdenfitier: CommandInstanceIdentifier): ActiveCommand | undefined {
		const characterCommands = this.activeCommands.get(commandIdenfitier.characterId);
		if (!characterCommands) return;

		const activeCommand = characterCommands.get(this.BuildCustomDataKey(commandIdenfitier));
		if (!activeCommand) return;

		return activeCommand;
	}

	/**
	 * Returns the currently running command instance if there is one.
	 */
	private GetActiveCommandByCommandId(characterId: number, commandId: string) {
		const commands = this.activeCommands.get(characterId);
		if (!commands) return;

		for (const [customDataKey, command] of commands) {
			if (command.commandId === commandId) {
				return {
					identifier: new CommandInstanceIdentifier(characterId, command.commandId, command.instanceId),
					command,
				};
			}
		}
	}

	/**
	 * Adds a command to the character's active command map. Also ensures that the command will be removed
	 * when the command is cleaned.
	 * @param character
	 * @param activeCommand
	 */
	private AddActiveCommandToCharacter(characterId: number, activeCommand: ActiveCommand) {
		let activeCommandsOnCharacter = this.activeCommands.get(characterId);
		if (!activeCommandsOnCharacter) {
			activeCommandsOnCharacter = new Map();
			this.activeCommands.set(characterId, activeCommandsOnCharacter);
		}
		activeCommandsOnCharacter.set(activeCommand.customDataKey, activeCommand);
		activeCommand.bin.Add(() => {
			activeCommandsOnCharacter.delete(activeCommand.customDataKey);
		});
	}

	protected OnDestroy(): void {
		this.globalBin.Clean();
	}

	private BuildCustomDataKey(keyData: { commandId: string; instanceId: number }) {
		return "_" + keyData.commandId + ":" + keyData.instanceId;
	}

	private ParseCustomDataKey(characterId: number, dataKey: string): CommandInstanceIdentifier | undefined {
		if (dataKey.sub(0, 1) !== "_") return;
		const [commandId, instanceId] = dataKey.sub(2).split(":");
		// print(`commandId: ${commandId}, instanceId: ${instanceId}`);

		return new CommandInstanceIdentifier(characterId, commandId, tonumber(instanceId) ?? 0);
	}

	private GetHighestCompletedInstance(characterId: number, commandId: string) {
		const characterInstanceIds = this.highestCompleteIdMap[characterId] ?? {};
		const highestInstance = characterInstanceIds[commandId] ?? 0;
		return highestInstance;
	}

	private SetHighestCompletedInstance(commandIdentifier: CommandInstanceIdentifier) {
		let characterHighest = this.highestCompleteIdMap[commandIdentifier.characterId];
		if (!characterHighest) {
			this.highestCompleteIdMap[commandIdentifier.characterId] = {};
			characterHighest = this.highestCompleteIdMap[commandIdentifier.characterId];
		}
		const highestInstance = characterHighest[commandIdentifier.commandId];
		if (highestInstance === undefined || highestInstance < commandIdentifier.instanceId) {
			characterHighest[commandIdentifier.commandId] = commandIdentifier.instanceId;
		}
	}
}
