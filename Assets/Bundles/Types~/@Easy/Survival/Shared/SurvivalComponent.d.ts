/// <reference types="@easy-games/compiler-types" />
import Character from "@Easy/Core/Shared/Character/Character";
import { TestParam } from "./TestModule";
export default class SurvivalComponent extends AirshipBehaviour {
    Start(): void;
    OnDestroy(): void;
    TestMethod(test: TestParam, character: Character): void;
}
