import { DataStoreServiceData, DataStoreServicePrisma } from "../../TypePackages/data-store-types";

export type AirshipDataStoreLockMode = DataStoreServicePrisma.BlobLockMode;
export type AirshipDataStoreLockInfo = DataStoreServiceData.IsDataLocked;
