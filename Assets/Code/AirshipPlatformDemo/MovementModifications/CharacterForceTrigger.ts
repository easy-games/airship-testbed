import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { OnTick } from "@Easy/Core/Shared/Util/Timer";

export default class CharacterForceTrigger extends AirshipBehaviour{
    public forceSpace = Space.Self;
    public triggerForce = Vector3.up;
    public continuous = false;

    private currentTargets: Map<number, Character> = new Map();

    public Awake(): void {
        Airship.Characters.onCharacterSpawned.Connect((character)=>{
            if(Game.IsClient() && !character.IsLocalCharacter()){
                return;
            }

            //Locally we want to refresh our colliders during replays
            character.movement.OnPreMove((isReplay)=>{
                if(this.currentTargets.has(character.id)){
                    this.ApplyForce(character);
                }
            });
        });
    }

    public OnTriggerEnter(collider: Collider): void {
        if(!Game.IsServer()){
            return;
        }
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            if(this.continuous){
                this.currentTargets.set(character.id, character);
            }else{
                this.ApplyForce(character);
            }
        }
    }

    public OnTriggerExit(collider: Collider): void {
        if(!Game.IsServer()){
            return;
        }
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character){
            if(this.continuous){
                this.currentTargets.delete(character.id);
            }
        }
    }

    private ApplyForce(character: Character){
        let force = this.forceSpace === Space.Self ?
            this.transform.TransformVector(this.triggerForce) : 
            this.triggerForce;
        
        character.movement.AddImpulse(force);
    }
}