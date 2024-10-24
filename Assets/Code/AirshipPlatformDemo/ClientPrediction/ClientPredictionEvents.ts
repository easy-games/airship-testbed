import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal"
import { Signal } from "@Easy/Core/Shared/Util/Signal"

export const PredictionEvents = {
	OnTestPrediction: new NetworkSignal<[number]>("OnTestPrediction"),
}