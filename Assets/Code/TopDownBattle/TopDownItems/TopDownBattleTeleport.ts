import TopDownBattleItem from "./TopDownBattleItem"

export default class TopDownBattleTeleport extends TopDownBattleItem{
    public teleportDistance = 3;
    public UseClient(): undefined {

    }

    public UseServer(): undefined {
        //Find a valid teleport position
        let lookDir = this.character.movement.GetLookVector().normalized;
        let hitInfo = Physics.Raycast(
            this.character.movement.transform.position.add(new Vector3(0,this.character.movement.currentCharacterHeight/2,0)), 
            new Vector3(lookDir.x, 0, lookDir.z).normalized,
            this.teleportDistance,
            this.character.movement.groundCollisionLayerMask.value);

        this.character.movement.Teleport(
            hitInfo[0] ? 
            hitInfo[1] : 
            this.character.movement.transform.position.add(lookDir).mul(this.teleportDistance));
    }
}