import Character from "@Easy/Core/Shared/Character/Character";

export default class CharacterForceTrigger extends AirshipBehaviour{
    public forceSpace = Space.Self;
    public triggerForce = Vector3.up;
    public continuous = false;

    private currentTargets: Character[] =  [];
    public FixedUpdate(dt: number): void {
        this.currentTargets.forEach(character => {
            this.ApplyForce(character);
        });
    }

    public OnTriggerEnter(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            if(this.continuous){
                this.currentTargets.push(character);
            }else{
                this.ApplyForce(character);
            }
        }
    }

    public OnTriggerExit(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            if(this.continuous){
                this.currentTargets.remove(this.currentTargets.indexOf(character));
            }
        }
    }

    private ApplyForce(character: Character){
        let force = this.forceSpace === Space.Self ?
            this.transform.TransformVector(this.triggerForce) : 
            this.triggerForce;
        
        character.movement.ApplyImpulse(force);
    }
}