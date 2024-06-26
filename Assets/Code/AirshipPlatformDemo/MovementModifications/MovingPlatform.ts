export default class MovingPlatformController extends AirshipBehaviour{
    public rigid!:Rigidbody;
    public targets: Transform[] = [];
    public moveSpeed: number = .1;
    public hitTargetMargin = .01;
    public stopAtTargetDuration = 0;
    public easeOut = true;
    public loop = true;

    private currentTargetI = 0;
    private lastHitTime = 0;
    private stopped = false;
    private targetDistance = 0;

    public Awake(): void {
        if(!this.rigid){
            this.rigid = this.gameObject.GetComponent<Rigidbody>()!;
        }
    }

    public FixedUpdate(dt: number): void {
        if(this.stopped){
            if(Time.time - this.lastHitTime > this.stopAtTargetDuration){
                this.stopped = false;
            }else{
                return;
            }
        }

        let targetPos = this.targets[this.currentTargetI].position;
        let distance = Vector3.Distance(targetPos, this.transform.position);
        if(distance < this.hitTargetMargin){
            this.HitTarget();
        }else{
            this.rigid.AddForce((targetPos.sub(this.transform.position)).normalized.mul(this.moveSpeed), ForceMode.Acceleration);
        }
    }

    public HitTarget(){
        this.lastHitTime = Time.time;
        if(this.stopAtTargetDuration > 0){
            this.rigid.velocity = Vector3.zero;
        }
        let prevI = this.currentTargetI;
        this.currentTargetI++;
        if(this.currentTargetI >= this.targets.size()){
            this.currentTargetI = 0;
        }
        this.targetDistance = Mathf.Max(1, Vector3.Distance(this.targets[this.currentTargetI].position, this.targets[prevI].position));
    }
}