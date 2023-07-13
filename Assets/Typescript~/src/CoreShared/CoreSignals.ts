import { Signal } from "Shared/Util/Signal";
import { BeforeBlockHitSignal } from "./Controllers/Global/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideClientSignal } from "./Controllers/Global/Damage/Projectile/ProjectileCollideClientSignal";
export const CoreSignals = {
	CoreInitialized: new Signal<{ idToken: string }>(),
	UserServiceInitialized: new Signal(),
};
