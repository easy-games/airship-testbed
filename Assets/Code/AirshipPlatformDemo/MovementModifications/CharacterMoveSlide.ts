import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

export default class CharacterMoveSlide extends AirshipBehaviour{
    private readonly SlideKey = "Slide";

    private character!:Character;
    private isSlideing = false;

    public slideForce = 10;

    public Awake(): void {
        this.character = this.gameObject.GetAirshipComponent<Character>()!;

        while(this.character.id === undefined || this.character.id < 0){
            task.wait();
        }

        print("Slide Character awake: "+ this.character.id);

        //Locally listen to actions
        if(this.character.IsLocalCharacter()) {
            print("Creating slide action");
            Airship.Input.CreateAction(this.SlideKey, Binding.Key(Key.Q));
            Airship.Input.OnDown(this.SlideKey).Connect((event) => {
                print("setting slide to true");
                this.character.AddCustomMoveData(this.SlideKey, true);
            });
        }

        if(this.character.IsLocalCharacter() || Game.IsServer()) {
            //Listen to custom data and modify movement based on values
            this.character.OnBeginMove.Connect((customMoveData, tick, isReplay) => {
                if(customMoveData.get(this.SlideKey)) {
                    //SLIDEING
                    print("SLIDE");
                    this.character.movement.AddImpulse(
                        this.character.movement.networkTransform.forward.mul(this.slideForce));
                }
            });
        }
    }
}