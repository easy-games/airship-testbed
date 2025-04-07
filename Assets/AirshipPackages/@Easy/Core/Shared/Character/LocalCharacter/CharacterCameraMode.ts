export enum CharacterCameraMode {
	Fixed,
	Orbit,
	OrbitFixed,
}

const t = CharacterCameraMode as unknown as { Locked: number };
t["Locked"] = CharacterCameraMode.Fixed;
