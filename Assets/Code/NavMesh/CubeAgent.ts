import { Airship } from "@Easy/Core/Shared/Airship";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class CubeAgent extends AirshipBehaviour {
	public agent: NavMeshAgent;

	private target: Transform | undefined;
	private bin = new Bin();

	override OnEnable(): void {
		this.bin.Add(
			Airship.Characters.ObserveCharacters((character) => {
				this.target = character.model.transform;

				this.bin.Add(
					character.onDespawn.Connect(() => {
						if (this.target === character.model.transform) {
							this.target = undefined;
						}
					}),
				);
			}),
		);
	}

	protected Update(dt: number): void {
		if (!this.target) return;

		this.agent.SetDestination(this.target.position);
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
