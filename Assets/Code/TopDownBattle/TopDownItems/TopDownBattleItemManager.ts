import { Bin } from "@Easy/Core/Shared/Util/Bin";
import TopDownBattleEnergyAttack from "./TopDownBattleEnergyAttack";
import TopDownBattleTeleport from "./TopDownBattleTeleport";
import { Airship } from "@Easy/Core/Shared/Airship";
import TopDownBattleItem from "./TopDownBattleItem";

export default class TopDownBattleItemManager extends AirshipBehaviour{
    private energyAttackItem!: TopDownBattleEnergyAttack;
    private teleportItem!: TopDownBattleTeleport;

    private bin:Bin = new Bin();
    
    public Start(): void {
        this.energyAttackItem = this.gameObject.GetAirshipComponent<TopDownBattleEnergyAttack>()!;
        this.teleportItem = this.gameObject.GetAirshipComponent<TopDownBattleTeleport>()!;
        
        this.RegisterItem("UseItem", this.energyAttackItem);
        this.RegisterItem("SecondaryUseItem", this.teleportItem);
    }

    private RegisterItem(actionName: string, item: TopDownBattleItem){
        this.bin.Add(Airship.input.OnDown(actionName).Connect((event)=>{
            print("OnDown: " + actionName);
            item.UseClient(true);
        }));
        this.bin.Add(Airship.input.OnUp(actionName).Connect((event)=>{
            print("OnUp: " + actionName);
            item.UseClient(false);
        }));
    }
}