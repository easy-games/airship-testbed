import { Cancellable } from "../../Util/Cancellable";
import Character from "../Character";

export class CharacterFootstepSignal extends Cancellable {
	constructor(
		public readonly character: Character,
		public readonly raycastHit: RaycastHit,
		public readonly material: Material | undefined,
		public audioClip: AudioClip,
		public readonly cameraPosition: Vector3,
		public volume: number,
		public readonly crouching: boolean,
	) {
		super();
	}
}
