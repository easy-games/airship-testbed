export interface InternalClothingMeta {
	classId: string;
	airId: string;
	slot: AccessorySlot | undefined;
	faceDecal?: boolean;
}

export const InternalClothingMeta = new Map<string, InternalClothingMeta>();

const Add = (airId: string, metas: Omit<InternalClothingMeta, "airId">[]) => {
	for (let meta of metas) {
		let m = meta as InternalClothingMeta;
		m.airId = airId;
		InternalClothingMeta.set(m.classId, m);
	}
};

// Box Boy
Add("555f157a-963d-416e-a3a7-0eb99b39d4cf", [
	{ classId: "b84b86d3-b11c-4b6e-b245-f202f33f06da", slot: AccessorySlot.Feet },
	{ classId: "ffbc21f2-f977-4452-bb98-43064890f0b8", slot: AccessorySlot.Head },
	{ classId: "804f5da6-3d65-4532-b57c-8a068a3301fa", slot: AccessorySlot.Torso },
	{ classId: "14f57239-2264-465c-9346-fa6654a2d6f1", slot: AccessorySlot.Hands },
]);
