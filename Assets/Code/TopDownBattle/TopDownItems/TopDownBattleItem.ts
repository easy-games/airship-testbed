import Character from "@Easy/Core/Shared/Character/Character";

export default abstract class TopDownBattleItem extends AirshipBehaviour{
    public character!: Character;

    public abstract UseClient(): undefined;
    public abstract UseServer(): undefined;
}