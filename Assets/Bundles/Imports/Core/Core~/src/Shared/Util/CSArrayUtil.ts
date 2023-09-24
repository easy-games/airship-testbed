/**
 * Set of utilities for working with `CSArray` types.
 */
export class CSArrayUtil {
	/**
	 * Convert a C# array to a native Typescript array.
	 * @param array A C# array.
	 * @returns A native Typescript array.
	 */
	public static Convert<T extends defined>(array: CSArray<T>): Array<T> {
		const newArray: Array<T> = [];
		for (let i = 0; i < array.Length; i++) {
			const value = array.GetValue(i);
			newArray.push(value);
		}
		return newArray;
	}

	/*public static Create<T>(keys: keyof T[], data: T[]): BinaryBlob {
		let blob = new BinaryBlob(array);
		const msg = blob.Decode() as BlobData;

		const blobData: { key: keyof T; value: T }[] = [];
		for(let i=0; i<data.size(); i++){
			blobData[i].key = keys[i];
			blobData[i].value = data[i];
		}
		data.forEach((key, index) => {
		});
		return new BinaryBlob(blobData);
	}*/
}
