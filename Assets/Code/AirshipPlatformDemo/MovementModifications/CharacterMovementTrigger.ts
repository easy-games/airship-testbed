export default class CharacterMovementTrigger extends AirshipBehaviour{
    private moveData?: CharacterMovementData;

    public Start(): void {
        this.moveData = this.gameObject.GetComponent<CharacterMovementData>();
    }
    
    public OnTriggerEnter(collider: Collider): void {
        print("ON TRIGGER ENTER");
        if(!this.moveData){
            print("No move data");
            return;
        }
        
        let characterMovement = collider.attachedRigidbody?.gameObject.GetComponent<CharacterMovement>();
        
        print("movement: " + characterMovement);
        if(characterMovement){
            print("Setting character movement to " + this.gameObject.name);
            characterMovement.moveData = this.moveData;
        }
    }
}