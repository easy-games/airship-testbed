export enum CharacterCameraMode {
	Fixed,
	Orbit,
}

const t = CharacterCameraMode as unknown as { Locked: number };
t["Locked"] = CharacterCameraMode.Fixed;
