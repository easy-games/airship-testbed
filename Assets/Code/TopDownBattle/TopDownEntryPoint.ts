import TopDownBattleGame from "./TopDownBattleGame";

//There is only one game class so expose it for anyone to access
export const TopDownBattle: TopDownBattleGame =
  GameObject.Find("GameManager").GetAirshipComponent<TopDownBattleGame>()!;