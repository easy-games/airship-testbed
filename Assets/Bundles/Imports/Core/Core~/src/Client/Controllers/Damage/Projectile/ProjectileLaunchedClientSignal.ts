import { Projectile } from "Shared/Projectile/Projectile";

export class ProjectileLaunchedClientSignal {
	constructor(public readonly projectile: Projectile) {}
}
