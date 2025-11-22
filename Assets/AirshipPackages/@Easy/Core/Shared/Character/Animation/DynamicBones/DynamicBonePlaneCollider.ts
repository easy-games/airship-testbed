import DynamicBoneColliderBase from "./DynamicBoneColliderBase";

export default class DynamicBonePlaneCollider extends DynamicBoneColliderBase {
	private m_Plane: Plane = new Plane(Vector3.up, Vector3.zero);

	public OnValidate(): void { }

	public Prepare(): void {
		let normal = Vector3.up;
		switch (this.m_Direction) {
			case DynamicBoneColliderBase.Direction.X: normal = this.transform.right; break;
			case DynamicBoneColliderBase.Direction.Y: normal = this.transform.up; break;
			case DynamicBoneColliderBase.Direction.Z: normal = this.transform.forward; break;
		}
		const p = this.transform.TransformPoint(this.m_Center);
		this.m_Plane.SetNormalAndPosition(normal, p);
	}

	public Collide(particlePositionWrapper: { value: Vector3 }, particleRadius: number): boolean {
		const d = this.m_Plane.GetDistanceToPoint(particlePositionWrapper.value);
		if (this.m_Bound === DynamicBoneColliderBase.Bound.Outside) {
			if (d < 0) {
				particlePositionWrapper.value = particlePositionWrapper.value.sub(this.m_Plane.normal.mul(d));
				return true;
			}
		} else {
			if (d > 0) {
				particlePositionWrapper.value = particlePositionWrapper.value.sub(this.m_Plane.normal.mul(d));
				return true;
			}
		}
		return false;
	}

	public OnDrawGizmosSelected(): void {
		if (!this.enabled) return;
		this.Prepare();
		Gizmos.color = (this.m_Bound === DynamicBoneColliderBase.Bound.Outside) ? Color.yellow : Color.magenta;
		const p = this.transform.TransformPoint(this.m_Center);
		Gizmos.DrawLine(p, p.add(this.m_Plane.normal));
	}
}
