import { Airship } from "../../Airship";
import Character from "../../Character/Character";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { Cancellable } from "../../Util/Cancellable";
import inspect from "../../Util/Inspect";
import { Signal, SignalPriority } from "../../Util/Signal";
import { NetworkChannel } from "../NetworkAPI";
import { NetworkSignal } from "../NetworkSignal";
import PredictedCustomCommand from "./PredictedCustomCommand";

export interface CommandConfiguration {
	priority?: SignalPriority;
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
	commandId: string;
	instanceId: number;
	config: CommandConfiguration;
	customDataKey: string;
	created: boolean;
	instance: PredictedCustomCommand<unknown, unknown>;
	bin: Bin;
}

/**
 * TODO:
 *
 * I think what I need to do is actually have the server continue to pass the last state data processed once the command finishes
 * until the client confirms that input is over and sends input false.
 *
 * The idea is that the server can cancel the command, but for both to agree on the end time and state, we need to ensure that the
 * client gets the message that the command has ended and also has correctly reconciled to the state of the system at the end of
 * processing.
 *
 * The trouble right now is that the command doesn't necessarily see the snapshot that the command ended, all it knows is that it received
 * as snapshot where the command was over. I need the server to pass information that would allow the client to reconcile back further if
 * the command ended on a snapshot before the one it saw.
 *
 * Hm.. do I though?? I don't want to reimplement the entire C# networking setup and that's pretty much what it looks like...
 */

interface CustomSnapshotData {
	data: Readonly<unknown>;
}

interface CustomInputData {
	finished: boolean;
	data: Readonly<unknown>;
}

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
	[commandIdentifier: string, commandNumber: number, time: number, lastCapturedState: CustomSnapshotData]
>("PredictedCommands/CommandEnded", NetworkChannel.Reliable);

const NetworkCommandInvaild = new NetworkSignal<[commandIdentifier: string, commandNumber: number, time: number]>(
	"PredictedCommands/CommandInvalid",
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

	/** Used by the client to queue confirm final state data for a command. */
	private unconfirmedFinalState: Map<string, { commandNumber: number; snapshot: CustomSnapshotData; time: number }> =
		new Map();
	/** Used by the client to resimulate the confirmed final stat of a command. */
	// TODO: right now this grows infinitely because we have no way to know when we will never resimulate this command again. We could add an event from C# to know when a tick
	// goes out of scope (but we would have to convert that to a command number. Doable tho)
	private confirmedFinalState: Map<string, { commandNumber: number; snapshot: CustomSnapshotData; time: number }> =
		new Map();

	/** Used to track requests to cancel running commands. */
	// TODO: chekc we clear this in all cases
	private queuedCancellations: CommandInstanceIdentifier[] = [];

	protected Start(): void {
		Airship.Characters.ObserveCharacters((character) => {
			// Handles creating queued commands just before input processing on the client. This ensures we don't connect command callbacks
			// in the middle of processing a tick. Commands should always start at the beginning of a tick before gathering input.
			character.bin.Add(
				character.PreCreateCommand.Connect(() => {
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
					});
					this.queuedCommands.clear();
				}),
			);

			// Handles creating new commands to process inputs the first time the input for a command is seen. Clients generally
			// have already created the command in PreCreateCommand, but still need to create new commands during replays, so they
			// also run this event.
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
						if (activeCommand) return;

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
										input.time,
									);
								}
								return;
							}
						}

						// Clients performing a replay need to ignore creating commands that have been cancelled authoritatively.
						if (replay && Game.IsClient()) {
							const confirmedState = this.confirmedFinalState.get(commandIdentifier.stringify());
							if (confirmedState) {
								// Our authoritative state saying this command should already have ended, so don't create it.
								if (confirmedState.commandNumber < input.commandNumber) {
									return;
								}
							}
						}

						// Run the command if it's not already running
						this.SetupCommand(character, commandIdentifier.commandId, commandIdentifier.instanceId);
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
						const result = this.RunWithoutYield(() =>
							instance.CompareSnapshots(aCommandData.data, bCommandData.data),
						);
						character.SetComparisonResult(result);
					});
				}),
			);

			// Handles setting snapshot state for commands. This is handled here because we may need to re-create
			// instances of the command that have already been cleaned up if we roll back to a time when the command
			// was still running.
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
							return;
						}

						//print("active command is not active on snapshot, removing" + activeCommand.customDataKey);
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
							let data = value.data;
							const confirmedState = this.confirmedFinalState.get(commandIdentifier.stringify());
							// Overwrite with last confirmed data if required
							if (confirmedState) {
								// Our authoritative state saying this command should already have ended, so don't create it.
								if (confirmedState.commandNumber < snapshot.lastProcessedCommand) {
									return;
								}
								data = confirmedState.snapshot.data;
							}

							// If we need to use this command and it's not been created yet, create it.
							if (!activeCommand.created) {
								// print(
								// 	"active command " +
								// 		activeCommand.customDataKey +
								// 		" was not created on target snapshot, creating",
								// );
								activeCommand.created = true;
								this.RunWithoutYield(() => activeCommand.instance.Create?.());
							}

							//print("resetting " + activeCommand.customDataKey);

							this.RunWithoutYield(() => activeCommand.instance.ResetToSnapshot(data));
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

		// Handles ending commands on the client when the server authoritatively completes the command.
		// TODO: what happens when the client ends a command too early? Do we keep the server command running or not (that's config right now, but does it work?)
		NetworkCommandEnd.client.OnServerEvent((commandIdentifierStr, commandNumber, time, stateData) => {
			// Get the predicted final state on the client
			const lastState = this.unconfirmedFinalState.get(commandIdentifierStr);
			this.unconfirmedFinalState.delete(commandIdentifierStr);

			const commandIdenfitier = CommandInstanceIdentifier.fromString(commandIdentifierStr);

			// If we are an observer, we don't have any unconfirmed end state to resimulate and we will need to store
			// the confirmed state for later since we buffer our ticks locally.
			if (commandIdenfitier.characterId !== Game.localPlayer.character?.id) {
				// If we've already completed the command by the time the final state arrives (unusual for observers due to buffering)
				// then we should fire the command end right away. We don't need to store the final state for later.
				if (
					this.GetHighestCompletedInstance(commandIdenfitier.characterId, commandIdenfitier.commandId) >=
					commandIdenfitier.instanceId
				) {
					this.onCommandEnded.Fire(commandIdenfitier, stateData.data);
					return;
				}

				// If we are still waiting to run the command, or haven't finished running it yet due to buffering (likely),
				// then store the final state for later.
				this.confirmedFinalState.set(commandIdentifierStr, {
					commandNumber: commandNumber,
					snapshot: stateData,
					time,
				});
				return;
			}

			this.confirmedFinalState.set(commandIdentifierStr, {
				commandNumber: commandNumber,
				snapshot: stateData,
				time,
			});
			this.onCommandEnded.Fire(commandIdenfitier, stateData.data);

			// temporary instance just for comparing snapshot data
			const config = this.commandHandlerMap[commandIdenfitier.commandId];
			const tempInstance = new config.handler(Game.localPlayer.character!, commandIdenfitier, config);
			print(
				`Client recieved end report for ${commandIdentifierStr}. Ended cmd: ${commandNumber} Predicted state: ${inspect(
					lastState,
				)} Auth State: ${inspect(stateData)}`,
			);
			// if the final states match, then we are good. No resim required
			if (
				lastState &&
				lastState.commandNumber === commandNumber &&
				tempInstance.CompareSnapshots(lastState?.snapshot.data, stateData.data)
			) {
				print("Final states match, no resim required.");
				return;
			}

			// If the states don't match or our local command hasn't stopped running, we have to resimulate
			Game.localPlayer.character!.movement.RequestResimulation(commandNumber);
		});

		// Handles commands that did not validate on the server.  These will be cancelled locally and resimulated every time.
		NetworkCommandInvaild.client.OnServerEvent((commandIdentifierStr, commandNumber, time) => {
			this.unconfirmedFinalState.delete(commandIdentifierStr);
			const commandIdenfitier = CommandInstanceIdentifier.fromString(commandIdentifierStr);
			this.onCommandEnded.Fire(commandIdenfitier, undefined);
			this.confirmedFinalState.set(commandIdentifierStr, {
				commandNumber: 0,
				time: time, // This time is used for when we should remove the confirmedState, so it needs to be accurate
				snapshot: { data: undefined as unknown as Readonly<unknown> },
			});
			Game.localPlayer.character!.movement.RequestResimulation(commandNumber);
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

					this.unconfirmedFinalState.forEach((data, key) => {
						if (data.time < time) this.unconfirmedFinalState.delete(key);
					});

					this.confirmedFinalState.forEach((data, key) => {
						if (data.time < time) this.confirmedFinalState.delete(key);
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
		this.queuedCancellations.push(commandInstance);
	}

	/** Allows you to retrieve and operate on the specific handler instance for a running command. When a new handler instance matching the
	 * command instance identifier is created, the callback will be called with the handler instance of the command that will be performing tick
	 * operations.
	 *
	 * If the command is invalidated or authoritatively ends, the returned bin will be cleaned and the callback will no longer be
	 * invoked.
	 */
	public ObserveHandler<T>(commandInstance: CommandInstanceIdentifier, callback: (instance: T) => CleanupFunc): Bin {
		const bin = new Bin();
		let callbackBin: CleanupFunc;

		bin.Add(
			this.onCommandEnded.Connect((commandId) => {
				if (commandId.stringify() !== commandInstance.stringify()) return;
				bin.Clean();
			}),
		);
		bin.Add(
			this.onInstanceCreated.Connect((commandId, instance) => {
				if (commandId.stringify() !== commandInstance.stringify()) return;
				callbackBin?.();
				callbackBin = callback(instance as T);
			}),
		);
		bin.Add(() => callbackBin?.());

		const active = this.GetActiveCommandByIdentifier(commandInstance);
		if (active) callbackBin = callback(active.instance as T);

		this.observerBins.add(bin);
		bin.Add(() => {
			this.observerBins.delete(bin);
		});

		return bin;
	}

	/**
	 * Observes the command instance currently running for a provided command id. This allows you to track the specific
	 * command instance identifier that is running. This fires when the active command changes, meaning that on the client,
	 * this callback will fire during replays if the command instance being run changes.
	 * @param commandId The command id used to run the command.
	 * @param callback
	 */
	public ObserveCommand(
		character: Character,
		commandId: string,
		callback: (commandIdentifier: CommandInstanceIdentifier | undefined) => CleanupFunc,
	) {
		const bin = new Bin();
		let callbackBin: CleanupFunc;

		bin.Add(
			this.onInstanceCreated.Connect((identifier) => {
				if (identifier.commandId !== commandId) return;
				callbackBin?.();
				callbackBin = callback(identifier);
			}),
		);
		bin.Add(
			this.onInstanceDestroyed.Connect((identifier) => {
				if (identifier.commandId !== commandId) return;
				callbackBin?.();
				callbackBin = callback(undefined);
			}),
		);
		bin.Add(() => callbackBin?.());

		const identifier = this.GetActiveCommandByCommandId(character, commandId);
		if (identifier) callbackBin = callback(identifier);

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
		};
		let shouldTickAgain = true;
		let lastProcessedInputCommandNumber: number = 0;
		let lastProcessedInputTime: number = 0;
		let lastCapturedState: CustomSnapshotData = {
			data: undefined as unknown as Readonly<unknown>,
		};

		// Ends a command with the expectation that we will never run it again. For the server, that means
		// we record the identifier as complete and send a report to the client that we have officially ended
		// the command and will no longer accept input. On the client, we simply destroy the command. we will send
		// the final onCommandEnded signal when the client recieves the report from the server.
		const CommitEndedCommand = () => {
			warn("last processed input: " + lastProcessedInputCommandNumber);
			const commandIdentifierStr = commandIdentifier.stringify();
			if (Game.IsServer()) {
				this.SetHighestCompletedInstance(commandIdentifier);
				this.onCommandEnded.Fire(commandIdentifier, lastCapturedState.data);
				if (character.player) {
					NetworkCommandEnd.server.FireAllClients(
						commandIdentifierStr,
						lastProcessedInputCommandNumber,
						lastProcessedInputTime,
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
					print("setting unconfirmed state for " + commandIdentifierStr);
				}
			}
			const queueCancelIndex = this.queuedCancellations.findIndex((i) => i.stringify() === commandIdentifierStr);
			if (queueCancelIndex !== -1) {
				this.queuedCancellations.remove(queueCancelIndex);
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

				const input = this.RunWithoutYield(() => activeCommand.instance.GetCommand());
				const inputWrapper: CustomInputData = {
					finished: input === false,
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

				// Handles the case where a client has predicted the end of a command. During replays, the client must
				// cancel this command from running after the end was predicted. There is also a special case for clients where they've incorrectly
				// ended a command early. It handles this case by only checking _predicted_ command ends, which means that if an authoritative end
				// exists, it will tick the command with empty input as the server would have.
				if (replay && finalCommandData === undefined) {
					const unconfirmedEnd = this.unconfirmedFinalState.get(commandIdentifier.stringify());
					if (unconfirmedEnd !== undefined && input.commandNumber > unconfirmedEnd.commandNumber) {
						CommitEndedCommand();
						return;
					}
				}

				// Make sure the command exists and is created for processing.
				const customInput = (customData as Map<string, CustomInputData>).get(activeCommand.customDataKey);
				if (customInput && !activeCommand.created) {
					activeCommand.created = true;
					this.RunWithoutYield(() => activeCommand.instance.Create?.());
				}

				// If the command has been authoritatively ended on this command number, then we should reset it's state to the
				// authoritative state for the command instead of processing a tick. We also mark it to stop processing on the next
				// tick since this is the last tick that should be processed.
				if (finalCommandData !== undefined && input.commandNumber === finalCommandData.commandNumber) {
					activeCommand.instance.ResetToSnapshot(finalCommandData.snapshot.data);
					shouldTickAgain = false;
					return;
				}

				// The command was finished. Call complete and don't tick.
				if (customInput && customInput.finished) {
					CommitEndedCommand();
					return;
				}

				// Process a normal forward tick
				const tickResult = this.RunWithoutYield(() =>
					activeCommand.instance.OnTick(customInput?.data, replay, input),
				);
				shouldTickAgain = tickResult !== false;
				lastProcessedInputCommandNumber = input.commandNumber; // TODO: can input be null?
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
			}),
		);

		// Handles OnCaptureSnapshot call
		activeCommand.bin.Add(
			character.OnAddCustomSnapshotData.ConnectWithPriority(config.priority ?? SignalPriority.NORMAL, () => {
				const state = this.RunWithoutYield(() => activeCommand.instance.OnCaptureSnapshot());
				const stateWrapper: CustomSnapshotData = {
					data: state as Readonly<unknown>,
				};
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
					this.RunWithoutYield(() =>
						activeCommand.instance.OnObserverUpdate?.(aData.data, bData.data, delta),
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
					this.RunWithoutYield(() => activeCommand.instance.OnObserverReachedState?.(commandData!.data));
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
			this.RunWithoutYield(() => activeCommand.instance.Destroy?.());
			this.onInstanceDestroyed.Fire(commandIdentifier);
		});

		this.AddActiveCommandToCharacter(character.id, activeCommand);
		this.onInstanceCreated.Fire(commandIdentifier, activeCommand.instance);
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
	private GetActiveCommandByCommandId(character: Character, commandId: string) {
		const commands = this.activeCommands.get(character.id);
		if (!commands) return;

		for (const [customDataKey, command] of commands) {
			if (command.commandId === commandId) {
				return new CommandInstanceIdentifier(character.id, command.commandId, command.instanceId);
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
		return "cc:" + keyData.commandId + ":" + keyData.instanceId;
	}

	private ParseCustomDataKey(characterId: number, dataKey: string): CommandInstanceIdentifier | undefined {
		if (dataKey.sub(0, 3) !== "cc:") return;
		const [commandId, instanceId] = dataKey.sub(4).split(":");

		return new CommandInstanceIdentifier(characterId, commandId, tonumber(instanceId) ?? 0);
	}

	private GetHighestCompletedInstance(characterId: number, commandId: string) {
		const characterInstanceIds = this.highestCompleteIdMap[characterId] ?? {};
		const highestInstance = characterInstanceIds[commandId] ?? 0;
		return highestInstance;
	}

	private SetHighestCompletedInstance(commandIdentifier: CommandInstanceIdentifier) {
		if (Game.IsClient()) return; // We don't want to track this on the client since it's what generates instanceIds. onCommandEnded is fired in OnCompareSnapshot
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

	private RunWithoutYield<T extends Callback>(callback: T) {
		let result: ReturnType<T>;
		const thread = task.spawnDetached(() => {
			result = callback();
		});
		if (coroutine.status(thread) !== "dead") {
			error(
				debug.traceback(
					thread,
					"Yield detected in a predicted command callback! This will cause undefined behavior!",
				),
			);
		}
		return result!;
	}
}
