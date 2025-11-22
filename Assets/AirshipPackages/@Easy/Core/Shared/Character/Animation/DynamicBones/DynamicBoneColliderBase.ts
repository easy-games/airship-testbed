export default class DynamicBoneColliderBase extends AirshipBehaviour {
    public static Direction = {
        X: 0,
        Y: 1,
        Z: 2,
    } as const;

    public m_Direction: number = DynamicBoneColliderBase.Direction.Y;
    public m_Center: Vector3 = Vector3.zero;

    public static Bound = {
        Outside: 0,
        Inside: 1,
    } as const;

    public m_Bound: number = DynamicBoneColliderBase.Bound.Outside;

    public PrepareFrame: number = 0;

    public GetPrepareFrame(): number {
        return this.PrepareFrame;
    }

    public SetPrepareFrame(v: number): void {
        this.PrepareFrame = v;
    }

    public Start(): void { }
    public Prepare(): void { }

    public Collide(particlePositionWrapper: { value: Vector3 }, particleRadius: number): boolean {
        return false;
    }
}
