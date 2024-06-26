export enum AirshipProductResourceType {
	GAME = "GAME",
	ORGANIZATION = "ORGANIZATION",
}

/** Describes a product as configured on the create dashboard. */
export interface AirshipProduct {
	id: string;
	resourceId: string;
	resourceType: AirshipProductResourceType;
	name: string;
	price: number;
	unique: boolean;
	giftable: boolean;
	createdAt: string;
}

/** Describes a transaction that has been authorized by a user. */
export interface AirshipPurchaseReceipt {
	/** ID of the transaction. Equivalent to receiptId */
	id: string;
	/** The user who paid for this product. */
	purchaserUid: string;
	/** The user who is receiving this product. */
	receiverUid: string;
	/** The price of the product at the time of purchase. */
	price: number;
	/** The quantity of product purchased. */
	quantity: number;
	/** The total price paid by the purchaser. */
	total: number;
	/** The ID of the product that was purchased. */
	productId: string;
	/** The time the transaction was authorized by the user as an ISO timestamp. */
	createdAt: string;
}
