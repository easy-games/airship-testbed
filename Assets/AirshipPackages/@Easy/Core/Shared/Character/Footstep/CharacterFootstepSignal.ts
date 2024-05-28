import { Cancellable } from "../../Util/Cancellable";
import Character from "../Character";

export class CharacterFootstepSignal extends Cancellable {
	constructor(
		public readonly character: Character,
		public readonly material: Material,
		public readonly raycastHit: RaycastHit,
		public audioClips: AudioClip[],
		public readonly cameraPosition: Vector3,
		public volume: number,
	) {
		super();
	}
}
