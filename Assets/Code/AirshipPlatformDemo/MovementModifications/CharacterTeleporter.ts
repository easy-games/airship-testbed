import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";

export default class CharacterTeleporter extends AirshipBehaviour {

    public targetTeleporter!: CharacterTeleporter;
    
    private key = "Teleport";
    private currentTargets: Map<number, Character> = new Map();
    private recievedTargets: Map<number, Character> = new Map();

    override Awake(): void {
        Airship.Characters.onCharacterSpawned.Connect((character)=>{
            if(character.IsLocalCharacter() || Game.IsServer()){
                //Listen to custom data and modify movement based on values
                character.OnBeginMove.Connect((customMoveData) => {
                    if(customMoveData.get(this.key) && this.currentTargets.has(character.id)
                        && !this.recievedTargets.has(character.id)){
                            print("Teleporting to: " + this.targetTeleporter.gameObject.name);
                            this.currentTargets.delete(character.id);
                        this.targetTeleporter.RecieveTarget(character);
                        character.movement!.Teleport(this.targetTeleporter.transform.position);
                    }
                });
            }
        });
    }

    public OnTriggerEnter(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character && (Game.IsServer() || character?.IsLocalCharacter())){
            this.currentTargets.set(character.id, character);
        }
    }

    public OnTriggerStay(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character && character?.IsLocalCharacter() && this.currentTargets.has(character.id)){
            character.AddCustomMoveData(this.key, true);
        }
    }

    public OnTriggerExit(collider: Collider): void {
        let character = collider.attachedRigidbody?.gameObject.GetAirshipComponent<Character>();
        if(character && (Game.IsServer() || character?.IsLocalCharacter())){
            this.currentTargets.delete(character.id);
            this.recievedTargets.delete(character.id);
        }
    }

    public RecieveTarget(character: Character){
        this.recievedTargets.set(character.id, character);
    }
}
