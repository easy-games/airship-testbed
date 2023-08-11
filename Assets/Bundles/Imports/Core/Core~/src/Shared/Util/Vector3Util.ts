function Lerp(from: number, to: number, alpha: number) {
	return from + (to - from) * alpha;
}

export function MagnitudeV3(v3: Vector3): number {
	return math.sqrt(v3.x ** 2 + v3.y ** 2 + v3.z ** 2);
}

export function SqrMagnitudeV3(v3: Vector3): number {
	return v3.x ** 2 + v3.y ** 2 + v3.z ** 2;
}

export function DistanceV3(from: Vector3, to: Vector3): number {
	return MagnitudeV3(from.sub(to));
}

export function NormalizeV3(v3: Vector3): Vector3 {
	const m = MagnitudeV3(v3);
	return new Vector3(v3.x / m, v3.y / m, v3.z / m);
}

export function DirectionV3(from: Vector3, to: Vector3): Vector3 {
	return NormalizeV3(to.sub(from));
}

export function LerpV3(from: Vector3, to: Vector3, alpha: number): Vector3 {
	return new Vector3(Lerp(from.x, to.x, alpha), Lerp(from.y, to.y, alpha), Lerp(from.z, to.z, alpha));
}

export function DotV3(a: Vector3, b: Vector3): number {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function CrossV3(a: Vector3, b: Vector3): Vector3 {
	return new Vector3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
