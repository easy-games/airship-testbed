import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { Network } from "Code/Network";

export default class CharacterMovementTestKeys extends AirshipBehaviour {
	public impulseKey = Key.Z;
	public teleportKey = Key.X;
	public lookDirKey = Key.C;

	public maxImpulse = Vector3.one;

	public fireOnServer = false;

	protected Awake(): void {
		if(Game.IsClient()){
			Airship.Input.CreateAction("ImpulseTest", Binding.Key(this.impulseKey));
			Airship.Input.CreateAction("TeleportTest", Binding.Key(this.teleportKey));
			Airship.Input.CreateAction("LookDirTest", Binding.Key(this.lookDirKey));
	
			Airship.Input.OnDown("ImpulseTest").Connect(()=>{
				//IMPULSING
				if(this.fireOnServer){
					//Send to server
					Network.ClientToServer.TestMovement.client.FireServer(0);
				}else{
					this.ImpulseTest();
				}
			})
	
			Airship.Input.OnDown("TeleportTest").Connect(()=>{
				//TELEPORTING
				if(this.fireOnServer){
					//Send to server
					Network.ClientToServer.TestMovement.client.FireServer(1);
				}else{
					this.TeleportTest();
				}
			})
	
			Airship.Input.OnDown("LookDirTest").Connect(()=>{
				//LOOKING
				if(this.fireOnServer){
					//Send to server
					Network.ClientToServer.TestMovement.client.FireServer(2);
				}else{
					this.LookTest();
				}
			})
		}else {
			Network.ClientToServer.TestMovement.server.OnClientEvent((player, actionType)=>{
				switch(actionType){
					case 0: 
						this.ImpulseTest();
						break;
					case 1: 
						this.TeleportTest();
						break;
					case 2: 
						this.LookTest();
						break;
				}
			});
		}
	}

	private ImpulseTest(){
		Airship.Characters.GetCharacters().forEach((character)=>{
			character.movement.SetImpulse(new Vector3(MathUtil.RandomFloat(-1,1) * this.maxImpulse.x, 1* this.maxImpulse.y, MathUtil.RandomFloat(-1,1)* this.maxImpulse.z));
		})
	}

	private TeleportTest(){
		Airship.Characters.GetCharacters().forEach((character)=>{
			character.movement.TeleportAndLook(
				new Vector3(MathUtil.RandomFloat(-1,1) * this.maxImpulse.x, 1* this.maxImpulse.y, MathUtil.RandomFloat(-1,1)* this.maxImpulse.z),
				new Vector3(MathUtil.RandomFloat(-1,1), MathUtil.RandomFloat(-1,1), MathUtil.RandomFloat(-1,1))
			);
		});
	}

	private LookTest(){
		Airship.Characters.GetCharacters().forEach((character)=>{
			character.movement.SetLookVector(
				new Vector3(MathUtil.RandomFloat(-1,1), MathUtil.RandomFloat(-1,1), MathUtil.RandomFloat(-1,1))
			);
		});
	}
}
