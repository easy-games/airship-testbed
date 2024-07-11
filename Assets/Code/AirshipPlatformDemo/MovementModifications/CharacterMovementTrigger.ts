export default class CharacterMovementDataTrigger extends AirshipBehaviour{
    private moveData?: CharacterMovementData;

    public Start(): void {
        this.moveData = this.gameObject.GetComponent<CharacterMovementData>();
    }
    
    public OnTriggerEnter(collider: Collider): void {
        if(!this.moveData){
            return;
        }
        
        let characterMovement = collider.attachedRigidbody?.gameObject.GetComponent<CharacterMovement>();
        
        if(characterMovement){
            characterMovement.moveData = this.moveData;
        }
    }
}