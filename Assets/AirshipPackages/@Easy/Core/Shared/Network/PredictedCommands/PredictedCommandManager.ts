import { Airship } from "../../Airship";
import Character from "../../Character/Character";
import { Game } from "../../Game";
import { Bin } from "../../Util/Bin";
import { Cancellable } from "../../Util/Cancellable";
import inspect from "../../Util/Inspect";
import { Signal } from "../../Util/Signal";
import { NetworkChannel } from "../NetworkAPI";
import { NetworkSignal } from "../NetworkSignal";
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
export interface CommandInstanceIdentifier {
	characterId: number;
	commandId: string;
	instanceId: number;
}

class ValidateCommand extends Cancellable {
	public constructor(public character: Character, public readonly commandId: string) {
		super();
	}
}

const NetworkCommandEnd = new NetworkSignal<
	[commandIdentifier: CommandInstanceIdentifier, lastCapturedState: CustomSnapshotData]
>("PredictedCommands/CommandEnded", NetworkChannel.Reliable);

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
	 * Fires when a command has authoritatively ended.
	 */
	public readonly onCommandEnded = new Signal<[CommandInstanceIdentifier, Readonly<unknown>]>();

	private commandHandlerMap: Record<string, CommandConfiguration> = {};
	/** The active commands for the current tick. If read during a replay, it will contain the active command at that tick. */
	private activeCommands: Map<number, Map<string, ActiveCommand>> = new Map();
	private globalBin = new Bin();

	// Clients use this number to generate a unique instance id for each command run. The server uses the client instance
	// IDs so we know which command input is for. Instance IDs are character scoped, so we don't have to worry about conflicts
	// across clients.
	private instanceId = 0;

	// The server uses this map to track the highest completed commands. The makes it so we don't recreate and run input for commands
	// that the server has authoritatively completed. The client doesn't need to track this, because it will reset to the server authoritative
	// result when it is received.
	private highestCompleteIdMap: Record<Character, { [commandId: string]: number }> = {};

	/** Used by the client to queue commands to be set up on the next tick. */
	private queuedCommands: CommandInstanceIdentifier[] = [];

	/** Used to track requests to cancel running commands. */
	private queuedCancellations: CommandInstanceIdentifier[] = [];

	protected Start(): void {
		Airship.Characters.ObserveCharacters((character) => {
			// Handles creating queued commands just before input processing on the client. This ensures we don't connect command callbacks
			// in the middle of processing a tick. Commands should always start at the beginning of a tick before gathering input.
			character.bin.Add(
				character.PreCreateCommand.Connect(() => {
					this.queuedCommands.forEach((key) => {
						const event = this.onValidateCommand.Fire(new ValidateCommand(character, key.commandId));
						if (event.IsCancelled()) return; // Skip creating if something says we shouldn't create this
						this.SetupCommand(character, key.commandId, key.instanceId);
					});
					this.queuedCommands.clear();
				}),
			);

			// Handles creating new commands to process inputs the first time the input for a command is seen on the server
			character.bin.Add(
				character.PreProcessCommand.Connect((customInputData, input) => {
					(customInputData as Map<string, Readonly<CustomInputData>>).forEach((value, key) => {
						// If it's not custom data controlled by us, ignore it
						const commandIdentifier = this.ParseCustomDataKey(character.id, key);
						if (!commandIdentifier) return;

						// Invalid instance ids are ignored. 0 is never used as an instance id.
						if (commandIdentifier.instanceId === 0) return;

						// See if the command is already running
						const activeCommand = this.GetActiveCommandOnCharacter(commandIdentifier);
						if (activeCommand) return;

						if (Game.IsServer() && !Game.IsHosting()) {
							const characterInstanceIds = this.highestCompleteIdMap[character.id] ?? {};
							const highestInstance = characterInstanceIds[commandIdentifier.commandId] ?? 0;

							// Highest instance is updated when the command _completes_ so if we see it again, that
							// means we should ignore the command since the server has considered it complete.
							if (commandIdentifier.instanceId <= highestInstance) return;
						}

						// Run the command if it's not already running
						this.SetupCommand(character, commandIdentifier.commandId, commandIdentifier.instanceId);
					});
				}),
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
						if (!aCommandData || !bCommandData) {
							character.SetComparisonResult(false);
							return;
						}

						// To find the command instance we need to work on, we first check active commands to see if it's still operating,
						// if it's not, we have to create it, then compare.
						let instance = this.GetActiveCommandOnCharacter(commandIdentifier)?.instance;
						if (!instance) {
							const handler = this.commandHandlerMap[commandIdentifier.commandId].handler;
							if (!handler) return;

							// Instead of fully creating an active command using SetupCommand, we simply create an instance of it
							// since all we want to do is call CompareSnapshots(). No ticking will be involved on this instance
							// and it should be removed once this function completes.
							instance = new handler(character, commandIdentifier);
						}

						// Call the compare function and set the result for C# to use later
						const result = instance.CompareSnapshots(aCommandData.data, bCommandData.data);
						character.SetComparisonResult(result);
					});
				}),
			);

			// Handles setting snapshot state for commands. This is handled here because we may need to re-create
			// instances of the command that have already been cleaned up if we roll back to a time when the command
			// was still running.
			character.bin.Add(
				character.OnResetToSnapshot.Connect((customSnapshotData) => {
					// print("resetting to snapshot with custom data set to:" + inspect(customSnapshotData));

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
							let activeCommand = this.GetActiveCommandOnCharacter(commandIdentifier);
							if (!activeCommand) {
								// If it's not running, create it
								activeCommand = this.SetupCommand(
									character,
									commandIdentifier.commandId,
									commandIdentifier.instanceId,
								);
								if (!activeCommand) {
									warn(
										`Failed to set up command ${commandIdentifier.commandId} (instance: ${commandIdentifier.instanceId}) for replay. This may cause unusual replay behavior.`,
									);
									return;
								}
							}

							// If we need to use this command and it's not been created yet, create it.
							if (!activeCommand.created) {
								// print(
								// 	"active command " +
								// 		activeCommand.customDataKey +
								// 		" was not created on target snapshot, creating",
								// );
								activeCommand.created = true;
								activeCommand.instance.Create?.();
							}

							//print("resetting " + activeCommand.customDataKey);

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

		// Handles ending commands on the client when the server authoritatively completes the command.
		// TODO: consider comparing last captured state and reconciling if needed?
		// TODO: this fires before reconcile due to Mirror networking order :/
		NetworkCommandEnd.client.OnServerEvent((commandIdentifier, stateData) => {
			// No matter when we receive this, the server is done processing inputs, so if the command is
			// active, we should cancel it. Most likely it won't be active because we will have reconciled it already.
			// let activeCommand = this.GetActiveCommandOnCharacter(commandIdentifier);
			// if (activeCommand) {
			// 	this.CancelCommand(commandIdentifier);
			// }
			// TODO: is this firing at the correct time? Cancel occurs on the next tick, so technically I guess we could
			// end up ticking after we fire onCommandEnded?
			// this.onCommandEnded.Fire(commandIdentifier, stateData.data);
			// ----- FOR MONDAY:
			// Check if we need a resim
			// if we do, request resim at the time in stateData.lastClientCommandTime
			// in ResetToState make sure that you reset to the state we have in stateData (maybe?)
			// queue command cancellation for the next tick so that next step in resim cancels
			// the command just as the server did
		});
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

		const instanceData = {
			characterId: character.id,
			commandId,
			instanceId: ++this.instanceId,
		};
		this.queuedCommands.push(instanceData);

		return instanceData;
	}

	/**
	 * Cancels the running command on the next tick.
	 */
	public CancelCommand(commandInstance: CommandInstanceIdentifier) {
		this.queuedCancellations.push(commandInstance);
	}

	/**
	 * Checks if a specific instance of a command is running. Character parameter is required on the server. Will also return true if
	 * the command is pending.
	 * @param commandInstance
	 * @param character
	 */
	public IsCommandInstanceActive(commandInstance: CommandInstanceIdentifier): boolean {
		if (!commandInstance) return false;

		if (
			this.queuedCommands.find(
				(cmd) => cmd.commandId === commandInstance.commandId && cmd.instanceId === commandInstance.instanceId,
			)
		) {
			return true;
		}

		const cmd = this.GetActiveCommandOnCharacter(commandInstance);
		return !!cmd;
	}

	/**
	 * Checks if there is at least one instance of the provided command id running. commandId is
	 * the key used in the map provided to the RegisterCommands() function. Will also return true if the command
	 * is pending
	 * @param commandId The command
	 * @param character
	 */
	public IsCommandIdActive(commandId: string, character?: Character) {
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

		for (const pending of this.queuedCommands) {
			if (pending.commandId === commandId) return true;
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

		const commandIdentifier: CommandInstanceIdentifier = {
			characterId: character.id,
			commandId,
			instanceId,
		};

		const existingCommand = this.GetActiveCommandOnCharacter(commandIdentifier);
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
			instance: new config.handler(character, commandIdentifier),
			bin: new Bin(),
		};
		let shouldTickAgain = true;
		let lastCapturedState: CustomSnapshotData = {
			data: undefined as unknown as Readonly<unknown>,
		};

		// Ends a command with the expectation that we will never run it again. For the server, that means
		// we record the identifier as complete and send a report to the client that we have officially ended
		// the command and will no longer accept input. On the client, we simply destroy the command. we will send
		// the final onCommandEnded signal when the client recieves the report from the server.
		const CommitEndedCommand = () => {
			if (Game.IsServer()) {
				this.SetHighestCompletedInstance(commandIdentifier);
				this.onCommandEnded.Fire(commandIdentifier, lastCapturedState.data);
				if (character.player) {
					print("last cp" + inspect(lastCapturedState));
					NetworkCommandEnd.server.FireClient(character.player, commandIdentifier, lastCapturedState);
				}
			}
			activeCommand.bin.Clean();
		};

		character.bin.Add(activeCommand.bin);

		// Handles GetCommand call
		activeCommand.bin.Add(
			character.OnAddCustomInputData.Connect(() => {
				// Last tick requested to end processing, so we no longer get input. The server
				// should have also expected to end processing this tick and will not expect new input.
				if (!shouldTickAgain) return;

				const input = activeCommand.instance.GetCommand();
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
			onUseInput.Connect((customData, input, replay) => {
				// The last tick returned false, so we should stop ticking no matter what our input is.
				if (!shouldTickAgain) {
					CommitEndedCommand();
					return;
				}

				const customInput = (customData as Map<string, CustomInputData>).get(activeCommand.customDataKey);
				if (customInput && !activeCommand.created) {
					activeCommand.created = true;
					activeCommand.instance.Create?.();
				}
				// The command was finished. Call complete and don't tick.
				if (customInput && customInput.finished) {
					CommitEndedCommand();
					return;
				}
				shouldTickAgain = activeCommand.instance.OnTick(customInput, replay) !== false;

				const queuedCancel = this.queuedCancellations.findIndex(
					(i) => i.characterId === character.id && i.commandId === commandId && i.instanceId === instanceId,
				);
				if (queuedCancel !== -1) {
					shouldTickAgain = false;
					this.queuedCancellations.remove(queuedCancel);
					return;
				}
			}),
		);

		// Handles OnCaptureSnapshot call
		activeCommand.bin.Add(
			character.OnAddCustomSnapshotData.Connect(() => {
				const state = activeCommand.instance.OnCaptureSnapshot();
				const stateWrapper: CustomSnapshotData = {
					data: state as Readonly<unknown>,
				};
				lastCapturedState = stateWrapper;
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

		this.AddActiveCommandToCharacter(character.id, activeCommand);
		return activeCommand;
	}

	private GetActiveCommandOnCharacter(commandIdenfitier: CommandInstanceIdentifier): ActiveCommand | undefined {
		const characterCommands = this.activeCommands.get(commandIdenfitier.characterId);
		if (!characterCommands) return;

		const activeCommand = characterCommands.get(this.BuildCustomDataKey(commandIdenfitier));
		if (!activeCommand) return;

		return activeCommand;
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

		return {
			characterId,
			commandId,
			instanceId: tonumber(instanceId) ?? 0,
		};
	}

	private SetHighestCompletedInstance(commandInstance: CommandInstanceIdentifier) {
		if (Game.IsClient()) return; // We don't want to track this on the client since it's what generates instanceIds. onCommandEnded is fired in OnCompareSnapshot
		let characterHighest = this.highestCompleteIdMap[commandInstance.characterId];
		if (!characterHighest) {
			this.highestCompleteIdMap[commandInstance.characterId] = {};
			characterHighest = this.highestCompleteIdMap[commandInstance.characterId];
		}
		const highestInstance = characterHighest[commandInstance.commandId];
		if (highestInstance === undefined || highestInstance < commandInstance.instanceId) {
			characterHighest[commandInstance.commandId] = commandInstance.instanceId;
		}
	}
}
