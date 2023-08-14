import { Team } from "Imports/Core/Shared/Team/Team";
import { Signal } from "Imports/Core/Shared/Util/Signal";

export const BWServerSignals = {
	/** Fired when a bed is destroyed. */
	BedDestroyed: new Signal<{ team: Team }>(),
};
