import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class CharacterMovementModTrigger extends AirshipBehaviour{
    public speedMultiplier = 1;
    public blockSprint = true;
    public blockJump = true;
    
    private activeCharacters: number[] = [];

    public Start(): void {
        Airship.Characters.onCharacterSpawned.Connect((character)=>{
            character.movement.OnAdjustMove((modifier) => {
                if(this.activeCharacters.includes(character.id)){
                    modifier.speedMultiplier *= this.speedMultiplier;
                    modifier.blockSprint =  modifier.blockSprint || this.blockSprint;
                    modifier.blockJump = modifier.blockJump || this.blockJump;
                }
            });
        });
    }

    public OnTriggerEnter(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            this.activeCharacters.push(character.id);
        }
    }

    public OnTriggerExit(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            this.activeCharacters.remove(this.activeCharacters.indexOf(character.id));
        }
    }
}