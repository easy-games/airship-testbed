import Character from "../../Character/Character";

export default class PredictedCustomCommand<Input, StateSnapshot> {
	/**
	 * The character the command is running on.
	 */
	public character: Character;

	/**
	 * Creates a predicted custom command instance. Command instances may be created and destroyed without
	 * ticks being called. It's recommended to create and remove any dependencies in the Create() and Destory()
	 * functions.
	 * @param character
	 */
	constructor(character: Character) {
		this.character = character;
	}

	// Owning Client Only

	/**
	 * Called on fixed update for each tick to determine the inputs for the current tick. The returned input
	 * is also sent to the server for processing.
	 *
	 * Returning false will end the command.
	 */
	GetCommand(): Input | false {
		return false;
	}

	// Server and Client

	/**
	 * Called before the first command is processed and when the command should begin having an effect on the world.
	 * This may be called more than once if there is a replay. This function should be used to create any objects
	 * in the world that you depend on during tick processing.
	 *
	 * You can also create things in OnTick, but keep in mind that sometimes ResetToSnapshot is called to check
	 * a single point in time (like during lag compensation) without a tick being run, so you will have to encode
	 * the existance of those objects in your state for that tick so that your ResetToSnapshot function can correctly
	 * recreate the state of the world at that point in time.
	 */
	Create?(): void;

	/**
	 * Called when a new input is available to be processed. Make whatever changes are necesary to the last
	 * state based on the provided input, and return a new state value. Make sure that your state value encodes
	 * all values needed to reset your changes back to this point in time.
	 *
	 * This function is processed before character movement is run and can be used to modify things like
	 * character speed or the user input used for movement processing.
	 *
	 * It is possible for there to be no input provided for a given tick. This may happen due to network issues
	 * or client misbehavior. It's up to you to decide how to handle missing input.
	 *
	 * Returning false will stop the command from processing on the next tick. OnCaptureSnapshot will still be called
	 * for the current tick.
	 *
	 * @param input
	 * @param replay
	 */
	OnTick(input: Readonly<Input> | undefined, replay: boolean): void | false {
		return false;
	}

	/**
	 * Return the current state of the system
	 */
	OnCaptureSnapshot(): StateSnapshot {
		return undefined as StateSnapshot;
	}

	/**
	 * Called on after the last input is processed and when the command should remove it's effects from the world.
	 * This may be called more than once if there is a replay. See Create() for more information.
	 */
	Destroy?(): void;

	/**
	 * Set the state to the provided one. This is called during lag compensation, resimulation, and when a non-authoritative
	 * server processes a new client state. Make sure that everything you modify in OnTick is set back to the state encoded
	 * in the provided state value.
	 *
	 * For example, if you modify a characters position OnTick, you should encode this value in the state you return
	 * from OnCaptureSnapshot. In ResetToSnapshot, you should set their position back to the position encoded in
	 * the state value.
	 *
	 * @param stateSnapshot One of the states previously returned from your OnCaptureSnapshot function.
	 */
	ResetToSnapshot(stateSnapshot: Readonly<StateSnapshot>): void {}

	/**
	 * Compares two snapshots. If the snapshots are equal, return true. If not, return false.
	 * @param a
	 * @param b
	 * @returns
	 */
	CompareSnapshots(a: Readonly<StateSnapshot>, b: Readonly<StateSnapshot>): boolean {
		return true;
	}

	// Client and observer effects.

	// /**
	//  * Called on observers when the first state is observed. The state provided may not be the first state
	//  * produced by the command due to the possibility of network loss.
	//  *
	//  * This function will only be called once.
	//  *
	//  * @param state The first state created or received for this command.
	//  */
	// OnObserverStart?(state: Readonly<StateSnapshot>): void;

	/**
	 * This function is called every frame for observers and allows you to interpolate effects based on the observed states for this
	 * command. The provided delta time is 0 to 1 and represents the lerp progress between the two states.
	 *
	 * When a character is in client authoritative mode, the server is considered an observer and this fuction will
	 * be called.
	 *
	 * @param lastState
	 * @param nextState
	 * @param delta
	 */
	OnObserverUpdate?(lastState: Readonly<StateSnapshot>, nextState: Readonly<StateSnapshot>, delta: number): void;

	/**
	 * This function is called when an observer reaches a new state. The frequency this function is called is
	 * deternined by your network update rate and network conditions. It is recommended that you update visuals
	 * that can be interpolated in OnEffectUpdate for the smoothest visuals.
	 *
	 * When a character is in client authoritative mode, the server is considered an observer and this fuction will
	 * be called.
	 *
	 * @param state The new state that was reached.
	 */
	OnObserverReachedState?(state: Readonly<StateSnapshot>): void;
}
