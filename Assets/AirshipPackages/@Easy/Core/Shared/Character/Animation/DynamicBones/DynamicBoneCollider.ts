import DynamicBoneColliderBase from "./DynamicBoneColliderBase";

export default class DynamicBoneCollider extends DynamicBoneColliderBase {
	public m_Radius: number = 0.5;
	public m_Height: number = 0;
	public m_Radius2: number = 0;

	private m_ScaledRadius: number = 0;
	private m_ScaledRadius2: number = 0;
	private m_C0: Vector3 = Vector3.zero;
	private m_C1: Vector3 = Vector3.zero;
	private m_C01Distance: number = 0;
	private m_CollideType: number = 0;

	public OnValidate(): void {
		this.m_Radius = math.max(this.m_Radius, 0);
		this.m_Height = math.max(this.m_Height, 0);
		this.m_Radius2 = math.max(this.m_Radius2, 0);
	}

	public Prepare(): void {
		const scale = math.abs(this.transform.lossyScale.x);
		const halfHeight = this.m_Height * 0.5;

		if (this.m_Radius2 <= 0 || math.abs(this.m_Radius - this.m_Radius2) < 0.01) {
			this.m_ScaledRadius = this.m_Radius * scale;

			const h = halfHeight - this.m_Radius;
			if (h <= 0) {
				this.m_C0 = this.transform.TransformPoint(this.m_Center);
				this.m_CollideType = this.m_Bound === DynamicBoneColliderBase.Bound.Outside ? 0 : 1;
			} else {
				// substitui clone() por new Vector3(...)
				let c0 = new Vector3(this.m_Center.x, this.m_Center.y, this.m_Center.z);
				let c1 = new Vector3(this.m_Center.x, this.m_Center.y, this.m_Center.z);

				// Não é permitido escrever em c0.x, c1.x diretamente (são readonly) — recria os Vector3
				switch (this.m_Direction) {
					case DynamicBoneColliderBase.Direction.X:
						c0 = new Vector3(c0.x + h, c0.y, c0.z);
						c1 = new Vector3(c1.x - h, c1.y, c1.z);
						break;
					case DynamicBoneColliderBase.Direction.Y:
						c0 = new Vector3(c0.x, c0.y + h, c0.z);
						c1 = new Vector3(c1.x, c1.y - h, c1.z);
						break;
					case DynamicBoneColliderBase.Direction.Z:
						c0 = new Vector3(c0.x, c0.y, c0.z + h);
						c1 = new Vector3(c1.x, c1.y, c1.z - h);
						break;
				}

				this.m_C0 = this.transform.TransformPoint(c0);
				this.m_C1 = this.transform.TransformPoint(c1);
				this.m_C01Distance = this.m_C1.sub(this.m_C0).magnitude;
				this.m_CollideType = this.m_Bound === DynamicBoneColliderBase.Bound.Outside ? 2 : 3;
			}
		} else {
			const r = math.max(this.m_Radius, this.m_Radius2);
			if (halfHeight - r <= 0) {
				this.m_ScaledRadius = r * scale;
				this.m_C0 = this.transform.TransformPoint(this.m_Center);
				this.m_CollideType = this.m_Bound === DynamicBoneColliderBase.Bound.Outside ? 0 : 1;
			} else {
				this.m_ScaledRadius = this.m_Radius * scale;
				this.m_ScaledRadius2 = this.m_Radius2 * scale;

				const h0 = halfHeight - this.m_Radius;
				const h1 = halfHeight - this.m_Radius2;
				// substitui clone() por new Vector3(...)
				let c0 = new Vector3(this.m_Center.x, this.m_Center.y, this.m_Center.z);
				let c1 = new Vector3(this.m_Center.x, this.m_Center.y, this.m_Center.z);

				// recria Vector3 para aplicar deslocamentos
				switch (this.m_Direction) {
					case DynamicBoneColliderBase.Direction.X:
						c0 = new Vector3(c0.x + h0, c0.y, c0.z);
						c1 = new Vector3(c1.x - h1, c1.y, c1.z);
						break;
					case DynamicBoneColliderBase.Direction.Y:
						c0 = new Vector3(c0.x, c0.y + h0, c0.z);
						c1 = new Vector3(c1.x, c1.y - h1, c1.z);
						break;
					case DynamicBoneColliderBase.Direction.Z:
						c0 = new Vector3(c0.x, c0.y, c0.z + h0);
						c1 = new Vector3(c1.x, c1.y, c1.z - h1);
						break;
				}

				this.m_C0 = this.transform.TransformPoint(c0);
				this.m_C1 = this.transform.TransformPoint(c1);
				this.m_C01Distance = this.m_C1.sub(this.m_C0).magnitude;
				this.m_CollideType = this.m_Bound === DynamicBoneColliderBase.Bound.Outside ? 4 : 5;
			}
		}
	}

	public Collide(particlePositionWrapper: { value: Vector3 }, particleRadius: number): boolean {
		switch (this.m_CollideType) {
			case 0: return DynamicBoneCollider.OutsideSphere(particlePositionWrapper, particleRadius, this.m_C0, this.m_ScaledRadius);
			case 1: return DynamicBoneCollider.InsideSphere(particlePositionWrapper, particleRadius, this.m_C0, this.m_ScaledRadius);
			case 2: return DynamicBoneCollider.OutsideCapsule(particlePositionWrapper, particleRadius, this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_C01Distance);
			case 3: return DynamicBoneCollider.InsideCapsule(particlePositionWrapper, particleRadius, this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_C01Distance);
			case 4: return DynamicBoneCollider.OutsideCapsule2(particlePositionWrapper, particleRadius, this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_ScaledRadius2, this.m_C01Distance);
			case 5: return DynamicBoneCollider.InsideCapsule2(particlePositionWrapper, particleRadius, this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_ScaledRadius2, this.m_C01Distance);
		}
		return false;
	}

	private static OutsideSphere(particlePositionWrapper: { value: Vector3 }, particleRadius: number, sphereCenter: Vector3, sphereRadius: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const r = sphereRadius + particleRadius;
		const r2 = r * r;
		const d = particlePosition.sub(sphereCenter);
		const dlen2 = d.sqrMagnitude;
		if (dlen2 > 0 && dlen2 < r2) {
			const dlen = math.sqrt(dlen2);
			particlePositionWrapper.value = sphereCenter.add(d.mul(r / dlen));
			return true;
		}
		return false;
	}

	private static InsideSphere(particlePositionWrapper: { value: Vector3 }, particleRadius: number, sphereCenter: Vector3, sphereRadius: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const r = sphereRadius - particleRadius;
		const r2 = r * r;
		const d = particlePosition.sub(sphereCenter);
		const dlen2 = d.sqrMagnitude;
		if (dlen2 > r2) {
			const dlen = math.sqrt(dlen2);
			particlePositionWrapper.value = sphereCenter.add(d.mul(r / dlen));
			return true;
		}
		return false;
	}

	private static OutsideCapsule(particlePositionWrapper: { value: Vector3 }, particleRadius: number, capsuleP0: Vector3, capsuleP1: Vector3, capsuleRadius: number, dirlen: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const r = capsuleRadius + particleRadius;
		const r2 = r * r;
		const dir = capsuleP1.sub(capsuleP0);
		const d = particlePosition.sub(capsuleP0);
		const t = Vector3.Dot(d, dir);

		if (t <= 0) {
			const dlen2 = d.sqrMagnitude;
			if (dlen2 > 0 && dlen2 < r2) {
				const dlen = math.sqrt(dlen2);
				particlePositionWrapper.value = capsuleP0.add(d.mul(r / dlen));
				return true;
			}
		} else {
			const dirlen2 = dirlen * dirlen;
			if (t >= dirlen2) {
				const d2 = particlePosition.sub(capsuleP1);
				const dlen2 = d2.sqrMagnitude;
				if (dlen2 > 0 && dlen2 < r2) {
					const dlen = math.sqrt(dlen2);
					particlePositionWrapper.value = capsuleP1.add(d2.mul(r / dlen));
					return true;
				}
			} else {
				const q = d.sub(dir.mul(t / dirlen2));
				const qlen2 = q.sqrMagnitude;
				if (qlen2 > 0 && qlen2 < r2) {
					const qlen = math.sqrt(qlen2);
					particlePositionWrapper.value = particlePosition.add(q.mul((r - qlen) / qlen));
					return true;
				}
			}
		}
		return false;
	}

	private static InsideCapsule(particlePositionWrapper: { value: Vector3 }, particleRadius: number, capsuleP0: Vector3, capsuleP1: Vector3, capsuleRadius: number, dirlen: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const r = capsuleRadius - particleRadius;
		const r2 = r * r;
		const dir = capsuleP1.sub(capsuleP0);
		const d = particlePosition.sub(capsuleP0);
		const t = Vector3.Dot(d, dir);

		if (t <= 0) {
			const dlen2 = d.sqrMagnitude;
			if (dlen2 > r2) {
				const dlen = math.sqrt(dlen2);
				particlePositionWrapper.value = capsuleP0.add(d.mul(r / dlen));
				return true;
			}
		} else {
			const dirlen2 = dirlen * dirlen;
			if (t >= dirlen2) {
				const d2 = particlePosition.sub(capsuleP1);
				const dlen2 = d2.sqrMagnitude;
				if (dlen2 > r2) {
					const dlen = math.sqrt(dlen2);
					particlePositionWrapper.value = capsuleP1.add(d2.mul(r / dlen));
					return true;
				}
			} else {
				const q = d.sub(dir.mul(t / dirlen2));
				const qlen2 = q.sqrMagnitude;
				if (qlen2 > r2) {
					const qlen = math.sqrt(qlen2);
					particlePositionWrapper.value = particlePosition.add(q.mul((r - qlen) / qlen));
					return true;
				}
			}
		}
		return false;
	}

	private static OutsideCapsule2(particlePositionWrapper: { value: Vector3 }, particleRadius: number, capsuleP0: Vector3, capsuleP1: Vector3, capsuleRadius0: number, capsuleRadius1: number, dirlen: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const dir = capsuleP1.sub(capsuleP0);
		const d = particlePosition.sub(capsuleP0);
		const t = Vector3.Dot(d, dir);

		if (t <= 0) {
			const r = capsuleRadius0 + particleRadius;
			const r2 = r * r;
			const dlen2 = d.sqrMagnitude;
			if (dlen2 > 0 && dlen2 < r2) {
				const dlen = math.sqrt(dlen2);
				particlePositionWrapper.value = capsuleP0.add(d.mul(r / dlen));
				return true;
			}
		} else {
			const dirlen2 = dirlen * dirlen;
			if (t >= dirlen2) {
				const r = capsuleRadius1 + particleRadius;
				const r2 = r * r;
				const d2 = particlePosition.sub(capsuleP1);
				const dlen2 = d2.sqrMagnitude;
				if (dlen2 > 0 && dlen2 < r2) {
					const dlen = math.sqrt(dlen2);
					particlePositionWrapper.value = capsuleP1.add(d2.mul(r / dlen));
					return true;
				}
			} else {
				const q = d.sub(dir.mul(t / dirlen2));
				const qlen2 = q.sqrMagnitude;
				const klen = Vector3.Dot(d, dir.div(dirlen));
				const r = Mathf.Lerp(capsuleRadius0, capsuleRadius1, klen / dirlen) + particleRadius;
				const r2 = r * r;
				if (qlen2 > 0 && qlen2 < r2) {
					const qlen = math.sqrt(qlen2);
					particlePositionWrapper.value = particlePosition.add(q.mul((r - qlen) / qlen));
					return true;
				}
			}
		}
		return false;
	}

	private static InsideCapsule2(particlePositionWrapper: { value: Vector3 }, particleRadius: number, capsuleP0: Vector3, capsuleP1: Vector3, capsuleRadius0: number, capsuleRadius1: number, dirlen: number): boolean {
		const particlePosition = particlePositionWrapper.value;
		const dir = capsuleP1.sub(capsuleP0);
		const d = particlePosition.sub(capsuleP0);
		const t = Vector3.Dot(d, dir);

		if (t <= 0) {
			const r = capsuleRadius0 - particleRadius;
			const r2 = r * r;
			const dlen2 = d.sqrMagnitude;
			if (dlen2 > r2) {
				const dlen = math.sqrt(dlen2);
				particlePositionWrapper.value = capsuleP0.add(d.mul(r / dlen));
				return true;
			}
		} else {
			const dirlen2 = dirlen * dirlen;
			if (t >= dirlen2) {
				const r = capsuleRadius1 - particleRadius;
				const r2 = r * r;
				const d2 = particlePosition.sub(capsuleP1);
				const dlen2 = d2.sqrMagnitude;
				if (dlen2 > r2) {
					const dlen = math.sqrt(dlen2);
					particlePositionWrapper.value = capsuleP1.add(d2.mul(r / dlen));
					return true;
				}
			} else {
				const q = d.sub(dir.mul(t / dirlen2));
				const qlen2 = q.sqrMagnitude;
				const klen = Vector3.Dot(d, dir.div(dirlen));
				const r = Mathf.Lerp(capsuleRadius0, capsuleRadius1, klen / dirlen) - particleRadius;
				const r2 = r * r;
				if (qlen2 > r2) {
					const qlen = math.sqrt(qlen2);
					particlePositionWrapper.value = particlePosition.add(q.mul((r - qlen) / qlen));
					return true;
				}
			}
		}
		return false;
	}

	public OnDrawGizmosSelected(): void {
		if (!this.enabled) return;
		this.Prepare();
		if (this.m_Bound === DynamicBoneColliderBase.Bound.Outside) Gizmos.color = Color.yellow; else Gizmos.color = Color.magenta;

		switch (this.m_CollideType) {
			case 0:
			case 1:
				Gizmos.DrawWireSphere(this.m_C0, this.m_ScaledRadius);
				break;
			case 2:
			case 3:
				DynamicBoneCollider.DrawCapsule(this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_ScaledRadius);
				break;
			case 4:
			case 5:
				DynamicBoneCollider.DrawCapsule(this.m_C0, this.m_C1, this.m_ScaledRadius, this.m_ScaledRadius2);
				break;
		}
	}

	private static DrawCapsule(c0: Vector3, c1: Vector3, radius0: number, radius1: number): void {
		Gizmos.DrawLine(c0, c1);
		Gizmos.DrawWireSphere(c0, radius0);
		Gizmos.DrawWireSphere(c1, radius1);
	}
}
