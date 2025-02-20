export const InternalClothingClassIdToAirId = new Map<string, string>();

const Add = (classId: string, airId: string) => {
	InternalClothingClassIdToAirId.set(classId, airId);
};
