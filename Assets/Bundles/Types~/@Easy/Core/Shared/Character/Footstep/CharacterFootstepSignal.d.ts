import { Cancellable } from "../../Util/Cancellable";
import Character from "../Character";
export declare class CharacterFootstepSignal extends Cancellable {
    readonly character: Character;
    readonly material: Material;
    readonly raycastHit: RaycastHit;
    audioClips: AudioClip[];
    readonly cameraPosition: Vector3;
    volume: number;
    constructor(character: Character, material: Material, raycastHit: RaycastHit, audioClips: AudioClip[], cameraPosition: Vector3, volume: number);
}
