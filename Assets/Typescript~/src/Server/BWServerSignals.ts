import { Team } from "Imports/Core/Shared/Team/Team";
import { Signal } from "./Util/Signal";

export const BWServerSignals = {
	/** Fired when a bed is destroyed. */
	BedDestroyed: new Signal<{ team: Team }>(),
};
