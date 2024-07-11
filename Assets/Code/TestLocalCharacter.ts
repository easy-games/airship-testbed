import Character from "@Easy/Core/Shared/Character/Character";

export default class TestLocalCharacter extends AirshipBehaviour {
	override Start(): void {
		const character = this.gameObject.GetAirshipComponent<Character>();
		character?.WaitForInit();
		if (character?.IsLocalCharacter()) {
			print("SUCCESS! local!");
			return;
		}
		print("fail. not local.");
	}

	override OnDestroy(): void {}
}
