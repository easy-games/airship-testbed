import DynamicBoneColliderBase from "./DynamicBoneColliderBase"

enum UpdateMode {
    Normal,
    AnimatePhysics,
    UnscaledTime,
    Default,
}

enum FreezeAxis {
    None,
    X,
    Y,
    Z,
}

class Particle {
    public m_Transform: Transform | undefined = undefined
    public m_ParentIndex: number = -1
    public m_ChildCount: number = 0
    public m_Damping: number = 0
    public m_Elasticity: number = 0
    public m_Stiffness: number = 0
    public m_Inert: number = 0
    public m_Friction: number = 0
    public m_Radius: number = 0
    public m_BoneLength: number = 0
    public m_isCollide: boolean = false
    public m_TransformNotNull: boolean = false

    public m_Position: Vector3 = Vector3.zero
    public m_PrevPosition: Vector3 = Vector3.zero
    public m_EndOffset: Vector3 = Vector3.zero
    public m_InitLocalPosition: Vector3 = Vector3.zero
    public m_InitLocalRotation: Quaternion = Quaternion.identity

    public m_TransformPosition: Vector3 = Vector3.zero
    public m_TransformLocalPosition: Vector3 = Vector3.zero
    public m_TransformLocalToWorldMatrix: Matrix4x4 = Matrix4x4.identity
}

class ParticleTree {
    public m_Root: Transform
    public m_LocalGravity: Vector3 = Vector3.zero
    public m_RootWorldToLocalMatrix: Matrix4x4 = Matrix4x4.identity
    public m_BoneTotalLength: number = 0
    public m_Particles: Particle[] = []
    public m_RestGravity: Vector3 = Vector3.zero

    constructor(root: Transform) {
        this.m_Root = root
    }
}

export default class DynamicBones extends AirshipBehaviour {
    public m_Root: Transform | undefined = undefined
    public m_Roots: Transform[] | undefined = undefined

    public m_UpdateRate: number = 60.0
    public m_UpdateMode: UpdateMode = UpdateMode.Default

    public m_Damping: number = 0.1
    public m_DampingDistrib: AnimationCurve | undefined = undefined

    public m_Elasticity: number = 0.1
    public m_ElasticityDistrib: AnimationCurve | undefined = undefined

    public m_Stiffness: number = 0.1
    public m_StiffnessDistrib: AnimationCurve | undefined = undefined

    public m_Inert: number = 0
    public m_InertDistrib: AnimationCurve | undefined = undefined

    public m_Friction: number = 0
    public m_FrictionDistrib: AnimationCurve | undefined = undefined

    public m_Radius: number = 0
    public m_RadiusDistrib: AnimationCurve | undefined = undefined

    public m_EndLength: number = 0
    public m_EndOffset: Vector3 = Vector3.zero

    public m_Gravity: Vector3 = Vector3.zero
    public m_Force: Vector3 = Vector3.zero

    public m_BlendWeight: number = 1.0

    public m_Colliders: DynamicBoneColliderBase[] | undefined = undefined
    public m_Exclusions: Transform[] | undefined = undefined

    public m_FreezeAxis: FreezeAxis = FreezeAxis.None

    public m_DistantDisable: boolean = false
    public m_ReferenceObject: Transform | undefined = undefined
    public m_DistanceToObject: number = 20

    public m_Multithread: boolean = false

    private m_ObjectMove: Vector3 = Vector3.zero
    private m_ObjectPrevPosition: Vector3 = Vector3.zero
    private m_ObjectScale: number = 1

    private m_Time: number = 0
    private m_Weight: number = 1.0
    private m_DistantDisabled: boolean = false
    private m_PreUpdateCount: number = 0

    private m_ParticleTrees: ParticleTree[] = []

    private m_DeltaTime: number = 0
    private m_EffectiveColliders: DynamicBoneColliderBase[] | undefined = undefined

    private static s_UpdateCount: number = 0
    private static s_PrepareFrame: number = 0

    public Start(): void {
        this.SetupParticles()
    }

    public FixedUpdate(): void {
        if (this.m_UpdateMode === UpdateMode.AnimatePhysics) {
            this.PreUpdate()
        }
    }

    public Update(): void {
        if (this.m_UpdateMode !== UpdateMode.AnimatePhysics) {
            this.PreUpdate()
        }
        DynamicBones.s_UpdateCount++
    }

    public LateUpdate(): void {
        if (this.m_PreUpdateCount === 0) {
            return
        }

        if (DynamicBones.s_UpdateCount > 0) {
            DynamicBones.s_UpdateCount = 0
            DynamicBones.s_PrepareFrame++
        }

        this.SetWeight(this.m_BlendWeight)

        this.CheckDistance()
        if (this.IsNeedUpdate()) {
            this.Prepare()
            this.UpdateParticles()
            this.ApplyParticlesToTransforms()
        }

        this.m_PreUpdateCount = 0
    }

    private Prepare(): void {
        this.m_DeltaTime = Time.deltaTime
        if (this.m_UpdateMode === UpdateMode.UnscaledTime) {
            this.m_DeltaTime = Time.unscaledDeltaTime
        } else if (this.m_UpdateMode === UpdateMode.AnimatePhysics) {
            this.m_DeltaTime = Time.fixedDeltaTime * this.m_PreUpdateCount
        }

        this.m_ObjectScale = Mathf.Abs(this.transform.lossyScale.x)
        this.m_ObjectMove = this.transform.position.sub(this.m_ObjectPrevPosition)
        this.m_ObjectPrevPosition = this.transform.position

        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            const pt = this.m_ParticleTrees[i]
            pt.m_RestGravity = pt.m_Root.TransformDirection(pt.m_LocalGravity)

            for (let j = 0; j < pt.m_Particles.size(); ++j) {
                const p = pt.m_Particles[j]
                if (p.m_TransformNotNull && p.m_Transform) {
                    p.m_TransformPosition = p.m_Transform.position
                    p.m_TransformLocalPosition = p.m_Transform.localPosition
                    p.m_TransformLocalToWorldMatrix = p.m_Transform.localToWorldMatrix
                }
            }
        }

        if (this.m_EffectiveColliders) {
            this.m_EffectiveColliders.clear()
        }

        if (this.m_Colliders) {
            for (let i = 0; i < this.m_Colliders.size(); ++i) {
                const c = this.m_Colliders[i]
                if (c && c.enabled) {
                    if (!this.m_EffectiveColliders) {
                        this.m_EffectiveColliders = []
                    }
                    this.m_EffectiveColliders.push(c)

                    if (c.PrepareFrame !== DynamicBones.s_PrepareFrame) {
                        c.Prepare()
                        c.PrepareFrame = DynamicBones.s_PrepareFrame
                    }
                }
            }
        }
    }

    private IsNeedUpdate(): boolean {
        return this.m_Weight > 0 && !(this.m_DistantDisable && this.m_DistantDisabled)
    }

    private PreUpdate(): void {
        if (this.IsNeedUpdate()) {
            this.InitTransforms()
        }
        this.m_PreUpdateCount++
    }

    private CheckDistance(): void {
        if (!this.m_DistantDisable) {
            return
        }

        let rt = this.m_ReferenceObject
        if (!rt && Camera.main) {
            rt = Camera.main.transform
        }

        if (rt) {
            const d2 = rt.position.sub(this.transform.position).sqrMagnitude
            const disable = d2 > this.m_DistanceToObject * this.m_DistanceToObject
            if (disable !== this.m_DistantDisabled) {
                if (!disable) {
                    this.ResetParticlesPosition()
                }
                this.m_DistantDisabled = disable
            }
        }
    }

    public OnEnable(): void {
        this.ResetParticlesPosition()
    }

    public OnDisable(): void {
        this.InitTransforms()
    }

    public OnValidate(): void {
        this.m_UpdateRate = Mathf.Max(this.m_UpdateRate, 0)
        this.m_Damping = Mathf.Clamp01(this.m_Damping)
        this.m_Elasticity = Mathf.Clamp01(this.m_Elasticity)
        this.m_Stiffness = Mathf.Clamp01(this.m_Stiffness)
        this.m_Inert = Mathf.Clamp01(this.m_Inert)
        this.m_Friction = Mathf.Clamp01(this.m_Friction)
        this.m_Radius = Mathf.Max(this.m_Radius, 0)

        if (Application.isEditor && Application.isPlaying) {
            if (this.IsRootChanged()) {
                this.InitTransforms()
                this.SetupParticles()
            } else {
                this.UpdateParameters()
            }
        }
    }

    private IsRootChanged(): boolean {
        const roots: Transform[] = []
        if (this.m_Root) {
            roots.push(this.m_Root)
        }

        if (this.m_Roots) {
            for (let i = 0; i < this.m_Roots.size(); ++i) {
                const root = this.m_Roots[i]
                if (root && roots.indexOf(root) < 0) {
                    roots.push(root)
                }
            }
        }

        if (roots.size() !== this.m_ParticleTrees.size()) {
            return true
        }

        for (let i = 0; i < roots.size(); ++i) {
            if (roots[i] !== this.m_ParticleTrees[i].m_Root) {
                return true
            }
        }

        return false
    }

    public OnDidApplyAnimationProperties(): void {
        this.UpdateParameters()
    }

    public OnDrawGizmosSelected(): void {
        if (!this.enabled) {
            return
        }

        if (Application.isEditor && !Application.isPlaying && this.transform.hasChanged) {
            this.SetupParticles()
        }

        Gizmos.color = Color.white
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.DrawGizmos(this.m_ParticleTrees[i])
        }
    }

    private DrawGizmos(pt: ParticleTree): void {
        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            if (p.m_ParentIndex >= 0) {
                const p0 = pt.m_Particles[p.m_ParentIndex]
                Gizmos.DrawLine(p.m_Position, p0.m_Position)
            }

            if (p.m_Radius > 0) {
                Gizmos.DrawWireSphere(p.m_Position, p.m_Radius * this.m_ObjectScale)
            }
        }
    }

    public SetWeight(w: number): void {
        if (this.m_Weight !== w) {
            if (w === 0) {
                this.InitTransforms()
            } else if (this.m_Weight === 0) {
                this.ResetParticlesPosition()
            }
            this.m_Weight = w
            this.m_BlendWeight = w
        }
    }

    public GetWeight(): number {
        return this.m_Weight
    }

    private UpdateParticles(): void {
        if (this.m_ParticleTrees.size() <= 0) {
            return
        }

        let loop = 1
        let timeVar = 1
        const dt = this.m_DeltaTime

        if (this.m_UpdateMode === UpdateMode.Default) {
            if (this.m_UpdateRate > 0) {
                timeVar = dt * this.m_UpdateRate
            }
        } else {
            if (this.m_UpdateRate > 0) {
                const frameTime = 1.0 / this.m_UpdateRate
                this.m_Time += dt
                loop = 0

                while (this.m_Time >= frameTime) {
                    this.m_Time -= frameTime
                    if (++loop >= 3) {
                        this.m_Time = 0
                        break
                    }
                }
            }
        }

        if (loop > 0) {
            for (let i = 0; i < loop; ++i) {
                this.UpdateParticles1(timeVar, i)
                this.UpdateParticles2(timeVar)
            }
        } else {
            this.SkipUpdateParticles()
        }
    }

    public SetupParticles(): void {
        this.m_ParticleTrees = []

        if (this.m_Root) {
            this.AppendParticleTree(this.m_Root)
        }

        if (this.m_Roots) {
            for (let i = 0; i < this.m_Roots.size(); ++i) {
                const root = this.m_Roots[i]
                if (!root) {
                    continue
                }

                if (this.m_ParticleTrees.find(x => x.m_Root === root)) {
                    continue
                }

                this.AppendParticleTree(root)
            }
        }

        this.m_ObjectScale = Mathf.Abs(this.transform.lossyScale.x)
        this.m_ObjectPrevPosition = this.transform.position
        this.m_ObjectMove = Vector3.zero

        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            const pt = this.m_ParticleTrees[i]
            this.AppendParticles(pt, pt.m_Root, -1, 0)
        }

        this.UpdateParameters()
    }

    private AppendParticleTree(root: Transform): void {
        if (!root) {
            return
        }

        const pt = new ParticleTree(root)
        pt.m_RootWorldToLocalMatrix = root.worldToLocalMatrix
        this.m_ParticleTrees.push(pt)
    }

    private AppendParticles(pt: ParticleTree, b: Transform | undefined, parentIndex: number, boneLength: number): void {
        const p = new Particle()
        p.m_Transform = b
        p.m_TransformNotNull = b !== undefined
        p.m_ParentIndex = parentIndex

        if (b) {
            p.m_Position = b.position
            p.m_PrevPosition = b.position
            p.m_InitLocalPosition = b.localPosition
            p.m_InitLocalRotation = b.localRotation
        } else {
            const pb = pt.m_Particles[parentIndex].m_Transform!
            if (this.m_EndLength > 0) {
                const ppb = pb.parent
                if (ppb) {
                    const endPos = pb.position.mul(2).sub(ppb.position)
                    p.m_EndOffset = pb.InverseTransformPoint(endPos).mul(this.m_EndLength)
                } else {
                    p.m_EndOffset = new Vector3(this.m_EndLength, 0, 0)
                }
            } else {
                const offsetWorld = this.transform.TransformDirection(this.m_EndOffset).add(pb.position)
                p.m_EndOffset = pb.InverseTransformPoint(offsetWorld)
            }
            const endWorldPos = pb.TransformPoint(p.m_EndOffset)
            p.m_Position = endWorldPos
            p.m_PrevPosition = endWorldPos
            p.m_InitLocalPosition = Vector3.zero
            p.m_InitLocalRotation = Quaternion.identity
        }

        if (parentIndex >= 0) {
            const parent = pt.m_Particles[parentIndex]
            const parentPos = parent.m_Transform!.position
            boneLength += parentPos.sub(p.m_Position).magnitude
            p.m_BoneLength = boneLength
            pt.m_BoneTotalLength = Mathf.Max(pt.m_BoneTotalLength, boneLength)
            parent.m_ChildCount++
        }

        const index = pt.m_Particles.size()
        pt.m_Particles.push(p)

        if (b) {
            const childCount = b.childCount
            for (let i = 0; i < childCount; ++i) {
                const child = b.GetChild(i)
                let exclude = false
                if (this.m_Exclusions) {
                    exclude = this.m_Exclusions.indexOf(child) >= 0
                }
                if (!exclude) {
                    this.AppendParticles(pt, child, index, boneLength)
                } else if (this.m_EndLength > 0 || !this.m_EndOffset.ApproxEqual(Vector3.zero)) {
                    this.AppendParticles(pt, undefined, index, boneLength)
                }
            }

            if (b.childCount === 0 && (this.m_EndLength > 0 || !this.m_EndOffset.ApproxEqual(Vector3.zero))) {
                this.AppendParticles(pt, undefined, index, boneLength)
            }
        }
    }

    public UpdateParameters(): void {
        this.SetWeight(this.m_BlendWeight)

        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.UpdateParametersForTree(this.m_ParticleTrees[i])
        }
    }

    private UpdateParametersForTree(pt: ParticleTree): void {
        pt.m_LocalGravity = pt.m_RootWorldToLocalMatrix.MultiplyVector(this.m_Gravity).normalized.mul(this.m_Gravity.magnitude)

        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            p.m_Damping = this.m_Damping
            p.m_Elasticity = this.m_Elasticity
            p.m_Stiffness = this.m_Stiffness
            p.m_Inert = this.m_Inert
            p.m_Friction = this.m_Friction
            p.m_Radius = this.m_Radius

            if (pt.m_BoneTotalLength > 0) {
                const a = p.m_BoneLength / pt.m_BoneTotalLength
                if (this.m_DampingDistrib && this.m_DampingDistrib.keys.size() > 0) {
                    p.m_Damping *= this.m_DampingDistrib.Evaluate(a)
                }
                if (this.m_ElasticityDistrib && this.m_ElasticityDistrib.keys.size() > 0) {
                    p.m_Elasticity *= this.m_ElasticityDistrib.Evaluate(a)
                }
                if (this.m_StiffnessDistrib && this.m_StiffnessDistrib.keys.size() > 0) {
                    p.m_Stiffness *= this.m_StiffnessDistrib.Evaluate(a)
                }
                if (this.m_InertDistrib && this.m_InertDistrib.keys.size() > 0) {
                    p.m_Inert *= this.m_InertDistrib.Evaluate(a)
                }
                if (this.m_FrictionDistrib && this.m_FrictionDistrib.keys.size() > 0) {
                    p.m_Friction *= this.m_FrictionDistrib.Evaluate(a)
                }
                if (this.m_RadiusDistrib && this.m_RadiusDistrib.keys.size() > 0) {
                    p.m_Radius *= this.m_RadiusDistrib.Evaluate(a)
                }
            }

            p.m_Damping = Mathf.Clamp01(p.m_Damping)
            p.m_Elasticity = Mathf.Clamp01(p.m_Elasticity)
            p.m_Stiffness = Mathf.Clamp01(p.m_Stiffness)
            p.m_Inert = Mathf.Clamp01(p.m_Inert)
            p.m_Friction = Mathf.Clamp01(p.m_Friction)
            p.m_Radius = Mathf.Max(p.m_Radius, 0)
        }
    }

    private InitTransforms(): void {
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.InitTransformsForTree(this.m_ParticleTrees[i])
        }
    }

    private InitTransformsForTree(pt: ParticleTree): void {
        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            if (p.m_TransformNotNull && p.m_Transform) {
                p.m_Transform.localPosition = p.m_InitLocalPosition
                p.m_Transform.localRotation = p.m_InitLocalRotation
            }
        }
    }

    private ResetParticlesPosition(): void {
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.ResetParticlesPositionForTree(this.m_ParticleTrees[i])
        }
        this.m_ObjectPrevPosition = this.transform.position
    }

    private ResetParticlesPositionForTree(pt: ParticleTree): void {
        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            if (p.m_TransformNotNull && p.m_Transform) {
                p.m_Position = p.m_Transform.position
                p.m_PrevPosition = p.m_Transform.position
            } else {
                const pb = pt.m_Particles[p.m_ParentIndex].m_Transform!
                const pos = pb.TransformPoint(p.m_EndOffset)
                p.m_Position = pos
                p.m_PrevPosition = pos
            }
            p.m_isCollide = false
        }
    }

    private UpdateParticles1(timeVar: number, loopIndex: number): void {
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.UpdateParticles1ForTree(this.m_ParticleTrees[i], timeVar, loopIndex)
        }
    }

    private UpdateParticles1ForTree(pt: ParticleTree, timeVar: number, loopIndex: number): void {
        let force = this.m_Gravity
        const fdir = this.m_Gravity.normalized
        const pf = fdir.mul(Mathf.Max(Vector3.Dot(pt.m_RestGravity, fdir), 0))
        force = force.sub(pf)
        force = force.add(this.m_Force).mul(this.m_ObjectScale * timeVar)

        const objectMove = loopIndex === 0 ? this.m_ObjectMove : Vector3.zero

        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            if (p.m_ParentIndex >= 0) {
                const v = p.m_Position.sub(p.m_PrevPosition)
                const rmove = objectMove.mul(p.m_Inert)
                p.m_PrevPosition = p.m_Position.add(rmove)
                let damping = p.m_Damping
                if (p.m_isCollide) {
                    damping += p.m_Friction
                    if (damping > 1) {
                        damping = 1
                    }
                    p.m_isCollide = false
                }
                p.m_Position = p.m_Position.add(v.mul(1 - damping)).add(force).add(rmove)
            } else {
                p.m_PrevPosition = p.m_Position
                p.m_Position = p.m_TransformPosition
            }
        }
    }

    private UpdateParticles2(timeVar: number): void {
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.UpdateParticles2ForTree(this.m_ParticleTrees[i], timeVar)
        }
    }

    private UpdateParticles2ForTree(pt: ParticleTree, timeVar: number): void {
        const movePlane = new PlaneFake()

        for (let i = 1; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            const p0 = pt.m_Particles[p.m_ParentIndex]

            let restLen: number
            if (p.m_TransformNotNull) {
                restLen = p0.m_TransformPosition.sub(p.m_TransformPosition).magnitude
            } else {
                restLen = p0.m_TransformLocalToWorldMatrix.MultiplyVector(p.m_EndOffset).magnitude
            }

            const stiffness = Mathf.Lerp(1.0, p.m_Stiffness, this.m_Weight)

            if (stiffness > 0 || p.m_Elasticity > 0) {
                let m0 = p0.m_TransformLocalToWorldMatrix
                m0 = DynamicBones.SetMatrixColumn(m0, 3, p0.m_Position)

                let restPos: Vector3
                if (p.m_TransformNotNull) {
                    restPos = m0.MultiplyPoint3x4(p.m_TransformLocalPosition)
                } else {
                    restPos = m0.MultiplyPoint3x4(p.m_EndOffset)
                }

                let d = restPos.sub(p.m_Position)
                p.m_Position = p.m_Position.add(d.mul(p.m_Elasticity * timeVar))

                if (stiffness > 0) {
                    d = restPos.sub(p.m_Position)
                    const len = d.magnitude
                    const maxlen = restLen * (1 - stiffness) * 2
                    if (len > maxlen) {
                        p.m_Position = p.m_Position.add(d.mul((len - maxlen) / len))
                    }
                }
            }

            if (this.m_EffectiveColliders) {
                const particleRadius = p.m_Radius * this.m_ObjectScale
                for (let j = 0; j < this.m_EffectiveColliders.size(); ++j) {
                    const c = this.m_EffectiveColliders[j]
                    if (c) {
                        const wrapper = { value: p.m_Position }
                        if (c.Collide(wrapper, particleRadius)) {
                            p.m_isCollide = true
                            p.m_Position = wrapper.value
                        }
                    }
                }
            }

            if (this.m_FreezeAxis !== FreezeAxis.None) {
                const colIndex = this.m_FreezeAxis - 1
                const col = p0.m_TransformLocalToWorldMatrix.GetColumn(colIndex)
                const planeNormal = new Vector3(col.x, col.y, col.z).normalized

                movePlane.SetNormalAndPosition(planeNormal, p0.m_Position)

                const dist = movePlane.GetDistanceToPoint(p.m_Position)
                p.m_Position = p.m_Position.sub(movePlane.normal.mul(dist))
            }

            const dd = p0.m_Position.sub(p.m_Position)
            const leng = dd.magnitude

            if (leng > 0) {
                p.m_Position = p.m_Position.add(dd.mul((leng - restLen) / leng))
            }
        }
    }

    private SkipUpdateParticles(): void {
        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.SkipUpdateParticlesForTree(this.m_ParticleTrees[i])
        }
    }

    private SkipUpdateParticlesForTree(pt: ParticleTree): void {
        for (let i = 0; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            if (p.m_ParentIndex >= 0) {
                p.m_PrevPosition = p.m_PrevPosition.add(this.m_ObjectMove)
                p.m_Position = p.m_Position.add(this.m_ObjectMove)

                const p0 = pt.m_Particles[p.m_ParentIndex]

                let restLen: number
                if (p.m_TransformNotNull) {
                    restLen = p0.m_TransformPosition.sub(p.m_TransformPosition).magnitude
                } else {
                    restLen = p0.m_TransformLocalToWorldMatrix.MultiplyVector(p.m_EndOffset).magnitude
                }

                const stiffness = Mathf.Lerp(1.0, p.m_Stiffness, this.m_Weight)
                if (stiffness > 0) {
                    let m0 = p0.m_TransformLocalToWorldMatrix
                    m0 = DynamicBones.SetMatrixColumn(m0, 3, p0.m_Position)
                    let restPos: Vector3
                    if (p.m_TransformNotNull) {
                        restPos = m0.MultiplyPoint3x4(p.m_TransformLocalPosition)
                    } else {
                        restPos = m0.MultiplyPoint3x4(p.m_EndOffset)
                    }

                    const d = restPos.sub(p.m_Position)
                    const len = d.magnitude
                    const maxlen = restLen * (1 - stiffness) * 2
                    if (len > maxlen) {
                        p.m_Position = p.m_Position.add(d.mul((len - maxlen) / len))
                    }
                }

                const dd = p0.m_Position.sub(p.m_Position)
                const leng = dd.magnitude
                if (leng > 0) {
                    p.m_Position = p.m_Position.add(dd.mul((leng - restLen) / leng))
                }
            } else {
                p.m_PrevPosition = p.m_Position
                p.m_Position = p.m_TransformPosition
            }
        }
    }

    private static MirrorVector(v: Vector3, axis: Vector3): Vector3 {
        return v.sub(axis.mul(Vector3.Dot(v, axis) * 2))
    }

    private ApplyParticlesToTransforms(): void {
        let ax = Vector3.right
        let ay = Vector3.up
        let az = Vector3.forward
        let nx = false
        let ny = false
        let nz = false

        const lossyScale = this.transform.lossyScale
        if (lossyScale.x < 0 || lossyScale.y < 0 || lossyScale.z < 0) {
            let mirrorObject: Transform | undefined = this.transform
            while (mirrorObject) {
                const ls = mirrorObject.localScale
                nx = ls.x < 0
                if (nx) {
                    ax = mirrorObject.right
                }
                ny = ls.y < 0
                if (ny) {
                    ay = mirrorObject.up
                }
                nz = ls.z < 0
                if (nz) {
                    az = mirrorObject.forward
                }
                if (nx || ny || nz) {
                    break
                }

                mirrorObject = mirrorObject.parent || undefined
            }
        }

        for (let i = 0; i < this.m_ParticleTrees.size(); ++i) {
            this.ApplyParticlesToTransformsForTree(this.m_ParticleTrees[i], ax, ay, az, nx, ny, nz)
        }
    }

    private ApplyParticlesToTransformsForTree(
        pt: ParticleTree,
        ax: Vector3,
        ay: Vector3,
        az: Vector3,
        nx: boolean,
        ny: boolean,
        nz: boolean,
    ): void {
        for (let i = 1; i < pt.m_Particles.size(); ++i) {
            const p = pt.m_Particles[i]
            const p0 = pt.m_Particles[p.m_ParentIndex]

            if (p0.m_ChildCount <= 1) {
                let localPos: Vector3
                if (p.m_TransformNotNull && p.m_Transform) {
                    localPos = p.m_Transform.localPosition
                } else {
                    localPos = p.m_EndOffset
                }
                const v0 = p0.m_Transform!.TransformDirection(localPos)
                let v1 = p.m_Position.sub(p0.m_Position)

                if (nx) {
                    v1 = DynamicBones.MirrorVector(v1, ax)
                }
                if (ny) {
                    v1 = DynamicBones.MirrorVector(v1, ay)
                }
                if (nz) {
                    v1 = DynamicBones.MirrorVector(v1, az)
                }

                const rot = Quaternion.FromToRotation(v0, v1)
                p0.m_Transform!.rotation = p0.m_Transform!.rotation.mul(rot)

            }

            if (p.m_TransformNotNull && p.m_Transform) {
                p.m_Transform.position = p.m_Position
            }
        }
    }

    private static SetMatrixColumn(m: Matrix4x4, index: number, v: Vector3): Matrix4x4 {
        m.SetColumn(index, new Vector4(v.x, v.y, v.z, 1))
        return m
    }
}

class PlaneFake {
    normal: Vector3 = Vector3.zero
    point: Vector3 = Vector3.zero

    SetNormalAndPosition(n: Vector3, p: Vector3): void {
        this.normal = new Vector3(n.x, n.y, n.z).normalized
        this.point = new Vector3(p.x, p.y, p.z)
    }

    GetDistanceToPoint(pos: Vector3): number {
        const v = pos.sub(this.point)
        return Vector3.Dot(v, this.normal)
    }
}
