import { Signal } from "Shared/Util/Signal";
import { BeforeBlockHitSignal } from "./Controllers/Global/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideClientSignal } from "./Controllers/Global/Damage/Projectile/ProjectileCollideClientSignal";
import { Entity } from "./Entity/Entity";

export const CoreSignals = {
	Initialized: new Signal<{ idToken: string }>(),
};
