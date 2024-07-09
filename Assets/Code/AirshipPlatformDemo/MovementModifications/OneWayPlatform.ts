import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";

export default class OneWayPlatform extends AirshipBehaviour{
    public activeGo!: GameObject;
    public inactiveGo!: GameObject;

    private collider!:Collider;

    public Awake(): void {
        this.collider = this.gameObject.GetComponentInChildren<Collider>();
        Airship.Characters.onCharacterSpawned.Connect((character)=>{
            if(Game.IsServer() || !character.IsLocalCharacter()){
                return;
            }

            //Locally we want to refresh our colliders during replays
            character.movement.OnBeginMove((isReplay)=>{
                if(isReplay){
                    this.RefreshForCharacter(character);
                }
            });
        });
    }

    public LateUpdate(dt: number): void {
        Airship.Characters.GetCharacters().forEach((character)=>{
            if(!Game.IsServer() && character.IsInitialized() && !character.IsLocalCharacter()){
                return;
            }
            this.RefreshForCharacter(character);
        });
    }

    private RefreshForCharacter(character: Character){
        let characterIsBelow = character.transform.position.y < this.transform.position.y;
        this.activeGo.SetActive(!characterIsBelow);
        this.inactiveGo.SetActive(characterIsBelow);
        //print("Characer Y:  "+ character.transform.position.y + " platform Y: " + this.transform.position.y + " characterIsBelow: " + characterIsBelow);
        character.movement.IgnoreGroundCollider(this.collider, characterIsBelow);
        Physics.IgnoreCollision(this.collider, character.movement.mainCollider, characterIsBelow);
    }
}