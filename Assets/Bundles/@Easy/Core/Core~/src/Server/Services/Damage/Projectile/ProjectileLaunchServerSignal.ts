import { Projectile } from "Shared/Projectile/Projectile";

export class ProjectileLaunchedServerSignal {
	constructor(public readonly projectile: Projectile) {}
}
