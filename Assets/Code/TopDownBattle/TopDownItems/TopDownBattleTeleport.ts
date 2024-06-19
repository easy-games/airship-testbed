import TopDownBattleItem from "./TopDownBattleItem"

export default class TopDownBattleTeleport extends TopDownBattleItem{
    public teleportDistance = 3;

    public UseClient(down:Boolean): undefined {
        if(down){
            this.UseServer(down, this.character.lookVector);
        }
    }

    public UseServer(down:Boolean, lookVector: Vector3): undefined {
        if(!down){
            return;
        }

        let movement = this.character.character.movement;
        //Find a valid teleport position
        let heightOffset = new Vector3(0,movement.currentCharacterHeight/2,0);
        let hitInfo = Physics.Raycast(
            movement.transform.position.add(heightOffset), 
            new Vector3(lookVector.x, 0, lookVector.z).normalized,
            this.teleportDistance,
            movement.groundCollisionLayerMask.value);

        let teleportPos =  hitInfo[0] ? hitInfo[1].sub(lookVector.mul(movement.characterRadius)) : 
                             movement.transform.position.add(lookVector.mul(this.teleportDistance))
        print("teleporint from: " + movement.transform.position + " to: " + teleportPos + " loking: " + lookVector);
        movement.Teleport(teleportPos);
    }
}