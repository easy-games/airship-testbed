import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

export default class CharacterMoveSlide extends AirshipBehaviour{
    private readonly SlideKey = "Slide";

    private character!:Character;
    private slideStartTime = 0;

    public slideForce = 10;
    public slideDurationInSeconds = .5;
    

    public Awake(): void {
        this.character = this.gameObject.GetAirshipComponent<Character>()!;
        this.character.WaitForInit();

        //Locally listen to actions
        if(this.character.IsLocalCharacter()) {
            Airship.Input.CreateAction(this.SlideKey, Binding.Key(Key.Q));
        }

        if(this.character.IsLocalCharacter() || Game.IsServer()) {
            //Listen to custom data and modify movement based on values
            this.character.OnBeginMove.Connect((customMoveData, inputData, tick, isReplay) => {
                if(customMoveData.get(this.SlideKey)) {
                    this.Slide(inputData.moveDir);
                }else{
                    this.StopSlide()
                }
            });
        }
    }

    public Update(dt: number): void {
        if(this.character.IsLocalCharacter()) {
            if(Airship.Input.IsDown(this.SlideKey)){
                this.character.AddCustomMoveData(this.SlideKey, true);
            }
        }
    }

    private Slide(dir: Vector3){
        let characterState = this.character.movement.GetState();
        
        if(this.slideStartTime <= 0){
            //Starting Slide
            print("Starting Slide");
            this.slideStartTime = Time.time;
        }        
        
        if((Time.time - this.slideStartTime) <= this.slideDurationInSeconds &&
            (characterState === CharacterState.Running || characterState === CharacterState.Sprinting)){
            //Slide
            this.character.movement.AddImpulse(dir.mul(this.slideForce));
        }

    }

    private StopSlide(){
        if(this.slideStartTime > 0){
            print("Stopping Slide");
            this.slideStartTime = -1;
        }
    }
}