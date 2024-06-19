import TopDownBattleCharacter from "../TopDownBattleCharacter";

export default abstract class TopDownBattleItem extends AirshipBehaviour{
    protected character!: TopDownBattleCharacter;

    public Awake(): void {
        this.character = this.gameObject.GetAirshipComponent<TopDownBattleCharacter>()!;
    }

    public abstract UseClient(down:Boolean): undefined;
    public abstract UseServer(down:Boolean, lookVector: Vector3): undefined;
}