import { Airship } from "@Easy/Core/Shared/Airship";
import { Layer } from "@Easy/Core/Shared/Util/Layer";

export default class OneWayPlatform extends AirshipBehaviour{
    private collider!:Collider;

    public Awake(): void {
        this.collider = this.gameObject.GetComponentInChildren<Collider>();
    }

    public LateUpdate(dt: number): void {
        Airship.characters.GetCharacters().forEach((character)=>{
            let characterIsBelow = character.transform.position.y < this.transform.position.y;
            //print("Characer Y:  "+ character.transform.position.y + " platform Y: " + this.transform.position.y + " characterIsBelow: " + characterIsBelow);
            character.movement.IgnoreGroundCollider(this.collider, characterIsBelow);
            Physics.IgnoreCollision(this.collider, character.movement.mainCollider, characterIsBelow);
        });
    }
}