export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: string; output: string };
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any };
  /**
   * ISO 8601 calendar date without timezone.
   * Format: %Y-%m-%d
   *
   * # Examples
   *
   * * `1994-11-13`
   * * `2000-02-24`
   */
  NaiveDate: { input: string; output: string };
  /**
   * ISO 8601 combined date and time without timezone.
   *
   * # Examples
   *
   * * `2015-07-01T08:59:60.123`,
   */
  NaiveDateTime: { input: string; output: string };
};

export type AbbreviationFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  text?: InputMaybe<StringFilterInput>;
};

export type AbbreviationNode = {
  __typename: 'AbbreviationNode';
  expansion: Scalars['String']['output'];
  id: Scalars['String']['output'];
  text: Scalars['String']['output'];
};

export type AccountBlocked = AuthTokenErrorInterface & {
  __typename: 'AccountBlocked';
  description: Scalars['String']['output'];
  timeoutRemaining: Scalars['Int']['output'];
};

export type ActiveEncounterEventFilterInput = {
  data?: InputMaybe<StringFilterInput>;
  /**
   * Only include events that are for the current encounter, i.e. have matching encounter type
   * and matching encounter name of the current encounter. If not set all events with matching
   * encounter type are returned.
   */
  isCurrentEncounter?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<EqualFilterStringInput>;
};

export type ActivityLogConnector = {
  __typename: 'ActivityLogConnector';
  nodes: Array<ActivityLogNode>;
  totalCount: Scalars['Int']['output'];
};

export type ActivityLogFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  recordId?: InputMaybe<EqualFilterStringInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<EqualFilterActivityLogTypeInput>;
  userId?: InputMaybe<EqualFilterStringInput>;
};

export type ActivityLogNode = {
  __typename: 'ActivityLogNode';
  datetime: Scalars['DateTime']['output'];
  from?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  recordId?: Maybe<Scalars['String']['output']>;
  store?: Maybe<StoreNode>;
  storeId?: Maybe<Scalars['String']['output']>;
  to?: Maybe<Scalars['String']['output']>;
  type: ActivityLogNodeType;
  user?: Maybe<UserNode>;
};

export enum ActivityLogNodeType {
  AssetCatalogueItemCreated = 'ASSET_CATALOGUE_ITEM_CREATED',
  AssetCatalogueItemPropertyCreated = 'ASSET_CATALOGUE_ITEM_PROPERTY_CREATED',
  AssetCreated = 'ASSET_CREATED',
  AssetDeleted = 'ASSET_DELETED',
  AssetLogCreated = 'ASSET_LOG_CREATED',
  AssetLogReasonCreated = 'ASSET_LOG_REASON_CREATED',
  AssetLogReasonDeleted = 'ASSET_LOG_REASON_DELETED',
  AssetPropertyCreated = 'ASSET_PROPERTY_CREATED',
  AssetUpdated = 'ASSET_UPDATED',
  DemographicIndicatorCreated = 'DEMOGRAPHIC_INDICATOR_CREATED',
  DemographicIndicatorUpdated = 'DEMOGRAPHIC_INDICATOR_UPDATED',
  DemographicProjectionCreated = 'DEMOGRAPHIC_PROJECTION_CREATED',
  DemographicProjectionUpdated = 'DEMOGRAPHIC_PROJECTION_UPDATED',
  InventoryAdjustment = 'INVENTORY_ADJUSTMENT',
  InvoiceCreated = 'INVOICE_CREATED',
  InvoiceDeleted = 'INVOICE_DELETED',
  InvoiceNumberAllocated = 'INVOICE_NUMBER_ALLOCATED',
  InvoiceStatusAllocated = 'INVOICE_STATUS_ALLOCATED',
  InvoiceStatusCancelled = 'INVOICE_STATUS_CANCELLED',
  InvoiceStatusDelivered = 'INVOICE_STATUS_DELIVERED',
  InvoiceStatusPicked = 'INVOICE_STATUS_PICKED',
  InvoiceStatusReceived = 'INVOICE_STATUS_RECEIVED',
  InvoiceStatusShipped = 'INVOICE_STATUS_SHIPPED',
  InvoiceStatusVerified = 'INVOICE_STATUS_VERIFIED',
  ItemVariantCreated = 'ITEM_VARIANT_CREATED',
  ItemVariantDeleted = 'ITEM_VARIANT_DELETED',
  ItemVariantUpdatedName = 'ITEM_VARIANT_UPDATED_NAME',
  ItemVariantUpdateColdStorageType = 'ITEM_VARIANT_UPDATE_COLD_STORAGE_TYPE',
  ItemVariantUpdateDosePerUnit = 'ITEM_VARIANT_UPDATE_DOSE_PER_UNIT',
  ItemVariantUpdateManufacturer = 'ITEM_VARIANT_UPDATE_MANUFACTURER',
  ItemVariantUpdateVvmType = 'ITEM_VARIANT_UPDATE_VVM_TYPE',
  PrescriptionCreated = 'PRESCRIPTION_CREATED',
  PrescriptionDeleted = 'PRESCRIPTION_DELETED',
  PrescriptionStatusCancelled = 'PRESCRIPTION_STATUS_CANCELLED',
  PrescriptionStatusPicked = 'PRESCRIPTION_STATUS_PICKED',
  PrescriptionStatusVerified = 'PRESCRIPTION_STATUS_VERIFIED',
  ProgramCreated = 'PROGRAM_CREATED',
  ProgramUpdated = 'PROGRAM_UPDATED',
  QuantityForLineHasBeenSetToZero = 'QUANTITY_FOR_LINE_HAS_BEEN_SET_TO_ZERO',
  Repack = 'REPACK',
  RequisitionApproved = 'REQUISITION_APPROVED',
  RequisitionCreated = 'REQUISITION_CREATED',
  RequisitionDeleted = 'REQUISITION_DELETED',
  RequisitionNumberAllocated = 'REQUISITION_NUMBER_ALLOCATED',
  RequisitionStatusFinalised = 'REQUISITION_STATUS_FINALISED',
  RequisitionStatusSent = 'REQUISITION_STATUS_SENT',
  RnrFormCreated = 'RNR_FORM_CREATED',
  RnrFormFinalised = 'RNR_FORM_FINALISED',
  RnrFormUpdated = 'RNR_FORM_UPDATED',
  SensorLocationChanged = 'SENSOR_LOCATION_CHANGED',
  StocktakeCreated = 'STOCKTAKE_CREATED',
  StocktakeDeleted = 'STOCKTAKE_DELETED',
  StocktakeStatusFinalised = 'STOCKTAKE_STATUS_FINALISED',
  StockBatchChange = 'STOCK_BATCH_CHANGE',
  StockCostPriceChange = 'STOCK_COST_PRICE_CHANGE',
  StockExpiryDateChange = 'STOCK_EXPIRY_DATE_CHANGE',
  StockLocationChange = 'STOCK_LOCATION_CHANGE',
  StockOffHold = 'STOCK_OFF_HOLD',
  StockOnHold = 'STOCK_ON_HOLD',
  StockSellPriceChange = 'STOCK_SELL_PRICE_CHANGE',
  UserLoggedIn = 'USER_LOGGED_IN',
  VaccinationCreated = 'VACCINATION_CREATED',
  VaccinationDeleted = 'VACCINATION_DELETED',
  VaccinationUpdated = 'VACCINATION_UPDATED',
  VaccineCourseCreated = 'VACCINE_COURSE_CREATED',
  VaccineCourseUpdated = 'VACCINE_COURSE_UPDATED',
  VvmStatusLogUpdated = 'VVM_STATUS_LOG_UPDATED',
}

export type ActivityLogResponse = ActivityLogConnector;

export enum ActivityLogSortFieldInput {
  ActivityLogType = 'activityLogType',
  Id = 'id',
  RecordId = 'recordId',
  UserId = 'userId',
}

export type ActivityLogSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ActivityLogSortFieldInput;
};

export type AddFromMasterListError = {
  __typename: 'AddFromMasterListError';
  error: AddFromMasterListErrorInterface;
};

export type AddFromMasterListErrorInterface = {
  description: Scalars['String']['output'];
};

export type AddFromMasterListInput = {
  masterListId: Scalars['String']['input'];
  requestRequisitionId: Scalars['String']['input'];
};

export type AddFromMasterListResponse =
  | AddFromMasterListError
  | RequisitionLineConnector;

export type AddToInboundShipmentFromMasterListError = {
  __typename: 'AddToInboundShipmentFromMasterListError';
  error: AddToInboundShipmentFromMasterListErrorInterface;
};

export type AddToInboundShipmentFromMasterListErrorInterface = {
  description: Scalars['String']['output'];
};

export type AddToInboundShipmentFromMasterListResponse =
  | AddToInboundShipmentFromMasterListError
  | InvoiceLineConnector;

export type AddToOutboundShipmentFromMasterListError = {
  __typename: 'AddToOutboundShipmentFromMasterListError';
  error: AddToOutboundShipmentFromMasterListErrorInterface;
};

export type AddToOutboundShipmentFromMasterListErrorInterface = {
  description: Scalars['String']['output'];
};

export type AddToOutboundShipmentFromMasterListResponse =
  | AddToOutboundShipmentFromMasterListError
  | InvoiceLineConnector;

export type AddToShipmentFromMasterListInput = {
  masterListId: Scalars['String']['input'];
  shipmentId: Scalars['String']['input'];
};

export type AdjustmentReasonNotProvided =
  InsertInventoryAdjustmentErrorInterface &
    InsertStockLineErrorInterface &
    InsertStocktakeLineErrorInterface &
    UpdateStocktakeLineErrorInterface & {
      __typename: 'AdjustmentReasonNotProvided';
      description: Scalars['String']['output'];
    };

export type AdjustmentReasonNotValid = InsertStocktakeLineErrorInterface &
  UpdateStocktakeLineErrorInterface & {
    __typename: 'AdjustmentReasonNotValid';
    description: Scalars['String']['output'];
  };

export enum AdjustmentTypeInput {
  Addition = 'ADDITION',
  Reduction = 'REDUCTION',
}

export type AllocateOutboundShipmentUnallocatedLineError = {
  __typename: 'AllocateOutboundShipmentUnallocatedLineError';
  error: AllocateOutboundShipmentUnallocatedLineErrorInterface;
};

export type AllocateOutboundShipmentUnallocatedLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type AllocateOutboundShipmentUnallocatedLineNode = {
  __typename: 'AllocateOutboundShipmentUnallocatedLineNode';
  deletes: Array<DeleteResponse>;
  inserts: InvoiceLineConnector;
  issuedExpiringSoonStockLines: StockLineConnector;
  skippedExpiredStockLines: StockLineConnector;
  skippedOnHoldStockLines: StockLineConnector;
  skippedUnusableVvmStatusLines: StockLineConnector;
  updates: InvoiceLineConnector;
};

export type AllocateOutboundShipmentUnallocatedLineResponse =
  | AllocateOutboundShipmentUnallocatedLineError
  | AllocateOutboundShipmentUnallocatedLineNode;

export type AllocateOutboundShipmentUnallocatedLineResponseWithId = {
  __typename: 'AllocateOutboundShipmentUnallocatedLineResponseWithId';
  id: Scalars['String']['output'];
  response: AllocateOutboundShipmentUnallocatedLineResponse;
};

export type AllocateProgramNumberInput = {
  numberName: Scalars['String']['input'];
};

export type AllocateProgramNumberResponse = NumberNode;

export enum ApplyToLinesInput {
  AssignIfNone = 'ASSIGN_IF_NONE',
  AssignToAll = 'ASSIGN_TO_ALL',
  None = 'NONE',
  UpdateExistingDonor = 'UPDATE_EXISTING_DONOR',
}

export type AssetCatalogueItemConnector = {
  __typename: 'AssetCatalogueItemConnector';
  nodes: Array<AssetCatalogueItemNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetCatalogueItemFilterInput = {
  category?: InputMaybe<StringFilterInput>;
  categoryId?: InputMaybe<EqualFilterStringInput>;
  class?: InputMaybe<StringFilterInput>;
  classId?: InputMaybe<EqualFilterStringInput>;
  code?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  manufacturer?: InputMaybe<StringFilterInput>;
  model?: InputMaybe<StringFilterInput>;
  search?: InputMaybe<StringFilterInput>;
  subCatalogue?: InputMaybe<StringFilterInput>;
  type?: InputMaybe<StringFilterInput>;
  typeId?: InputMaybe<EqualFilterStringInput>;
};

export type AssetCatalogueItemNode = {
  __typename: 'AssetCatalogueItemNode';
  assetCategory?: Maybe<AssetCategoryNode>;
  assetCategoryId: Scalars['String']['output'];
  assetClass?: Maybe<AssetClassNode>;
  assetClassId: Scalars['String']['output'];
  assetType?: Maybe<AssetTypeNode>;
  assetTypeId: Scalars['String']['output'];
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  manufacturer?: Maybe<Scalars['String']['output']>;
  model: Scalars['String']['output'];
  properties: Scalars['String']['output'];
  subCatalogue: Scalars['String']['output'];
};

export type AssetCatalogueItemResponse = AssetCatalogueItemNode | NodeError;

export enum AssetCatalogueItemSortFieldInput {
  Catalogue = 'catalogue',
  Code = 'code',
  Manufacturer = 'manufacturer',
  Model = 'model',
}

export type AssetCatalogueItemSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: AssetCatalogueItemSortFieldInput;
};

export type AssetCatalogueItemsResponse = AssetCatalogueItemConnector;

export type AssetCatalogueMutations = {
  __typename: 'AssetCatalogueMutations';
  deleteAssetCatalogueItem: DeleteAssetCatalogueItemResponse;
  insertAssetCatalogueItem: InsertAssetCatalogueItemResponse;
};

export type AssetCatalogueMutationsDeleteAssetCatalogueItemArgs = {
  assetCatalogueItemId: Scalars['String']['input'];
};

export type AssetCatalogueMutationsInsertAssetCatalogueItemArgs = {
  input: InsertAssetCatalogueItemInput;
  storeId: Scalars['String']['input'];
};

export type AssetCategoriesResponse = AssetCategoryConnector;

export type AssetCategoryConnector = {
  __typename: 'AssetCategoryConnector';
  nodes: Array<AssetCategoryNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetCategoryFilterInput = {
  classId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type AssetCategoryNode = {
  __typename: 'AssetCategoryNode';
  classId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AssetCategoryResponse = AssetCategoryNode | NodeError;

export enum AssetCategorySortFieldInput {
  Name = 'name',
}

export type AssetCategorySortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: AssetCategorySortFieldInput;
};

export type AssetClassConnector = {
  __typename: 'AssetClassConnector';
  nodes: Array<AssetClassNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetClassFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type AssetClassNode = {
  __typename: 'AssetClassNode';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AssetClassResponse = AssetClassNode | NodeError;

export enum AssetClassSortFieldInput {
  Name = 'name',
}

export type AssetClassSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: AssetClassSortFieldInput;
};

export type AssetClassesResponse = AssetClassConnector;

export type AssetConnector = {
  __typename: 'AssetConnector';
  nodes: Array<AssetNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetFilterInput = {
  assetNumber?: InputMaybe<StringFilterInput>;
  catalogueItemId?: InputMaybe<EqualFilterStringInput>;
  categoryId?: InputMaybe<EqualFilterStringInput>;
  classId?: InputMaybe<EqualFilterStringInput>;
  functionalStatus?: InputMaybe<EqualFilterStatusInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  installationDate?: InputMaybe<DateFilterInput>;
  isNonCatalogue?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<StringFilterInput>;
  replacementDate?: InputMaybe<DateFilterInput>;
  serialNumber?: InputMaybe<StringFilterInput>;
  storeCodeOrName?: InputMaybe<StringFilterInput>;
  storeId?: InputMaybe<StringFilterInput>;
  typeId?: InputMaybe<EqualFilterStringInput>;
};

export type AssetLogConnector = {
  __typename: 'AssetLogConnector';
  nodes: Array<AssetLogNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetLogFilterInput = {
  assetId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  logDatetime?: InputMaybe<DatetimeFilterInput>;
  reasonId?: InputMaybe<EqualFilterStringInput>;
  status?: InputMaybe<EqualFilterStatusInput>;
  user?: InputMaybe<StringFilterInput>;
};

export type AssetLogNode = {
  __typename: 'AssetLogNode';
  assetId: Scalars['String']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  documents: SyncFileReferenceConnector;
  id: Scalars['String']['output'];
  logDatetime: Scalars['NaiveDateTime']['output'];
  reason?: Maybe<AssetLogReasonNode>;
  status?: Maybe<StatusType>;
  type?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UserNode>;
};

export type AssetLogReasonConnector = {
  __typename: 'AssetLogReasonConnector';
  nodes: Array<AssetLogReasonNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetLogReasonFilterInput = {
  assetLogStatus?: InputMaybe<EqualFilterStatusInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  reason?: InputMaybe<StringFilterInput>;
};

export type AssetLogReasonMutations = {
  __typename: 'AssetLogReasonMutations';
  deleteLogReason: DeleteAssetLogReasonResponse;
  insertAssetLogReason: InsertAssetLogReasonResponse;
};

export type AssetLogReasonMutationsDeleteLogReasonArgs = {
  reasonId: Scalars['String']['input'];
};

export type AssetLogReasonMutationsInsertAssetLogReasonArgs = {
  input: InsertAssetLogReasonInput;
};

export type AssetLogReasonNode = {
  __typename: 'AssetLogReasonNode';
  assetLogStatus: StatusType;
  id: Scalars['String']['output'];
  reason: Scalars['String']['output'];
};

export enum AssetLogReasonSortFieldInput {
  Status = 'status',
}

export type AssetLogReasonSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: AssetLogReasonSortFieldInput;
};

export type AssetLogReasonsResponse = AssetLogReasonConnector;

export enum AssetLogSortFieldInput {
  LogDatetime = 'logDatetime',
  Status = 'status',
}

export type AssetLogSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: AssetLogSortFieldInput;
};

export enum AssetLogStatusInput {
  Decommissioned = 'DECOMMISSIONED',
  Functioning = 'FUNCTIONING',
  FunctioningButNeedsAttention = 'FUNCTIONING_BUT_NEEDS_ATTENTION',
  NotFunctioning = 'NOT_FUNCTIONING',
  NotInUse = 'NOT_IN_USE',
  Unserviceable = 'UNSERVICEABLE',
}

export type AssetLogsResponse = AssetLogConnector;

export type AssetNode = {
  __typename: 'AssetNode';
  assetCategory?: Maybe<AssetCategoryNode>;
  assetClass?: Maybe<AssetClassNode>;
  assetNumber?: Maybe<Scalars['String']['output']>;
  assetType?: Maybe<AssetTypeNode>;
  /** Returns a JSON string of the asset catalogue properties e.g {"property_key": "value"} */
  catalogProperties?: Maybe<Scalars['String']['output']>;
  catalogueItem?: Maybe<AssetCatalogueItemNode>;
  catalogueItemId?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['NaiveDateTime']['output'];
  documents: SyncFileReferenceConnector;
  donor?: Maybe<NameNode>;
  donorNameId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  installationDate?: Maybe<Scalars['NaiveDate']['output']>;
  locations: LocationConnector;
  lockedFields: LockedAssetFieldsNode;
  modifiedDatetime: Scalars['NaiveDateTime']['output'];
  needsReplacement?: Maybe<Scalars['Boolean']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  /** Returns a JSON string of the asset properties (defined on the asset itself) e.g {"property_key": "value"} */
  properties: Scalars['String']['output'];
  replacementDate?: Maybe<Scalars['NaiveDate']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  statusLog?: Maybe<AssetLogNode>;
  store?: Maybe<StoreNode>;
  storeId?: Maybe<Scalars['String']['output']>;
  warrantyEnd?: Maybe<Scalars['NaiveDate']['output']>;
  warrantyStart?: Maybe<Scalars['NaiveDate']['output']>;
};

export type AssetNodeDonorArgs = {
  storeId: Scalars['String']['input'];
};

export type AssetParseResponse = AssetNode | ScannedDataParseError;

export type AssetPropertiesResponse = AssetPropertyConnector;

export type AssetPropertyConnector = {
  __typename: 'AssetPropertyConnector';
  nodes: Array<AssetPropertyNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetPropertyFilterInput = {
  assetCategoryId?: InputMaybe<EqualFilterStringInput>;
  assetClassId?: InputMaybe<EqualFilterStringInput>;
  assetTypeId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  key?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type AssetPropertyNode = {
  __typename: 'AssetPropertyNode';
  allowedValues?: Maybe<Scalars['String']['output']>;
  assetCategoryId?: Maybe<Scalars['String']['output']>;
  assetClassId?: Maybe<Scalars['String']['output']>;
  assetTypeId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  valueType: PropertyNodeValueType;
};

export enum AssetSortFieldInput {
  AssetNumber = 'assetNumber',
  InstallationDate = 'installationDate',
  ModifiedDatetime = 'modifiedDatetime',
  ReplacementDate = 'replacementDate',
  SerialNumber = 'serialNumber',
  Store = 'store',
}

export type AssetSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: AssetSortFieldInput;
};

export type AssetTypeConnector = {
  __typename: 'AssetTypeConnector';
  nodes: Array<AssetTypeNode>;
  totalCount: Scalars['Int']['output'];
};

export type AssetTypeFilterInput = {
  categoryId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type AssetTypeNode = {
  __typename: 'AssetTypeNode';
  categoryId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AssetTypeResponse = AssetTypeNode | NodeError;

export enum AssetTypeSortFieldInput {
  Name = 'name',
}

export type AssetTypeSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: AssetTypeSortFieldInput;
};

export type AssetTypesResponse = AssetTypeConnector;

export type AssetsResponse = AssetConnector;

export type AuthToken = {
  __typename: 'AuthToken';
  /** Bearer token */
  token: Scalars['String']['output'];
};

export type AuthTokenError = {
  __typename: 'AuthTokenError';
  error: AuthTokenErrorInterface;
};

export type AuthTokenErrorInterface = {
  description: Scalars['String']['output'];
};

export type AuthTokenResponse = AuthToken | AuthTokenError;

export type BarcodeNode = {
  __typename: 'BarcodeNode';
  gtin: Scalars['String']['output'];
  id: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  manufacturerId?: Maybe<Scalars['String']['output']>;
  packSize?: Maybe<Scalars['Float']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
};

export type BarcodeResponse = BarcodeNode | NodeError;

export type BatchInboundShipmentInput = {
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deleteInboundShipmentLines?: InputMaybe<
    Array<DeleteInboundShipmentLineInput>
  >;
  deleteInboundShipmentServiceLines?: InputMaybe<
    Array<DeleteInboundShipmentServiceLineInput>
  >;
  deleteInboundShipments?: InputMaybe<Array<DeleteInboundShipmentInput>>;
  insertFromInternalOrderLines?: InputMaybe<
    Array<InsertInboundShipmentLineFromInternalOrderLineInput>
  >;
  insertInboundShipmentLines?: InputMaybe<
    Array<InsertInboundShipmentLineInput>
  >;
  insertInboundShipmentServiceLines?: InputMaybe<
    Array<InsertInboundShipmentServiceLineInput>
  >;
  insertInboundShipments?: InputMaybe<Array<InsertInboundShipmentInput>>;
  updateInboundShipmentLines?: InputMaybe<
    Array<UpdateInboundShipmentLineInput>
  >;
  updateInboundShipmentServiceLines?: InputMaybe<
    Array<UpdateInboundShipmentServiceLineInput>
  >;
  updateInboundShipments?: InputMaybe<Array<UpdateInboundShipmentInput>>;
};

export type BatchInboundShipmentResponse = {
  __typename: 'BatchInboundShipmentResponse';
  deleteInboundShipmentLines?: Maybe<
    Array<DeleteInboundShipmentLineResponseWithId>
  >;
  deleteInboundShipmentServiceLines?: Maybe<
    Array<DeleteInboundShipmentServiceLineResponseWithId>
  >;
  deleteInboundShipments?: Maybe<Array<DeleteInboundShipmentResponseWithId>>;
  insertFromInternalOrderLines?: Maybe<
    Array<InsertInboundShipmentLineFromInternalOrderLineResponseWithId>
  >;
  insertInboundShipmentLines?: Maybe<
    Array<InsertInboundShipmentLineResponseWithId>
  >;
  insertInboundShipmentServiceLines?: Maybe<
    Array<InsertInboundShipmentServiceLineResponseWithId>
  >;
  insertInboundShipments?: Maybe<Array<InsertInboundShipmentResponseWithId>>;
  updateInboundShipmentLines?: Maybe<
    Array<UpdateInboundShipmentLineResponseWithId>
  >;
  updateInboundShipmentServiceLines?: Maybe<
    Array<UpdateInboundShipmentServiceLineResponseWithId>
  >;
  updateInboundShipments?: Maybe<Array<UpdateInboundShipmentResponseWithId>>;
};

export type BatchIsReserved = DeleteInboundShipmentLineErrorInterface &
  UpdateInboundShipmentLineErrorInterface & {
    __typename: 'BatchIsReserved';
    description: Scalars['String']['output'];
  };

export type BatchOutboundShipmentInput = {
  allocatedOutboundShipmentUnallocatedLines?: InputMaybe<
    Array<Scalars['String']['input']>
  >;
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deleteOutboundShipmentLines?: InputMaybe<
    Array<DeleteOutboundShipmentLineInput>
  >;
  deleteOutboundShipmentServiceLines?: InputMaybe<
    Array<DeleteOutboundShipmentServiceLineInput>
  >;
  deleteOutboundShipmentUnallocatedLines?: InputMaybe<
    Array<DeleteOutboundShipmentUnallocatedLineInput>
  >;
  deleteOutboundShipments?: InputMaybe<Array<Scalars['String']['input']>>;
  insertOutboundShipmentLines?: InputMaybe<
    Array<InsertOutboundShipmentLineInput>
  >;
  insertOutboundShipmentServiceLines?: InputMaybe<
    Array<InsertOutboundShipmentServiceLineInput>
  >;
  insertOutboundShipmentUnallocatedLines?: InputMaybe<
    Array<InsertOutboundShipmentUnallocatedLineInput>
  >;
  insertOutboundShipments?: InputMaybe<Array<InsertOutboundShipmentInput>>;
  updateOutboundShipmentLines?: InputMaybe<
    Array<UpdateOutboundShipmentLineInput>
  >;
  updateOutboundShipmentServiceLines?: InputMaybe<
    Array<UpdateOutboundShipmentServiceLineInput>
  >;
  updateOutboundShipmentUnallocatedLines?: InputMaybe<
    Array<UpdateOutboundShipmentUnallocatedLineInput>
  >;
  updateOutboundShipments?: InputMaybe<Array<UpdateOutboundShipmentInput>>;
};

export type BatchOutboundShipmentResponse = {
  __typename: 'BatchOutboundShipmentResponse';
  allocateOutboundShipmentUnallocatedLines?: Maybe<
    Array<AllocateOutboundShipmentUnallocatedLineResponseWithId>
  >;
  deleteOutboundShipmentLines?: Maybe<
    Array<DeleteOutboundShipmentLineResponseWithId>
  >;
  deleteOutboundShipmentServiceLines?: Maybe<
    Array<DeleteOutboundShipmentServiceLineResponseWithId>
  >;
  deleteOutboundShipmentUnallocatedLines?: Maybe<
    Array<DeleteOutboundShipmentUnallocatedLineResponseWithId>
  >;
  deleteOutboundShipments?: Maybe<Array<DeleteOutboundShipmentResponseWithId>>;
  insertOutboundShipmentLines?: Maybe<
    Array<InsertOutboundShipmentLineResponseWithId>
  >;
  insertOutboundShipmentServiceLines?: Maybe<
    Array<InsertOutboundShipmentServiceLineResponseWithId>
  >;
  insertOutboundShipmentUnallocatedLines?: Maybe<
    Array<InsertOutboundShipmentUnallocatedLineResponseWithId>
  >;
  insertOutboundShipments?: Maybe<Array<InsertOutboundShipmentResponseWithId>>;
  updateOutboundShipmentLines?: Maybe<
    Array<UpdateOutboundShipmentLineResponseWithId>
  >;
  updateOutboundShipmentServiceLines?: Maybe<
    Array<UpdateOutboundShipmentServiceLineResponseWithId>
  >;
  updateOutboundShipmentUnallocatedLines?: Maybe<
    Array<UpdateOutboundShipmentUnallocatedLineResponseWithId>
  >;
  updateOutboundShipments?: Maybe<Array<UpdateOutboundShipmentResponseWithId>>;
};

export type BatchPrescriptionInput = {
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deletePrescriptionLines?: InputMaybe<Array<DeletePrescriptionLineInput>>;
  deletePrescriptions?: InputMaybe<Array<Scalars['String']['input']>>;
  insertPrescriptionLines?: InputMaybe<Array<InsertPrescriptionLineInput>>;
  insertPrescriptions?: InputMaybe<Array<InsertPrescriptionInput>>;
  setPrescribedQuantity?: InputMaybe<Array<SetPrescribedQuantityInput>>;
  updatePrescriptionLines?: InputMaybe<Array<UpdatePrescriptionLineInput>>;
  updatePrescriptions?: InputMaybe<Array<UpdatePrescriptionInput>>;
};

export type BatchPrescriptionResponse = {
  __typename: 'BatchPrescriptionResponse';
  deletePrescriptionLines?: Maybe<Array<DeletePrescriptionLineResponseWithId>>;
  deletePrescriptions?: Maybe<Array<DeletePrescriptionResponseWithId>>;
  insertPrescriptionLines?: Maybe<Array<InsertPrescriptionLineResponseWithId>>;
  insertPrescriptions?: Maybe<Array<InsertPrescriptionResponseWithId>>;
  setPrescribedQuantity?: Maybe<Array<SetPrescribedQuantityWithId>>;
  updatePrescriptionLines?: Maybe<Array<UpdatePrescriptionLineResponseWithId>>;
  updatePrescriptions?: Maybe<Array<UpdatePrescriptionResponseWithId>>;
};

export type BatchRequestRequisitionInput = {
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deleteRequestRequisitionLines?: InputMaybe<
    Array<DeleteRequestRequisitionLineInput>
  >;
  deleteRequestRequisitions?: InputMaybe<Array<DeleteRequestRequisitionInput>>;
  insertRequestRequisitionLines?: InputMaybe<
    Array<InsertRequestRequisitionLineInput>
  >;
  insertRequestRequisitions?: InputMaybe<Array<InsertRequestRequisitionInput>>;
  updateRequestRequisitionLines?: InputMaybe<
    Array<UpdateRequestRequisitionLineInput>
  >;
  updateRequestRequisitions?: InputMaybe<Array<UpdateRequestRequisitionInput>>;
};

export type BatchRequestRequisitionResponse = {
  __typename: 'BatchRequestRequisitionResponse';
  deleteRequestRequisitionLines?: Maybe<
    Array<DeleteRequestRequisitionLineResponseWithId>
  >;
  deleteRequestRequisitions?: Maybe<
    Array<DeleteRequestRequisitionResponseWithId>
  >;
  insertRequestRequisitionLines?: Maybe<
    Array<InsertRequestRequisitionLineResponseWithId>
  >;
  insertRequestRequisitions?: Maybe<
    Array<InsertRequestRequisitionResponseWithId>
  >;
  updateRequestRequisitionLines?: Maybe<
    Array<UpdateRequestRequisitionLineResponseWithId>
  >;
  updateRequestRequisitions?: Maybe<
    Array<UpdateRequestRequisitionResponseWithId>
  >;
};

export type BatchResponseRequisitionInput = {
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deleteResponseRequisitionLines?: InputMaybe<
    Array<DeleteResponseRequisitionLineInput>
  >;
  deleteResponseRequisitions?: InputMaybe<
    Array<DeleteResponseRequisitionInput>
  >;
};

export type BatchResponseRequisitionResponse = {
  __typename: 'BatchResponseRequisitionResponse';
  deleteResponseRequisitionLines?: Maybe<
    Array<DeleteResponseRequisitionLineResponseWithId>
  >;
  deleteResponseRequisitions?: Maybe<
    Array<DeleteResponseRequisitionResponseWithId>
  >;
};

export type BatchStocktakeInput = {
  continueOnError?: InputMaybe<Scalars['Boolean']['input']>;
  deleteStocktakeLines?: InputMaybe<Array<DeleteStocktakeLineInput>>;
  deleteStocktakes?: InputMaybe<Array<DeleteStocktakeInput>>;
  insertStocktakeLines?: InputMaybe<Array<InsertStocktakeLineInput>>;
  insertStocktakes?: InputMaybe<Array<InsertStocktakeInput>>;
  updateStocktakeLines?: InputMaybe<Array<UpdateStocktakeLineInput>>;
  updateStocktakes?: InputMaybe<Array<UpdateStocktakeInput>>;
};

export type BatchStocktakeResponse = {
  __typename: 'BatchStocktakeResponse';
  deleteStocktakeLines?: Maybe<Array<DeleteStocktakeLineResponseWithId>>;
  deleteStocktakes?: Maybe<Array<DeleteStocktakeResponseWithId>>;
  insertStocktakeLines?: Maybe<Array<InsertStocktakeLineResponseWithId>>;
  insertStocktakes?: Maybe<Array<InsertStocktakeResponseWithId>>;
  updateStocktakeLines?: Maybe<Array<UpdateStocktakeLineResponseWithId>>;
  updateStocktakes?: Maybe<Array<UpdateStocktakeResponseWithId>>;
};

export type BoolStorePrefInput = {
  storeId: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type BundledItemMutations = {
  __typename: 'BundledItemMutations';
  deleteBundledItem: DeleteBundledItemResponse;
  upsertBundledItem: UpsertBundledItemResponse;
};

export type BundledItemMutationsDeleteBundledItemArgs = {
  input: DeleteBundledItemInput;
  storeId: Scalars['String']['input'];
};

export type BundledItemMutationsUpsertBundledItemArgs = {
  input: UpsertBundledItemInput;
  storeId: Scalars['String']['input'];
};

export type BundledItemNode = {
  __typename: 'BundledItemNode';
  bundledItemVariant?: Maybe<ItemVariantNode>;
  bundledItemVariantId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  principalItemVariant?: Maybe<ItemVariantNode>;
  principalItemVariantId: Scalars['String']['output'];
  ratio: Scalars['Float']['output'];
};

export type CampaignConnector = {
  __typename: 'CampaignConnector';
  nodes: Array<CampaignNode>;
  totalCount: Scalars['Int']['output'];
};

export type CampaignFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type CampaignMutations = {
  __typename: 'CampaignMutations';
  deleteCampaign: DeleteCampaignResponse;
  upsertCampaign: UpsertCampaignResponse;
};

export type CampaignMutationsDeleteCampaignArgs = {
  input: DeleteCampaignInput;
};

export type CampaignMutationsUpsertCampaignArgs = {
  input: UpsertCampaignInput;
};

export type CampaignNode = {
  __typename: 'CampaignNode';
  endDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  startDate?: Maybe<Scalars['NaiveDate']['output']>;
};

export enum CampaignSortFieldInput {
  Name = 'name',
}

export type CampaignSortInput = {
  /** Sort query result is sorted descending or ascending (if not provided the default is ascending) */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: CampaignSortFieldInput;
};

export type CampaignsResponse = CampaignConnector;

export type CanOnlyChangeToAllocatedWhenNoUnallocatedLines =
  UpdateErrorInterface & {
    __typename: 'CanOnlyChangeToAllocatedWhenNoUnallocatedLines';
    description: Scalars['String']['output'];
    invoiceLines: InvoiceLineConnector;
  };

export type CanOnlyChangeToPickedWhenNoUnallocatedLines =
  UpdatePrescriptionErrorInterface & {
    __typename: 'CanOnlyChangeToPickedWhenNoUnallocatedLines';
    description: Scalars['String']['output'];
    invoiceLines: InvoiceLineConnector;
  };

export type CannotChangeStatusOfInvoiceOnHold = UpdateErrorInterface &
  UpdateInboundShipmentErrorInterface & {
    __typename: 'CannotChangeStatusOfInvoiceOnHold';
    description: Scalars['String']['output'];
  };

export type CannotDeleteInvoiceWithLines = DeleteCustomerReturnErrorInterface &
  DeleteErrorInterface &
  DeleteInboundShipmentErrorInterface &
  DeletePrescriptionErrorInterface &
  DeleteSupplierReturnErrorInterface & {
    __typename: 'CannotDeleteInvoiceWithLines';
    description: Scalars['String']['output'];
    lines: InvoiceLineConnector;
  };

export type CannotDeleteLineLinkedToShipment =
  DeleteResponseRequisitionLineErrorInterface & {
    __typename: 'CannotDeleteLineLinkedToShipment';
    description: Scalars['String']['output'];
  };

export type CannotDeleteRequisitionWithLines =
  DeleteRequestRequisitionErrorInterface & {
    __typename: 'CannotDeleteRequisitionWithLines';
    description: Scalars['String']['output'];
  };

export type CannotEditInvoice =
  AddToInboundShipmentFromMasterListErrorInterface &
    AddToOutboundShipmentFromMasterListErrorInterface &
    DeleteCustomerReturnErrorInterface &
    DeleteErrorInterface &
    DeleteInboundShipmentErrorInterface &
    DeleteInboundShipmentLineErrorInterface &
    DeleteInboundShipmentServiceLineErrorInterface &
    DeleteOutboundShipmentLineErrorInterface &
    DeleteOutboundShipmentServiceLineErrorInterface &
    DeletePrescriptionErrorInterface &
    DeletePrescriptionLineErrorInterface &
    DeleteSupplierReturnErrorInterface &
    InsertInboundShipmentLineErrorInterface &
    InsertInboundShipmentServiceLineErrorInterface &
    InsertOutboundShipmentLineErrorInterface &
    InsertOutboundShipmentServiceLineErrorInterface &
    InsertPrescriptionLineErrorInterface &
    UpdateInboundShipmentErrorInterface &
    UpdateInboundShipmentLineErrorInterface &
    UpdateInboundShipmentServiceLineErrorInterface &
    UpdateOutboundShipmentLineErrorInterface &
    UpdateOutboundShipmentServiceLineErrorInterface &
    UpdatePrescriptionLineErrorInterface & {
      __typename: 'CannotEditInvoice';
      description: Scalars['String']['output'];
    };

export type CannotEditRequisition = AddFromMasterListErrorInterface &
  CreateRequisitionShipmentErrorInterface &
  DeleteRequestRequisitionErrorInterface &
  DeleteRequestRequisitionLineErrorInterface &
  DeleteResponseRequisitionLineErrorInterface &
  InsertRequestRequisitionLineErrorInterface &
  InsertResponseRequisitionLineErrorInterface &
  SupplyRequestedQuantityErrorInterface &
  UpdateRequestRequisitionErrorInterface &
  UpdateRequestRequisitionLineErrorInterface &
  UpdateResponseRequisitionErrorInterface &
  UpdateResponseRequisitionLineErrorInterface &
  UseSuggestedQuantityErrorInterface & {
    __typename: 'CannotEditRequisition';
    description: Scalars['String']['output'];
  };

export type CannotEditStocktake = DeleteStocktakeErrorInterface &
  DeleteStocktakeLineErrorInterface &
  InsertStocktakeLineErrorInterface &
  UpdateStocktakeErrorInterface &
  UpdateStocktakeLineErrorInterface & {
    __typename: 'CannotEditStocktake';
    description: Scalars['String']['output'];
  };

export type CannotHaveEstimatedDeliveryDateBeforeShippedDate =
  UpdateErrorInterface & {
    __typename: 'CannotHaveEstimatedDeliveryDateBeforeShippedDate';
    description: Scalars['String']['output'];
  };

export type CannotHaveFractionalPack = InsertRepackErrorInterface & {
  __typename: 'CannotHaveFractionalPack';
  description: Scalars['String']['output'];
};

export type CannotIssueInForeignCurrency = UpdateErrorInterface &
  UpdateInboundShipmentErrorInterface & {
    __typename: 'CannotIssueInForeignCurrency';
    description: Scalars['String']['output'];
  };

export type CannotReverseInvoiceStatus = UpdateErrorInterface &
  UpdateInboundShipmentErrorInterface &
  UpdatePrescriptionErrorInterface & {
    __typename: 'CannotReverseInvoiceStatus';
    description: Scalars['String']['output'];
  };

export type CentralGeneralMutations = {
  __typename: 'CentralGeneralMutations';
  configureNameProperties: ConfigureNamePropertiesResponse;
};

export type CentralGeneralMutationsConfigureNamePropertiesArgs = {
  input: Array<ConfigureNamePropertyInput>;
};

export type CentralPatientNode = {
  __typename: 'CentralPatientNode';
  code: Scalars['String']['output'];
  dateOfBirth?: Maybe<Scalars['NaiveDate']['output']>;
  firstName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
};

export type CentralPatientSearchConnector = {
  __typename: 'CentralPatientSearchConnector';
  nodes: Array<CentralPatientNode>;
  totalCount: Scalars['Int']['output'];
};

export type CentralPatientSearchError = {
  __typename: 'CentralPatientSearchError';
  error: CentralPatientSearchErrorInterface;
};

export type CentralPatientSearchErrorInterface = {
  description: Scalars['String']['output'];
};

export type CentralPatientSearchInput = {
  /** Patient code */
  code?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
};

export type CentralPatientSearchResponse =
  | CentralPatientSearchConnector
  | CentralPatientSearchError;

export type CentralPluginMutations = {
  __typename: 'CentralPluginMutations';
  installUploadedPlugin: PluginInfoNode;
};

export type CentralPluginMutationsInstallUploadedPluginArgs = {
  fileId: Scalars['String']['input'];
};

export type CentralPluginQueries = {
  __typename: 'CentralPluginQueries';
  uploadedPluginInfo: UploadedPluginInfoResponse;
};

export type CentralPluginQueriesUploadedPluginInfoArgs = {
  fileId: Scalars['String']['input'];
};

export type CentralServerMutationNode = {
  __typename: 'CentralServerMutationNode';
  assetCatalogue: AssetCatalogueMutations;
  bundledItem: BundledItemMutations;
  campaign: CampaignMutations;
  demographic: DemographicMutations;
  general: CentralGeneralMutations;
  itemVariant: ItemVariantMutations;
  logReason: AssetLogReasonMutations;
  plugins: CentralPluginMutations;
  preferences: PreferenceMutations;
  vaccineCourse: VaccineCourseMutations;
};

export type CentralServerQueryNode = {
  __typename: 'CentralServerQueryNode';
  plugin: CentralPluginQueries;
};

export type CentralSyncRequired = AuthTokenErrorInterface & {
  __typename: 'CentralSyncRequired';
  description: Scalars['String']['output'];
};

export type ClinicianConnector = {
  __typename: 'ClinicianConnector';
  nodes: Array<ClinicianNode>;
  totalCount: Scalars['Int']['output'];
};

export type ClinicianFilterInput = {
  address1?: InputMaybe<StringFilterInput>;
  address2?: InputMaybe<StringFilterInput>;
  code?: InputMaybe<StringFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  firstName?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  initials?: InputMaybe<StringFilterInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<StringFilterInput>;
  mobile?: InputMaybe<StringFilterInput>;
  phone?: InputMaybe<StringFilterInput>;
};

export type ClinicianNode = {
  __typename: 'ClinicianNode';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<GenderType>;
  id: Scalars['String']['output'];
  initials: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  mobile?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

export enum ClinicianSortFieldInput {
  Address1 = 'address1',
  Address2 = 'address2',
  Code = 'code',
  Email = 'email',
  FirstName = 'firstName',
  Initials = 'initials',
  LastName = 'lastName',
  Mobile = 'mobile',
  Phone = 'phone',
}

export type ClinicianSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ClinicianSortFieldInput;
};

export type CliniciansResponse = ClinicianConnector;

export type ColdStorageTypeConnector = {
  __typename: 'ColdStorageTypeConnector';
  nodes: Array<ColdStorageTypeNode>;
  totalCount: Scalars['Int']['output'];
};

export type ColdStorageTypeFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<EqualFilterStringInput>;
};

export type ColdStorageTypeNode = {
  __typename: 'ColdStorageTypeNode';
  id: Scalars['String']['output'];
  maxTemperature: Scalars['Float']['output'];
  minTemperature: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export enum ColdStorageTypeSortFieldInput {
  Id = 'id',
  Name = 'name',
}

export type ColdStorageTypeSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ColdStorageTypeSortFieldInput;
};

export type ColdStorageTypesResponse = ColdStorageTypeConnector;

export type ConfigureNamePropertiesResponse = Success;

export type ConfigureNamePropertyInput = {
  allowedValues?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  key: Scalars['String']['input'];
  name: Scalars['String']['input'];
  propertyId: Scalars['String']['input'];
  remoteEditable: Scalars['Boolean']['input'];
  valueType: PropertyNodeValueType;
};

export type ConnectionError = CentralPatientSearchErrorInterface &
  LinkPatientPatientToStoreErrorInterface &
  UpdateUserErrorInterface & {
    __typename: 'ConnectionError';
    description: Scalars['String']['output'];
  };

export type ConsumptionHistoryConnector = {
  __typename: 'ConsumptionHistoryConnector';
  nodes: Array<ConsumptionHistoryNode>;
  totalCount: Scalars['Int']['output'];
};

export type ConsumptionHistoryNode = {
  __typename: 'ConsumptionHistoryNode';
  averageMonthlyConsumption: Scalars['Int']['output'];
  consumption: Scalars['Int']['output'];
  date: Scalars['NaiveDate']['output'];
  isCurrent: Scalars['Boolean']['output'];
  isHistoric: Scalars['Boolean']['output'];
};

export type ConsumptionOptionsInput = {
  /** Defaults to store preference amc_lookback_months */
  amcLookbackMonths?: InputMaybe<Scalars['Int']['input']>;
  /** Defaults to 12 */
  numberOfDataPoints?: InputMaybe<Scalars['Int']['input']>;
};

export enum ContactFormNodeType {
  Feedback = 'FEEDBACK',
  Support = 'SUPPORT',
}

export type ContactTraceConnector = {
  __typename: 'ContactTraceConnector';
  nodes: Array<ContactTraceNode>;
  totalCount: Scalars['Int']['output'];
};

export type ContactTraceFilterInput = {
  contactPatientId?: InputMaybe<EqualFilterStringInput>;
  contactTraceId?: InputMaybe<StringFilterInput>;
  dateOfBirth?: InputMaybe<DateFilterInput>;
  datetime?: InputMaybe<DatetimeFilterInput>;
  documentName?: InputMaybe<StringFilterInput>;
  firstName?: InputMaybe<StringFilterInput>;
  gender?: InputMaybe<EqualFilterGenderType>;
  id?: InputMaybe<EqualFilterStringInput>;
  lastName?: InputMaybe<StringFilterInput>;
  patientId?: InputMaybe<EqualFilterStringInput>;
  programId?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<StringFilterInput>;
};

export type ContactTraceNode = {
  __typename: 'ContactTraceNode';
  age?: Maybe<Scalars['Int']['output']>;
  contactPatient?: Maybe<PatientNode>;
  contactPatientId?: Maybe<Scalars['String']['output']>;
  contactTraceId?: Maybe<Scalars['String']['output']>;
  dateOfBirth?: Maybe<Scalars['NaiveDate']['output']>;
  datetime: Scalars['DateTime']['output'];
  /** The encounter document */
  document: DocumentNode;
  documentId: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<GenderType>;
  id: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  patient: PatientNode;
  patientId: Scalars['String']['output'];
  program: ProgramNode;
  /** Returns the matching program enrolment for the root patient of this contact trace */
  programEnrolment?: Maybe<ProgramEnrolmentNode>;
  programId: Scalars['String']['output'];
  /** Relationship between the patient and the contact, e.g. mother, next of kin, etc. */
  relationship?: Maybe<Scalars['String']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
};

export type ContactTraceResponse = ContactTraceConnector;

export enum ContactTraceSortFieldInput {
  ContactTraceId = 'contactTraceId',
  DateOfBirth = 'dateOfBirth',
  Datetime = 'datetime',
  FirstName = 'firstName',
  Gender = 'gender',
  LastName = 'lastName',
  PatientId = 'patientId',
  ProgramId = 'programId',
}

export type ContactTraceSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ContactTraceSortFieldInput;
};

export type CreateInventoryAdjustmentError = {
  __typename: 'CreateInventoryAdjustmentError';
  error: InsertInventoryAdjustmentErrorInterface;
};

export type CreateInventoryAdjustmentInput = {
  adjustment: Scalars['Float']['input'];
  adjustmentType: AdjustmentTypeInput;
  /** @deprecated Since 2.8.0. Use reason_option_id */
  inventoryAdjustmentReasonId?: InputMaybe<Scalars['String']['input']>;
  reasonOptionId?: InputMaybe<Scalars['String']['input']>;
  stockLineId: Scalars['String']['input'];
};

export type CreateInventoryAdjustmentResponse =
  | CreateInventoryAdjustmentError
  | InvoiceNode;

export type CreateRequisitionShipmentError = {
  __typename: 'CreateRequisitionShipmentError';
  error: CreateRequisitionShipmentErrorInterface;
};

export type CreateRequisitionShipmentErrorInterface = {
  description: Scalars['String']['output'];
};

export type CreateRequisitionShipmentInput = {
  responseRequisitionId: Scalars['String']['input'];
};

export type CreateRequisitionShipmentResponse =
  | CreateRequisitionShipmentError
  | InvoiceNode;

export type CurrenciesResponse = CurrencyConnector;

export type CurrencyConnector = {
  __typename: 'CurrencyConnector';
  nodes: Array<CurrencyNode>;
  totalCount: Scalars['Int']['output'];
};

export type CurrencyFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isHomeCurrency?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CurrencyNode = {
  __typename: 'CurrencyNode';
  code: Scalars['String']['output'];
  dateUpdated?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  isHomeCurrency: Scalars['Boolean']['output'];
  rate: Scalars['Float']['output'];
};

export enum CurrencySortFieldInput {
  CurrencyCode = 'currencyCode',
  Id = 'id',
  IsHomeCurrency = 'isHomeCurrency',
}

export type CurrencySortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: CurrencySortFieldInput;
};

export type CustomerIndicatorInformationNode = {
  __typename: 'CustomerIndicatorInformationNode';
  customer: NameNode;
  /** Datetime should be null if no columns found */
  datetime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  indicatorInformation: Array<RequisitionIndicatorInformationNode>;
};

export type CustomerIndicatorInformationNodeCustomerArgs = {
  storeId: Scalars['String']['input'];
};

export type CustomerProgramRequisitionSettingNode = {
  __typename: 'CustomerProgramRequisitionSettingNode';
  customerNameId: Scalars['String']['output'];
  programSettings: Array<ProgramSettingNode>;
};

export type CustomerReturnInput = {
  customerId: Scalars['String']['input'];
  customerReturnLines: Array<CustomerReturnLineInput>;
  id: Scalars['String']['input'];
  outboundShipmentId?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerReturnLineInput = {
  batch?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  itemVariantId?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  numberOfPacksReturned: Scalars['Float']['input'];
  packSize: Scalars['Float']['input'];
  reasonId?: InputMaybe<Scalars['String']['input']>;
  vvmStatusId?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerReturnLineNode = {
  __typename: 'CustomerReturnLineNode';
  batch?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  item: ItemNode;
  itemCode: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  itemVariantId?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  numberOfPacksIssued?: Maybe<Scalars['Float']['output']>;
  numberOfPacksReturned: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  reasonId?: Maybe<Scalars['String']['output']>;
  reasonOption?: Maybe<ReasonOptionNode>;
  stockLineId?: Maybe<Scalars['String']['output']>;
};

export type DatabaseError = DeleteAssetCatalogueItemErrorInterface &
  DeleteAssetErrorInterface &
  DeleteAssetLogReasonErrorInterface &
  DeleteCampaignErrorInterface &
  DeleteLocationErrorInterface &
  DeleteVaccineCourseErrorInterface &
  InsertAssetCatalogueItemErrorInterface &
  InsertAssetErrorInterface &
  InsertAssetLogErrorInterface &
  InsertAssetLogReasonErrorInterface &
  InsertDemographicIndicatorErrorInterface &
  InsertDemographicProjectionErrorInterface &
  InsertLocationErrorInterface &
  NodeErrorInterface &
  RefreshTokenErrorInterface &
  ScannedDataParseErrorInterface &
  UpdateAssetErrorInterface &
  UpdateDemographicIndicatorErrorInterface &
  UpdateDemographicProjectionErrorInterface &
  UpdateLocationErrorInterface &
  UpdateSensorErrorInterface &
  UpdateVaccineCourseErrorInterface &
  UpsertBundledItemErrorInterface &
  UpsertCampaignErrorInterface &
  UpsertItemVariantErrorInterface & {
    __typename: 'DatabaseError';
    description: Scalars['String']['output'];
    fullError: Scalars['String']['output'];
  };

export type DatabaseSettingsNode = {
  __typename: 'DatabaseSettingsNode';
  databaseType: DatabaseType;
};

export enum DatabaseType {
  Postgres = 'POSTGRES',
  SqLite = 'SQ_LITE',
}

export type DateFilterInput = {
  afterOrEqualTo?: InputMaybe<Scalars['NaiveDate']['input']>;
  beforeOrEqualTo?: InputMaybe<Scalars['NaiveDate']['input']>;
  equalTo?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type DatetimeFilterInput = {
  afterOrEqualTo?: InputMaybe<Scalars['DateTime']['input']>;
  beforeOrEqualTo?: InputMaybe<Scalars['DateTime']['input']>;
  equalTo?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteAssetCatalogueItemError = {
  __typename: 'DeleteAssetCatalogueItemError';
  error: DeleteAssetCatalogueItemErrorInterface;
};

export type DeleteAssetCatalogueItemErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteAssetCatalogueItemResponse =
  | DeleteAssetCatalogueItemError
  | DeleteResponse;

export type DeleteAssetError = {
  __typename: 'DeleteAssetError';
  error: DeleteAssetErrorInterface;
};

export type DeleteAssetErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteAssetLogReasonError = {
  __typename: 'DeleteAssetLogReasonError';
  error: DeleteAssetLogReasonErrorInterface;
};

export type DeleteAssetLogReasonErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteAssetLogReasonResponse =
  | DeleteAssetLogReasonError
  | DeleteResponse;

export type DeleteAssetResponse = DeleteAssetError | DeleteResponse;

export type DeleteBundledItemInput = {
  id: Scalars['String']['input'];
};

export type DeleteBundledItemResponse = DeleteResponse;

export type DeleteCampaignError = {
  __typename: 'DeleteCampaignError';
  error: DeleteCampaignErrorInterface;
};

export type DeleteCampaignErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteCampaignInput = {
  id: Scalars['String']['input'];
};

export type DeleteCampaignResponse =
  | DeleteCampaignError
  | DeleteCampaignSuccess;

export type DeleteCampaignSuccess = {
  __typename: 'DeleteCampaignSuccess';
  id: Scalars['String']['output'];
};

export type DeleteCustomerReturnError = {
  __typename: 'DeleteCustomerReturnError';
  error: DeleteCustomerReturnErrorInterface;
};

export type DeleteCustomerReturnErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteCustomerReturnResponse =
  | DeleteCustomerReturnError
  | DeleteResponse;

export type DeleteErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteInboundShipmentError = {
  __typename: 'DeleteInboundShipmentError';
  error: DeleteInboundShipmentErrorInterface;
};

export type DeleteInboundShipmentErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteInboundShipmentInput = {
  id: Scalars['String']['input'];
};

export type DeleteInboundShipmentLineError = {
  __typename: 'DeleteInboundShipmentLineError';
  error: DeleteInboundShipmentLineErrorInterface;
};

export type DeleteInboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteInboundShipmentLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteInboundShipmentLineResponse =
  | DeleteInboundShipmentLineError
  | DeleteResponse;

export type DeleteInboundShipmentLineResponseWithId = {
  __typename: 'DeleteInboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteInboundShipmentLineResponse;
};

export type DeleteInboundShipmentResponse =
  | DeleteInboundShipmentError
  | DeleteResponse;

export type DeleteInboundShipmentResponseWithId = {
  __typename: 'DeleteInboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteInboundShipmentResponse;
};

export type DeleteInboundShipmentServiceLineError = {
  __typename: 'DeleteInboundShipmentServiceLineError';
  error: DeleteInboundShipmentServiceLineErrorInterface;
};

export type DeleteInboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteInboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteInboundShipmentServiceLineResponse =
  | DeleteInboundShipmentServiceLineError
  | DeleteResponse;

export type DeleteInboundShipmentServiceLineResponseWithId = {
  __typename: 'DeleteInboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteInboundShipmentServiceLineResponse;
};

export type DeleteItemVariantInput = {
  id: Scalars['String']['input'];
};

export type DeleteItemVariantResponse = DeleteResponse;

export type DeleteLocationError = {
  __typename: 'DeleteLocationError';
  error: DeleteLocationErrorInterface;
};

export type DeleteLocationErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteLocationInput = {
  id: Scalars['String']['input'];
};

export type DeleteLocationResponse = DeleteLocationError | DeleteResponse;

export type DeleteOutboundShipmentError = {
  __typename: 'DeleteOutboundShipmentError';
  error: DeleteErrorInterface;
};

export type DeleteOutboundShipmentLineError = {
  __typename: 'DeleteOutboundShipmentLineError';
  error: DeleteOutboundShipmentLineErrorInterface;
};

export type DeleteOutboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteOutboundShipmentLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteOutboundShipmentLineResponse =
  | DeleteOutboundShipmentLineError
  | DeleteResponse;

export type DeleteOutboundShipmentLineResponseWithId = {
  __typename: 'DeleteOutboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteOutboundShipmentLineResponse;
};

export type DeleteOutboundShipmentResponse =
  | DeleteOutboundShipmentError
  | DeleteResponse;

export type DeleteOutboundShipmentResponseWithId = {
  __typename: 'DeleteOutboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteOutboundShipmentResponse;
};

export type DeleteOutboundShipmentServiceLineError = {
  __typename: 'DeleteOutboundShipmentServiceLineError';
  error: DeleteOutboundShipmentServiceLineErrorInterface;
};

export type DeleteOutboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteOutboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteOutboundShipmentServiceLineResponse =
  | DeleteOutboundShipmentServiceLineError
  | DeleteResponse;

export type DeleteOutboundShipmentServiceLineResponseWithId = {
  __typename: 'DeleteOutboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteOutboundShipmentServiceLineResponse;
};

export type DeleteOutboundShipmentUnallocatedLineError = {
  __typename: 'DeleteOutboundShipmentUnallocatedLineError';
  error: DeleteOutboundShipmentUnallocatedLineErrorInterface;
};

export type DeleteOutboundShipmentUnallocatedLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteOutboundShipmentUnallocatedLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteOutboundShipmentUnallocatedLineResponse =
  | DeleteOutboundShipmentUnallocatedLineError
  | DeleteResponse;

export type DeleteOutboundShipmentUnallocatedLineResponseWithId = {
  __typename: 'DeleteOutboundShipmentUnallocatedLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteOutboundShipmentUnallocatedLineResponse;
};

export type DeletePrescriptionError = {
  __typename: 'DeletePrescriptionError';
  error: DeletePrescriptionErrorInterface;
};

export type DeletePrescriptionErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeletePrescriptionLineError = {
  __typename: 'DeletePrescriptionLineError';
  error: DeletePrescriptionLineErrorInterface;
};

export type DeletePrescriptionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeletePrescriptionLineInput = {
  id: Scalars['String']['input'];
};

export type DeletePrescriptionLineResponse =
  | DeletePrescriptionLineError
  | DeleteResponse;

export type DeletePrescriptionLineResponseWithId = {
  __typename: 'DeletePrescriptionLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeletePrescriptionLineResponse;
};

export type DeletePrescriptionResponse =
  | DeletePrescriptionError
  | DeleteResponse;

export type DeletePrescriptionResponseWithId = {
  __typename: 'DeletePrescriptionResponseWithId';
  id: Scalars['String']['output'];
  response: DeletePrescriptionResponse;
};

export type DeleteRequestRequisitionError = {
  __typename: 'DeleteRequestRequisitionError';
  error: DeleteRequestRequisitionErrorInterface;
};

export type DeleteRequestRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteRequestRequisitionInput = {
  id: Scalars['String']['input'];
};

export type DeleteRequestRequisitionLineError = {
  __typename: 'DeleteRequestRequisitionLineError';
  error: DeleteRequestRequisitionLineErrorInterface;
};

export type DeleteRequestRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteRequestRequisitionLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteRequestRequisitionLineResponse =
  | DeleteRequestRequisitionLineError
  | DeleteResponse;

export type DeleteRequestRequisitionLineResponseWithId = {
  __typename: 'DeleteRequestRequisitionLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteRequestRequisitionLineResponse;
};

export type DeleteRequestRequisitionResponse =
  | DeleteRequestRequisitionError
  | DeleteResponse;

export type DeleteRequestRequisitionResponseWithId = {
  __typename: 'DeleteRequestRequisitionResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteRequestRequisitionResponse;
};

export type DeleteResponse = {
  __typename: 'DeleteResponse';
  id: Scalars['String']['output'];
};

export type DeleteResponseRequisitionError = {
  __typename: 'DeleteResponseRequisitionError';
  error: DeleteResponseRequisitionErrorInterface;
};

export type DeleteResponseRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteResponseRequisitionInput = {
  id: Scalars['String']['input'];
};

export type DeleteResponseRequisitionLineError = {
  __typename: 'DeleteResponseRequisitionLineError';
  error: DeleteResponseRequisitionLineErrorInterface;
};

export type DeleteResponseRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteResponseRequisitionLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteResponseRequisitionLineResponse =
  | DeleteResponse
  | DeleteResponseRequisitionLineError;

export type DeleteResponseRequisitionLineResponseWithId = {
  __typename: 'DeleteResponseRequisitionLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteResponseRequisitionLineResponse;
};

export type DeleteResponseRequisitionResponse =
  | DeleteResponse
  | DeleteResponseRequisitionError;

export type DeleteResponseRequisitionResponseWithId = {
  __typename: 'DeleteResponseRequisitionResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteResponseRequisitionResponse;
};

export type DeleteStocktakeError = {
  __typename: 'DeleteStocktakeError';
  error: DeleteStocktakeErrorInterface;
};

export type DeleteStocktakeErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteStocktakeInput = {
  id: Scalars['String']['input'];
};

export type DeleteStocktakeLineError = {
  __typename: 'DeleteStocktakeLineError';
  error: DeleteStocktakeLineErrorInterface;
};

export type DeleteStocktakeLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteStocktakeLineInput = {
  id: Scalars['String']['input'];
};

export type DeleteStocktakeLineResponse =
  | DeleteResponse
  | DeleteStocktakeLineError;

export type DeleteStocktakeLineResponseWithId = {
  __typename: 'DeleteStocktakeLineResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteStocktakeLineResponse;
};

export type DeleteStocktakeResponse = DeleteResponse | DeleteStocktakeError;

export type DeleteStocktakeResponseWithId = {
  __typename: 'DeleteStocktakeResponseWithId';
  id: Scalars['String']['output'];
  response: DeleteStocktakeResponse;
};

export type DeleteSupplierReturnError = {
  __typename: 'DeleteSupplierReturnError';
  error: DeleteSupplierReturnErrorInterface;
};

export type DeleteSupplierReturnErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteSupplierReturnResponse =
  | DeleteResponse
  | DeleteSupplierReturnError;

export type DeleteVaccineCourseError = {
  __typename: 'DeleteVaccineCourseError';
  error: DeleteVaccineCourseErrorInterface;
};

export type DeleteVaccineCourseErrorInterface = {
  description: Scalars['String']['output'];
};

export type DeleteVaccineCourseResponse =
  | DeleteResponse
  | DeleteVaccineCourseError;

export type DemographicConnector = {
  __typename: 'DemographicConnector';
  nodes: Array<DemographicNode>;
  totalCount: Scalars['Int']['output'];
};

export type DemographicFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type DemographicIndicatorConnector = {
  __typename: 'DemographicIndicatorConnector';
  nodes: Array<DemographicIndicatorNode>;
  totalCount: Scalars['Int']['output'];
};

export type DemographicIndicatorFilterInput = {
  baseYear?: InputMaybe<EqualFilterNumberInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type DemographicIndicatorNode = {
  __typename: 'DemographicIndicatorNode';
  basePopulation: Scalars['Int']['output'];
  baseYear: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  populationPercentage: Scalars['Float']['output'];
  year1Projection: Scalars['Int']['output'];
  year2Projection: Scalars['Int']['output'];
  year3Projection: Scalars['Int']['output'];
  year4Projection: Scalars['Int']['output'];
  year5Projection: Scalars['Int']['output'];
};

export enum DemographicIndicatorSortFieldInput {
  Id = 'id',
  Name = 'name',
}

export type DemographicIndicatorSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: DemographicIndicatorSortFieldInput;
};

export type DemographicIndicatorsResponse = DemographicIndicatorConnector;

export type DemographicMutations = {
  __typename: 'DemographicMutations';
  insertDemographicIndicator: InsertDemographicIndicatorResponse;
  insertDemographicProjection: InsertDemographicProjectionResponse;
  updateDemographicIndicator: UpdateDemographicIndicatorResponse;
  updateDemographicProjection: UpdateDemographicProjectionResponse;
};

export type DemographicMutationsInsertDemographicIndicatorArgs = {
  input: InsertDemographicIndicatorInput;
};

export type DemographicMutationsInsertDemographicProjectionArgs = {
  input: InsertDemographicProjectionInput;
};

export type DemographicMutationsUpdateDemographicIndicatorArgs = {
  input: UpdateDemographicIndicatorInput;
};

export type DemographicMutationsUpdateDemographicProjectionArgs = {
  input: UpdateDemographicProjectionInput;
};

export type DemographicNode = {
  __typename: 'DemographicNode';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type DemographicProjectionConnector = {
  __typename: 'DemographicProjectionConnector';
  nodes: Array<DemographicProjectionNode>;
  totalCount: Scalars['Int']['output'];
};

export type DemographicProjectionFilterInput = {
  baseYear?: InputMaybe<EqualFilterNumberInput>;
  id?: InputMaybe<EqualFilterStringInput>;
};

export type DemographicProjectionNode = {
  __typename: 'DemographicProjectionNode';
  baseYear: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  year1: Scalars['Float']['output'];
  year2: Scalars['Float']['output'];
  year3: Scalars['Float']['output'];
  year4: Scalars['Float']['output'];
  year5: Scalars['Float']['output'];
};

export type DemographicProjectionResponse =
  | DemographicProjectionNode
  | NodeError;

export enum DemographicProjectionSortFieldInput {
  Id = 'id',
}

export type DemographicProjectionSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: DemographicProjectionSortFieldInput;
};

export type DemographicProjectionsResponse = DemographicProjectionConnector;

export enum DemographicSortFieldInput {
  Id = 'id',
  Name = 'name',
}

export type DemographicSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: DemographicSortFieldInput;
};

export type DemographicsResponse = DemographicConnector;

export type DiagnosisNode = {
  __typename: 'DiagnosisNode';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type DisplaySettingNode = {
  __typename: 'DisplaySettingNode';
  hash: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type DisplaySettingsHash = {
  logo: Scalars['String']['input'];
  theme: Scalars['String']['input'];
};

export type DisplaySettingsInput = {
  customLogo?: InputMaybe<Scalars['String']['input']>;
  customTheme?: InputMaybe<Scalars['String']['input']>;
};

export type DisplaySettingsNode = {
  __typename: 'DisplaySettingsNode';
  customLogo?: Maybe<DisplaySettingNode>;
  customTheme?: Maybe<DisplaySettingNode>;
};

export type DocumentConnector = {
  __typename: 'DocumentConnector';
  nodes: Array<DocumentNode>;
  totalCount: Scalars['Int']['output'];
};

export type DocumentFilterInput = {
  contextId?: InputMaybe<EqualFilterStringInput>;
  /**
   * This filter makes it possible to search the raw text json data.
   * Be beware of potential performance issues.
   */
  data?: InputMaybe<StringFilterInput>;
  datetime?: InputMaybe<DatetimeFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  owner?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<EqualFilterStringInput>;
};

export type DocumentHistoryResponse = DocumentConnector;

export type DocumentNode = {
  __typename: 'DocumentNode';
  data: Scalars['JSON']['output'];
  documentRegistry?: Maybe<DocumentRegistryNode>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parents: Array<Scalars['String']['output']>;
  schema?: Maybe<JsonschemaNode>;
  timestamp: Scalars['DateTime']['output'];
  type: Scalars['String']['output'];
  user?: Maybe<UserNode>;
  userId: Scalars['String']['output'];
};

export enum DocumentRegistryCategoryNode {
  ContactTrace = 'CONTACT_TRACE',
  Custom = 'CUSTOM',
  Encounter = 'ENCOUNTER',
  Patient = 'PATIENT',
  ProgramEnrolment = 'PROGRAM_ENROLMENT',
}

export type DocumentRegistryConnector = {
  __typename: 'DocumentRegistryConnector';
  nodes: Array<DocumentRegistryNode>;
  totalCount: Scalars['Int']['output'];
};

export type DocumentRegistryFilterInput = {
  category?: InputMaybe<EqualFilterDocumentRegistryCategoryInput>;
  contextId?: InputMaybe<EqualFilterStringInput>;
  documentType?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
};

export type DocumentRegistryNode = {
  __typename: 'DocumentRegistryNode';
  category: DocumentRegistryCategoryNode;
  contextId: Scalars['String']['output'];
  documentType: Scalars['String']['output'];
  formSchemaId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  jsonSchema: Scalars['JSON']['output'];
  name?: Maybe<Scalars['String']['output']>;
  uiSchema: Scalars['JSON']['output'];
  uiSchemaType: Scalars['String']['output'];
};

export type DocumentRegistryResponse = DocumentRegistryConnector;

export enum DocumentRegistrySortFieldInput {
  DocumentType = 'documentType',
  Type = 'type',
}

export type DocumentRegistrySortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: DocumentRegistrySortFieldInput;
};

export type DocumentResponse = DocumentConnector;

export enum DocumentSortFieldInput {
  Context = 'context',
  Datetime = 'datetime',
  Name = 'name',
  Owner = 'owner',
  Type = 'type',
}

export type DocumentSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: DocumentSortFieldInput;
};

export type DoseConfigurationNotAllowed = UpsertItemVariantErrorInterface & {
  __typename: 'DoseConfigurationNotAllowed';
  description: Scalars['String']['output'];
};

export type DraftStockOutItemData = {
  __typename: 'DraftStockOutItemData';
  draftLines: Array<DraftStockOutLineNode>;
  note?: Maybe<Scalars['String']['output']>;
  placeholderQuantity?: Maybe<Scalars['Float']['output']>;
  prescribedQuantity?: Maybe<Scalars['Float']['output']>;
};

export type DraftStockOutLineNode = {
  __typename: 'DraftStockOutLineNode';
  availablePacks: Scalars['Float']['output'];
  batch?: Maybe<Scalars['String']['output']>;
  campaign?: Maybe<CampaignNode>;
  defaultDosesPerUnit: Scalars['Int']['output'];
  donor?: Maybe<NameNode>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  inStorePacks: Scalars['Float']['output'];
  itemVariant?: Maybe<ItemVariantNode>;
  location?: Maybe<LocationNode>;
  numberOfPacks: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  sellPricePerPack: Scalars['Float']['output'];
  stockLineId: Scalars['String']['output'];
  stockLineOnHold: Scalars['Boolean']['output'];
  vvmStatus?: Maybe<VvmstatusNode>;
};

export type DraftStockOutLineNodeDonorArgs = {
  storeId: Scalars['String']['input'];
};

export type EmergencyResponseRequisitionCounts = {
  __typename: 'EmergencyResponseRequisitionCounts';
  new: Scalars['Int']['output'];
};

export type EncounterConnector = {
  __typename: 'EncounterConnector';
  nodes: Array<EncounterNode>;
  totalCount: Scalars['Int']['output'];
};

export type EncounterEventFilterInput = {
  activeEndDatetime?: InputMaybe<DatetimeFilterInput>;
  activeStartDatetime?: InputMaybe<DatetimeFilterInput>;
  data?: InputMaybe<StringFilterInput>;
  datetime?: InputMaybe<DatetimeFilterInput>;
  /**
   * Only include events that are for the current encounter, i.e. have matching encounter type
   * and matching encounter name of the current encounter. If not set all events with matching
   * encounter type are returned.
   */
  isCurrentEncounter?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<EqualFilterStringInput>;
};

export type EncounterFieldsConnector = {
  __typename: 'EncounterFieldsConnector';
  nodes: Array<EncounterFieldsNode>;
  totalCount: Scalars['Int']['output'];
};

export type EncounterFieldsInput = {
  fields: Array<Scalars['String']['input']>;
};

export type EncounterFieldsNode = {
  __typename: 'EncounterFieldsNode';
  encounter: EncounterNode;
  fields: Array<Scalars['JSON']['output']>;
};

export type EncounterFieldsResponse = EncounterFieldsConnector;

export type EncounterFilterInput = {
  clinicianId?: InputMaybe<EqualFilterStringInput>;
  createdDatetime?: InputMaybe<DatetimeFilterInput>;
  documentData?: InputMaybe<StringFilterInput>;
  documentName?: InputMaybe<EqualFilterStringInput>;
  endDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  /** Only if this filter is set encounters with status DELETED are returned */
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  patient?: InputMaybe<PatientFilterInput>;
  patientId?: InputMaybe<EqualFilterStringInput>;
  programEnrolment?: InputMaybe<ProgramEnrolmentFilterInput>;
  /** The program id */
  programId?: InputMaybe<EqualFilterStringInput>;
  startDatetime?: InputMaybe<DatetimeFilterInput>;
  status?: InputMaybe<EqualFilterEncounterStatusInput>;
  type?: InputMaybe<EqualFilterStringInput>;
};

export type EncounterNode = {
  __typename: 'EncounterNode';
  activeProgramEvents: ProgramEventResponse;
  clinician?: Maybe<ClinicianNode>;
  contextId: Scalars['String']['output'];
  createdDatetime: Scalars['DateTime']['output'];
  /** The encounter document */
  document: DocumentNode;
  endDatetime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  patient: PatientNode;
  patientId: Scalars['String']['output'];
  previousEncounter?: Maybe<EncounterNode>;
  /** Returns the matching program enrolment for the patient of this encounter */
  programEnrolment?: Maybe<ProgramEnrolmentNode>;
  programEvents: ProgramEventResponse;
  programId: Scalars['String']['output'];
  startDatetime: Scalars['DateTime']['output'];
  status?: Maybe<EncounterNodeStatus>;
  /** Tries to suggest a date for the next encounter */
  suggestedNextEncounter?: Maybe<SuggestedNextEncounterNode>;
  type: Scalars['String']['output'];
};

export type EncounterNodeActiveProgramEventsArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
  filter?: InputMaybe<ActiveEncounterEventFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramEventSortInput>;
};

export type EncounterNodeProgramEventsArgs = {
  filter?: InputMaybe<EncounterEventFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramEventSortInput>;
};

export enum EncounterNodeStatus {
  Cancelled = 'CANCELLED',
  Deleted = 'DELETED',
  Pending = 'PENDING',
  Visited = 'VISITED',
}

export type EncounterResponse = EncounterConnector;

export enum EncounterSortFieldInput {
  CreatedDatetime = 'createdDatetime',
  EndDatetime = 'endDatetime',
  PatientId = 'patientId',
  Program = 'program',
  StartDatetime = 'startDatetime',
  Status = 'status',
  Type = 'type',
}

export type EncounterSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: EncounterSortFieldInput;
};

export type EqualFilterActivityLogTypeInput = {
  equalAny?: InputMaybe<Array<ActivityLogNodeType>>;
  equalTo?: InputMaybe<ActivityLogNodeType>;
  notEqualTo?: InputMaybe<ActivityLogNodeType>;
};

export type EqualFilterBigFloatingNumberInput = {
  equalAny?: InputMaybe<Array<Scalars['Float']['input']>>;
  equalAnyOrNull?: InputMaybe<Array<Scalars['Float']['input']>>;
  equalTo?: InputMaybe<Scalars['Float']['input']>;
  notEqualTo?: InputMaybe<Scalars['Float']['input']>;
};

export type EqualFilterBigNumberInput = {
  equalAny?: InputMaybe<Array<Scalars['Int']['input']>>;
  equalAnyOrNull?: InputMaybe<Array<Scalars['Int']['input']>>;
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
};

export type EqualFilterDocumentRegistryCategoryInput = {
  equalAny?: InputMaybe<Array<DocumentRegistryCategoryNode>>;
  equalTo?: InputMaybe<DocumentRegistryCategoryNode>;
  notEqualTo?: InputMaybe<DocumentRegistryCategoryNode>;
};

export type EqualFilterEncounterStatusInput = {
  equalAny?: InputMaybe<Array<EncounterNodeStatus>>;
  equalTo?: InputMaybe<EncounterNodeStatus>;
  notEqualTo?: InputMaybe<EncounterNodeStatus>;
};

export type EqualFilterGenderType = {
  equalAny?: InputMaybe<Array<GenderType>>;
  equalTo?: InputMaybe<GenderType>;
  notEqualTo?: InputMaybe<GenderType>;
};

export type EqualFilterInventoryAdjustmentReasonTypeInput = {
  equalAny?: InputMaybe<Array<InventoryAdjustmentReasonNodeType>>;
  equalTo?: InputMaybe<InventoryAdjustmentReasonNodeType>;
  notEqualTo?: InputMaybe<InventoryAdjustmentReasonNodeType>;
};

export type EqualFilterInvoiceLineTypeInput = {
  equalAny?: InputMaybe<Array<InvoiceLineNodeType>>;
  equalTo?: InputMaybe<InvoiceLineNodeType>;
  notEqualTo?: InputMaybe<InvoiceLineNodeType>;
};

export type EqualFilterInvoiceStatusInput = {
  equalAny?: InputMaybe<Array<InvoiceNodeStatus>>;
  equalTo?: InputMaybe<InvoiceNodeStatus>;
  notEqualTo?: InputMaybe<InvoiceNodeStatus>;
};

export type EqualFilterInvoiceTypeInput = {
  equalAny?: InputMaybe<Array<InvoiceNodeType>>;
  equalTo?: InputMaybe<InvoiceNodeType>;
  notEqualTo?: InputMaybe<InvoiceNodeType>;
};

export type EqualFilterItemTypeInput = {
  equalAny?: InputMaybe<Array<ItemNodeType>>;
  equalTo?: InputMaybe<ItemNodeType>;
  notEqualTo?: InputMaybe<ItemNodeType>;
};

export type EqualFilterNumberInput = {
  equalAny?: InputMaybe<Array<Scalars['Int']['input']>>;
  equalAnyOrNull?: InputMaybe<Array<Scalars['Int']['input']>>;
  equalTo?: InputMaybe<Scalars['Int']['input']>;
  notEqualTo?: InputMaybe<Scalars['Int']['input']>;
};

export type EqualFilterReasonOptionTypeInput = {
  equalAny?: InputMaybe<Array<ReasonOptionNodeType>>;
  equalTo?: InputMaybe<ReasonOptionNodeType>;
  notEqualTo?: InputMaybe<ReasonOptionNodeType>;
};

export type EqualFilterReportContextInput = {
  equalAny?: InputMaybe<Array<ReportContext>>;
  equalTo?: InputMaybe<ReportContext>;
  notEqualTo?: InputMaybe<ReportContext>;
};

export type EqualFilterRequisitionStatusInput = {
  equalAny?: InputMaybe<Array<RequisitionNodeStatus>>;
  equalTo?: InputMaybe<RequisitionNodeStatus>;
  notEqualTo?: InputMaybe<RequisitionNodeStatus>;
};

export type EqualFilterRequisitionTypeInput = {
  equalAny?: InputMaybe<Array<RequisitionNodeType>>;
  equalTo?: InputMaybe<RequisitionNodeType>;
  notEqualTo?: InputMaybe<RequisitionNodeType>;
};

export type EqualFilterStatusInput = {
  equalAny?: InputMaybe<Array<AssetLogStatusInput>>;
  equalTo?: InputMaybe<AssetLogStatusInput>;
  notEqualTo?: InputMaybe<AssetLogStatusInput>;
};

export type EqualFilterStocktakeStatusInput = {
  equalAny?: InputMaybe<Array<StocktakeNodeStatus>>;
  equalTo?: InputMaybe<StocktakeNodeStatus>;
  notEqualTo?: InputMaybe<StocktakeNodeStatus>;
};

export type EqualFilterStringInput = {
  equalAny?: InputMaybe<Array<Scalars['String']['input']>>;
  equalAnyOrNull?: InputMaybe<Array<Scalars['String']['input']>>;
  equalTo?: InputMaybe<Scalars['String']['input']>;
  notEqualTo?: InputMaybe<Scalars['String']['input']>;
};

export type EqualFilterTemperatureBreachRowTypeInput = {
  equalAny?: InputMaybe<Array<TemperatureBreachNodeType>>;
  equalTo?: InputMaybe<TemperatureBreachNodeType>;
  notEqualTo?: InputMaybe<TemperatureBreachNodeType>;
};

export type EqualFilterTypeInput = {
  equalAny?: InputMaybe<Array<NameNodeType>>;
  equalTo?: InputMaybe<NameNodeType>;
  notEqualTo?: InputMaybe<NameNodeType>;
};

export type ExistingLinesInput = {
  itemId: Scalars['String']['input'];
  returnId: Scalars['String']['input'];
};

export type FailedToFetchReportData = PrintReportErrorInterface & {
  __typename: 'FailedToFetchReportData';
  description: Scalars['String']['output'];
  errors: Scalars['JSON']['output'];
};

export type FailedTranslation = QueryReportErrorInterface &
  QueryReportsErrorInterface & {
    __typename: 'FailedTranslation';
    description: Scalars['String']['output'];
  };

export type FinaliseRnRFormInput = {
  id: Scalars['String']['input'];
};

export type FinaliseRnRFormResponse = RnRFormNode;

export type FinalisedRequisition = DeleteResponseRequisitionErrorInterface & {
  __typename: 'FinalisedRequisition';
  description: Scalars['String']['output'];
};

export enum ForeignKey {
  InvoiceId = 'invoiceId',
  ItemId = 'itemId',
  LocationId = 'locationId',
  OtherPartyId = 'otherPartyId',
  RequisitionId = 'requisitionId',
  StockLineId = 'stockLineId',
}

export type ForeignKeyError = DeleteInboundShipmentLineErrorInterface &
  DeleteInboundShipmentServiceLineErrorInterface &
  DeleteOutboundShipmentLineErrorInterface &
  DeleteOutboundShipmentServiceLineErrorInterface &
  DeleteOutboundShipmentUnallocatedLineErrorInterface &
  DeletePrescriptionLineErrorInterface &
  DeleteResponseRequisitionLineErrorInterface &
  InsertInboundShipmentLineErrorInterface &
  InsertInboundShipmentServiceLineErrorInterface &
  InsertOutboundShipmentLineErrorInterface &
  InsertOutboundShipmentServiceLineErrorInterface &
  InsertOutboundShipmentUnallocatedLineErrorInterface &
  InsertPrescriptionLineErrorInterface &
  InsertRequestRequisitionLineErrorInterface &
  InsertResponseRequisitionLineErrorInterface &
  SetPrescribedQuantityErrorInterface &
  UpdateInboundShipmentLineErrorInterface &
  UpdateInboundShipmentServiceLineErrorInterface &
  UpdateOutboundShipmentLineErrorInterface &
  UpdateOutboundShipmentServiceLineErrorInterface &
  UpdateOutboundShipmentUnallocatedLineErrorInterface &
  UpdatePrescriptionLineErrorInterface &
  UpdateRequestRequisitionLineErrorInterface &
  UpdateResponseRequisitionLineErrorInterface & {
    __typename: 'ForeignKeyError';
    description: Scalars['String']['output'];
    key: ForeignKey;
  };

export type FormSchemaConnector = {
  __typename: 'FormSchemaConnector';
  nodes: Array<FormSchemaNode>;
  totalCount: Scalars['Int']['output'];
};

export type FormSchemaFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<EqualFilterStringInput>;
};

export type FormSchemaNode = {
  __typename: 'FormSchemaNode';
  id: Scalars['String']['output'];
  jsonSchema: Scalars['JSON']['output'];
  type: Scalars['String']['output'];
  uiSchema: Scalars['JSON']['output'];
};

export type FormSchemaResponse = FormSchemaConnector;

export enum FormSchemaSortFieldInput {
  Id = 'id',
}

export type FormSchemaSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: FormSchemaSortFieldInput;
};

export type FrontendPluginMetadataNode = {
  __typename: 'FrontendPluginMetadataNode';
  code: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type FullSyncStatusNode = {
  __typename: 'FullSyncStatusNode';
  error?: Maybe<SyncErrorNode>;
  errorThreshold: Scalars['Int']['output'];
  integration?: Maybe<SyncStatusWithProgressNode>;
  isSyncing: Scalars['Boolean']['output'];
  lastSuccessfulSync?: Maybe<SyncStatusNode>;
  prepareInitial?: Maybe<SyncStatusNode>;
  pullCentral?: Maybe<SyncStatusWithProgressNode>;
  pullRemote?: Maybe<SyncStatusWithProgressNode>;
  pullV6?: Maybe<SyncStatusWithProgressNode>;
  push?: Maybe<SyncStatusWithProgressNode>;
  pushV6?: Maybe<SyncStatusWithProgressNode>;
  summary: SyncStatusNode;
  warningThreshold: Scalars['Int']['output'];
};

export enum GenderType {
  Female = 'FEMALE',
  Male = 'MALE',
  NonBinary = 'NON_BINARY',
  Transgender = 'TRANSGENDER',
  TransgenderFemale = 'TRANSGENDER_FEMALE',
  TransgenderFemaleHormone = 'TRANSGENDER_FEMALE_HORMONE',
  TransgenderFemaleSurgical = 'TRANSGENDER_FEMALE_SURGICAL',
  TransgenderMale = 'TRANSGENDER_MALE',
  TransgenderMaleHormone = 'TRANSGENDER_MALE_HORMONE',
  TransgenderMaleSurgical = 'TRANSGENDER_MALE_SURGICAL',
  Unknown = 'UNKNOWN',
}

export type GenerateCustomerReturnLinesInput = {
  existingLinesInput?: InputMaybe<ExistingLinesInput>;
  /** The ids of the outbound shipment lines to generate new return lines for */
  outboundShipmentLineIds: Array<Scalars['String']['input']>;
};

export type GenerateCustomerReturnLinesResponse =
  GeneratedCustomerReturnLineConnector;

/** At least one input is required. */
export type GenerateSupplierReturnLinesInput = {
  /** Generate new return lines for all the available stock lines of a specific item */
  itemId?: InputMaybe<Scalars['String']['input']>;
  /** Include existing return lines in the response. Only has an effect when either `stock_line_ids` or `item_id` is set. */
  returnId?: InputMaybe<Scalars['String']['input']>;
  /** The stock line ids to generate new return lines for */
  stockLineIds: Array<Scalars['String']['input']>;
};

export type GenerateSupplierReturnLinesResponse = SupplierReturnLineConnector;

export type GeneratedCustomerReturnLineConnector = {
  __typename: 'GeneratedCustomerReturnLineConnector';
  nodes: Array<CustomerReturnLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type Gs1DataElement = {
  ai: Scalars['String']['input'];
  data: Scalars['String']['input'];
};

export type IdResponse = {
  __typename: 'IdResponse';
  id: Scalars['String']['output'];
};

export type InboundInvoiceCounts = {
  __typename: 'InboundInvoiceCounts';
  created: InvoiceCountsSummary;
  notDelivered: Scalars['Int']['output'];
};

export type IndicatorColumnNode = {
  __typename: 'IndicatorColumnNode';
  columnNumber: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  value?: Maybe<IndicatorValueNode>;
  valueType?: Maybe<IndicatorValueTypeNode>;
};

export type IndicatorColumnNodeValueArgs = {
  customerNameId: Scalars['String']['input'];
  periodId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type IndicatorLineNode = {
  __typename: 'IndicatorLineNode';
  columns: Array<IndicatorColumnNode>;
  customerIndicatorInfo: Array<CustomerIndicatorInformationNode>;
  line: IndicatorLineRowNode;
};

export type IndicatorLineNodeCustomerIndicatorInfoArgs = {
  periodId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type IndicatorLineRowNode = {
  __typename: 'IndicatorLineRowNode';
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lineNumber: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  valueType?: Maybe<IndicatorValueTypeNode>;
};

export type IndicatorValueNode = {
  __typename: 'IndicatorValueNode';
  id: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export enum IndicatorValueTypeNode {
  Number = 'NUMBER',
  String = 'STRING',
}

export type InitialisationStatusNode = {
  __typename: 'InitialisationStatusNode';
  siteName?: Maybe<Scalars['String']['output']>;
  status: InitialisationStatusType;
};

export enum InitialisationStatusType {
  /** Fuly initialised */
  Initialised = 'INITIALISED',
  /** Sync settings were set and sync was attempted at least once */
  Initialising = 'INITIALISING',
  /** Sync settings are not set and sync was not attempted */
  PreInitialisation = 'PRE_INITIALISATION',
}

export type InitialiseSiteResponse = SyncErrorNode | SyncSettingsNode;

export type InsertAssetCatalogueItemError = {
  __typename: 'InsertAssetCatalogueItemError';
  error: InsertAssetCatalogueItemErrorInterface;
};

export type InsertAssetCatalogueItemErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertAssetCatalogueItemInput = {
  categoryId: Scalars['String']['input'];
  classId: Scalars['String']['input'];
  code: Scalars['String']['input'];
  id: Scalars['String']['input'];
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model: Scalars['String']['input'];
  properties?: InputMaybe<Scalars['String']['input']>;
  subCatalogue: Scalars['String']['input'];
  typeId: Scalars['String']['input'];
};

export type InsertAssetCatalogueItemResponse =
  | AssetCatalogueItemNode
  | InsertAssetCatalogueItemError;

export type InsertAssetError = {
  __typename: 'InsertAssetError';
  error: InsertAssetErrorInterface;
};

export type InsertAssetErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertAssetInput = {
  assetNumber?: InputMaybe<Scalars['String']['input']>;
  catalogueItemId?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  classId?: InputMaybe<Scalars['String']['input']>;
  donorNameId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  installationDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  lockedFieldsJson?: InputMaybe<Scalars['String']['input']>;
  needsReplacement?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Scalars['String']['input']>;
  replacementDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  typeId?: InputMaybe<Scalars['String']['input']>;
  warrantyEnd?: InputMaybe<Scalars['NaiveDate']['input']>;
  warrantyStart?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type InsertAssetLogError = {
  __typename: 'InsertAssetLogError';
  error: InsertAssetLogErrorInterface;
};

export type InsertAssetLogErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertAssetLogInput = {
  assetId: Scalars['String']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  reasonId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AssetLogStatusInput>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type InsertAssetLogReasonError = {
  __typename: 'InsertAssetLogReasonError';
  error: InsertAssetLogReasonErrorInterface;
};

export type InsertAssetLogReasonErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertAssetLogReasonInput = {
  assetLogStatus: AssetLogStatusInput;
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type InsertAssetLogReasonResponse =
  | AssetLogReasonNode
  | InsertAssetLogReasonError;

export type InsertAssetLogResponse = AssetLogNode | InsertAssetLogError;

export type InsertAssetResponse = AssetNode | InsertAssetError;

export type InsertBarcodeInput = {
  gtin: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  packSize?: InputMaybe<Scalars['Float']['input']>;
};

export type InsertBarcodeResponse = BarcodeNode;

export type InsertContactFormInput = {
  body: Scalars['String']['input'];
  contactType: ContactFormNodeType;
  id: Scalars['String']['input'];
  replyEmail: Scalars['String']['input'];
};

export type InsertContactFormResponse = InsertResponse;

export type InsertContactTraceInput = {
  /** Contact trace document data */
  data: Scalars['JSON']['input'];
  /** The patient ID the contact belongs to */
  patientId: Scalars['String']['input'];
  /** The schema id used for the encounter data */
  schemaId: Scalars['String']['input'];
  /** The contact trace document type */
  type: Scalars['String']['input'];
};

export type InsertContactTraceResponse = ContactTraceNode;

export type InsertCustomerReturnError = {
  __typename: 'InsertCustomerReturnError';
  error: InsertCustomerReturnErrorInterface;
};

export type InsertCustomerReturnErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertCustomerReturnResponse =
  | InsertCustomerReturnError
  | InvoiceNode;

export type InsertDemographicIndicatorError = {
  __typename: 'InsertDemographicIndicatorError';
  error: InsertDemographicIndicatorErrorInterface;
};

export type InsertDemographicIndicatorErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertDemographicIndicatorInput = {
  basePopulation?: InputMaybe<Scalars['Int']['input']>;
  baseYear: Scalars['Int']['input'];
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  populationPercentage?: InputMaybe<Scalars['Float']['input']>;
  year1Projection?: InputMaybe<Scalars['Int']['input']>;
  year2Projection?: InputMaybe<Scalars['Int']['input']>;
  year3Projection?: InputMaybe<Scalars['Int']['input']>;
  year4Projection?: InputMaybe<Scalars['Int']['input']>;
  year5Projection?: InputMaybe<Scalars['Int']['input']>;
};

export type InsertDemographicIndicatorResponse =
  | DemographicIndicatorNode
  | InsertDemographicIndicatorError;

export type InsertDemographicProjectionError = {
  __typename: 'InsertDemographicProjectionError';
  error: InsertDemographicProjectionErrorInterface;
};

export type InsertDemographicProjectionErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertDemographicProjectionInput = {
  baseYear: Scalars['Int']['input'];
  id: Scalars['String']['input'];
  year1?: InputMaybe<Scalars['Float']['input']>;
  year2?: InputMaybe<Scalars['Float']['input']>;
  year3?: InputMaybe<Scalars['Float']['input']>;
  year4?: InputMaybe<Scalars['Float']['input']>;
  year5?: InputMaybe<Scalars['Float']['input']>;
};

export type InsertDemographicProjectionResponse =
  | DemographicProjectionNode
  | InsertDemographicProjectionError;

export type InsertDocumentRegistryInput = {
  category: DocumentRegistryCategoryNode;
  contextId: Scalars['String']['input'];
  documentType: Scalars['String']['input'];
  formSchemaId: Scalars['String']['input'];
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type InsertDocumentResponse = DocumentRegistryNode;

export type InsertEncounterInput = {
  /** Encounter document data */
  data: Scalars['JSON']['input'];
  patientId: Scalars['String']['input'];
  /** The schema id used for the encounter data */
  schemaId: Scalars['String']['input'];
  /** The encounter type */
  type: Scalars['String']['input'];
};

export type InsertEncounterResponse = EncounterNode;

export type InsertErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertFormSchemaInput = {
  id: Scalars['String']['input'];
  jsonSchema: Scalars['JSON']['input'];
  type: Scalars['String']['input'];
  uiSchema: Scalars['JSON']['input'];
};

export type InsertFormSchemaResponse = FormSchemaNode;

export type InsertFromInternalOrderResponse = InvoiceLineNode;

export type InsertInboundShipmentError = {
  __typename: 'InsertInboundShipmentError';
  error: InsertInboundShipmentErrorInterface;
};

export type InsertInboundShipmentErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertInboundShipmentInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  otherPartyId: Scalars['String']['input'];
  requisitionId?: InputMaybe<Scalars['String']['input']>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type InsertInboundShipmentLineError = {
  __typename: 'InsertInboundShipmentLineError';
  error: InsertInboundShipmentLineErrorInterface;
};

export type InsertInboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertInboundShipmentLineFromInternalOrderLineInput = {
  invoiceId: Scalars['String']['input'];
  requisitionLineId: Scalars['String']['input'];
};

export type InsertInboundShipmentLineFromInternalOrderLineResponseWithId = {
  __typename: 'InsertInboundShipmentLineFromInternalOrderLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertFromInternalOrderResponse;
};

export type InsertInboundShipmentLineInput = {
  batch?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['String']['input']>;
  costPricePerPack: Scalars['Float']['input'];
  donorId?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  itemVariantId?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<NullableStringUpdate>;
  numberOfPacks: Scalars['Float']['input'];
  packSize: Scalars['Float']['input'];
  sellPricePerPack: Scalars['Float']['input'];
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
  totalBeforeTax?: InputMaybe<Scalars['Float']['input']>;
  vvmStatusId?: InputMaybe<Scalars['String']['input']>;
};

export type InsertInboundShipmentLineResponse =
  | InsertInboundShipmentLineError
  | InvoiceLineNode;

export type InsertInboundShipmentLineResponseWithId = {
  __typename: 'InsertInboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertInboundShipmentLineResponse;
};

export type InsertInboundShipmentResponse =
  | InsertInboundShipmentError
  | InvoiceNode;

export type InsertInboundShipmentResponseWithId = {
  __typename: 'InsertInboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: InsertInboundShipmentResponse;
};

export type InsertInboundShipmentServiceLineError = {
  __typename: 'InsertInboundShipmentServiceLineError';
  error: InsertInboundShipmentServiceLineErrorInterface;
};

export type InsertInboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertInboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
  totalBeforeTax: Scalars['Float']['input'];
};

export type InsertInboundShipmentServiceLineResponse =
  | InsertInboundShipmentServiceLineError
  | InvoiceLineNode;

export type InsertInboundShipmentServiceLineResponseWithId = {
  __typename: 'InsertInboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertInboundShipmentServiceLineResponse;
};

export type InsertInsuranceInput = {
  discountPercentage: Scalars['Float']['input'];
  expiryDate: Scalars['NaiveDate']['input'];
  id: Scalars['String']['input'];
  insuranceProviderId: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
  nameId: Scalars['String']['input'];
  policyNumberFamily: Scalars['String']['input'];
  policyNumberPerson: Scalars['String']['input'];
  policyType: InsurancePolicyNodeType;
};

export type InsertInsuranceResponse = IdResponse;

export type InsertInventoryAdjustmentErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertLocationError = {
  __typename: 'InsertLocationError';
  error: InsertLocationErrorInterface;
};

export type InsertLocationErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertLocationInput = {
  code: Scalars['String']['input'];
  coldStorageTypeId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
};

export type InsertLocationResponse = InsertLocationError | LocationNode;

export type InsertOutboundShipmentError = {
  __typename: 'InsertOutboundShipmentError';
  error: InsertErrorInterface;
};

export type InsertOutboundShipmentInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  /** The new invoice id provided by the client */
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  /** The other party must be a customer of the current store */
  otherPartyId: Scalars['String']['input'];
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type InsertOutboundShipmentLineError = {
  __typename: 'InsertOutboundShipmentLineError';
  error: InsertOutboundShipmentLineErrorInterface;
};

export type InsertOutboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertOutboundShipmentLineInput = {
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  numberOfPacks: Scalars['Float']['input'];
  stockLineId: Scalars['String']['input'];
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
};

export type InsertOutboundShipmentLineResponse =
  | InsertOutboundShipmentLineError
  | InvoiceLineNode;

export type InsertOutboundShipmentLineResponseWithId = {
  __typename: 'InsertOutboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertOutboundShipmentLineResponse;
};

export type InsertOutboundShipmentResponse =
  | InsertOutboundShipmentError
  | InvoiceNode
  | NodeError;

export type InsertOutboundShipmentResponseWithId = {
  __typename: 'InsertOutboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: InsertOutboundShipmentResponse;
};

export type InsertOutboundShipmentServiceLineError = {
  __typename: 'InsertOutboundShipmentServiceLineError';
  error: InsertOutboundShipmentServiceLineErrorInterface;
};

export type InsertOutboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertOutboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
  totalBeforeTax: Scalars['Float']['input'];
};

export type InsertOutboundShipmentServiceLineResponse =
  | InsertOutboundShipmentServiceLineError
  | InvoiceLineNode;

export type InsertOutboundShipmentServiceLineResponseWithId = {
  __typename: 'InsertOutboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertOutboundShipmentServiceLineResponse;
};

export type InsertOutboundShipmentUnallocatedLineError = {
  __typename: 'InsertOutboundShipmentUnallocatedLineError';
  error: InsertOutboundShipmentUnallocatedLineErrorInterface;
};

export type InsertOutboundShipmentUnallocatedLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertOutboundShipmentUnallocatedLineInput = {
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
};

export type InsertOutboundShipmentUnallocatedLineResponse =
  | InsertOutboundShipmentUnallocatedLineError
  | InvoiceLineNode;

export type InsertOutboundShipmentUnallocatedLineResponseWithId = {
  __typename: 'InsertOutboundShipmentUnallocatedLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertOutboundShipmentUnallocatedLineResponse;
};

export type InsertPatientInput = {
  address1?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  code2?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  dateOfDeath?: InputMaybe<Scalars['NaiveDate']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<GenderType>;
  id: Scalars['String']['input'];
  isDeceased?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  nextOfKinId?: InputMaybe<Scalars['String']['input']>;
  nextOfKinName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type InsertPatientResponse = PatientNode;

export type InsertPluginDataInput = {
  data: Scalars['String']['input'];
  dataIdentifier: Scalars['String']['input'];
  id: Scalars['String']['input'];
  pluginCode: Scalars['String']['input'];
  relatedRecordId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type InsertPluginDataResponse = PluginDataNode;

export type InsertPrescriptionInput = {
  clinicianId?: InputMaybe<Scalars['String']['input']>;
  diagnosisId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  patientId: Scalars['String']['input'];
  prescriptionDate?: InputMaybe<Scalars['DateTime']['input']>;
  programId?: InputMaybe<Scalars['String']['input']>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type InsertPrescriptionLineError = {
  __typename: 'InsertPrescriptionLineError';
  error: InsertPrescriptionLineErrorInterface;
};

export type InsertPrescriptionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertPrescriptionLineInput = {
  id: Scalars['String']['input'];
  invoiceId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  numberOfPacks: Scalars['Float']['input'];
  stockLineId: Scalars['String']['input'];
};

export type InsertPrescriptionLineResponse =
  | InsertPrescriptionLineError
  | InvoiceLineNode;

export type InsertPrescriptionLineResponseWithId = {
  __typename: 'InsertPrescriptionLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertPrescriptionLineResponse;
};

export type InsertPrescriptionResponse = InvoiceNode;

export type InsertPrescriptionResponseWithId = {
  __typename: 'InsertPrescriptionResponseWithId';
  id: Scalars['String']['output'];
  response: InsertPrescriptionResponse;
};

export type InsertPrinterInput = {
  address: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  labelHeight: Scalars['Int']['input'];
  labelWidth: Scalars['Int']['input'];
  port: Scalars['Int']['input'];
};

export type InsertPrinterResponse = PrinterNode;

export type InsertProgramEnrolmentInput = {
  /** Program document data */
  data: Scalars['JSON']['input'];
  patientId: Scalars['String']['input'];
  /** The schema id used for the program data */
  schemaId: Scalars['String']['input'];
  /** The program type */
  type: Scalars['String']['input'];
};

export type InsertProgramEnrolmentResponse = ProgramEnrolmentNode;

export type InsertProgramPatientInput = {
  /** Patient document data */
  data: Scalars['JSON']['input'];
  /** The schema id used for the patient data */
  schemaId: Scalars['String']['input'];
};

export type InsertProgramPatientResponse = PatientNode;

export type InsertProgramRequestRequisitionError = {
  __typename: 'InsertProgramRequestRequisitionError';
  error: InsertProgramRequestRequisitionErrorInterface;
};

export type InsertProgramRequestRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertProgramRequestRequisitionInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  /** Defaults to 2 weeks from now */
  expectedDeliveryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  otherPartyId: Scalars['String']['input'];
  periodId: Scalars['String']['input'];
  programOrderTypeId: Scalars['String']['input'];
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type InsertProgramRequestRequisitionResponse =
  | InsertProgramRequestRequisitionError
  | RequisitionNode;

export type InsertProgramResponseRequisitionError = {
  __typename: 'InsertProgramResponseRequisitionError';
  error: InsertProgramResponseRequisitionErrorInterface;
};

export type InsertProgramResponseRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertProgramResponseRequisitionInput = {
  id: Scalars['String']['input'];
  otherPartyId: Scalars['String']['input'];
  periodId: Scalars['String']['input'];
  programOrderTypeId: Scalars['String']['input'];
};

export type InsertProgramResponseRequisitionResponse =
  | InsertProgramResponseRequisitionError
  | RequisitionNode;

export type InsertRepackError = {
  __typename: 'InsertRepackError';
  error: InsertRepackErrorInterface;
};

export type InsertRepackErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertRepackInput = {
  newLocationId?: InputMaybe<Scalars['String']['input']>;
  newPackSize: Scalars['Float']['input'];
  numberOfPacks: Scalars['Float']['input'];
  stockLineId: Scalars['String']['input'];
};

export type InsertRepackResponse = InsertRepackError | InvoiceNode;

export type InsertRequestRequisitionError = {
  __typename: 'InsertRequestRequisitionError';
  error: InsertRequestRequisitionErrorInterface;
};

export type InsertRequestRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertRequestRequisitionInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  /** Defaults to 2 weeks from now */
  expectedDeliveryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  maxMonthsOfStock: Scalars['Float']['input'];
  minMonthsOfStock: Scalars['Float']['input'];
  otherPartyId: Scalars['String']['input'];
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type InsertRequestRequisitionLineError = {
  __typename: 'InsertRequestRequisitionLineError';
  error: InsertRequestRequisitionLineErrorInterface;
};

export type InsertRequestRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertRequestRequisitionLineInput = {
  id: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  requisitionId: Scalars['String']['input'];
};

export type InsertRequestRequisitionLineResponse =
  | InsertRequestRequisitionLineError
  | RequisitionLineNode;

export type InsertRequestRequisitionLineResponseWithId = {
  __typename: 'InsertRequestRequisitionLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertRequestRequisitionLineResponse;
};

export type InsertRequestRequisitionResponse =
  | InsertRequestRequisitionError
  | RequisitionNode;

export type InsertRequestRequisitionResponseWithId = {
  __typename: 'InsertRequestRequisitionResponseWithId';
  id: Scalars['String']['output'];
  response: InsertRequestRequisitionResponse;
};

export type InsertResponse = {
  __typename: 'InsertResponse';
  id: Scalars['String']['output'];
};

export type InsertResponseRequisitionError = {
  __typename: 'InsertResponseRequisitionError';
  error: InsertResponseRequisitionErrorInterface;
};

export type InsertResponseRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertResponseRequisitionInput = {
  id: Scalars['String']['input'];
  maxMonthsOfStock: Scalars['Float']['input'];
  minMonthsOfStock: Scalars['Float']['input'];
  otherPartyId: Scalars['String']['input'];
};

export type InsertResponseRequisitionLineError = {
  __typename: 'InsertResponseRequisitionLineError';
  error: InsertResponseRequisitionLineErrorInterface;
};

export type InsertResponseRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertResponseRequisitionLineInput = {
  id: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  requisitionId: Scalars['String']['input'];
};

export type InsertResponseRequisitionLineResponse =
  | InsertResponseRequisitionLineError
  | RequisitionLineNode;

export type InsertResponseRequisitionResponse =
  | InsertResponseRequisitionError
  | RequisitionNode;

export type InsertRnRFormInput = {
  id: Scalars['String']['input'];
  periodId: Scalars['String']['input'];
  programId: Scalars['String']['input'];
  supplierId: Scalars['String']['input'];
};

export type InsertRnRFormResponse = RnRFormNode;

export type InsertStockLineError = {
  __typename: 'InsertStockLineError';
  error: InsertStockLineErrorInterface;
};

export type InsertStockLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertStockLineInput = {
  /** Empty barcode will unlink barcode from StockLine */
  barcode?: InputMaybe<Scalars['String']['input']>;
  batch?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<Scalars['String']['input']>;
  costPricePerPack: Scalars['Float']['input'];
  donorId?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  /** @deprecated Since 2.8.0. Use reason_option_id */
  inventoryAdjustmentReasonId?: InputMaybe<Scalars['String']['input']>;
  itemId: Scalars['String']['input'];
  itemVariantId?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<NullableStringUpdate>;
  numberOfPacks: Scalars['Float']['input'];
  onHold: Scalars['Boolean']['input'];
  packSize: Scalars['Float']['input'];
  reasonOptionId?: InputMaybe<Scalars['String']['input']>;
  sellPricePerPack: Scalars['Float']['input'];
  vvmStatusId?: InputMaybe<Scalars['String']['input']>;
};

export type InsertStockLineLineResponse = InsertStockLineError | StockLineNode;

export type InsertStocktakeInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiresBefore?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  isInitialStocktake?: InputMaybe<Scalars['Boolean']['input']>;
  itemsHaveStock?: InputMaybe<Scalars['Boolean']['input']>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  masterListId?: InputMaybe<Scalars['String']['input']>;
};

export type InsertStocktakeLineError = {
  __typename: 'InsertStocktakeLineError';
  error: InsertStocktakeLineErrorInterface;
};

export type InsertStocktakeLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertStocktakeLineInput = {
  batch?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  costPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  countedNumberOfPacks?: InputMaybe<Scalars['Float']['input']>;
  donorId?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  /** @deprecated Since 2.8.0. Use reason_option_id */
  inventoryAdjustmentReasonId?: InputMaybe<Scalars['String']['input']>;
  itemId?: InputMaybe<Scalars['String']['input']>;
  itemVariantId?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<NullableStringUpdate>;
  note?: InputMaybe<Scalars['String']['input']>;
  packSize?: InputMaybe<Scalars['Float']['input']>;
  reasonOptionId?: InputMaybe<Scalars['String']['input']>;
  sellPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  stockLineId?: InputMaybe<Scalars['String']['input']>;
  stocktakeId: Scalars['String']['input'];
};

export type InsertStocktakeLineResponse =
  | InsertStocktakeLineError
  | StocktakeLineNode;

export type InsertStocktakeLineResponseWithId = {
  __typename: 'InsertStocktakeLineResponseWithId';
  id: Scalars['String']['output'];
  response: InsertStocktakeLineResponse;
};

export type InsertStocktakeResponse = StocktakeNode;

export type InsertStocktakeResponseWithId = {
  __typename: 'InsertStocktakeResponseWithId';
  id: Scalars['String']['output'];
  response: InsertStocktakeResponse;
};

export type InsertSupplierReturnError = {
  __typename: 'InsertSupplierReturnError';
  error: InsertSupplierReturnErrorInterface;
};

export type InsertSupplierReturnErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertSupplierReturnResponse =
  | InsertSupplierReturnError
  | InvoiceNode;

export type InsertVvmStatusLogInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  statusId: Scalars['String']['input'];
  stockLineId: Scalars['String']['input'];
};

export type InsertVvmStatusLogResponse = VvmstatusLogNode;

export type InsertVaccinationInput = {
  clinicianId?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  encounterId: Scalars['String']['input'];
  facilityFreeText?: InputMaybe<Scalars['String']['input']>;
  facilityNameId?: InputMaybe<Scalars['String']['input']>;
  given: Scalars['Boolean']['input'];
  id: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  notGivenReason?: InputMaybe<Scalars['String']['input']>;
  stockLineId?: InputMaybe<Scalars['String']['input']>;
  vaccinationDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  vaccineCourseDoseId: Scalars['String']['input'];
};

export type InsertVaccinationResponse = VaccinationNode;

export type InsertVaccineCourseError = {
  __typename: 'InsertVaccineCourseError';
  error: InsertVaccineCourseErrorInterface;
};

export type InsertVaccineCourseErrorInterface = {
  description: Scalars['String']['output'];
};

export type InsertVaccineCourseInput = {
  coverageRate: Scalars['Float']['input'];
  demographicId?: InputMaybe<Scalars['String']['input']>;
  doses: Array<UpsertVaccineCourseDoseInput>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  programId: Scalars['String']['input'];
  useInGapsCalculations: Scalars['Boolean']['input'];
  vaccineItems: Array<UpsertVaccineCourseItemInput>;
  wastageRate: Scalars['Float']['input'];
};

export type InsertVaccineCourseResponse =
  | InsertVaccineCourseError
  | VaccineCourseNode;

export type InsuranceConnector = {
  __typename: 'InsuranceConnector';
  nodes: Array<InsurancePolicyNode>;
};

export type InsurancePolicyNode = {
  __typename: 'InsurancePolicyNode';
  discountPercentage: Scalars['Float']['output'];
  expiryDate: Scalars['NaiveDate']['output'];
  id: Scalars['String']['output'];
  insuranceProviderId: Scalars['String']['output'];
  insuranceProviders?: Maybe<InsuranceProviderNode>;
  isActive: Scalars['Boolean']['output'];
  policyNumber: Scalars['String']['output'];
  policyNumberFamily?: Maybe<Scalars['String']['output']>;
  policyNumberPerson?: Maybe<Scalars['String']['output']>;
  policyType: InsurancePolicyNodeType;
};

export enum InsurancePolicyNodeType {
  Business = 'BUSINESS',
  Personal = 'PERSONAL',
}

export type InsuranceProviderNode = {
  __typename: 'InsuranceProviderNode';
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  prescriptionValidityDays?: Maybe<Scalars['Int']['output']>;
  providerName: Scalars['String']['output'];
};

export type InsuranceProvidersConnector = {
  __typename: 'InsuranceProvidersConnector';
  nodes: Array<InsuranceProvidersNode>;
};

export type InsuranceProvidersNode = {
  __typename: 'InsuranceProvidersNode';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  prescriptionValidityDays?: Maybe<Scalars['Int']['output']>;
  providerName: Scalars['String']['output'];
};

export type InsuranceProvidersResponse = InsuranceProvidersConnector;

export type InsuranceResponse = InsurancePolicyNode;

export enum InsuranceSortFieldInput {
  ExpiryDate = 'expiryDate',
  IsActive = 'isActive',
}

export type InsuranceSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: InsuranceSortFieldInput;
};

export type InsurancesResponse = InsuranceConnector;

export type InternalError = InsertAssetCatalogueItemErrorInterface &
  InsertAssetErrorInterface &
  InsertAssetLogErrorInterface &
  InsertAssetLogReasonErrorInterface &
  InsertDemographicIndicatorErrorInterface &
  InsertDemographicProjectionErrorInterface &
  InsertLocationErrorInterface &
  RefreshTokenErrorInterface &
  ScannedDataParseErrorInterface &
  UpdateAssetErrorInterface &
  UpdateDemographicIndicatorErrorInterface &
  UpdateDemographicProjectionErrorInterface &
  UpdateLocationErrorInterface &
  UpdateSensorErrorInterface &
  UpsertBundledItemErrorInterface &
  UpsertCampaignErrorInterface &
  UpsertItemVariantErrorInterface & {
    __typename: 'InternalError';
    description: Scalars['String']['output'];
    fullError: Scalars['String']['output'];
  };

export type InvalidCredentials = AuthTokenErrorInterface &
  UpdateUserErrorInterface & {
    __typename: 'InvalidCredentials';
    description: Scalars['String']['output'];
  };

export type InvalidStockSelection = UpdatePrescriptionErrorInterface & {
  __typename: 'InvalidStockSelection';
  description: Scalars['String']['output'];
};

export type InvalidToken = RefreshTokenErrorInterface & {
  __typename: 'InvalidToken';
  description: Scalars['String']['output'];
};

export type InventoryAdjustmentReasonConnector = {
  __typename: 'InventoryAdjustmentReasonConnector';
  nodes: Array<InventoryAdjustmentReasonNode>;
  totalCount: Scalars['Int']['output'];
};

export type InventoryAdjustmentReasonFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<EqualFilterInventoryAdjustmentReasonTypeInput>;
};

export type InventoryAdjustmentReasonNode = {
  __typename: 'InventoryAdjustmentReasonNode';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  reason: Scalars['String']['output'];
  type: InventoryAdjustmentReasonNodeType;
};

export enum InventoryAdjustmentReasonNodeType {
  Negative = 'NEGATIVE',
  Positive = 'POSITIVE',
}

export type InventoryAdjustmentReasonResponse =
  InventoryAdjustmentReasonConnector;

export enum InventoryAdjustmentReasonSortFieldInput {
  Id = 'id',
  InventoryAdjustmentReasonType = 'inventoryAdjustmentReasonType',
  Reason = 'reason',
}

export type InventoryAdjustmentReasonSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: InventoryAdjustmentReasonSortFieldInput;
};

export type InvoiceConnector = {
  __typename: 'InvoiceConnector';
  nodes: Array<InvoiceNode>;
  totalCount: Scalars['Int']['output'];
};

export type InvoiceCounts = {
  __typename: 'InvoiceCounts';
  inbound: InboundInvoiceCounts;
  outbound: OutboundInvoiceCounts;
};

export type InvoiceCountsSummary = {
  __typename: 'InvoiceCountsSummary';
  thisWeek: Scalars['Int']['output'];
  today: Scalars['Int']['output'];
};

export type InvoiceFilterInput = {
  allocatedDatetime?: InputMaybe<DatetimeFilterInput>;
  colour?: InputMaybe<EqualFilterStringInput>;
  comment?: InputMaybe<StringFilterInput>;
  createdDatetime?: InputMaybe<DatetimeFilterInput>;
  createdOrBackdatedDatetime?: InputMaybe<DatetimeFilterInput>;
  deliveredDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  invoiceNumber?: InputMaybe<EqualFilterBigNumberInput>;
  isProgramInvoice?: InputMaybe<Scalars['Boolean']['input']>;
  linkedInvoiceId?: InputMaybe<EqualFilterStringInput>;
  nameId?: InputMaybe<EqualFilterStringInput>;
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  otherPartyId?: InputMaybe<EqualFilterStringInput>;
  otherPartyName?: InputMaybe<StringFilterInput>;
  pickedDatetime?: InputMaybe<DatetimeFilterInput>;
  receivedDatetime?: InputMaybe<DatetimeFilterInput>;
  requisitionId?: InputMaybe<EqualFilterStringInput>;
  shippedDatetime?: InputMaybe<DatetimeFilterInput>;
  status?: InputMaybe<EqualFilterInvoiceStatusInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
  theirReference?: InputMaybe<StringFilterInput>;
  transportReference?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<EqualFilterInvoiceTypeInput>;
  userId?: InputMaybe<EqualFilterStringInput>;
  verifiedDatetime?: InputMaybe<DatetimeFilterInput>;
};

export type InvoiceIsNotEditable = UpdateErrorInterface &
  UpdateNameErrorInterface &
  UpdatePrescriptionErrorInterface &
  UpdateReturnOtherPartyErrorInterface & {
    __typename: 'InvoiceIsNotEditable';
    description: Scalars['String']['output'];
  };

export type InvoiceLineConnector = {
  __typename: 'InvoiceLineConnector';
  nodes: Array<InvoiceLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type InvoiceLineFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  /** @deprecated Since 2.8.0. Use reason_option */
  inventoryAdjustmentReason?: InputMaybe<EqualFilterStringInput>;
  invoiceId?: InputMaybe<EqualFilterStringInput>;
  invoiceStatus?: InputMaybe<EqualFilterInvoiceStatusInput>;
  invoiceType?: InputMaybe<EqualFilterInvoiceTypeInput>;
  itemId?: InputMaybe<EqualFilterStringInput>;
  locationId?: InputMaybe<EqualFilterStringInput>;
  numberOfPacks?: InputMaybe<EqualFilterBigFloatingNumberInput>;
  reasonOption?: InputMaybe<EqualFilterStringInput>;
  requisitionId?: InputMaybe<EqualFilterStringInput>;
  stockLineId?: InputMaybe<EqualFilterStringInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
  type?: InputMaybe<EqualFilterInvoiceLineTypeInput>;
  verifiedDatetime?: InputMaybe<DatetimeFilterInput>;
};

export type InvoiceLineNode = {
  __typename: 'InvoiceLineNode';
  batch?: Maybe<Scalars['String']['output']>;
  campaign?: Maybe<CampaignNode>;
  costPricePerPack: Scalars['Float']['output'];
  donor?: Maybe<NameNode>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  foreignCurrencyPriceBeforeTax?: Maybe<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  /** @deprecated Since 2.8.0. Use reason_option instead */
  inventoryAdjustmentReason?: Maybe<InventoryAdjustmentReasonNode>;
  invoiceId: Scalars['String']['output'];
  item: ItemNode;
  itemCode: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  itemVariant?: Maybe<ItemVariantNode>;
  itemVariantId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<LocationNode>;
  locationId?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  numberOfPacks: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  prescribedQuantity?: Maybe<Scalars['Float']['output']>;
  pricing: PricingNode;
  reasonOption?: Maybe<ReasonOptionNode>;
  /** @deprecated Since 2.8.0. Use reason_option instead */
  returnReason?: Maybe<ReturnReasonNode>;
  /** @deprecated Since 2.8.0. Use reason_option instead */
  returnReasonId?: Maybe<Scalars['String']['output']>;
  sellPricePerPack: Scalars['Float']['output'];
  stockLine?: Maybe<StockLineNode>;
  taxPercentage?: Maybe<Scalars['Float']['output']>;
  totalAfterTax: Scalars['Float']['output'];
  totalBeforeTax: Scalars['Float']['output'];
  type: InvoiceLineNodeType;
  vvmStatusId?: Maybe<Scalars['String']['output']>;
};

export type InvoiceLineNodeDonorArgs = {
  storeId: Scalars['String']['input'];
};

export enum InvoiceLineNodeType {
  Service = 'SERVICE',
  StockIn = 'STOCK_IN',
  StockOut = 'STOCK_OUT',
  UnallocatedStock = 'UNALLOCATED_STOCK',
}

export enum InvoiceLineSortFieldInput {
  /** Invoice line batch */
  Batch = 'batch',
  /** Invoice line expiry date */
  ExpiryDate = 'expiryDate',
  ItemCode = 'itemCode',
  ItemName = 'itemName',
  /** Invoice line item stock location name */
  LocationName = 'locationName',
  /** Invoice line pack size */
  PackSize = 'packSize',
}

export type InvoiceLineSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: InvoiceLineSortFieldInput;
};

export type InvoiceLinesResponse = InvoiceLineConnector;

export type InvoiceNode = {
  __typename: 'InvoiceNode';
  allocatedDatetime?: Maybe<Scalars['DateTime']['output']>;
  backdatedDatetime?: Maybe<Scalars['DateTime']['output']>;
  cancelledDatetime?: Maybe<Scalars['DateTime']['output']>;
  clinician?: Maybe<ClinicianNode>;
  clinicianId?: Maybe<Scalars['String']['output']>;
  colour?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['DateTime']['output'];
  currency?: Maybe<CurrencyNode>;
  currencyRate: Scalars['Float']['output'];
  defaultDonor?: Maybe<NameNode>;
  deliveredDatetime?: Maybe<Scalars['DateTime']['output']>;
  diagnosis?: Maybe<DiagnosisNode>;
  diagnosisId?: Maybe<Scalars['String']['output']>;
  expectedDeliveryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  insuranceDiscountAmount?: Maybe<Scalars['Float']['output']>;
  insuranceDiscountPercentage?: Maybe<Scalars['Float']['output']>;
  insurancePolicy?: Maybe<InsurancePolicyNode>;
  invoiceNumber: Scalars['Int']['output'];
  isCancellation: Scalars['Boolean']['output'];
  lines: InvoiceLineConnector;
  /** Inbound Shipment <-> Outbound Shipment, where Inbound Shipment originated from Outbound Shipment */
  linkedShipment?: Maybe<InvoiceNode>;
  nameInsuranceJoinId?: Maybe<Scalars['String']['output']>;
  onHold: Scalars['Boolean']['output'];
  /**
   * Inbound Shipment that is the origin of this Supplier Return
   * OR Outbound Shipment that is the origin of this Customer Return
   */
  originalShipment?: Maybe<InvoiceNode>;
  otherParty: NameNode;
  otherPartyId: Scalars['String']['output'];
  otherPartyName: Scalars['String']['output'];
  patient?: Maybe<PatientNode>;
  pickedDatetime?: Maybe<Scalars['DateTime']['output']>;
  pricing: PricingNode;
  program?: Maybe<ProgramNode>;
  programId?: Maybe<Scalars['String']['output']>;
  receivedDatetime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Response Requisition that is the origin of this Outbound Shipment
   * Or Request Requisition for Inbound Shipment that Originated from Outbound Shipment (linked through Response Requisition)
   */
  requisition?: Maybe<RequisitionNode>;
  shippedDatetime?: Maybe<Scalars['DateTime']['output']>;
  status: InvoiceNodeStatus;
  store?: Maybe<StoreNode>;
  taxPercentage?: Maybe<Scalars['Float']['output']>;
  theirReference?: Maybe<Scalars['String']['output']>;
  transportReference?: Maybe<Scalars['String']['output']>;
  type: InvoiceNodeType;
  /**
   * User that last edited invoice, if user is not found in system default unknown user is returned
   * Null is returned for transfers, where inbound has not been edited yet
   * Null is also returned for system created invoices like inventory adjustments
   */
  user?: Maybe<UserNode>;
  verifiedDatetime?: Maybe<Scalars['DateTime']['output']>;
};

export type InvoiceNodeDefaultDonorArgs = {
  storeId: Scalars['String']['input'];
};

export type InvoiceNodeOtherPartyArgs = {
  storeId: Scalars['String']['input'];
};

export enum InvoiceNodeStatus {
  /**
   * General description: Outbound Shipment is ready for picking (all unallocated lines need to be fullfilled)
   * Outbound Shipment: Invoice can only be turned to allocated status when
   * all unallocated lines are fullfilled
   * Inbound Shipment: not applicable
   */
  Allocated = 'ALLOCATED',
  Cancelled = 'CANCELLED',
  /**
   * General description: Inbound Shipment was received
   * Outbound Shipment: Status is updated based on corresponding inbound Shipment
   * Inbound Shipment: Stock is introduced and can be issued
   */
  Delivered = 'DELIVERED',
  /**
   * Outbound Shipment: available_number_of_packs in a stock line gets
   * updated when items are added to the invoice.
   * Inbound Shipment: No stock changes in this status, only manually entered
   * inbound Shipments have new status
   */
  New = 'NEW',
  /**
   * General description: Outbound Shipment was picked from shelf and ready for Shipment
   * Outbound Shipment: available_number_of_packs and
   * total_number_of_packs get updated when items are added to the invoice
   * Inbound Shipment: For inter store stock transfers an inbound Shipment
   * is created when corresponding outbound Shipment is picked and ready for
   * Shipment, inbound Shipment is not editable in this status
   */
  Picked = 'PICKED',
  /**
   * General description: Received inbound Shipment has arrived, not counted or verified yet
   * Outbound Shipment: Status is updated based on corresponding inbound Shipment
   * Inbound Shipment: Status update, doesn't affect stock levels or restrict access to edit
   */
  Received = 'RECEIVED',
  /**
   * General description: Outbound Shipment is sent out for delivery
   * Outbound Shipment: Becomes not editable
   * Inbound Shipment: For inter store stock transfers an inbound Shipment
   * becomes editable when this status is set as a result of corresponding
   * outbound Shipment being changed to shipped (this is similar to New status)
   */
  Shipped = 'SHIPPED',
  /**
   * General description: Received inbound Shipment was counted and verified
   * Outbound Shipment: Status is updated based on corresponding inbound Shipment
   * Inbound Shipment: Becomes not editable
   */
  Verified = 'VERIFIED',
}

export enum InvoiceNodeType {
  CustomerReturn = 'CUSTOMER_RETURN',
  InboundShipment = 'INBOUND_SHIPMENT',
  InventoryAddition = 'INVENTORY_ADDITION',
  InventoryReduction = 'INVENTORY_REDUCTION',
  OutboundShipment = 'OUTBOUND_SHIPMENT',
  Prescription = 'PRESCRIPTION',
  Repack = 'REPACK',
  SupplierReturn = 'SUPPLIER_RETURN',
}

export type InvoiceResponse = InvoiceNode | NodeError;

export enum InvoiceSortFieldInput {
  AllocatedDatetime = 'allocatedDatetime',
  Comment = 'comment',
  CreatedDatetime = 'createdDatetime',
  DeliveredDatetime = 'deliveredDatetime',
  InvoiceDatetime = 'invoiceDatetime',
  InvoiceNumber = 'invoiceNumber',
  OtherPartyName = 'otherPartyName',
  PickedDatetime = 'pickedDatetime',
  ShippedDatetime = 'shippedDatetime',
  Status = 'status',
  TheirReference = 'theirReference',
  TransportReference = 'transportReference',
  Type = 'type',
  VerifiedDatetime = 'verifiedDatetime',
}

export type InvoiceSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: InvoiceSortFieldInput;
};

export type InvoicesResponse = InvoiceConnector;

export type ItemChartNode = {
  __typename: 'ItemChartNode';
  calculationDate?: Maybe<Scalars['NaiveDate']['output']>;
  consumptionHistory?: Maybe<ConsumptionHistoryConnector>;
  stockEvolution?: Maybe<StockEvolutionConnector>;
  suggestedQuantityCalculation: SuggestedQuantityCalculationNode;
};

export type ItemConnector = {
  __typename: 'ItemConnector';
  nodes: Array<ItemNode>;
  totalCount: Scalars['Int']['output'];
};

export type ItemCounts = {
  __typename: 'ItemCounts';
  itemCounts: ItemCountsResponse;
};

export type ItemCountsResponse = {
  __typename: 'ItemCountsResponse';
  lowStock: Scalars['Int']['output'];
  moreThanSixMonthsStock: Scalars['Int']['output'];
  noStock: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ItemDirectionNode = {
  __typename: 'ItemDirectionNode';
  directions: Scalars['String']['output'];
  id: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
};

export type ItemFilterInput = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  categoryName?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<StringFilterInput>;
  codeOrName?: InputMaybe<StringFilterInput>;
  /** Items with available stock on hand, regardless of item visibility. This filter is ignored if `is_visible_or_on_hand` is true */
  hasStockOnHand?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isVaccine?: InputMaybe<Scalars['Boolean']['input']>;
  /** Items that are part of a masterlist which is visible in this store. This filter is ignored if `is_visible_or_on_hand` is true */
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  /** Items that are part of a masterlist which is visible in this store OR there is available stock of that item in this store */
  isVisibleOrOnHand?: InputMaybe<Scalars['Boolean']['input']>;
  masterListId?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
  type?: InputMaybe<EqualFilterItemTypeInput>;
};

export type ItemLedgerConnector = {
  __typename: 'ItemLedgerConnector';
  nodes: Array<ItemLedgerNode>;
  totalCount: Scalars['Int']['output'];
};

export type ItemLedgerNode = {
  __typename: 'ItemLedgerNode';
  balance: Scalars['Float']['output'];
  batch?: Maybe<Scalars['String']['output']>;
  costPricePerPack: Scalars['Float']['output'];
  datetime: Scalars['DateTime']['output'];
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  invoiceId: Scalars['String']['output'];
  invoiceNumber: Scalars['Int']['output'];
  invoiceStatus: InvoiceNodeStatus;
  invoiceType: InvoiceNodeType;
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  numberOfPacks: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  quantity: Scalars['Float']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  sellPricePerPack: Scalars['Float']['output'];
  stockLineId?: Maybe<Scalars['String']['output']>;
  storeId: Scalars['String']['output'];
  totalBeforeTax?: Maybe<Scalars['Float']['output']>;
};

export type ItemLedgerResponse = ItemLedgerConnector;

export type ItemNode = {
  __typename: 'ItemNode';
  atcCategory: Scalars['String']['output'];
  availableBatches: StockLineConnector;
  availableStockOnHand: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  ddd: Scalars['String']['output'];
  defaultPackSize: Scalars['Float']['output'];
  doses: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  isVaccine: Scalars['Boolean']['output'];
  itemDirections: Array<ItemDirectionNode>;
  margin: Scalars['Float']['output'];
  masterLists?: Maybe<Array<MasterListNode>>;
  msupplyUniversalCode: Scalars['String']['output'];
  msupplyUniversalName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  outerPackSize: Scalars['Int']['output'];
  stats: ItemStatsNode;
  strength?: Maybe<Scalars['String']['output']>;
  type: ItemNodeType;
  unitName?: Maybe<Scalars['String']['output']>;
  variants: Array<ItemVariantNode>;
  venCategory: VenCategoryType;
  volumePerOuterPack: Scalars['Float']['output'];
  volumePerPack: Scalars['Float']['output'];
  warnings: Array<WarningNode>;
  weight: Scalars['Float']['output'];
};

export type ItemNodeAvailableBatchesArgs = {
  storeId: Scalars['String']['input'];
};

export type ItemNodeAvailableStockOnHandArgs = {
  storeId: Scalars['String']['input'];
};

export type ItemNodeMasterListsArgs = {
  storeId: Scalars['String']['input'];
};

export type ItemNodeStatsArgs = {
  amcLookbackMonths?: InputMaybe<Scalars['Float']['input']>;
  storeId: Scalars['String']['input'];
};

export enum ItemNodeType {
  NonStock = 'NON_STOCK',
  Service = 'SERVICE',
  Stock = 'STOCK',
}

export type ItemPriceInput = {
  itemId: Scalars['String']['input'];
  nameId?: InputMaybe<Scalars['String']['input']>;
};

export type ItemPriceNode = {
  __typename: 'ItemPriceNode';
  calculatedPricePerUnit?: Maybe<Scalars['Float']['output']>;
  defaultPricePerUnit?: Maybe<Scalars['Float']['output']>;
  discountPercentage?: Maybe<Scalars['Float']['output']>;
  itemId: Scalars['String']['output'];
};

export type ItemPriceResponse = ItemPriceNode;

export enum ItemSortFieldInput {
  Code = 'code',
  Name = 'name',
  Type = 'type',
}

export type ItemSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ItemSortFieldInput;
};

export type ItemStatsNode = {
  __typename: 'ItemStatsNode';
  availableMonthsOfStockOnHand?: Maybe<Scalars['Float']['output']>;
  availableStockOnHand: Scalars['Float']['output'];
  averageMonthlyConsumption: Scalars['Float']['output'];
  monthsOfStockOnHand?: Maybe<Scalars['Float']['output']>;
  stockOnHand: Scalars['Float']['output'];
  totalConsumption: Scalars['Float']['output'];
};

export type ItemVariantMutations = {
  __typename: 'ItemVariantMutations';
  deleteItemVariant: DeleteItemVariantResponse;
  upsertItemVariant: UpsertPackVariantResponse;
};

export type ItemVariantMutationsDeleteItemVariantArgs = {
  input: DeleteItemVariantInput;
  storeId: Scalars['String']['input'];
};

export type ItemVariantMutationsUpsertItemVariantArgs = {
  input: UpsertItemVariantInput;
  storeId: Scalars['String']['input'];
};

export type ItemVariantNode = {
  __typename: 'ItemVariantNode';
  /** This item variant is the principal item variant in a bundle - these items are bundled with it */
  bundledItemVariants: Array<BundledItemNode>;
  /** This item variant is bundled with other (principal) item variants */
  bundlesWith: Array<BundledItemNode>;
  coldStorageType?: Maybe<ColdStorageTypeNode>;
  coldStorageTypeId?: Maybe<Scalars['String']['output']>;
  dosesPerUnit: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  item?: Maybe<ItemNode>;
  itemId: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  manufacturer?: Maybe<NameNode>;
  manufacturerId?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  packagingVariants: Array<PackagingVariantNode>;
  vvmType?: Maybe<Scalars['String']['output']>;
};

export type ItemVariantNodeManufacturerArgs = {
  storeId: Scalars['String']['input'];
};

export type ItemsResponse = ItemConnector;

export type JsonschemaNode = {
  __typename: 'JsonschemaNode';
  id: Scalars['String']['output'];
  jsonSchema: Scalars['JSON']['output'];
};

export type LabelPrinterSettingNode = {
  __typename: 'LabelPrinterSettingNode';
  address: Scalars['String']['output'];
  labelHeight: Scalars['Int']['output'];
  labelWidth: Scalars['Int']['output'];
  port: Scalars['Int']['output'];
};

export type LabelPrinterSettingsInput = {
  address: Scalars['String']['input'];
  labelHeight: Scalars['Int']['input'];
  labelWidth: Scalars['Int']['input'];
  port: Scalars['Int']['input'];
};

export type LabelPrinterUpdateResult = {
  __typename: 'LabelPrinterUpdateResult';
  success: Scalars['Boolean']['output'];
};

export enum LanguageType {
  English = 'ENGLISH',
  French = 'FRENCH',
  Khmer = 'KHMER',
  Laos = 'LAOS',
  Portuguese = 'PORTUGUESE',
  Russian = 'RUSSIAN',
  Spanish = 'SPANISH',
  Tetum = 'TETUM',
}

export type LedgerConnector = {
  __typename: 'LedgerConnector';
  nodes: Array<LedgerNode>;
  totalCount: Scalars['Int']['output'];
};

export type LedgerFilterInput = {
  itemId?: InputMaybe<EqualFilterStringInput>;
  stockLineId?: InputMaybe<EqualFilterStringInput>;
};

export type LedgerNode = {
  __typename: 'LedgerNode';
  datetime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  invoiceNumber: Scalars['Int']['output'];
  invoiceType: InvoiceNodeType;
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Float']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  stockLineId?: Maybe<Scalars['String']['output']>;
  storeId: Scalars['String']['output'];
};

export type LedgerResponse = LedgerConnector;

export enum LedgerSortFieldInput {
  Datetime = 'datetime',
  InvoiceType = 'invoiceType',
  ItemId = 'itemId',
  Name = 'name',
  Quantity = 'quantity',
  StockLineId = 'stockLineId',
}

export type LedgerSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the
   * default is ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: LedgerSortFieldInput;
};

export type LineDeleteError = DeleteResponseRequisitionErrorInterface & {
  __typename: 'LineDeleteError';
  description: Scalars['String']['output'];
};

export type LineLinkedToTransferredInvoice =
  DeleteInboundShipmentLineErrorInterface & {
    __typename: 'LineLinkedToTransferredInvoice';
    description: Scalars['String']['output'];
  };

export type LinkPatientPatientToStoreError = {
  __typename: 'LinkPatientPatientToStoreError';
  error: LinkPatientPatientToStoreErrorInterface;
};

export type LinkPatientPatientToStoreErrorInterface = {
  description: Scalars['String']['output'];
};

export type LinkPatientToStoreResponse =
  | LinkPatientPatientToStoreError
  | NameStoreJoinNode;

export type LocationConnector = {
  __typename: 'LocationConnector';
  nodes: Array<LocationNode>;
  totalCount: Scalars['Int']['output'];
};

export type LocationFilterInput = {
  assignedToAsset?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  storeId?: InputMaybe<EqualFilterStringInput>;
};

export type LocationInUse = DeleteLocationErrorInterface & {
  __typename: 'LocationInUse';
  description: Scalars['String']['output'];
  invoiceLines: InvoiceLineConnector;
  stockLines: StockLineConnector;
};

export type LocationIsOnHold = InsertOutboundShipmentLineErrorInterface &
  InsertPrescriptionLineErrorInterface &
  UpdateOutboundShipmentLineErrorInterface &
  UpdatePrescriptionLineErrorInterface & {
    __typename: 'LocationIsOnHold';
    description: Scalars['String']['output'];
  };

export type LocationNode = {
  __typename: 'LocationNode';
  code: Scalars['String']['output'];
  coldStorageType?: Maybe<ColdStorageTypeNode>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  onHold: Scalars['Boolean']['output'];
  stock: StockLineConnector;
};

export type LocationNotFound = InsertOutboundShipmentLineErrorInterface &
  InsertPrescriptionLineErrorInterface &
  UpdateOutboundShipmentLineErrorInterface &
  UpdatePrescriptionLineErrorInterface & {
    __typename: 'LocationNotFound';
    description: Scalars['String']['output'];
  };

export enum LocationSortFieldInput {
  Code = 'code',
  Name = 'name',
}

export type LocationSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: LocationSortFieldInput;
};

export type LocationsResponse = LocationConnector;

export type LockedAssetFieldsNode = {
  __typename: 'LockedAssetFieldsNode';
  catalogueItemId: Scalars['Boolean']['output'];
  serialNumber: Scalars['Boolean']['output'];
  warrantyEnd: Scalars['Boolean']['output'];
  warrantyStart: Scalars['Boolean']['output'];
};

export enum LogLevelEnum {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Info = 'INFO',
  Trace = 'TRACE',
  Warn = 'WARN',
}

export type LogLevelNode = {
  __typename: 'LogLevelNode';
  level: LogLevelEnum;
};

export type LogNode = {
  __typename: 'LogNode';
  fileContent?: Maybe<Array<Scalars['String']['output']>>;
  fileNames?: Maybe<Array<Scalars['String']['output']>>;
};

export type Logout = {
  __typename: 'Logout';
  /** User id of the logged out user */
  userId: Scalars['String']['output'];
};

export type LogoutResponse = Logout;

export enum LowStockStatus {
  BelowHalf = 'BELOW_HALF',
  BelowQuarter = 'BELOW_QUARTER',
  Ok = 'OK',
}

export type MasterListConnector = {
  __typename: 'MasterListConnector';
  nodes: Array<MasterListNode>;
  totalCount: Scalars['Int']['output'];
};

export type MasterListFilterInput = {
  code?: InputMaybe<StringFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  existsForName?: InputMaybe<StringFilterInput>;
  existsForNameId?: InputMaybe<EqualFilterStringInput>;
  existsForStoreId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  isProgram?: InputMaybe<Scalars['Boolean']['input']>;
  itemId?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
};

export type MasterListLineConnector = {
  __typename: 'MasterListLineConnector';
  nodes: Array<MasterListLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type MasterListLineFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  itemId?: InputMaybe<EqualFilterStringInput>;
  masterList?: InputMaybe<MasterListFilterInput>;
  masterListId?: InputMaybe<EqualFilterStringInput>;
};

export type MasterListLineNode = {
  __typename: 'MasterListLineNode';
  id: Scalars['String']['output'];
  item: ItemNode;
  itemId: Scalars['String']['output'];
};

export enum MasterListLineSortFieldInput {
  Code = 'code',
  Name = 'name',
}

export type MasterListLineSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: MasterListLineSortFieldInput;
};

export type MasterListLinesResponse = MasterListLineConnector;

export type MasterListNode = {
  __typename: 'MasterListNode';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
  discountPercentage: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  linesCount?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
};

export type MasterListNotFoundForThisName =
  AddToOutboundShipmentFromMasterListErrorInterface & {
    __typename: 'MasterListNotFoundForThisName';
    description: Scalars['String']['output'];
  };

export type MasterListNotFoundForThisStore = AddFromMasterListErrorInterface &
  AddToInboundShipmentFromMasterListErrorInterface & {
    __typename: 'MasterListNotFoundForThisStore';
    description: Scalars['String']['output'];
  };

export enum MasterListSortFieldInput {
  Code = 'code',
  Description = 'description',
  DiscountPercentage = 'discountPercentage',
  Name = 'name',
}

export type MasterListSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: MasterListSortFieldInput;
};

export type MasterListsResponse = MasterListConnector;

export type MaxOrdersReachedForPeriod =
  InsertProgramRequestRequisitionErrorInterface &
    InsertProgramResponseRequisitionErrorInterface & {
      __typename: 'MaxOrdersReachedForPeriod';
      description: Scalars['String']['output'];
    };

export type MissingCredentials = UpdateUserErrorInterface & {
  __typename: 'MissingCredentials';
  description: Scalars['String']['output'];
};

export type Mutations = {
  __typename: 'Mutations';
  /** Add requisition lines from master item master list */
  addFromMasterList: AddFromMasterListResponse;
  addToInboundShipmentFromMasterList: AddToInboundShipmentFromMasterListResponse;
  /** Add invoice lines from master item master list */
  addToOutboundShipmentFromMasterList: AddToOutboundShipmentFromMasterListResponse;
  allocateOutboundShipmentUnallocatedLine: AllocateOutboundShipmentUnallocatedLineResponse;
  allocateProgramNumber: AllocateProgramNumberResponse;
  batchInboundShipment: BatchInboundShipmentResponse;
  batchOutboundShipment: BatchOutboundShipmentResponse;
  batchPrescription: BatchPrescriptionResponse;
  batchRequestRequisition: BatchRequestRequisitionResponse;
  batchResponseRequisition: BatchResponseRequisitionResponse;
  batchStocktake: BatchStocktakeResponse;
  centralServer: CentralServerMutationNode;
  createInventoryAdjustment: CreateInventoryAdjustmentResponse;
  /**
   * Create shipment for response requisition
   * Will create Outbound Shipment with placeholder lines for each requisition line
   * placeholder line quantity will be set to requisitionLine.supply - all linked outbound shipments
   * lines quantity (placeholder and filled) for requisitionLine.item
   */
  createRequisitionShipment: CreateRequisitionShipmentResponse;
  deleteAsset: DeleteAssetResponse;
  deleteCustomerReturn: DeleteCustomerReturnResponse;
  deleteInboundShipment: DeleteInboundShipmentResponse;
  deleteInboundShipmentLine: DeleteInboundShipmentLineResponse;
  deleteInboundShipmentServiceLine: DeleteInboundShipmentServiceLineResponse;
  deleteLocation: DeleteLocationResponse;
  deleteOutboundShipment: DeleteOutboundShipmentResponse;
  deleteOutboundShipmentLine: DeleteOutboundShipmentLineResponse;
  deleteOutboundShipmentServiceLine: DeleteOutboundShipmentServiceLineResponse;
  deleteOutboundShipmentUnallocatedLine: DeleteOutboundShipmentUnallocatedLineResponse;
  deletePrescription: DeletePrescriptionResponse;
  deletePrescriptionLine: DeletePrescriptionLineResponse;
  deleteRequestRequisition: DeleteRequestRequisitionResponse;
  deleteRequestRequisitionLine: DeleteRequestRequisitionLineResponse;
  deleteResponseRequisition: DeleteResponseRequisitionResponse;
  deleteResponseRequisitionLine: DeleteResponseRequisitionLineResponse;
  deleteStocktake: DeleteStocktakeResponse;
  deleteStocktakeLine: DeleteStocktakeLineResponse;
  deleteSupplierReturn: DeleteSupplierReturnResponse;
  finaliseRnrForm: FinaliseRnRFormResponse;
  initialiseSite: InitialiseSiteResponse;
  insertAsset: InsertAssetResponse;
  insertAssetLog: InsertAssetLogResponse;
  insertBarcode: InsertBarcodeResponse;
  insertContactForm: InsertContactFormResponse;
  insertContactTrace: InsertContactTraceResponse;
  insertCustomerReturn: InsertCustomerReturnResponse;
  insertDocumentRegistry: InsertDocumentResponse;
  insertEncounter: InsertEncounterResponse;
  insertFormSchema: InsertFormSchemaResponse;
  insertInboundShipment: InsertInboundShipmentResponse;
  insertInboundShipmentLine: InsertInboundShipmentLineResponse;
  insertInboundShipmentServiceLine: InsertInboundShipmentServiceLineResponse;
  insertInsurance: InsertInsuranceResponse;
  insertLocation: InsertLocationResponse;
  insertOutboundShipment: InsertOutboundShipmentResponse;
  insertOutboundShipmentLine: InsertOutboundShipmentLineResponse;
  insertOutboundShipmentServiceLine: InsertOutboundShipmentServiceLineResponse;
  insertOutboundShipmentUnallocatedLine: InsertOutboundShipmentUnallocatedLineResponse;
  /** Inserts a new patient (without document data) */
  insertPatient: InsertPatientResponse;
  insertPluginData: InsertPluginDataResponse;
  insertPrescription: InsertPrescriptionResponse;
  insertPrescriptionLine: InsertPrescriptionLineResponse;
  insertPrinter: InsertPrinterResponse;
  /**
   * Enrols a patient into a program by adding a program document to the patient's documents.
   * Every patient can only have one program document of each program type.
   */
  insertProgramEnrolment: InsertProgramEnrolmentResponse;
  /**
   * Inserts a new program patient, i.e. a patient that can contain additional information stored
   * in a document.
   */
  insertProgramPatient: InsertProgramPatientResponse;
  insertProgramRequestRequisition: InsertProgramRequestRequisitionResponse;
  insertProgramResponseRequisition: InsertProgramResponseRequisitionResponse;
  insertRepack: InsertRepackResponse;
  insertRequestRequisition: InsertRequestRequisitionResponse;
  insertRequestRequisitionLine: InsertRequestRequisitionLineResponse;
  insertResponseRequisition: InsertResponseRequisitionResponse;
  insertResponseRequisitionLine: InsertResponseRequisitionLineResponse;
  insertRnrForm: InsertRnRFormResponse;
  insertStockLine: InsertStockLineLineResponse;
  insertStocktake: InsertStocktakeResponse;
  insertStocktakeLine: InsertStocktakeLineResponse;
  insertSupplierReturn: InsertSupplierReturnResponse;
  insertVaccination: InsertVaccinationResponse;
  insertVvmStatusLog: InsertVvmStatusLogResponse;
  /** Links a patient to a store and thus effectively to a site */
  linkPatientToStore: LinkPatientToStoreResponse;
  manualSync: Scalars['String']['output'];
  saveOutboundShipmentItemLines: InvoiceNode;
  savePrescriptionItemLines: InvoiceNode;
  /** Set supply quantity to requested quantity */
  supplyRequestedQuantity: SupplyRequestedQuantityResponse;
  updateAsset: UpdateAssetResponse;
  updateContactTrace: UpdateContactTraceResponse;
  updateCustomerReturn: UpdateCustomerReturnResponse;
  updateCustomerReturnLines: UpdateCustomerReturnLinesResponse;
  updateDisplaySettings: UpdateDisplaySettingsResponse;
  updateEncounter: UpdateEncounterResponse;
  updateInboundShipment: UpdateInboundShipmentResponse;
  updateInboundShipmentLine: UpdateInboundShipmentLineResponse;
  updateInboundShipmentServiceLine: UpdateInboundShipmentServiceLineResponse;
  updateIndicatorValue: UpdateIndicatorValueResponse;
  updateInsurance: UpdateInsuranceResponse;
  updateLabelPrinterSettings: UpdateLabelPrinterSettingsResponse;
  updateLocation: UpdateLocationResponse;
  updateLogLevel: UpsertLogLevelResponse;
  updateNameProperties: UpdateNamePropertiesResponse;
  updateOutboundShipment: UpdateOutboundShipmentResponse;
  updateOutboundShipmentLine: UpdateOutboundShipmentLineResponse;
  updateOutboundShipmentName: UpdateOutboundShipmentNameResponse;
  updateOutboundShipmentServiceLine: UpdateOutboundShipmentServiceLineResponse;
  updateOutboundShipmentUnallocatedLine: UpdateOutboundShipmentUnallocatedLineResponse;
  /** Updates a new patient (without document data) */
  updatePatient: UpdatePatientResponse;
  updatePluginData: UpdatePluginDataResponse;
  updatePrescription: UpdatePrescriptionResponse;
  updatePrescriptionLine: UpdatePrescriptionLineResponse;
  updatePrinter: UpdatePrinterResponse;
  /** Updates an existing program document belonging to a patient. */
  updateProgramEnrolment: UpdateProgramEnrolmentResponse;
  /**
   * Updates a new program patient, i.e. a patient the can contain additional information stored
   * in a document.
   */
  updateProgramPatient: UpdateProgramPatientResponse;
  updateRequestRequisition: UpdateRequestRequisitionResponse;
  updateRequestRequisitionLine: UpdateRequestRequisitionLineResponse;
  updateResponseRequisition: UpdateResponseRequisitionResponse;
  updateResponseRequisitionLine: UpdateResponseRequisitionLineResponse;
  updateRnrForm: UpdateRnRFormResponse;
  updateSensor: UpdateSensorResponse;
  updateStockLine: UpdateStockLineLineResponse;
  updateStocktake: UpdateStocktakeResponse;
  updateStocktakeLine: UpdateStocktakeLineResponse;
  updateSupplierReturn: UpdateSupplierReturnResponse;
  updateSupplierReturnLines: UpdateSupplierReturnLinesResponse;
  updateSupplierReturnOtherParty: UpdateSupplierReturnOtherPartyResponse;
  updateSyncSettings: UpdateSyncSettingsResponse;
  updateTemperatureBreach: UpdateTemperatureBreachResponse;
  updateUser: UpdateUserResponse;
  updateVaccination: UpdateVaccinationResponse;
  updateVvmStatusLog: UpdateVvmStatusResponse;
  /** Set requested for each line in request requisition to calculated */
  useSuggestedQuantity: UseSuggestedQuantityResponse;
};

export type MutationsAddFromMasterListArgs = {
  input: AddFromMasterListInput;
  storeId: Scalars['String']['input'];
};

export type MutationsAddToInboundShipmentFromMasterListArgs = {
  input: AddToShipmentFromMasterListInput;
  storeId: Scalars['String']['input'];
};

export type MutationsAddToOutboundShipmentFromMasterListArgs = {
  input: AddToShipmentFromMasterListInput;
  storeId: Scalars['String']['input'];
};

export type MutationsAllocateOutboundShipmentUnallocatedLineArgs = {
  lineId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsAllocateProgramNumberArgs = {
  input: AllocateProgramNumberInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchInboundShipmentArgs = {
  input: BatchInboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchOutboundShipmentArgs = {
  input: BatchOutboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchPrescriptionArgs = {
  input: BatchPrescriptionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchRequestRequisitionArgs = {
  input: BatchRequestRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchResponseRequisitionArgs = {
  input: BatchResponseRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsBatchStocktakeArgs = {
  input: BatchStocktakeInput;
  storeId: Scalars['String']['input'];
};

export type MutationsCreateInventoryAdjustmentArgs = {
  input: CreateInventoryAdjustmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsCreateRequisitionShipmentArgs = {
  input: CreateRequisitionShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteAssetArgs = {
  assetId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteCustomerReturnArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteInboundShipmentArgs = {
  input: DeleteInboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteInboundShipmentLineArgs = {
  input: DeleteInboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteInboundShipmentServiceLineArgs = {
  input: DeleteInboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteLocationArgs = {
  input: DeleteLocationInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteOutboundShipmentArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteOutboundShipmentLineArgs = {
  input: DeleteOutboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteOutboundShipmentServiceLineArgs = {
  input: DeleteOutboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteOutboundShipmentUnallocatedLineArgs = {
  input: DeleteOutboundShipmentUnallocatedLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeletePrescriptionArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsDeletePrescriptionLineArgs = {
  input: DeletePrescriptionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteRequestRequisitionArgs = {
  input: DeleteRequestRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteRequestRequisitionLineArgs = {
  input: DeleteRequestRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteResponseRequisitionArgs = {
  input: DeleteResponseRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteResponseRequisitionLineArgs = {
  input: DeleteResponseRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteStocktakeArgs = {
  input: DeleteStocktakeInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteStocktakeLineArgs = {
  input: DeleteStocktakeLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsDeleteSupplierReturnArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsFinaliseRnrFormArgs = {
  input: FinaliseRnRFormInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInitialiseSiteArgs = {
  input: SyncSettingsInput;
};

export type MutationsInsertAssetArgs = {
  input: InsertAssetInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertAssetLogArgs = {
  input: InsertAssetLogInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertBarcodeArgs = {
  input: InsertBarcodeInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertContactFormArgs = {
  input: InsertContactFormInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertContactTraceArgs = {
  input: InsertContactTraceInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertCustomerReturnArgs = {
  input: CustomerReturnInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertDocumentRegistryArgs = {
  input: InsertDocumentRegistryInput;
};

export type MutationsInsertEncounterArgs = {
  input: InsertEncounterInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertFormSchemaArgs = {
  input: InsertFormSchemaInput;
};

export type MutationsInsertInboundShipmentArgs = {
  input: InsertInboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertInboundShipmentLineArgs = {
  input: InsertInboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertInboundShipmentServiceLineArgs = {
  input: InsertInboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertInsuranceArgs = {
  input: InsertInsuranceInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertLocationArgs = {
  input: InsertLocationInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertOutboundShipmentArgs = {
  input: InsertOutboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertOutboundShipmentLineArgs = {
  input: InsertOutboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertOutboundShipmentServiceLineArgs = {
  input: InsertOutboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertOutboundShipmentUnallocatedLineArgs = {
  input: InsertOutboundShipmentUnallocatedLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertPatientArgs = {
  input: InsertPatientInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertPluginDataArgs = {
  input: InsertPluginDataInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertPrescriptionArgs = {
  input: InsertPrescriptionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertPrescriptionLineArgs = {
  input: InsertPrescriptionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertPrinterArgs = {
  input: InsertPrinterInput;
};

export type MutationsInsertProgramEnrolmentArgs = {
  input: InsertProgramEnrolmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertProgramPatientArgs = {
  input: InsertProgramPatientInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertProgramRequestRequisitionArgs = {
  input: InsertProgramRequestRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertProgramResponseRequisitionArgs = {
  input: InsertProgramResponseRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertRepackArgs = {
  input: InsertRepackInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertRequestRequisitionArgs = {
  input: InsertRequestRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertRequestRequisitionLineArgs = {
  input: InsertRequestRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertResponseRequisitionArgs = {
  input: InsertResponseRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertResponseRequisitionLineArgs = {
  input: InsertResponseRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertRnrFormArgs = {
  input: InsertRnRFormInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertStockLineArgs = {
  input: InsertStockLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertStocktakeArgs = {
  input: InsertStocktakeInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertStocktakeLineArgs = {
  input: InsertStocktakeLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertSupplierReturnArgs = {
  input: SupplierReturnInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertVaccinationArgs = {
  input: InsertVaccinationInput;
  storeId: Scalars['String']['input'];
};

export type MutationsInsertVvmStatusLogArgs = {
  input: InsertVvmStatusLogInput;
  storeId: Scalars['String']['input'];
};

export type MutationsLinkPatientToStoreArgs = {
  nameId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type MutationsManualSyncArgs = {
  fetchPatientId?: InputMaybe<Scalars['String']['input']>;
};

export type MutationsSaveOutboundShipmentItemLinesArgs = {
  input: SaveOutboundShipmentLinesInput;
  storeId: Scalars['String']['input'];
};

export type MutationsSavePrescriptionItemLinesArgs = {
  input: SavePrescriptionLinesInput;
  storeId: Scalars['String']['input'];
};

export type MutationsSupplyRequestedQuantityArgs = {
  input: SupplyRequestedQuantityInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateAssetArgs = {
  input: UpdateAssetInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateContactTraceArgs = {
  input: UpdateContactTraceInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateCustomerReturnArgs = {
  input: UpdateCustomerReturnInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateCustomerReturnLinesArgs = {
  input: UpdateCustomerReturnLinesInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateDisplaySettingsArgs = {
  input: DisplaySettingsInput;
};

export type MutationsUpdateEncounterArgs = {
  input: UpdateEncounterInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateInboundShipmentArgs = {
  input: UpdateInboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateInboundShipmentLineArgs = {
  input: UpdateInboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateInboundShipmentServiceLineArgs = {
  input: UpdateInboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateIndicatorValueArgs = {
  input: UpdateIndicatorValueInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateInsuranceArgs = {
  input: UpdateInsuranceInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateLabelPrinterSettingsArgs = {
  input: LabelPrinterSettingsInput;
};

export type MutationsUpdateLocationArgs = {
  input: UpdateLocationInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateLogLevelArgs = {
  input: UpsertLogLevelInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateNamePropertiesArgs = {
  input: UpdateNamePropertiesInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateOutboundShipmentArgs = {
  input: UpdateOutboundShipmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateOutboundShipmentLineArgs = {
  input: UpdateOutboundShipmentLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateOutboundShipmentNameArgs = {
  input: UpdateOutboundShipmentNameInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateOutboundShipmentServiceLineArgs = {
  input: UpdateOutboundShipmentServiceLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateOutboundShipmentUnallocatedLineArgs = {
  input: UpdateOutboundShipmentUnallocatedLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdatePatientArgs = {
  input: UpdatePatientInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdatePluginDataArgs = {
  input: UpdatePluginDataInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdatePrescriptionArgs = {
  input: UpdatePrescriptionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdatePrescriptionLineArgs = {
  input: UpdatePrescriptionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdatePrinterArgs = {
  input: UpdatePrinterInput;
};

export type MutationsUpdateProgramEnrolmentArgs = {
  input: UpdateProgramEnrolmentInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateProgramPatientArgs = {
  input: UpdateProgramPatientInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateRequestRequisitionArgs = {
  input: UpdateRequestRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateRequestRequisitionLineArgs = {
  input: UpdateRequestRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateResponseRequisitionArgs = {
  input: UpdateResponseRequisitionInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateResponseRequisitionLineArgs = {
  input: UpdateResponseRequisitionLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateRnrFormArgs = {
  input: UpdateRnRFormInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateSensorArgs = {
  input: UpdateSensorInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateStockLineArgs = {
  input: UpdateStockLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateStocktakeArgs = {
  input: UpdateStocktakeInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateStocktakeLineArgs = {
  input: UpdateStocktakeLineInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateSupplierReturnArgs = {
  input: UpdateSupplierReturnInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateSupplierReturnLinesArgs = {
  input: UpdateSupplierReturnLinesInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateSupplierReturnOtherPartyArgs = {
  input: UpdateSupplierReturnOtherPartyInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateSyncSettingsArgs = {
  input: SyncSettingsInput;
};

export type MutationsUpdateTemperatureBreachArgs = {
  input: UpdateTemperatureBreachInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateVaccinationArgs = {
  input: UpdateVaccinationInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUpdateVvmStatusLogArgs = {
  input: UpdateVvmStatusLogInput;
  storeId: Scalars['String']['input'];
};

export type MutationsUseSuggestedQuantityArgs = {
  input: UseSuggestedQuantityInput;
  storeId: Scalars['String']['input'];
};

export type NameConnector = {
  __typename: 'NameConnector';
  nodes: Array<NameNode>;
  totalCount: Scalars['Int']['output'];
};

export type NameFilterInput = {
  address1?: InputMaybe<StringFilterInput>;
  address2?: InputMaybe<StringFilterInput>;
  /** Filter by code */
  code?: InputMaybe<StringFilterInput>;
  /** Search filter across name or code */
  codeOrName?: InputMaybe<StringFilterInput>;
  country?: InputMaybe<StringFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  /** Filter by customer property */
  isCustomer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by donor property */
  isDonor?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by manufacturer property */
  isManufacturer?: InputMaybe<Scalars['Boolean']['input']>;
  /** Is this name a store */
  isStore?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by supplier property */
  isSupplier?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * Show system names (defaults to false)
   * System names don't have name_store_join thus if queried with true filter, is_visible filter should also be true or null
   * if is_visible is set to true and is_system_name is also true no system names will be returned
   */
  isSystemName?: InputMaybe<Scalars['Boolean']['input']>;
  /** Visibility in current store (based on store_id parameter and existence of name_store_join record) */
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by name */
  name?: InputMaybe<StringFilterInput>;
  phone?: InputMaybe<StringFilterInput>;
  /** Code of the store if store is linked to name */
  storeCode?: InputMaybe<StringFilterInput>;
  supplyingStoreId?: InputMaybe<EqualFilterStringInput>;
  /** Filter by the name type */
  type?: InputMaybe<EqualFilterTypeInput>;
};

export type NameNode = {
  __typename: 'NameNode';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  chargeCode?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdDatetime?: Maybe<Scalars['DateTime']['output']>;
  customData?: Maybe<Scalars['JSON']['output']>;
  dateOfBirth?: Maybe<Scalars['NaiveDate']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<GenderType>;
  id: Scalars['String']['output'];
  isCustomer: Scalars['Boolean']['output'];
  isDonor: Scalars['Boolean']['output'];
  isManufacturer: Scalars['Boolean']['output'];
  isOnHold: Scalars['Boolean']['output'];
  isSupplier: Scalars['Boolean']['output'];
  isSystemName: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  /** Returns a JSON string of the name properties e.g {"property_key": "value"} */
  properties: Scalars['String']['output'];
  store?: Maybe<StoreNode>;
  type: NameNodeType;
  website?: Maybe<Scalars['String']['output']>;
};

export enum NameNodeType {
  Facility = 'FACILITY',
  Invad = 'INVAD',
  Repack = 'REPACK',
  Store = 'STORE',
}

export type NamePropertyConnector = {
  __typename: 'NamePropertyConnector';
  nodes: Array<NamePropertyNode>;
  totalCount: Scalars['Int']['output'];
};

export type NamePropertyNode = {
  __typename: 'NamePropertyNode';
  id: Scalars['String']['output'];
  property: PropertyNode;
  remoteEditable: Scalars['Boolean']['output'];
};

export type NamePropertyResponse = NamePropertyConnector;

export enum NameSortFieldInput {
  Code = 'code',
  Name = 'name',
}

export type NameSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: NameSortFieldInput;
};

export type NameStoreJoinNode = {
  __typename: 'NameStoreJoinNode';
  id: Scalars['String']['output'];
  nameId: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type NamesResponse = NameConnector;

export type NoPermissionForThisStore = InsertAssetErrorInterface &
  InsertDemographicIndicatorErrorInterface &
  InsertDemographicProjectionErrorInterface &
  UpdateDemographicIndicatorErrorInterface &
  UpdateDemographicProjectionErrorInterface & {
    __typename: 'NoPermissionForThisStore';
    description: Scalars['String']['output'];
  };

export type NoRefreshTokenProvided = RefreshTokenErrorInterface & {
  __typename: 'NoRefreshTokenProvided';
  description: Scalars['String']['output'];
};

export type NoSiteAccess = AuthTokenErrorInterface & {
  __typename: 'NoSiteAccess';
  description: Scalars['String']['output'];
};

/** Generic Error Wrapper */
export type NodeError = {
  __typename: 'NodeError';
  error: NodeErrorInterface;
};

export type NodeErrorInterface = {
  description: Scalars['String']['output'];
};

export type NotARefreshToken = RefreshTokenErrorInterface & {
  __typename: 'NotARefreshToken';
  description: Scalars['String']['output'];
};

export type NotAnInboundShipment = UpdateInboundShipmentLineErrorInterface & {
  __typename: 'NotAnInboundShipment';
  description: Scalars['String']['output'];
};

export type NotAnOutboundShipmentError = UpdateErrorInterface &
  UpdateNameErrorInterface & {
    __typename: 'NotAnOutboundShipmentError';
    description: Scalars['String']['output'];
  };

export type NotEnoughStockForReduction =
  InsertOutboundShipmentLineErrorInterface &
    InsertPrescriptionLineErrorInterface &
    UpdateOutboundShipmentLineErrorInterface &
    UpdatePrescriptionLineErrorInterface & {
      __typename: 'NotEnoughStockForReduction';
      batch: StockLineResponse;
      description: Scalars['String']['output'];
      line?: Maybe<InvoiceLineNode>;
    };

export type NotMostRecentGivenDose = UpdateVaccinationErrorInterface & {
  __typename: 'NotMostRecentGivenDose';
  description: Scalars['String']['output'];
};

export type NothingRemainingToSupply =
  CreateRequisitionShipmentErrorInterface & {
    __typename: 'NothingRemainingToSupply';
    description: Scalars['String']['output'];
  };

/**
 * Update a nullable value
 *
 * This struct is usually used as an optional value.
 * For example, in an API update input object like `mutableValue:  NullableUpdate | null | undefined`.
 * This is done to encode the following cases (using `mutableValue` from previous example):
 * 1) if `mutableValue` is `null | undefined`, nothing is updated
 * 2) if `mutableValue` object is set:
 * a) if `NullableUpdate.value` is `undefined | null`, the `mutableValue` is set to `null`
 * b) if `NullableUpdate.value` is set, the `mutableValue` is set to the provided `NullableUpdate.value`
 */
export type NullableDateUpdate = {
  value?: InputMaybe<Scalars['NaiveDate']['input']>;
};

/**
 * Update a nullable value
 *
 * This struct is usually used as an optional value.
 * For example, in an API update input object like `mutableValue:  NullableUpdate | null | undefined`.
 * This is done to encode the following cases (using `mutableValue` from previous example):
 * 1) if `mutableValue` is `null | undefined`, nothing is updated
 * 2) if `mutableValue` object is set:
 * a) if `NullableUpdate.value` is `undefined | null`, the `mutableValue` is set to `null`
 * b) if `NullableUpdate.value` is set, the `mutableValue` is set to the provided `NullableUpdate.value`
 */
export type NullableStringUpdate = {
  value?: InputMaybe<Scalars['String']['input']>;
};

export type NumberNode = {
  __typename: 'NumberNode';
  number: Scalars['Int']['output'];
};

export type OkResponse = {
  __typename: 'OkResponse';
  ok: Scalars['Boolean']['output'];
};

export type OrderingTooManyItems = UpdateRequestRequisitionErrorInterface &
  UpdateResponseRequisitionErrorInterface & {
    __typename: 'OrderingTooManyItems';
    description: Scalars['String']['output'];
    maxItemsInEmergencyOrder: Scalars['Int']['output'];
  };

export type OtherPartyNotACustomer = InsertCustomerReturnErrorInterface &
  InsertErrorInterface &
  InsertResponseRequisitionErrorInterface &
  UpdateCustomerReturnErrorInterface &
  UpdateNameErrorInterface & {
    __typename: 'OtherPartyNotACustomer';
    description: Scalars['String']['output'];
  };

export type OtherPartyNotASupplier = InsertInboundShipmentErrorInterface &
  InsertRequestRequisitionErrorInterface &
  InsertSupplierReturnErrorInterface &
  UpdateInboundShipmentErrorInterface &
  UpdateRequestRequisitionErrorInterface &
  UpdateReturnOtherPartyErrorInterface & {
    __typename: 'OtherPartyNotASupplier';
    description: Scalars['String']['output'];
  };

export type OtherPartyNotVisible = InsertCustomerReturnErrorInterface &
  InsertErrorInterface &
  InsertInboundShipmentErrorInterface &
  InsertRequestRequisitionErrorInterface &
  InsertResponseRequisitionErrorInterface &
  InsertSupplierReturnErrorInterface &
  UpdateCustomerReturnErrorInterface &
  UpdateInboundShipmentErrorInterface &
  UpdateNameErrorInterface &
  UpdateRequestRequisitionErrorInterface &
  UpdateReturnOtherPartyErrorInterface & {
    __typename: 'OtherPartyNotVisible';
    description: Scalars['String']['output'];
  };

export type OutboundInvoiceCounts = {
  __typename: 'OutboundInvoiceCounts';
  created: InvoiceCountsSummary;
  /** Number of outbound shipments not shipped yet */
  notShipped: Scalars['Int']['output'];
};

export type OutboundShipmentLineInput = {
  campaignId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  numberOfPacks: Scalars['Float']['input'];
  stockLineId: Scalars['String']['input'];
};

export type PackagingVariantInput = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  packSize?: InputMaybe<Scalars['Float']['input']>;
  packagingLevel: Scalars['Int']['input'];
  volumePerUnit?: InputMaybe<Scalars['Float']['input']>;
};

export type PackagingVariantNode = {
  __typename: 'PackagingVariantNode';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  packSize?: Maybe<Scalars['Float']['output']>;
  packagingLevel: Scalars['Int']['output'];
  volumePerUnit?: Maybe<Scalars['Float']['output']>;
};

/**
 * Pagination input.
 *
 * Option to limit the number of returned items and/or queries large lists in "pages".
 */
export type PaginationInput = {
  /** Max number of returned items */
  first?: InputMaybe<Scalars['Int']['input']>;
  /** First returned item is at the `offset` position in the full list */
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type PatientConnector = {
  __typename: 'PatientConnector';
  nodes: Array<PatientNode>;
  totalCount: Scalars['Int']['output'];
};

export type PatientFilterInput = {
  address1?: InputMaybe<StringFilterInput>;
  address2?: InputMaybe<StringFilterInput>;
  code?: InputMaybe<StringFilterInput>;
  code2?: InputMaybe<StringFilterInput>;
  country?: InputMaybe<StringFilterInput>;
  dateOfBirth?: InputMaybe<DateFilterInput>;
  dateOfDeath?: InputMaybe<DateFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  firstName?: InputMaybe<StringFilterInput>;
  gender?: InputMaybe<EqualFilterGenderType>;
  id?: InputMaybe<EqualFilterStringInput>;
  identifier?: InputMaybe<StringFilterInput>;
  lastName?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  nextOfKinName?: InputMaybe<StringFilterInput>;
  phone?: InputMaybe<StringFilterInput>;
  programEnrolmentName?: InputMaybe<StringFilterInput>;
};

export type PatientNode = {
  __typename: 'PatientNode';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  age?: Maybe<Scalars['Int']['output']>;
  code: Scalars['String']['output'];
  code2?: Maybe<Scalars['String']['output']>;
  contactTraces: ContactTraceResponse;
  country?: Maybe<Scalars['String']['output']>;
  createdDatetime?: Maybe<Scalars['DateTime']['output']>;
  dateOfBirth?: Maybe<Scalars['NaiveDate']['output']>;
  dateOfDeath?: Maybe<Scalars['NaiveDate']['output']>;
  document?: Maybe<DocumentNode>;
  /**
   * Returns a draft version of the document data.
   *
   * The draft version can differ from the current document data if a patient has been edited
   * remotely in mSupply.
   * In this case the draft version contains the mSupply patient changes, i.e. information from
   * the name row has been integrated into the current document version.
   * When editing a patient in omSupply the document draft version should be used.
   * This means when the document is eventually saved, the remote changes are incorporated into
   * the document data.
   */
  documentDraft?: Maybe<Scalars['JSON']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<GenderType>;
  id: Scalars['String']['output'];
  isDeceased: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextOfKin?: Maybe<PatientNode>;
  nextOfKinId?: Maybe<Scalars['String']['output']>;
  /**
   * If a next of kin link exists, returns the name of the next of kin patient.
   * Otherwise, this returns the plain text field, which allows for recording
   * next of kin name where a patient record for the next of kin does not exist.
   */
  nextOfKinName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  programEnrolments: ProgramEnrolmentResponse;
  website?: Maybe<Scalars['String']['output']>;
};

export type PatientNodeContactTracesArgs = {
  filter?: InputMaybe<ContactTraceFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ContactTraceSortInput>;
};

export type PatientNodeProgramEnrolmentsArgs = {
  filter?: InputMaybe<ProgramEnrolmentFilterInput>;
};

export type PatientResponse = PatientConnector;

export type PatientSearchConnector = {
  __typename: 'PatientSearchConnector';
  nodes: Array<PatientSearchNode>;
  totalCount: Scalars['Int']['output'];
};

export type PatientSearchInput = {
  /** Patient code */
  code?: InputMaybe<Scalars['String']['input']>;
  /** Secondary patient code */
  code2?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<GenderType>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type PatientSearchNode = {
  __typename: 'PatientSearchNode';
  patient: PatientNode;
  score: Scalars['Float']['output'];
};

export type PatientSearchResponse = PatientSearchConnector;

export enum PatientSortFieldInput {
  Address1 = 'address1',
  Address2 = 'address2',
  Code = 'code',
  Code2 = 'code2',
  Country = 'country',
  CreatedDatetime = 'createdDatetime',
  DateOfBirth = 'dateOfBirth',
  DateOfDeath = 'dateOfDeath',
  Email = 'email',
  FirstName = 'firstName',
  Gender = 'gender',
  LastName = 'lastName',
  Name = 'name',
  Phone = 'phone',
}

export type PatientSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: PatientSortFieldInput;
};

export type PeriodConnector = {
  __typename: 'PeriodConnector';
  nodes: Array<PeriodNode>;
  totalCount: Scalars['Int']['output'];
};

export type PeriodFilterInput = {
  endDate?: InputMaybe<DateFilterInput>;
  startDate?: InputMaybe<DateFilterInput>;
};

export type PeriodNode = {
  __typename: 'PeriodNode';
  endDate: Scalars['NaiveDate']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  startDate: Scalars['NaiveDate']['output'];
};

export type PeriodScheduleNode = {
  __typename: 'PeriodScheduleNode';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  periods: Array<SchedulePeriodNode>;
};

export type PeriodSchedulesConnector = {
  __typename: 'PeriodSchedulesConnector';
  nodes: Array<PeriodScheduleNode>;
};

export type PeriodSchedulesResponse = PeriodSchedulesConnector;

export type PeriodsResponse = PeriodConnector;

export type PluginDataConnector = {
  __typename: 'PluginDataConnector';
  nodes: Array<PluginDataNode>;
  totalCount: Scalars['Int']['output'];
};

export type PluginDataFilterInput = {
  dataIdentifier?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  relatedRecordId?: InputMaybe<EqualFilterStringInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
};

export type PluginDataNode = {
  __typename: 'PluginDataNode';
  data: Scalars['String']['output'];
  dataIdentifier: Scalars['String']['output'];
  id: Scalars['String']['output'];
  pluginCode: Scalars['String']['output'];
  relatedRecordId?: Maybe<Scalars['String']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
};

export type PluginDataResponse = PluginDataConnector;

export enum PluginDataSortFieldInput {
  Id = 'id',
  PluginCode = 'pluginCode',
}

export type PluginDataSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: PluginDataSortFieldInput;
};

export type PluginInfoNode = {
  __typename: 'PluginInfoNode';
  pluginInfo: Scalars['JSON']['output'];
};

/** The context we are editing pref within (e.g. prefs for given store, user, etc.) */
export type PreferenceDescriptionContext = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type PreferenceDescriptionNode = {
  __typename: 'PreferenceDescriptionNode';
  key: PreferenceKey;
  /**
   * WARNING: Type loss - holds any kind of pref value (for edit UI).
   * Use the PreferencesNode to load the strictly typed value.
   */
  value: Scalars['JSON']['output'];
  valueType: PreferenceValueNodeType;
};

export enum PreferenceKey {
  AllowTrackingOfStockByDonor = 'allowTrackingOfStockByDonor',
  ManageVaccinesInDoses = 'manageVaccinesInDoses',
  ManageVvmStatusForStock = 'manageVvmStatusForStock',
  ShowContactTracing = 'showContactTracing',
  SortByVvmStatusThenExpiry = 'sortByVvmStatusThenExpiry',
  UseSimplifiedMobileUi = 'useSimplifiedMobileUi',
}

export type PreferenceMutations = {
  __typename: 'PreferenceMutations';
  upsertPreferences: OkResponse;
};

export type PreferenceMutationsUpsertPreferencesArgs = {
  input: UpsertPreferencesInput;
  storeId: Scalars['String']['input'];
};

export enum PreferenceNodeType {
  Global = 'GLOBAL',
  Store = 'STORE',
}

export enum PreferenceValueNodeType {
  Boolean = 'BOOLEAN',
  Integer = 'INTEGER',
}

export type PreferencesNode = {
  __typename: 'PreferencesNode';
  allowTrackingOfStockByDonor: Scalars['Boolean']['output'];
  manageVaccinesInDoses: Scalars['Boolean']['output'];
  manageVvmStatusForStock: Scalars['Boolean']['output'];
  showContactTracing: Scalars['Boolean']['output'];
  sortByVvmStatusThenExpiry: Scalars['Boolean']['output'];
  useSimplifiedMobileUi: Scalars['Boolean']['output'];
};

export type PrescriptionLineInput = {
  id: Scalars['String']['input'];
  numberOfPacks: Scalars['Float']['input'];
  stockLineId: Scalars['String']['input'];
};

export type PricingNode = {
  __typename: 'PricingNode';
  foreignCurrencyTotalAfterTax?: Maybe<Scalars['Float']['output']>;
  serviceTotalAfterTax: Scalars['Float']['output'];
  serviceTotalBeforeTax: Scalars['Float']['output'];
  stockTotalAfterTax: Scalars['Float']['output'];
  stockTotalBeforeTax: Scalars['Float']['output'];
  taxPercentage?: Maybe<Scalars['Float']['output']>;
  totalAfterTax: Scalars['Float']['output'];
  totalBeforeTax: Scalars['Float']['output'];
};

export enum PrintFormat {
  Excel = 'EXCEL',
  Html = 'HTML',
  Pdf = 'PDF',
}

export type PrintReportError = {
  __typename: 'PrintReportError';
  error: PrintReportErrorInterface;
};

export type PrintReportErrorInterface = {
  description: Scalars['String']['output'];
};

export type PrintReportNode = {
  __typename: 'PrintReportNode';
  /**
   * Return the file id of the generated report.
   * The file can be fetched using the /files?id={id} endpoint
   */
  fileId: Scalars['String']['output'];
};

export type PrintReportResponse = PrintReportError | PrintReportNode;

/** This struct is used to sort report data by a key and in descending or ascending order */
export type PrintReportSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: Scalars['String']['input'];
};

export type PrinterConnector = {
  __typename: 'PrinterConnector';
  nodes: Array<PrinterNode>;
  totalCount: Scalars['Int']['output'];
};

export type PrinterFilterInput = {
  address?: InputMaybe<EqualFilterStringInput>;
  description?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
};

export type PrinterNode = {
  __typename: 'PrinterNode';
  address: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  labelHeight: Scalars['Int']['output'];
  labelWidth: Scalars['Int']['output'];
  port: Scalars['Int']['output'];
};

export type ProgramConnector = {
  __typename: 'ProgramConnector';
  nodes: Array<ProgramNode>;
  totalCount: Scalars['Int']['output'];
};

export type ProgramEnrolmentConnector = {
  __typename: 'ProgramEnrolmentConnector';
  nodes: Array<ProgramEnrolmentNode>;
  totalCount: Scalars['Int']['output'];
};

export type ProgramEnrolmentFilterInput = {
  documentName?: InputMaybe<EqualFilterStringInput>;
  enrolmentDatetime?: InputMaybe<DatetimeFilterInput>;
  isImmunisationProgram?: InputMaybe<Scalars['Boolean']['input']>;
  patientId?: InputMaybe<EqualFilterStringInput>;
  programEnrolmentId?: InputMaybe<StringFilterInput>;
  /** The program id */
  programId?: InputMaybe<EqualFilterStringInput>;
  programName?: InputMaybe<StringFilterInput>;
  status?: InputMaybe<StringFilterInput>;
  /** Same as program enrolment document type */
  type?: InputMaybe<EqualFilterStringInput>;
};

export type ProgramEnrolmentNode = {
  __typename: 'ProgramEnrolmentNode';
  activeProgramEvents: ProgramEventResponse;
  contextId: Scalars['String']['output'];
  /** The encounter document */
  document: DocumentNode;
  /** The program document */
  encounters: EncounterConnector;
  enrolmentDatetime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isImmunisationProgram: Scalars['Boolean']['output'];
  /** The program document name */
  name: Scalars['String']['output'];
  patient: PatientNode;
  patientId: Scalars['String']['output'];
  programEnrolmentId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** The program type */
  type: Scalars['String']['output'];
};

export type ProgramEnrolmentNodeActiveProgramEventsArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
  filter?: InputMaybe<ProgramEventFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramEventSortInput>;
};

export type ProgramEnrolmentNodeEncountersArgs = {
  filter?: InputMaybe<EncounterFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<EncounterSortInput>;
};

export type ProgramEnrolmentResponse = ProgramEnrolmentConnector;

export enum ProgramEnrolmentSortFieldInput {
  EnrolmentDatetime = 'enrolmentDatetime',
  PatientId = 'patientId',
  ProgramEnrolmentId = 'programEnrolmentId',
  Status = 'status',
  Type = 'type',
}

export type ProgramEnrolmentSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ProgramEnrolmentSortFieldInput;
};

export type ProgramEventConnector = {
  __typename: 'ProgramEventConnector';
  nodes: Array<ProgramEventNode>;
  totalCount: Scalars['Int']['output'];
};

export type ProgramEventFilterInput = {
  activeEndDatetime?: InputMaybe<DatetimeFilterInput>;
  activeStartDatetime?: InputMaybe<DatetimeFilterInput>;
  data?: InputMaybe<StringFilterInput>;
  documentName?: InputMaybe<EqualFilterStringInput>;
  documentType?: InputMaybe<EqualFilterStringInput>;
  patientId?: InputMaybe<EqualFilterStringInput>;
  /** The event type */
  type?: InputMaybe<EqualFilterStringInput>;
};

export type ProgramEventNode = {
  __typename: 'ProgramEventNode';
  activeEndDatetime: Scalars['DateTime']['output'];
  activeStartDatetime: Scalars['DateTime']['output'];
  data?: Maybe<Scalars['String']['output']>;
  datetime: Scalars['DateTime']['output'];
  /** The document associated with the document_name */
  document?: Maybe<DocumentNode>;
  documentName?: Maybe<Scalars['String']['output']>;
  documentType: Scalars['String']['output'];
  patient?: Maybe<PatientNode>;
  patientId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ProgramEventResponse = ProgramEventConnector;

export enum ProgramEventSortFieldInput {
  ActiveEndDatetime = 'activeEndDatetime',
  ActiveStartDatetime = 'activeStartDatetime',
  Datetime = 'datetime',
  DocumentName = 'documentName',
  DocumentType = 'documentType',
  Type = 'type',
}

export type ProgramEventSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ProgramEventSortFieldInput;
};

export type ProgramFilterInput = {
  contextId?: InputMaybe<EqualFilterStringInput>;
  elmisCode?: InputMaybe<EqualFilterStringInput>;
  existsForStoreId?: InputMaybe<EqualFilterStringInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  isImmunisation?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<StringFilterInput>;
};

export type ProgramIndicatorConnector = {
  __typename: 'ProgramIndicatorConnector';
  nodes: Array<ProgramIndicatorNode>;
  totalCount: Scalars['Int']['output'];
};

export type ProgramIndicatorFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  programId?: InputMaybe<EqualFilterStringInput>;
};

export type ProgramIndicatorNode = {
  __typename: 'ProgramIndicatorNode';
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lineAndColumns: Array<IndicatorLineNode>;
  program: ProgramNode;
};

export type ProgramIndicatorResponse = ProgramIndicatorConnector;

export enum ProgramIndicatorSortFieldInput {
  Code = 'code',
  ProgramId = 'programId',
}

export type ProgramIndicatorSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: ProgramIndicatorSortFieldInput;
};

export type ProgramNode = {
  __typename: 'ProgramNode';
  elmisCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isImmunisation: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  vaccineCourses?: Maybe<Array<VaccineCourseNode>>;
};

export type ProgramRequisitionOrderTypeNode = {
  __typename: 'ProgramRequisitionOrderTypeNode';
  availablePeriods: Array<PeriodNode>;
  id: Scalars['String']['output'];
  isEmergency: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type ProgramSettingNode = {
  __typename: 'ProgramSettingNode';
  masterListCode: Scalars['String']['output'];
  masterListDescription: Scalars['String']['output'];
  masterListDiscountPercentage?: Maybe<Scalars['Float']['output']>;
  masterListId: Scalars['String']['output'];
  masterListIsActive: Scalars['Boolean']['output'];
  masterListIsDefaultPriceList: Scalars['Boolean']['output'];
  masterListName: Scalars['String']['output'];
  masterListNameTagId: Scalars['String']['output'];
  masterListNameTagName: Scalars['String']['output'];
  orderTypes: Array<ProgramRequisitionOrderTypeNode>;
};

export enum ProgramSortFieldInput {
  Name = 'name',
}

export type ProgramSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ProgramSortFieldInput;
};

export type ProgramsResponse = ProgramConnector;

export type PropertyNode = {
  __typename: 'PropertyNode';
  /**
   * If `valueType` is `String`, this field can contain a comma-separated
   * list of allowed values, essentially defining an enum.
   * If `valueType` is Integer or Float, this field will include the
   * word `negative` if negative values are allowed.
   */
  allowedValues?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  valueType: PropertyNodeValueType;
};

export enum PropertyNodeValueType {
  Boolean = 'BOOLEAN',
  Float = 'FLOAT',
  Integer = 'INTEGER',
  String = 'STRING',
}

export type Queries = {
  __typename: 'Queries';
  abbreviations: Array<AbbreviationNode>;
  /**
   * Returns active program events at a given date time.
   * This can also be achieved by using the program_events endpoint with the filter:
   * `active_start_datetime <= at && active_end_datetime + 1 >= at`
   */
  activeProgramEvents: ProgramEventResponse;
  activeVvmStatuses: VvmstatusesResponse;
  activityLogs: ActivityLogResponse;
  apiVersion: Scalars['String']['output'];
  assetCatalogueItem: AssetCatalogueItemResponse;
  assetCatalogueItems: AssetCatalogueItemsResponse;
  assetCategories: AssetCategoriesResponse;
  assetCategory: AssetCategoryResponse;
  assetClass: AssetClassResponse;
  assetClasses: AssetClassesResponse;
  assetFromGs1Data: AssetParseResponse;
  assetLogReasons: AssetLogReasonsResponse;
  assetLogs: AssetLogsResponse;
  assetProperties: AssetPropertiesResponse;
  assetType: AssetTypeResponse;
  assetTypes: AssetTypesResponse;
  /** Query omSupply "assets" entries */
  assets: AssetsResponse;
  /**
   * Retrieves a new auth bearer and refresh token
   * The refresh token is returned as a cookie
   */
  authToken: AuthTokenResponse;
  barcodeByGtin: BarcodeResponse;
  campaigns: CampaignsResponse;
  centralPatientSearch: CentralPatientSearchResponse;
  centralServer: CentralServerQueryNode;
  clinicians: CliniciansResponse;
  /** Query omSupply "cold_storage_type" entries */
  coldStorageTypes: ColdStorageTypesResponse;
  contactTraces: ContactTraceResponse;
  currencies: CurrenciesResponse;
  databaseSettings: DatabaseSettingsNode;
  demographicIndicators: DemographicIndicatorsResponse;
  demographicProjectionByBaseYear: DemographicProjectionResponse;
  demographicProjections: DemographicProjectionsResponse;
  demographics: DemographicsResponse;
  diagnosesActive: Array<DiagnosisNode>;
  displaySettings: DisplaySettingsNode;
  document?: Maybe<DocumentNode>;
  documentHistory: DocumentHistoryResponse;
  documentRegistries: DocumentRegistryResponse;
  documents: DocumentResponse;
  draftStockOutLines: DraftStockOutItemData;
  encounterFields: EncounterFieldsResponse;
  encounters: EncounterResponse;
  formSchemas: FormSchemaResponse;
  frontendPluginMetadata: Array<FrontendPluginMetadataNode>;
  /**
   * Generates new customer_return lines in memory, based on supplier return line ids.
   * Optionally includes existing customer_return lines for a specific item in a return.
   * Provides an friendly shape to edit these lines before calling the insert/update mutations.
   */
  generateCustomerReturnLines: GenerateCustomerReturnLinesResponse;
  /**
   * Creates a generated report.
   *
   * All details about the report, e.g. the output format, are specified in the report definition
   * which is referred to by the report_id.
   * The generated report can be retrieved from the `/files` endpoint using the returned file id.
   */
  generateReport: PrintReportResponse;
  /**
   * Can be used when developing reports, e.g. to generate a report that is not already in the
   * system.
   */
  generateReportDefinition: PrintReportResponse;
  /**
   * Generates new supplier return lines in memory, based on either stock line ids, or an item id.
   * Optionally includes existing supplier return lines for a specific item in a return.
   * Provides an friendly shape to edit these lines before calling the insert/update mutations.
   */
  generateSupplierReturnLines: GenerateSupplierReturnLinesResponse;
  getVvmStatusLogByStockLine: VvmstatusLogResponse;
  /** Query for "historical_stock_line" entries */
  historicalStockLines: StockLinesResponse;
  /** Available without authorisation in operational and initialisation states */
  initialisationStatus: InitialisationStatusNode;
  insertPrescription: InsertPrescriptionResponse;
  insurancePolicies: InsurancesResponse;
  insurancePolicy: InsuranceResponse;
  insuranceProviders: InsuranceProvidersResponse;
  /** @deprecated Since 2.8.0. Use reason_options instead */
  inventoryAdjustmentReasons: InventoryAdjustmentReasonResponse;
  invoice: InvoiceResponse;
  invoiceByNumber: InvoiceResponse;
  invoiceCounts: InvoiceCounts;
  invoiceLines: InvoiceLinesResponse;
  invoices: InvoicesResponse;
  isCentralServer: Scalars['Boolean']['output'];
  itemCounts: ItemCounts;
  itemLedger: ItemLedgerResponse;
  itemPrice: ItemPriceResponse;
  itemVariantsConfigured: Scalars['Boolean']['output'];
  /** Query omSupply "item" entries */
  items: ItemsResponse;
  labelPrinterSettings?: Maybe<LabelPrinterSettingNode>;
  lastSuccessfulUserSync: UpdateUserNode;
  latestSyncStatus?: Maybe<FullSyncStatusNode>;
  ledger: LedgerResponse;
  /** Query omSupply "locations" entries */
  locations: LocationsResponse;
  logContents: LogNode;
  logFileNames: LogNode;
  logLevel: LogLevelNode;
  logout: LogoutResponse;
  masterListLines: MasterListLinesResponse;
  /** Query omSupply "master_lists" entries */
  masterLists: MasterListsResponse;
  me: UserResponse;
  nameProperties: NamePropertyResponse;
  /** Query omSupply "name" entries */
  names: NamesResponse;
  numberOfRecordsInPushQueue: Scalars['Int']['output'];
  patient?: Maybe<PatientNode>;
  patientSearch: PatientSearchResponse;
  patients: PatientResponse;
  periods: PeriodsResponse;
  pluginData: PluginDataResponse;
  pluginGraphqlQuery: Scalars['JSON']['output'];
  /** The list of preferences and their current values (used for the admin/edit page) */
  preferenceDescriptions: Array<PreferenceDescriptionNode>;
  /** Returns the relevant set of preferences based on context (e.g. current store) */
  preferences: PreferencesNode;
  printers: PrinterConnector;
  programEnrolments: ProgramEnrolmentResponse;
  programEvents: ProgramEventResponse;
  programIndicators: ProgramIndicatorResponse;
  programRequisitionSettingsByCustomer: CustomerProgramRequisitionSettingNode;
  programs: ProgramsResponse;
  rAndRForm: RnRFormResponse;
  rAndRForms: RnRFormsResponse;
  reasonOptions: ReasonOptionResponse;
  /**
   * Retrieves a new auth bearer and refresh token
   * The refresh token is returned as a cookie
   */
  refreshToken: RefreshTokenResponse;
  repack: RepackResponse;
  repacksByStockLine: RepackConnector;
  report: ReportResponse;
  /** Queries a list of available reports */
  reports: ReportsResponse;
  requisition: RequisitionResponse;
  requisitionByNumber: RequisitionResponse;
  requisitionCounts: RequisitionCounts;
  requisitionLineChart: RequisitionLineChartResponse;
  requisitions: RequisitionsResponse;
  responseRequisitionStats: RequisitionLineStatsResponse;
  /** @deprecated Since 2.8.0. Use reason_options instead */
  returnReasons: ReturnReasonResponse;
  schedulesWithPeriodsByProgram: PeriodSchedulesResponse;
  /** Query omSupply "sensor" entries */
  sensors: SensorsResponse;
  stockCounts: StockCounts;
  /** Query for "stock_line" entries */
  stockLines: StockLinesResponse;
  stocktake: StocktakeResponse;
  stocktakeByNumber: StocktakeResponse;
  stocktakeLines: StocktakesLinesResponse;
  stocktakes: StocktakesResponse;
  store: StoreResponse;
  storePreferences: StorePreferenceNode;
  stores: StoresResponse;
  supplierProgramRequisitionSettings: Array<SupplierProgramRequisitionSettingNode>;
  syncSettings?: Maybe<SyncSettingsNode>;
  /** Query omSupply "temperature_breach" entries */
  temperatureBreaches: TemperatureBreachesResponse;
  /** Query omSupply "temperature_log" entries */
  temperatureLogs: TemperatureLogsResponse;
  /** Query omSupply temperature notification entries */
  temperatureNotifications: TemperatureNotificationsResponse;
  vaccination?: Maybe<VaccinationNode>;
  vaccinationCard: VaccinationCardResponse;
  vaccineCourse: VaccineCourseResponse;
  vaccineCourseDose: VaccineCourseDoseResponse;
  vaccineCourses: VaccineCoursesResponse;
};

export type QueriesAbbreviationsArgs = {
  filter?: InputMaybe<AbbreviationFilterInput>;
};

export type QueriesActiveProgramEventsArgs = {
  at?: InputMaybe<Scalars['DateTime']['input']>;
  filter?: InputMaybe<ProgramEventFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramEventSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesActiveVvmStatusesArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesActivityLogsArgs = {
  filter?: InputMaybe<ActivityLogFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ActivityLogSortInput>>;
};

export type QueriesAssetCatalogueItemArgs = {
  id: Scalars['String']['input'];
};

export type QueriesAssetCatalogueItemsArgs = {
  filter?: InputMaybe<AssetCatalogueItemFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetCatalogueItemSortInput>>;
};

export type QueriesAssetCategoriesArgs = {
  filter?: InputMaybe<AssetCategoryFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetCategorySortInput>>;
};

export type QueriesAssetCategoryArgs = {
  id: Scalars['String']['input'];
};

export type QueriesAssetClassArgs = {
  id: Scalars['String']['input'];
};

export type QueriesAssetClassesArgs = {
  filter?: InputMaybe<AssetClassFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetClassSortInput>>;
};

export type QueriesAssetFromGs1DataArgs = {
  gs1: Array<Gs1DataElement>;
  storeId: Scalars['String']['input'];
};

export type QueriesAssetLogReasonsArgs = {
  filter?: InputMaybe<AssetLogReasonFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetLogReasonSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesAssetLogsArgs = {
  filter?: InputMaybe<AssetLogFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetLogSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesAssetPropertiesArgs = {
  filter?: InputMaybe<AssetPropertyFilterInput>;
};

export type QueriesAssetTypeArgs = {
  id: Scalars['String']['input'];
};

export type QueriesAssetTypesArgs = {
  filter?: InputMaybe<AssetTypeFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetTypeSortInput>>;
};

export type QueriesAssetsArgs = {
  filter?: InputMaybe<AssetFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<AssetSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesAuthTokenArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type QueriesBarcodeByGtinArgs = {
  gtin: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesCampaignsArgs = {
  filter?: InputMaybe<CampaignFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<CampaignSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesCentralPatientSearchArgs = {
  input: CentralPatientSearchInput;
  storeId: Scalars['String']['input'];
};

export type QueriesCliniciansArgs = {
  filter?: InputMaybe<ClinicianFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ClinicianSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesColdStorageTypesArgs = {
  filter?: InputMaybe<ColdStorageTypeFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ColdStorageTypeSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesContactTracesArgs = {
  filter?: InputMaybe<ContactTraceFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ContactTraceSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesCurrenciesArgs = {
  filter?: InputMaybe<CurrencyFilterInput>;
  sort?: InputMaybe<Array<CurrencySortInput>>;
};

export type QueriesDemographicIndicatorsArgs = {
  filter?: InputMaybe<DemographicIndicatorFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<DemographicIndicatorSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesDemographicProjectionByBaseYearArgs = {
  baseYear: Scalars['Int']['input'];
};

export type QueriesDemographicProjectionsArgs = {
  filter?: InputMaybe<DemographicProjectionFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<DemographicProjectionSortInput>>;
};

export type QueriesDemographicsArgs = {
  filter?: InputMaybe<DemographicFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<DemographicSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesDisplaySettingsArgs = {
  input: DisplaySettingsHash;
};

export type QueriesDocumentArgs = {
  name: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesDocumentHistoryArgs = {
  name: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesDocumentRegistriesArgs = {
  filter?: InputMaybe<DocumentRegistryFilterInput>;
  sort?: InputMaybe<Array<DocumentRegistrySortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesDocumentsArgs = {
  filter?: InputMaybe<DocumentFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<DocumentSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesDraftStockOutLinesArgs = {
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesEncounterFieldsArgs = {
  filter?: InputMaybe<EncounterFilterInput>;
  input: EncounterFieldsInput;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<EncounterSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesEncountersArgs = {
  filter?: InputMaybe<EncounterFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<EncounterSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesFormSchemasArgs = {
  filter?: InputMaybe<FormSchemaFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<FormSchemaSortInput>>;
};

export type QueriesGenerateCustomerReturnLinesArgs = {
  input: GenerateCustomerReturnLinesInput;
  storeId: Scalars['String']['input'];
};

export type QueriesGenerateReportArgs = {
  arguments?: InputMaybe<Scalars['JSON']['input']>;
  currentLanguage?: InputMaybe<Scalars['String']['input']>;
  dataId?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<PrintFormat>;
  reportId: Scalars['String']['input'];
  sort?: InputMaybe<PrintReportSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesGenerateReportDefinitionArgs = {
  arguments?: InputMaybe<Scalars['JSON']['input']>;
  currentLanguage?: InputMaybe<Scalars['String']['input']>;
  dataId?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<PrintFormat>;
  name?: InputMaybe<Scalars['String']['input']>;
  report: Scalars['JSON']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesGenerateSupplierReturnLinesArgs = {
  input: GenerateSupplierReturnLinesInput;
  storeId: Scalars['String']['input'];
};

export type QueriesGetVvmStatusLogByStockLineArgs = {
  stockLineId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesHistoricalStockLinesArgs = {
  datetime?: InputMaybe<Scalars['DateTime']['input']>;
  itemId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesInsertPrescriptionArgs = {
  input: InsertPrescriptionInput;
  storeId: Scalars['String']['input'];
};

export type QueriesInsurancePoliciesArgs = {
  nameId: Scalars['String']['input'];
  sort?: InputMaybe<Array<InsuranceSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesInsurancePolicyArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesInsuranceProvidersArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesInventoryAdjustmentReasonsArgs = {
  filter?: InputMaybe<InventoryAdjustmentReasonFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<InventoryAdjustmentReasonSortInput>>;
};

export type QueriesInvoiceArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesInvoiceByNumberArgs = {
  invoiceNumber: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
  type: InvoiceNodeType;
};

export type QueriesInvoiceCountsArgs = {
  storeId: Scalars['String']['input'];
  timezoneOffset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueriesInvoiceLinesArgs = {
  filter?: InputMaybe<InvoiceLineFilterInput>;
  page?: InputMaybe<PaginationInput>;
  reportSort?: InputMaybe<PrintReportSortInput>;
  sort?: InputMaybe<Array<InvoiceLineSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesInvoicesArgs = {
  filter?: InputMaybe<InvoiceFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<InvoiceSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesItemCountsArgs = {
  lowStockThreshold?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
};

export type QueriesItemLedgerArgs = {
  filter?: InputMaybe<LedgerFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<LedgerSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesItemPriceArgs = {
  input: ItemPriceInput;
  storeId: Scalars['String']['input'];
};

export type QueriesItemVariantsConfiguredArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesItemsArgs = {
  filter?: InputMaybe<ItemFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ItemSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesLedgerArgs = {
  filter?: InputMaybe<LedgerFilterInput>;
  sort?: InputMaybe<Array<LedgerSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesLocationsArgs = {
  filter?: InputMaybe<LocationFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<LocationSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesLogContentsArgs = {
  fileName?: InputMaybe<Scalars['String']['input']>;
};

export type QueriesMasterListLinesArgs = {
  filter?: InputMaybe<MasterListLineFilterInput>;
  masterListId: Scalars['String']['input'];
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<MasterListLineSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesMasterListsArgs = {
  filter?: InputMaybe<MasterListFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<MasterListSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesNamesArgs = {
  filter?: InputMaybe<NameFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<NameSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesPatientArgs = {
  patientId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesPatientSearchArgs = {
  input: PatientSearchInput;
  storeId: Scalars['String']['input'];
};

export type QueriesPatientsArgs = {
  filter?: InputMaybe<PatientFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<PatientSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesPeriodsArgs = {
  filter?: InputMaybe<PeriodFilterInput>;
  page?: InputMaybe<PaginationInput>;
  programId?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type QueriesPluginDataArgs = {
  filter?: InputMaybe<PluginDataFilterInput>;
  pluginCode: Scalars['String']['input'];
  sort?: InputMaybe<Array<PluginDataSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesPluginGraphqlQueryArgs = {
  input: Scalars['JSON']['input'];
  pluginCode: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesPreferenceDescriptionsArgs = {
  prefContext: PreferenceDescriptionContext;
  prefType: PreferenceNodeType;
  storeId: Scalars['String']['input'];
};

export type QueriesPreferencesArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesPrintersArgs = {
  filter?: InputMaybe<PrinterFilterInput>;
};

export type QueriesProgramEnrolmentsArgs = {
  filter?: InputMaybe<ProgramEnrolmentFilterInput>;
  sort?: InputMaybe<ProgramEnrolmentSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesProgramEventsArgs = {
  filter?: InputMaybe<ProgramEventFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramEventSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesProgramIndicatorsArgs = {
  filter?: InputMaybe<ProgramIndicatorFilterInput>;
  sort?: InputMaybe<ProgramIndicatorSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesProgramRequisitionSettingsByCustomerArgs = {
  customerNameId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesProgramsArgs = {
  filter?: InputMaybe<ProgramFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<ProgramSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesRAndRFormArgs = {
  rnrFormId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesRAndRFormsArgs = {
  filter?: InputMaybe<RnRFormFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<RnRFormSortInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesReasonOptionsArgs = {
  filter?: InputMaybe<ReasonOptionFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ReasonOptionSortInput>>;
};

export type QueriesRepackArgs = {
  invoiceId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesRepacksByStockLineArgs = {
  stockLineId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesReportArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
  userLanguage: Scalars['String']['input'];
};

export type QueriesReportsArgs = {
  filter?: InputMaybe<ReportFilterInput>;
  sort?: InputMaybe<Array<ReportSortInput>>;
  storeId: Scalars['String']['input'];
  userLanguage: Scalars['String']['input'];
};

export type QueriesRequisitionArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesRequisitionByNumberArgs = {
  requisitionNumber: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
  type: RequisitionNodeType;
};

export type QueriesRequisitionCountsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesRequisitionLineChartArgs = {
  consumptionOptionsInput?: InputMaybe<ConsumptionOptionsInput>;
  requestRequisitionLineId: Scalars['String']['input'];
  stockEvolutionOptionsInput?: InputMaybe<StockEvolutionOptionsInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesRequisitionsArgs = {
  filter?: InputMaybe<RequisitionFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<RequisitionSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesResponseRequisitionStatsArgs = {
  requisitionLineId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesReturnReasonsArgs = {
  filter?: InputMaybe<ReturnReasonFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<ReturnReasonSortInput>>;
};

export type QueriesSchedulesWithPeriodsByProgramArgs = {
  programId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesSensorsArgs = {
  filter?: InputMaybe<SensorFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<SensorSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesStockCountsArgs = {
  daysTillExpired?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
  timezoneOffset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueriesStockLinesArgs = {
  filter?: InputMaybe<StockLineFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<StockLineSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesStocktakeArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesStocktakeByNumberArgs = {
  stocktakeNumber: Scalars['Int']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesStocktakeLinesArgs = {
  filter?: InputMaybe<StocktakeLineFilterInput>;
  page?: InputMaybe<PaginationInput>;
  reportSort?: InputMaybe<PrintReportSortInput>;
  sort?: InputMaybe<Array<StocktakeLineSortInput>>;
  stocktakeId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesStocktakesArgs = {
  filter?: InputMaybe<StocktakeFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<StocktakeSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesStoreArgs = {
  id: Scalars['String']['input'];
};

export type QueriesStorePreferencesArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesStoresArgs = {
  filter?: InputMaybe<StoreFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<StoreSortInput>>;
};

export type QueriesSupplierProgramRequisitionSettingsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueriesTemperatureBreachesArgs = {
  filter?: InputMaybe<TemperatureBreachFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<TemperatureBreachSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesTemperatureLogsArgs = {
  filter?: InputMaybe<TemperatureLogFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<TemperatureLogSortInput>>;
  storeId: Scalars['String']['input'];
};

export type QueriesTemperatureNotificationsArgs = {
  page?: InputMaybe<PaginationInput>;
  storeId: Scalars['String']['input'];
};

export type QueriesVaccinationArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesVaccinationCardArgs = {
  programEnrolmentId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type QueriesVaccineCourseArgs = {
  id: Scalars['String']['input'];
};

export type QueriesVaccineCourseDoseArgs = {
  id: Scalars['String']['input'];
};

export type QueriesVaccineCoursesArgs = {
  filter?: InputMaybe<VaccineCourseFilterInput>;
  page?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<Array<VaccineCourseSortInput>>;
};

export type QueryReportError = {
  __typename: 'QueryReportError';
  error: QueryReportErrorInterface;
};

export type QueryReportErrorInterface = {
  description: Scalars['String']['output'];
};

export type QueryReportsError = {
  __typename: 'QueryReportsError';
  error: QueryReportsErrorInterface;
};

export type QueryReportsErrorInterface = {
  description: Scalars['String']['output'];
};

export type ReasonOptionConnector = {
  __typename: 'ReasonOptionConnector';
  nodes: Array<ReasonOptionNode>;
  totalCount: Scalars['Int']['output'];
};

export type ReasonOptionFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<EqualFilterReasonOptionTypeInput>;
};

export type ReasonOptionNode = {
  __typename: 'ReasonOptionNode';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  reason: Scalars['String']['output'];
  type: ReasonOptionNodeType;
};

export enum ReasonOptionNodeType {
  NegativeInventoryAdjustment = 'NEGATIVE_INVENTORY_ADJUSTMENT',
  OpenVialWastage = 'OPEN_VIAL_WASTAGE',
  PositiveInventoryAdjustment = 'POSITIVE_INVENTORY_ADJUSTMENT',
  RequisitionLineVariance = 'REQUISITION_LINE_VARIANCE',
  ReturnReason = 'RETURN_REASON',
}

export type ReasonOptionResponse = ReasonOptionConnector;

export enum ReasonOptionSortFieldInput {
  Reason = 'reason',
  ReasonOptionType = 'reasonOptionType',
}

export type ReasonOptionSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ReasonOptionSortFieldInput;
};

export type RecordAlreadyExist = InsertAssetCatalogueItemErrorInterface &
  InsertAssetErrorInterface &
  InsertAssetLogErrorInterface &
  InsertAssetLogReasonErrorInterface &
  InsertDemographicIndicatorErrorInterface &
  InsertDemographicProjectionErrorInterface &
  InsertLocationErrorInterface &
  InsertVaccineCourseErrorInterface &
  UpdateDemographicIndicatorErrorInterface &
  UpdateDemographicProjectionErrorInterface & {
    __typename: 'RecordAlreadyExist';
    description: Scalars['String']['output'];
  };

export type RecordBelongsToAnotherStore = DeleteAssetErrorInterface &
  DeleteAssetLogReasonErrorInterface &
  DeleteLocationErrorInterface &
  UpdateAssetErrorInterface &
  UpdateLocationErrorInterface &
  UpdateSensorErrorInterface & {
    __typename: 'RecordBelongsToAnotherStore';
    description: Scalars['String']['output'];
  };

export type RecordNotFound = AddFromMasterListErrorInterface &
  AddToInboundShipmentFromMasterListErrorInterface &
  AddToOutboundShipmentFromMasterListErrorInterface &
  AllocateOutboundShipmentUnallocatedLineErrorInterface &
  CreateRequisitionShipmentErrorInterface &
  DeleteAssetCatalogueItemErrorInterface &
  DeleteAssetErrorInterface &
  DeleteAssetLogReasonErrorInterface &
  DeleteCampaignErrorInterface &
  DeleteCustomerReturnErrorInterface &
  DeleteErrorInterface &
  DeleteInboundShipmentErrorInterface &
  DeleteInboundShipmentLineErrorInterface &
  DeleteInboundShipmentServiceLineErrorInterface &
  DeleteLocationErrorInterface &
  DeleteOutboundShipmentLineErrorInterface &
  DeleteOutboundShipmentServiceLineErrorInterface &
  DeleteOutboundShipmentUnallocatedLineErrorInterface &
  DeletePrescriptionErrorInterface &
  DeletePrescriptionLineErrorInterface &
  DeleteRequestRequisitionErrorInterface &
  DeleteRequestRequisitionLineErrorInterface &
  DeleteResponseRequisitionErrorInterface &
  DeleteResponseRequisitionLineErrorInterface &
  DeleteSupplierReturnErrorInterface &
  DeleteVaccineCourseErrorInterface &
  NodeErrorInterface &
  RequisitionLineChartErrorInterface &
  RequisitionLineStatsErrorInterface &
  ScannedDataParseErrorInterface &
  SupplyRequestedQuantityErrorInterface &
  UpdateAssetErrorInterface &
  UpdateErrorInterface &
  UpdateInboundShipmentErrorInterface &
  UpdateInboundShipmentLineErrorInterface &
  UpdateInboundShipmentServiceLineErrorInterface &
  UpdateIndicatorValueErrorInterface &
  UpdateLocationErrorInterface &
  UpdateNameErrorInterface &
  UpdateNamePropertiesErrorInterface &
  UpdateOutboundShipmentLineErrorInterface &
  UpdateOutboundShipmentServiceLineErrorInterface &
  UpdateOutboundShipmentUnallocatedLineErrorInterface &
  UpdatePrescriptionErrorInterface &
  UpdatePrescriptionLineErrorInterface &
  UpdateRequestRequisitionErrorInterface &
  UpdateRequestRequisitionLineErrorInterface &
  UpdateResponseRequisitionErrorInterface &
  UpdateResponseRequisitionLineErrorInterface &
  UpdateReturnOtherPartyErrorInterface &
  UpdateSensorErrorInterface &
  UpdateStockLineErrorInterface &
  UseSuggestedQuantityErrorInterface & {
    __typename: 'RecordNotFound';
    description: Scalars['String']['output'];
  };

export type RecordProgramCombinationAlreadyExists =
  InsertVaccineCourseErrorInterface &
    UpdateVaccineCourseErrorInterface & {
      __typename: 'RecordProgramCombinationAlreadyExists';
      description: Scalars['String']['output'];
    };

export type RefreshToken = {
  __typename: 'RefreshToken';
  /** New Bearer token */
  token: Scalars['String']['output'];
};

export type RefreshTokenError = {
  __typename: 'RefreshTokenError';
  error: RefreshTokenErrorInterface;
};

export type RefreshTokenErrorInterface = {
  description: Scalars['String']['output'];
};

export type RefreshTokenResponse = RefreshToken | RefreshTokenError;

export type RepackConnector = {
  __typename: 'RepackConnector';
  nodes: Array<RepackNode>;
  totalCount: Scalars['Int']['output'];
};

export type RepackNode = {
  __typename: 'RepackNode';
  batch?: Maybe<Scalars['String']['output']>;
  datetime: Scalars['DateTime']['output'];
  from: RepackStockLineNode;
  id: Scalars['String']['output'];
  invoice: InvoiceNode;
  repackId: Scalars['String']['output'];
  to: RepackStockLineNode;
};

export type RepackResponse = NodeError | RepackNode;

export type RepackStockLineNode = {
  __typename: 'RepackStockLineNode';
  location?: Maybe<LocationNode>;
  numberOfPacks: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  stockLine?: Maybe<StockLineNode>;
};

export type ReportConnector = {
  __typename: 'ReportConnector';
  nodes: Array<ReportNode>;
  totalCount: Scalars['Int']['output'];
};

export enum ReportContext {
  Asset = 'ASSET',
  Dispensary = 'DISPENSARY',
  InboundReturn = 'INBOUND_RETURN',
  InboundShipment = 'INBOUND_SHIPMENT',
  InternalOrder = 'INTERNAL_ORDER',
  OutboundReturn = 'OUTBOUND_RETURN',
  OutboundShipment = 'OUTBOUND_SHIPMENT',
  Patient = 'PATIENT',
  Prescription = 'PRESCRIPTION',
  Repack = 'REPACK',
  Report = 'REPORT',
  Requisition = 'REQUISITION',
  Resource = 'RESOURCE',
  Stocktake = 'STOCKTAKE',
}

export type ReportFilterInput = {
  context?: InputMaybe<EqualFilterReportContextInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<StringFilterInput>;
  subContext?: InputMaybe<EqualFilterStringInput>;
};

export type ReportNode = {
  __typename: 'ReportNode';
  argumentSchema?: Maybe<FormSchemaNode>;
  code: Scalars['String']['output'];
  context: ReportContext;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  /** Human readable name of the report */
  name: Scalars['String']['output'];
  subContext?: Maybe<Scalars['String']['output']>;
};

export type ReportResponse = QueryReportError | ReportNode;

export enum ReportSortFieldInput {
  Id = 'id',
  Name = 'name',
}

export type ReportSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ReportSortFieldInput;
};

export type ReportsResponse = QueryReportsError | ReportConnector;

export type RequestRequisitionCounts = {
  __typename: 'RequestRequisitionCounts';
  draft: Scalars['Int']['output'];
};

export type RequestStoreStatsNode = {
  __typename: 'RequestStoreStatsNode';
  averageMonthlyConsumption: Scalars['Float']['output'];
  maxMonthsOfStock: Scalars['Float']['output'];
  stockOnHand: Scalars['Float']['output'];
  suggestedQuantity: Scalars['Float']['output'];
};

export type RequisitionConnector = {
  __typename: 'RequisitionConnector';
  nodes: Array<RequisitionNode>;
  totalCount: Scalars['Int']['output'];
};

export type RequisitionCounts = {
  __typename: 'RequisitionCounts';
  emergency: EmergencyResponseRequisitionCounts;
  request: RequestRequisitionCounts;
  response: ResponseRequisitionCounts;
};

export type RequisitionFilterInput = {
  aShipmentHasBeenCreated?: InputMaybe<Scalars['Boolean']['input']>;
  automaticallyCreated?: InputMaybe<Scalars['Boolean']['input']>;
  colour?: InputMaybe<EqualFilterStringInput>;
  comment?: InputMaybe<StringFilterInput>;
  createdDatetime?: InputMaybe<DatetimeFilterInput>;
  elmisCode?: InputMaybe<EqualFilterStringInput>;
  expectedDeliveryDate?: InputMaybe<DateFilterInput>;
  finalisedDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  isEmergency?: InputMaybe<Scalars['Boolean']['input']>;
  orderType?: InputMaybe<EqualFilterStringInput>;
  otherPartyId?: InputMaybe<EqualFilterStringInput>;
  otherPartyName?: InputMaybe<StringFilterInput>;
  periodId?: InputMaybe<EqualFilterStringInput>;
  programId?: InputMaybe<EqualFilterStringInput>;
  requisitionNumber?: InputMaybe<EqualFilterBigNumberInput>;
  sentDatetime?: InputMaybe<DatetimeFilterInput>;
  status?: InputMaybe<EqualFilterRequisitionStatusInput>;
  theirReference?: InputMaybe<StringFilterInput>;
  type?: InputMaybe<EqualFilterRequisitionTypeInput>;
  userId?: InputMaybe<EqualFilterStringInput>;
};

export type RequisitionIndicatorInformationNode = {
  __typename: 'RequisitionIndicatorInformationNode';
  columnId: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type RequisitionLineChartError = {
  __typename: 'RequisitionLineChartError';
  error: RequisitionLineChartErrorInterface;
};

export type RequisitionLineChartErrorInterface = {
  description: Scalars['String']['output'];
};

export type RequisitionLineChartResponse =
  | ItemChartNode
  | RequisitionLineChartError;

export type RequisitionLineConnector = {
  __typename: 'RequisitionLineConnector';
  nodes: Array<RequisitionLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type RequisitionLineNode = {
  __typename: 'RequisitionLineNode';
  additionInUnits: Scalars['Float']['output'];
  /** Quantity already issued in outbound shipments */
  alreadyIssued: Scalars['Float']['output'];
  approvalComment?: Maybe<Scalars['String']['output']>;
  approvedQuantity: Scalars['Float']['output'];
  availableStockOnHand: Scalars['Float']['output'];
  averageMonthlyConsumption: Scalars['Float']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  daysOutOfStock: Scalars['Float']['output'];
  expiringUnits: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  /** InboundShipment lines linked to requisitions line */
  inboundShipmentLines: InvoiceLineConnector;
  incomingUnits: Scalars['Float']['output'];
  initialStockOnHandUnits: Scalars['Float']['output'];
  item: ItemNode;
  itemId: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  /**
   * For request requisition: snapshot stats (when requisition was created)
   * For response requisition current item stats
   */
  itemStats: ItemStatsNode;
  linkedRequisitionLine?: Maybe<RequisitionLineNode>;
  lossInUnits: Scalars['Float']['output'];
  optionId?: Maybe<Scalars['String']['output']>;
  /** OutboundShipment lines linked to requisitions line */
  outboundShipmentLines: InvoiceLineConnector;
  outgoingUnits: Scalars['Float']['output'];
  reason?: Maybe<ReasonOptionNode>;
  /**
   * Quantity remaining to supply
   * supplyQuantity minus all (including unallocated) linked invoice lines numberOfPacks * packSize
   * Only available in response requisition, request requisition returns 0
   */
  remainingQuantityToSupply: Scalars['Float']['output'];
  /** Quantity requested */
  requestedQuantity: Scalars['Float']['output'];
  requisitionId: Scalars['String']['output'];
  requisitionNumber: Scalars['Int']['output'];
  /**
   * Calculated quantity
   * When months_of_stock < requisition.min_months_of_stock, calculated = average_monthly_consumption * requisition.max_months_of_stock - months_of_stock
   */
  suggestedQuantity: Scalars['Float']['output'];
  /** Quantity to be supplied in the next shipment, only used in response requisition */
  supplyQuantity: Scalars['Float']['output'];
};

export type RequisitionLineNodeItemStatsArgs = {
  amcLookbackMonths?: InputMaybe<Scalars['Float']['input']>;
};

export type RequisitionLineStatsError = {
  __typename: 'RequisitionLineStatsError';
  error: RequisitionLineStatsErrorInterface;
};

export type RequisitionLineStatsErrorInterface = {
  description: Scalars['String']['output'];
};

export type RequisitionLineStatsResponse =
  | RequisitionLineStatsError
  | ResponseRequisitionStatsNode;

export type RequisitionLineWithItemIdExists =
  InsertRequestRequisitionLineErrorInterface &
    InsertResponseRequisitionLineErrorInterface & {
      __typename: 'RequisitionLineWithItemIdExists';
      description: Scalars['String']['output'];
    };

export type RequisitionNode = {
  __typename: 'RequisitionNode';
  approvalStatus: RequisitionNodeApprovalStatus;
  colour?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['DateTime']['output'];
  expectedDeliveryDate?: Maybe<Scalars['NaiveDate']['output']>;
  finalisedDatetime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  isEmergency: Scalars['Boolean']['output'];
  lines: RequisitionLineConnector;
  /**
   * All lines that have not been supplied
   * based on same logic as RequisitionLineNode.remainingQuantityToSupply
   * only applicable to Response requisition, Request requisition will empty connector
   */
  linesRemainingToSupply: RequisitionLineConnector;
  /** Linked requisition */
  linkedRequisition?: Maybe<RequisitionNode>;
  /** Maximum calculated quantity, used to deduce calculated quantity for each line, see calculated in requisition line */
  maxMonthsOfStock: Scalars['Float']['output'];
  /** Minimum quantity to have for stock to be ordered, used to deduce calculated quantity for each line, see calculated in requisition line */
  minMonthsOfStock: Scalars['Float']['output'];
  orderType?: Maybe<Scalars['String']['output']>;
  /**
   * Request Requisition: Supplying store (store that is supplying stock)
   * Response Requisition: Customer store (store that is ordering stock)
   */
  otherParty: NameNode;
  otherPartyId: Scalars['String']['output'];
  otherPartyName: Scalars['String']['output'];
  period?: Maybe<PeriodNode>;
  program?: Maybe<ProgramNode>;
  /** @deprecated use `program.name` instead. */
  programName?: Maybe<Scalars['String']['output']>;
  requisitionNumber: Scalars['Int']['output'];
  /** Applicable to request requisition only */
  sentDatetime?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Response Requisition: Outbound Shipments linked requisition
   * Request Requisition: Inbound Shipments linked to requisition
   */
  shipments: InvoiceConnector;
  status: RequisitionNodeStatus;
  theirReference?: Maybe<Scalars['String']['output']>;
  type: RequisitionNodeType;
  /**
   * User that last edited requisition, if user is not found in system default unknown user is returned
   * Null is returned for transfers, where response requisition has not been edited yet
   */
  user?: Maybe<UserNode>;
};

export type RequisitionNodeOtherPartyArgs = {
  storeId: Scalars['String']['input'];
};

/** Approval status is applicable to response requisition only */
export enum RequisitionNodeApprovalStatus {
  /** Approved */
  Approved = 'APPROVED',
  /** Approval was denied, requisition is not editable */
  Denied = 'DENIED',
  None = 'NONE',
  /** Pending authorisation, requisition should not be editable */
  Pending = 'PENDING',
}

export enum RequisitionNodeStatus {
  /** New requisition when manually created */
  Draft = 'DRAFT',
  /**
   * Response requisition: When supplier finished fulfilling requisition, locked for future editing
   * Request requisition: When response requisition is finalised
   */
  Finalised = 'FINALISED',
  /** New requisition when automatically created, only applicable to response requisition when it's duplicated in supplying store from request requisition */
  New = 'NEW',
  /** Request requisition is sent and locked for future editing, only applicable to request requisition */
  Sent = 'SENT',
}

export enum RequisitionNodeType {
  /** Requisition created by store that is ordering stock */
  Request = 'REQUEST',
  /** Supplying store requisition in response to request requisition */
  Response = 'RESPONSE',
}

export type RequisitionReasonNotProvided = {
  __typename: 'RequisitionReasonNotProvided';
  description: Scalars['String']['output'];
  requisitionLine: RequisitionLineNode;
};

export type RequisitionReasonsNotProvided =
  UpdateRequestRequisitionErrorInterface &
    UpdateResponseRequisitionErrorInterface & {
      __typename: 'RequisitionReasonsNotProvided';
      description: Scalars['String']['output'];
      errors: Array<RequisitionReasonNotProvided>;
    };

export type RequisitionResponse = RecordNotFound | RequisitionNode;

export enum RequisitionSortFieldInput {
  Comment = 'comment',
  CreatedDatetime = 'createdDatetime',
  ExpectedDeliveryDate = 'expectedDeliveryDate',
  FinalisedDatetime = 'finalisedDatetime',
  OrderType = 'orderType',
  OtherPartyName = 'otherPartyName',
  PeriodStartDate = 'periodStartDate',
  ProgramName = 'programName',
  RequisitionNumber = 'requisitionNumber',
  SentDatetime = 'sentDatetime',
  Status = 'status',
  TheirReference = 'theirReference',
  Type = 'type',
}

export type RequisitionSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: RequisitionSortFieldInput;
};

export type RequisitionWithShipment =
  DeleteResponseRequisitionErrorInterface & {
    __typename: 'RequisitionWithShipment';
    description: Scalars['String']['output'];
  };

export type RequisitionsResponse = RequisitionConnector;

export type ResponseRequisitionCounts = {
  __typename: 'ResponseRequisitionCounts';
  new: Scalars['Int']['output'];
};

export type ResponseRequisitionStatsNode = {
  __typename: 'ResponseRequisitionStatsNode';
  requestStoreStats: RequestStoreStatsNode;
  responseStoreStats: ResponseStoreStatsNode;
};

export type ResponseStoreStatsNode = {
  __typename: 'ResponseStoreStatsNode';
  incomingStock: Scalars['Int']['output'];
  otherRequestedQuantity: Scalars['Float']['output'];
  requestedQuantity: Scalars['Float']['output'];
  stockOnHand: Scalars['Float']['output'];
  stockOnOrder: Scalars['Float']['output'];
};

export type ReturnReasonConnector = {
  __typename: 'ReturnReasonConnector';
  nodes: Array<ReturnReasonNode>;
  totalCount: Scalars['Int']['output'];
};

export type ReturnReasonFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ReturnReasonNode = {
  __typename: 'ReturnReasonNode';
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  reason: Scalars['String']['output'];
};

export type ReturnReasonResponse = ReturnReasonConnector;

export enum ReturnReasonSortFieldInput {
  Id = 'id',
  Reason = 'reason',
}

export type ReturnReasonSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: ReturnReasonSortFieldInput;
};

export type RnRFormConnector = {
  __typename: 'RnRFormConnector';
  nodes: Array<RnRFormNode>;
  totalCount: Scalars['Int']['output'];
};

export type RnRFormFilterInput = {
  createdDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  periodScheduleId?: InputMaybe<EqualFilterStringInput>;
  programId?: InputMaybe<EqualFilterStringInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
};

export type RnRFormLineNode = {
  __typename: 'RnRFormLineNode';
  adjustedQuantityConsumed: Scalars['Float']['output'];
  adjustments: Scalars['Float']['output'];
  approvedQuantity?: Maybe<Scalars['Float']['output']>;
  averageMonthlyConsumption: Scalars['Float']['output'];
  calculatedRequestedQuantity: Scalars['Float']['output'];
  comment?: Maybe<Scalars['String']['output']>;
  confirmed: Scalars['Boolean']['output'];
  enteredRequestedQuantity?: Maybe<Scalars['Float']['output']>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  finalBalance: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  initialBalance: Scalars['Float']['output'];
  item: ItemNode;
  itemId: Scalars['String']['output'];
  losses: Scalars['Float']['output'];
  lowStock: LowStockStatus;
  maximumQuantity: Scalars['Float']['output'];
  minimumQuantity: Scalars['Float']['output'];
  previousMonthlyConsumptionValues: Scalars['String']['output'];
  quantityConsumed: Scalars['Float']['output'];
  quantityReceived: Scalars['Float']['output'];
  rnrFormId: Scalars['String']['output'];
  stockOutDuration: Scalars['Int']['output'];
};

export type RnRFormNode = {
  __typename: 'RnRFormNode';
  comment?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  lines: Array<RnRFormLineNode>;
  periodId: Scalars['String']['output'];
  periodLength: Scalars['Int']['output'];
  periodName: Scalars['String']['output'];
  programId: Scalars['String']['output'];
  programName: Scalars['String']['output'];
  status: RnRFormNodeStatus;
  supplierId: Scalars['String']['output'];
  supplierName: Scalars['String']['output'];
  theirReference?: Maybe<Scalars['String']['output']>;
};

export enum RnRFormNodeStatus {
  Draft = 'DRAFT',
  Finalised = 'FINALISED',
}

export type RnRFormResponse = NodeError | RnRFormNode;

export enum RnRFormSortFieldInput {
  CreatedDatetime = 'createdDatetime',
  Period = 'period',
  Program = 'program',
  Status = 'status',
  SupplierName = 'supplierName',
}

export type RnRFormSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: RnRFormSortFieldInput;
};

export type RnRFormsResponse = RnRFormConnector;

export type SaveOutboundShipmentLinesInput = {
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  lines: Array<OutboundShipmentLineInput>;
  placeholderQuantity?: InputMaybe<Scalars['Float']['input']>;
};

export type SavePrescriptionLinesInput = {
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  lines: Array<PrescriptionLineInput>;
  note?: InputMaybe<Scalars['String']['input']>;
  prescribedQuantity?: InputMaybe<Scalars['Float']['input']>;
};

export type ScannedDataParseError = {
  __typename: 'ScannedDataParseError';
  error: ScannedDataParseErrorInterface;
};

export type ScannedDataParseErrorInterface = {
  description: Scalars['String']['output'];
};

export type SchedulePeriodNode = {
  __typename: 'SchedulePeriodNode';
  id: Scalars['String']['output'];
  inUse: Scalars['Boolean']['output'];
  period: PeriodNode;
};

export type SensorConnector = {
  __typename: 'SensorConnector';
  nodes: Array<SensorNode>;
  totalCount: Scalars['Int']['output'];
};

export type SensorFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<StringFilterInput>;
  serial?: InputMaybe<EqualFilterStringInput>;
};

export type SensorNode = {
  __typename: 'SensorNode';
  assets: AssetConnector;
  batteryLevel?: Maybe<Scalars['Int']['output']>;
  breach?: Maybe<TemperatureBreachNodeType>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastConnectionDatetime?: Maybe<Scalars['DateTime']['output']>;
  latestTemperatureLog?: Maybe<TemperatureLogConnector>;
  location?: Maybe<LocationNode>;
  logInterval?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  serial: Scalars['String']['output'];
  type: SensorNodeType;
};

export enum SensorNodeType {
  Berlinger = 'BERLINGER',
  BlueMaestro = 'BLUE_MAESTRO',
  Laird = 'LAIRD',
}

export enum SensorSortFieldInput {
  Name = 'name',
  Serial = 'serial',
}

export type SensorSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: SensorSortFieldInput;
};

export type SensorsResponse = SensorConnector;

export type SetPrescribedQuantityError = {
  __typename: 'SetPrescribedQuantityError';
  error: SetPrescribedQuantityErrorInterface;
};

export type SetPrescribedQuantityErrorInterface = {
  description: Scalars['String']['output'];
};

export type SetPrescribedQuantityInput = {
  invoiceId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  prescribedQuantity: Scalars['Float']['input'];
};

export type SetPrescribedQuantityResponse =
  | InvoiceLineNode
  | SetPrescribedQuantityError;

export type SetPrescribedQuantityWithId = {
  __typename: 'SetPrescribedQuantityWithId';
  id: Scalars['String']['output'];
  response: SetPrescribedQuantityResponse;
};

export type SnapshotCountCurrentCountMismatch =
  UpdateStocktakeErrorInterface & {
    __typename: 'SnapshotCountCurrentCountMismatch';
    description: Scalars['String']['output'];
    lines: Array<SnapshotCountCurrentCountMismatchLine>;
  };

export type SnapshotCountCurrentCountMismatchLine =
  UpdateStocktakeLineErrorInterface & {
    __typename: 'SnapshotCountCurrentCountMismatchLine';
    description: Scalars['String']['output'];
    stocktakeLine: StocktakeLineNode;
  };

export enum StatusType {
  Decommissioned = 'DECOMMISSIONED',
  Functioning = 'FUNCTIONING',
  FunctioningButNeedsAttention = 'FUNCTIONING_BUT_NEEDS_ATTENTION',
  NotFunctioning = 'NOT_FUNCTIONING',
  NotInUse = 'NOT_IN_USE',
  Unserviceable = 'UNSERVICEABLE',
}

export type StockCounts = {
  __typename: 'StockCounts';
  expired: Scalars['Int']['output'];
  expiringSoon: Scalars['Int']['output'];
};

export type StockEvolutionConnector = {
  __typename: 'StockEvolutionConnector';
  nodes: Array<StockEvolutionNode>;
  totalCount: Scalars['Int']['output'];
};

export type StockEvolutionNode = {
  __typename: 'StockEvolutionNode';
  date: Scalars['NaiveDate']['output'];
  isHistoric: Scalars['Boolean']['output'];
  isProjected: Scalars['Boolean']['output'];
  maximumStockOnHand: Scalars['Int']['output'];
  minimumStockOnHand: Scalars['Int']['output'];
  stockOnHand: Scalars['Int']['output'];
};

export type StockEvolutionOptionsInput = {
  /** Defaults to 30, number of data points for historic stock on hand in stock evolution chart */
  numberOfHistoricDataPoints?: InputMaybe<Scalars['Int']['input']>;
  /** Defaults to 20, number of data points for projected stock on hand in stock evolution chart */
  numberOfProjectedDataPoints?: InputMaybe<Scalars['Int']['input']>;
};

export type StockLineAlreadyExistsInInvoice =
  InsertOutboundShipmentLineErrorInterface &
    InsertPrescriptionLineErrorInterface &
    UpdateOutboundShipmentLineErrorInterface &
    UpdatePrescriptionLineErrorInterface & {
      __typename: 'StockLineAlreadyExistsInInvoice';
      description: Scalars['String']['output'];
      line: InvoiceLineNode;
    };

export type StockLineConnector = {
  __typename: 'StockLineConnector';
  nodes: Array<StockLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type StockLineFilterInput = {
  expiryDate?: InputMaybe<DateFilterInput>;
  hasPacksInStore?: InputMaybe<Scalars['Boolean']['input']>;
  id?: InputMaybe<EqualFilterStringInput>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  itemCodeOrName?: InputMaybe<StringFilterInput>;
  itemId?: InputMaybe<EqualFilterStringInput>;
  location?: InputMaybe<LocationFilterInput>;
  locationId?: InputMaybe<EqualFilterStringInput>;
  masterList?: InputMaybe<MasterListFilterInput>;
  storeId?: InputMaybe<EqualFilterStringInput>;
};

export type StockLineIsOnHold = InsertOutboundShipmentLineErrorInterface &
  InsertPrescriptionLineErrorInterface &
  UpdateOutboundShipmentLineErrorInterface &
  UpdatePrescriptionLineErrorInterface & {
    __typename: 'StockLineIsOnHold';
    description: Scalars['String']['output'];
  };

export type StockLineNode = {
  __typename: 'StockLineNode';
  availableNumberOfPacks: Scalars['Float']['output'];
  barcode?: Maybe<Scalars['String']['output']>;
  batch?: Maybe<Scalars['String']['output']>;
  campaign?: Maybe<CampaignNode>;
  costPricePerPack: Scalars['Float']['output'];
  donor?: Maybe<NameNode>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  item: ItemNode;
  itemId: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  itemVariant?: Maybe<ItemVariantNode>;
  itemVariantId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<LocationNode>;
  locationId?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  onHold: Scalars['Boolean']['output'];
  packSize: Scalars['Float']['output'];
  sellPricePerPack: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
  supplierName?: Maybe<Scalars['String']['output']>;
  totalNumberOfPacks: Scalars['Float']['output'];
  vvmStatus?: Maybe<VvmstatusNode>;
  vvmStatusId?: Maybe<Scalars['String']['output']>;
  vvmStatusLogs?: Maybe<VvmstatusLogConnector>;
};

export type StockLineNodeDonorArgs = {
  storeId: Scalars['String']['input'];
};

export type StockLineReducedBelowZero =
  InsertInventoryAdjustmentErrorInterface &
    InsertRepackErrorInterface &
    InsertStocktakeLineErrorInterface &
    UpdateStocktakeLineErrorInterface & {
      __typename: 'StockLineReducedBelowZero';
      description: Scalars['String']['output'];
      stockLine: StockLineNode;
    };

export type StockLineResponse = NodeError | StockLineNode;

export enum StockLineSortFieldInput {
  Batch = 'batch',
  ExpiryDate = 'expiryDate',
  ItemCode = 'itemCode',
  ItemName = 'itemName',
  LocationCode = 'locationCode',
  NumberOfPacks = 'numberOfPacks',
  PackSize = 'packSize',
  SupplierName = 'supplierName',
}

export type StockLineSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: StockLineSortFieldInput;
};

export type StockLinesReducedBelowZero = UpdateStocktakeErrorInterface & {
  __typename: 'StockLinesReducedBelowZero';
  description: Scalars['String']['output'];
  errors: Array<StockLineReducedBelowZero>;
};

export type StockLinesResponse = StockLineConnector;

export type StocktakeConnector = {
  __typename: 'StocktakeConnector';
  nodes: Array<StocktakeNode>;
  totalCount: Scalars['Int']['output'];
};

export type StocktakeFilterInput = {
  comment?: InputMaybe<StringFilterInput>;
  createdDatetime?: InputMaybe<DatetimeFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  finalisedDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  isLocked?: InputMaybe<Scalars['Boolean']['input']>;
  isProgramStocktake?: InputMaybe<Scalars['Boolean']['input']>;
  programId?: InputMaybe<EqualFilterStringInput>;
  status?: InputMaybe<EqualFilterStocktakeStatusInput>;
  stocktakeDate?: InputMaybe<DateFilterInput>;
  stocktakeNumber?: InputMaybe<EqualFilterBigNumberInput>;
  userId?: InputMaybe<EqualFilterStringInput>;
};

export type StocktakeIsLocked = UpdateStocktakeErrorInterface & {
  __typename: 'StocktakeIsLocked';
  description: Scalars['String']['output'];
};

export type StocktakeLineConnector = {
  __typename: 'StocktakeLineConnector';
  nodes: Array<StocktakeLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type StocktakeLineFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  itemCodeOrName?: InputMaybe<StringFilterInput>;
  itemId?: InputMaybe<EqualFilterStringInput>;
  locationId?: InputMaybe<EqualFilterStringInput>;
  stocktakeId?: InputMaybe<EqualFilterStringInput>;
};

export type StocktakeLineNode = {
  __typename: 'StocktakeLineNode';
  batch?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  costPricePerPack?: Maybe<Scalars['Float']['output']>;
  countedNumberOfPacks?: Maybe<Scalars['Float']['output']>;
  donorId?: Maybe<Scalars['String']['output']>;
  donorName?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  /** @deprecated Since 2.8.0. Use reason_option instead */
  inventoryAdjustmentReason?: Maybe<InventoryAdjustmentReasonNode>;
  /** @deprecated Since 2.8.0. Use reason_option instead */
  inventoryAdjustmentReasonId?: Maybe<Scalars['String']['output']>;
  item: ItemNode;
  itemId: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  itemVariant?: Maybe<ItemVariantNode>;
  itemVariantId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<LocationNode>;
  note?: Maybe<Scalars['String']['output']>;
  packSize?: Maybe<Scalars['Float']['output']>;
  reasonOption?: Maybe<ReasonOptionNode>;
  sellPricePerPack?: Maybe<Scalars['Float']['output']>;
  snapshotNumberOfPacks: Scalars['Float']['output'];
  stockLine?: Maybe<StockLineNode>;
  stocktakeId: Scalars['String']['output'];
};

export enum StocktakeLineSortFieldInput {
  /** Stocktake line batch */
  Batch = 'batch',
  /** Stocktake line expiry date */
  ExpiryDate = 'expiryDate',
  ItemCode = 'itemCode',
  ItemName = 'itemName',
  /** Stocktake line item stock location code */
  LocationCode = 'locationCode',
  /** Stocktake line pack size */
  PackSize = 'packSize',
}

export type StocktakeLineSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: StocktakeLineSortFieldInput;
};

export type StocktakeNode = {
  __typename: 'StocktakeNode';
  comment?: Maybe<Scalars['String']['output']>;
  countedBy?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  finalisedDatetime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  inventoryAddition?: Maybe<InvoiceNode>;
  inventoryAdditionId?: Maybe<Scalars['String']['output']>;
  inventoryReduction?: Maybe<InvoiceNode>;
  inventoryReductionId?: Maybe<Scalars['String']['output']>;
  isInitialStocktake: Scalars['Boolean']['output'];
  isLocked: Scalars['Boolean']['output'];
  lines: StocktakeLineConnector;
  program?: Maybe<ProgramNode>;
  status: StocktakeNodeStatus;
  stocktakeDate?: Maybe<Scalars['NaiveDate']['output']>;
  stocktakeNumber: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  user?: Maybe<UserNode>;
  verifiedBy?: Maybe<Scalars['String']['output']>;
};

export enum StocktakeNodeStatus {
  Finalised = 'FINALISED',
  New = 'NEW',
}

export type StocktakeResponse = NodeError | StocktakeNode;

export enum StocktakeSortFieldInput {
  Comment = 'comment',
  CreatedDatetime = 'createdDatetime',
  Description = 'description',
  FinalisedDatetime = 'finalisedDatetime',
  Status = 'status',
  StocktakeDate = 'stocktakeDate',
  StocktakeNumber = 'stocktakeNumber',
}

export type StocktakeSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: StocktakeSortFieldInput;
};

export type StocktakesLinesResponse = StocktakeLineConnector;

export type StocktakesResponse = StocktakeConnector;

export type StoreConnector = {
  __typename: 'StoreConnector';
  nodes: Array<StoreNode>;
  totalCount: Scalars['Int']['output'];
};

export type StoreFilterInput = {
  code?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
  nameCode?: InputMaybe<StringFilterInput>;
  siteId?: InputMaybe<EqualFilterNumberInput>;
};

export enum StoreModeNodeType {
  Dispensary = 'DISPENSARY',
  Store = 'STORE',
}

export type StoreNode = {
  __typename: 'StoreNode';
  code: Scalars['String']['output'];
  createdDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  /**
   * Returns the associated store logo.
   * The logo is returned as a data URL schema, e.g. "data:image/png;base64,..."
   */
  logo?: Maybe<Scalars['String']['output']>;
  name: NameNode;
  siteId: Scalars['Int']['output'];
  storeName: Scalars['String']['output'];
};

export type StoreNodeNameArgs = {
  storeId: Scalars['String']['input'];
};

export type StorePreferenceNode = {
  __typename: 'StorePreferenceNode';
  editPrescribedQuantityOnPrescription: Scalars['Boolean']['output'];
  extraFieldsInRequisition: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  issueInForeignCurrency: Scalars['Boolean']['output'];
  manuallyLinkInternalOrderToInboundShipment: Scalars['Boolean']['output'];
  monthlyConsumptionLookBackPeriod: Scalars['Float']['output'];
  monthsItemsExpire: Scalars['Float']['output'];
  monthsLeadTime: Scalars['Float']['output'];
  monthsOverstock: Scalars['Float']['output'];
  monthsUnderstock: Scalars['Float']['output'];
  omProgramModule: Scalars['Boolean']['output'];
  packToOne: Scalars['Boolean']['output'];
  requestRequisitionRequiresAuthorisation: Scalars['Boolean']['output'];
  responseRequisitionRequiresAuthorisation: Scalars['Boolean']['output'];
  stocktakeFrequency: Scalars['Float']['output'];
  useConsumptionAndStockFromCustomersForInternalOrders: Scalars['Boolean']['output'];
  vaccineModule: Scalars['Boolean']['output'];
};

export type StoreResponse = NodeError | StoreNode;

export enum StoreSortFieldInput {
  Code = 'code',
  Name = 'name',
  NameCode = 'nameCode',
}

export type StoreSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: StoreSortFieldInput;
};

export type StoresResponse = StoreConnector;

export type StringFilterInput = {
  /** Search term must be an exact match (case sensitive) */
  equalTo?: InputMaybe<Scalars['String']['input']>;
  /** Search term must be included in search candidate (case insensitive) */
  like?: InputMaybe<Scalars['String']['input']>;
};

export type Success = {
  __typename: 'Success';
  success: Scalars['Boolean']['output'];
};

export type SuggestedNextEncounterNode = {
  __typename: 'SuggestedNextEncounterNode';
  label?: Maybe<Scalars['String']['output']>;
  startDatetime: Scalars['DateTime']['output'];
};

export type SuggestedQuantityCalculationNode = {
  __typename: 'SuggestedQuantityCalculationNode';
  averageMonthlyConsumption: Scalars['Int']['output'];
  maximumStockOnHand: Scalars['Int']['output'];
  minimumStockOnHand: Scalars['Int']['output'];
  stockOnHand: Scalars['Int']['output'];
  suggestedQuantity: Scalars['Int']['output'];
};

export type SupplierProgramRequisitionSettingNode = {
  __typename: 'SupplierProgramRequisitionSettingNode';
  masterList: MasterListNode;
  orderTypes: Array<ProgramRequisitionOrderTypeNode>;
  programId: Scalars['String']['output'];
  programName: Scalars['String']['output'];
  suppliers: Array<NameNode>;
  tagName: Scalars['String']['output'];
};

export type SupplierReturnInput = {
  id: Scalars['String']['input'];
  inboundShipmentId?: InputMaybe<Scalars['String']['input']>;
  supplierId: Scalars['String']['input'];
  supplierReturnLines: Array<SupplierReturnLineInput>;
};

export type SupplierReturnLineConnector = {
  __typename: 'SupplierReturnLineConnector';
  nodes: Array<SupplierReturnLineNode>;
  totalCount: Scalars['Int']['output'];
};

export type SupplierReturnLineInput = {
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  numberOfPacksToReturn: Scalars['Float']['input'];
  reasonId?: InputMaybe<Scalars['String']['input']>;
  stockLineId: Scalars['String']['input'];
};

export type SupplierReturnLineNode = {
  __typename: 'SupplierReturnLineNode';
  availableNumberOfPacks: Scalars['Float']['output'];
  batch?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['NaiveDate']['output']>;
  id: Scalars['String']['output'];
  item: ItemNode;
  itemCode: Scalars['String']['output'];
  itemName: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  numberOfPacksToReturn: Scalars['Float']['output'];
  packSize: Scalars['Float']['output'];
  reasonId?: Maybe<Scalars['String']['output']>;
  reasonOption?: Maybe<ReasonOptionNode>;
  stockLineId: Scalars['String']['output'];
};

export type SupplyRequestedQuantityError = {
  __typename: 'SupplyRequestedQuantityError';
  error: SupplyRequestedQuantityErrorInterface;
};

export type SupplyRequestedQuantityErrorInterface = {
  description: Scalars['String']['output'];
};

export type SupplyRequestedQuantityInput = {
  responseRequisitionId: Scalars['String']['input'];
};

export type SupplyRequestedQuantityResponse =
  | RequisitionLineConnector
  | SupplyRequestedQuantityError;

export type SyncErrorNode = {
  __typename: 'SyncErrorNode';
  fullError: Scalars['String']['output'];
  variant: SyncErrorVariant;
};

export enum SyncErrorVariant {
  ApiVersionIncompatible = 'API_VERSION_INCOMPATIBLE',
  CentralV6NotConfigured = 'CENTRAL_V6_NOT_CONFIGURED',
  ConnectionError = 'CONNECTION_ERROR',
  HardwareIdMismatch = 'HARDWARE_ID_MISMATCH',
  IncorrectPassword = 'INCORRECT_PASSWORD',
  IntegrationError = 'INTEGRATION_ERROR',
  IntegrationTimeoutReached = 'INTEGRATION_TIMEOUT_REACHED',
  InvalidUrl = 'INVALID_URL',
  SiteAuthTimeout = 'SITE_AUTH_TIMEOUT',
  SiteHasNoStore = 'SITE_HAS_NO_STORE',
  SiteNameNotFound = 'SITE_NAME_NOT_FOUND',
  SiteUuidIsBeingChanged = 'SITE_UUID_IS_BEING_CHANGED',
  Unknown = 'UNKNOWN',
  V6ApiVersionIncompatible = 'V6_API_VERSION_INCOMPATIBLE',
}

export type SyncFileReferenceConnector = {
  __typename: 'SyncFileReferenceConnector';
  nodes: Array<SyncFileReferenceNode>;
  totalCount: Scalars['Int']['output'];
};

export type SyncFileReferenceNode = {
  __typename: 'SyncFileReferenceNode';
  createdDatetime: Scalars['NaiveDateTime']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  recordId: Scalars['String']['output'];
  tableName: Scalars['String']['output'];
};

export type SyncSettingsInput = {
  /** Sync interval */
  intervalSeconds: Scalars['Int']['input'];
  /** Plain text password */
  password: Scalars['String']['input'];
  url: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SyncSettingsNode = {
  __typename: 'SyncSettingsNode';
  /** How frequently central data is synced */
  intervalSeconds: Scalars['Int']['output'];
  /** Central server url */
  url: Scalars['String']['output'];
  /** Central server username */
  username: Scalars['String']['output'];
};

export type SyncStatusNode = {
  __typename: 'SyncStatusNode';
  durationInSeconds: Scalars['Int']['output'];
  finished?: Maybe<Scalars['DateTime']['output']>;
  started: Scalars['DateTime']['output'];
};

export type SyncStatusWithProgressNode = {
  __typename: 'SyncStatusWithProgressNode';
  done?: Maybe<Scalars['Int']['output']>;
  finished?: Maybe<Scalars['DateTime']['output']>;
  started: Scalars['DateTime']['output'];
  total?: Maybe<Scalars['Int']['output']>;
};

export type TaxInput = {
  /** Set or unset the tax value (in percentage) */
  percentage?: InputMaybe<Scalars['Float']['input']>;
};

export type TemperatureBreachConnector = {
  __typename: 'TemperatureBreachConnector';
  nodes: Array<TemperatureBreachNode>;
  totalCount: Scalars['Int']['output'];
};

export type TemperatureBreachFilterInput = {
  endDatetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  location?: InputMaybe<LocationFilterInput>;
  sensor?: InputMaybe<SensorFilterInput>;
  startDatetime?: InputMaybe<DatetimeFilterInput>;
  type?: InputMaybe<EqualFilterTemperatureBreachRowTypeInput>;
  unacknowledged?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TemperatureBreachNode = {
  __typename: 'TemperatureBreachNode';
  comment?: Maybe<Scalars['String']['output']>;
  durationMilliseconds: Scalars['Int']['output'];
  endDatetime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  location?: Maybe<LocationNode>;
  maxOrMinTemperature?: Maybe<Scalars['Float']['output']>;
  sensor?: Maybe<SensorNode>;
  sensorId: Scalars['String']['output'];
  startDatetime: Scalars['DateTime']['output'];
  type: TemperatureBreachNodeType;
  unacknowledged: Scalars['Boolean']['output'];
};

export enum TemperatureBreachNodeType {
  ColdConsecutive = 'COLD_CONSECUTIVE',
  ColdCumulative = 'COLD_CUMULATIVE',
  HotConsecutive = 'HOT_CONSECUTIVE',
  HotCumulative = 'HOT_CUMULATIVE',
}

export enum TemperatureBreachSortFieldInput {
  EndDatetime = 'endDatetime',
  StartDatetime = 'startDatetime',
}

export type TemperatureBreachSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: TemperatureBreachSortFieldInput;
};

export type TemperatureBreachesResponse = TemperatureBreachConnector;

export type TemperatureExcursionConnector = {
  __typename: 'TemperatureExcursionConnector';
  nodes: Array<TemperatureExcursionNode>;
  totalCount: Scalars['Int']['output'];
};

export type TemperatureExcursionNode = {
  __typename: 'TemperatureExcursionNode';
  id: Scalars['String']['output'];
  location?: Maybe<LocationNode>;
  maxOrMinTemperature: Scalars['Float']['output'];
  sensor?: Maybe<SensorNode>;
  sensorId: Scalars['String']['output'];
  startDatetime: Scalars['DateTime']['output'];
};

export type TemperatureLogConnector = {
  __typename: 'TemperatureLogConnector';
  nodes: Array<TemperatureLogNode>;
  totalCount: Scalars['Int']['output'];
};

export type TemperatureLogFilterInput = {
  datetime?: InputMaybe<DatetimeFilterInput>;
  id?: InputMaybe<EqualFilterStringInput>;
  location?: InputMaybe<LocationFilterInput>;
  sensor?: InputMaybe<SensorFilterInput>;
  temperatureBreach?: InputMaybe<TemperatureBreachFilterInput>;
};

export type TemperatureLogNode = {
  __typename: 'TemperatureLogNode';
  datetime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  location?: Maybe<LocationNode>;
  sensor?: Maybe<SensorNode>;
  sensorId: Scalars['String']['output'];
  temperature: Scalars['Float']['output'];
  temperatureBreach?: Maybe<TemperatureBreachNode>;
};

export enum TemperatureLogSortFieldInput {
  Datetime = 'datetime',
  Temperature = 'temperature',
}

export type TemperatureLogSortInput = {
  /**
   * Sort query result is sorted descending or ascending (if not provided the default is
   * ascending)
   */
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  /** Sort query result by `key` */
  key: TemperatureLogSortFieldInput;
};

export type TemperatureLogsResponse = TemperatureLogConnector;

export type TemperatureNotificationConnector = {
  __typename: 'TemperatureNotificationConnector';
  breaches: TemperatureBreachConnector;
  excursions: TemperatureExcursionConnector;
};

export type TemperatureNotificationsResponse = TemperatureNotificationConnector;

export type TokenExpired = RefreshTokenErrorInterface & {
  __typename: 'TokenExpired';
  description: Scalars['String']['output'];
};

export type TransferredRequisition = DeleteResponseRequisitionErrorInterface & {
  __typename: 'TransferredRequisition';
  description: Scalars['String']['output'];
};

export type UnallocatedLineForItemAlreadyExists =
  InsertOutboundShipmentUnallocatedLineErrorInterface & {
    __typename: 'UnallocatedLineForItemAlreadyExists';
    description: Scalars['String']['output'];
  };

export type UnallocatedLinesOnlyEditableInNewInvoice =
  InsertOutboundShipmentUnallocatedLineErrorInterface & {
    __typename: 'UnallocatedLinesOnlyEditableInNewInvoice';
    description: Scalars['String']['output'];
  };

export enum UniqueCombinationKey {
  Manufacturer = 'manufacturer',
  Model = 'model',
}

export type UniqueCombinationViolation =
  InsertAssetCatalogueItemErrorInterface & {
    __typename: 'UniqueCombinationViolation';
    description: Scalars['String']['output'];
    fields: Array<UniqueCombinationKey>;
  };

export enum UniqueValueKey {
  Code = 'code',
  Name = 'name',
  Serial = 'serial',
}

export type UniqueValueViolation = InsertAssetCatalogueItemErrorInterface &
  InsertAssetErrorInterface &
  InsertAssetLogErrorInterface &
  InsertAssetLogReasonErrorInterface &
  InsertDemographicIndicatorErrorInterface &
  InsertDemographicProjectionErrorInterface &
  InsertLocationErrorInterface &
  UpdateAssetErrorInterface &
  UpdateDemographicIndicatorErrorInterface &
  UpdateDemographicProjectionErrorInterface &
  UpdateLocationErrorInterface &
  UpdateSensorErrorInterface &
  UpsertCampaignErrorInterface &
  UpsertItemVariantErrorInterface & {
    __typename: 'UniqueValueViolation';
    description: Scalars['String']['output'];
    field: UniqueValueKey;
  };

export type UpdateAssetError = {
  __typename: 'UpdateAssetError';
  error: UpdateAssetErrorInterface;
};

export type UpdateAssetErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateAssetInput = {
  assetNumber?: InputMaybe<Scalars['String']['input']>;
  catalogueItemId?: InputMaybe<NullableStringUpdate>;
  donorNameId?: InputMaybe<NullableStringUpdate>;
  id: Scalars['String']['input'];
  installationDate?: InputMaybe<NullableDateUpdate>;
  locationIds?: InputMaybe<Array<Scalars['String']['input']>>;
  needsReplacement?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Scalars['String']['input']>;
  replacementDate?: InputMaybe<NullableDateUpdate>;
  serialNumber?: InputMaybe<NullableStringUpdate>;
  storeId?: InputMaybe<NullableStringUpdate>;
  warrantyEnd?: InputMaybe<NullableDateUpdate>;
  warrantyStart?: InputMaybe<NullableDateUpdate>;
};

export type UpdateAssetResponse = AssetNode | UpdateAssetError;

export type UpdateContactTraceInput = {
  /** Contact trace document data */
  data: Scalars['JSON']['input'];
  /** The document ID of the contact trace document which should be updated */
  parent: Scalars['String']['input'];
  /** The patient ID the contact belongs to */
  patientId: Scalars['String']['input'];
  /** The schema id used for the contact trace data */
  schemaId: Scalars['String']['input'];
  /** The contact trace document type */
  type: Scalars['String']['input'];
};

export type UpdateContactTraceResponse = ContactTraceNode;

export type UpdateCustomerReturnError = {
  __typename: 'UpdateCustomerReturnError';
  error: UpdateCustomerReturnErrorInterface;
};

export type UpdateCustomerReturnErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateCustomerReturnInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  otherPartyId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UpdateCustomerReturnStatusInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerReturnLinesInput = {
  customerReturnId: Scalars['String']['input'];
  customerReturnLines: Array<CustomerReturnLineInput>;
};

export type UpdateCustomerReturnLinesResponse = InvoiceNode;

export type UpdateCustomerReturnResponse =
  | InvoiceNode
  | UpdateCustomerReturnError;

export enum UpdateCustomerReturnStatusInput {
  Received = 'RECEIVED',
  Verified = 'VERIFIED',
}

export type UpdateDemographicIndicatorError = {
  __typename: 'UpdateDemographicIndicatorError';
  error: UpdateDemographicIndicatorErrorInterface;
};

export type UpdateDemographicIndicatorErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateDemographicIndicatorInput = {
  basePopulation?: InputMaybe<Scalars['Int']['input']>;
  baseYear?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  populationPercentage?: InputMaybe<Scalars['Float']['input']>;
  year1Projection?: InputMaybe<Scalars['Int']['input']>;
  year2Projection?: InputMaybe<Scalars['Int']['input']>;
  year3Projection?: InputMaybe<Scalars['Int']['input']>;
  year4Projection?: InputMaybe<Scalars['Int']['input']>;
  year5Projection?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateDemographicIndicatorResponse =
  | DemographicIndicatorNode
  | UpdateDemographicIndicatorError;

export type UpdateDemographicProjectionError = {
  __typename: 'UpdateDemographicProjectionError';
  error: UpdateDemographicProjectionErrorInterface;
};

export type UpdateDemographicProjectionErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateDemographicProjectionInput = {
  baseYear?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['String']['input'];
  year1?: InputMaybe<Scalars['Float']['input']>;
  year2?: InputMaybe<Scalars['Float']['input']>;
  year3?: InputMaybe<Scalars['Float']['input']>;
  year4?: InputMaybe<Scalars['Float']['input']>;
  year5?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateDemographicProjectionResponse =
  | DemographicProjectionNode
  | UpdateDemographicProjectionError;

export type UpdateDisplaySettingsError = {
  __typename: 'UpdateDisplaySettingsError';
  error: Scalars['String']['output'];
};

export type UpdateDisplaySettingsResponse =
  | UpdateDisplaySettingsError
  | UpdateResult;

export type UpdateDonorInput = {
  applyToLines: ApplyToLinesInput;
  donorId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateEncounterInput = {
  /** Encounter document data */
  data: Scalars['JSON']['input'];
  /** The document id of the encounter document which should be updated */
  parent: Scalars['String']['input'];
  /** The schema id used for the encounter data */
  schemaId: Scalars['String']['input'];
  /** The encounter type */
  type: Scalars['String']['input'];
};

export type UpdateEncounterResponse = EncounterNode;

export type UpdateErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateInboundShipmentError = {
  __typename: 'UpdateInboundShipmentError';
  error: UpdateInboundShipmentErrorInterface;
};

export type UpdateInboundShipmentErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateInboundShipmentInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  currencyId?: InputMaybe<Scalars['String']['input']>;
  currencyRate?: InputMaybe<Scalars['Float']['input']>;
  defaultDonor?: InputMaybe<UpdateDonorInput>;
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  otherPartyId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UpdateInboundShipmentStatusInput>;
  tax?: InputMaybe<TaxInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInboundShipmentLineError = {
  __typename: 'UpdateInboundShipmentLineError';
  error: UpdateInboundShipmentLineErrorInterface;
};

export type UpdateInboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateInboundShipmentLineInput = {
  batch?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<NullableStringUpdate>;
  costPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  donorId?: InputMaybe<NullableStringUpdate>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  itemVariantId?: InputMaybe<NullableStringUpdate>;
  location?: InputMaybe<NullableStringUpdate>;
  numberOfPacks?: InputMaybe<Scalars['Float']['input']>;
  packSize?: InputMaybe<Scalars['Float']['input']>;
  sellPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  tax?: InputMaybe<TaxInput>;
  totalBeforeTax?: InputMaybe<Scalars['Float']['input']>;
  vvmStatusId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInboundShipmentLineResponse =
  | InvoiceLineNode
  | UpdateInboundShipmentLineError;

export type UpdateInboundShipmentLineResponseWithId = {
  __typename: 'UpdateInboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateInboundShipmentLineResponse;
};

export type UpdateInboundShipmentResponse =
  | InvoiceNode
  | UpdateInboundShipmentError;

export type UpdateInboundShipmentResponseWithId = {
  __typename: 'UpdateInboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateInboundShipmentResponse;
};

export type UpdateInboundShipmentServiceLineError = {
  __typename: 'UpdateInboundShipmentServiceLineError';
  error: UpdateInboundShipmentServiceLineErrorInterface;
};

export type UpdateInboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateInboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<TaxInput>;
  totalBeforeTax?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateInboundShipmentServiceLineResponse =
  | InvoiceLineNode
  | UpdateInboundShipmentServiceLineError;

export type UpdateInboundShipmentServiceLineResponseWithId = {
  __typename: 'UpdateInboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateInboundShipmentServiceLineResponse;
};

export enum UpdateInboundShipmentStatusInput {
  Delivered = 'DELIVERED',
  Received = 'RECEIVED',
  Verified = 'VERIFIED',
}

export type UpdateIndicatorValueError = {
  __typename: 'UpdateIndicatorValueError';
  error: UpdateIndicatorValueErrorInterface;
};

export type UpdateIndicatorValueErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateIndicatorValueInput = {
  id: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type UpdateIndicatorValueResponse =
  | IndicatorValueNode
  | UpdateIndicatorValueError;

export type UpdateInsuranceInput = {
  discountPercentage?: InputMaybe<Scalars['Float']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  insuranceProviderId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  policyType?: InputMaybe<InsurancePolicyNodeType>;
};

export type UpdateInsuranceResponse = IdResponse;

export type UpdateLabelPrinterSettingsError = {
  __typename: 'UpdateLabelPrinterSettingsError';
  error: Scalars['String']['output'];
};

export type UpdateLabelPrinterSettingsResponse =
  | LabelPrinterUpdateResult
  | UpdateLabelPrinterSettingsError;

export type UpdateLocationError = {
  __typename: 'UpdateLocationError';
  error: UpdateLocationErrorInterface;
};

export type UpdateLocationErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateLocationInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  coldStorageTypeId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateLocationResponse = LocationNode | UpdateLocationError;

export type UpdateNameErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateNamePropertiesError = {
  __typename: 'UpdateNamePropertiesError';
  error: UpdateNamePropertiesErrorInterface;
};

export type UpdateNamePropertiesErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateNamePropertiesInput = {
  id: Scalars['String']['input'];
  properties?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNamePropertiesResponse = NameNode | UpdateNamePropertiesError;

export type UpdateOutboundShipmentError = {
  __typename: 'UpdateOutboundShipmentError';
  error: UpdateErrorInterface;
};

export type UpdateOutboundShipmentInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  currencyId?: InputMaybe<Scalars['String']['input']>;
  currencyRate?: InputMaybe<Scalars['Float']['input']>;
  expectedDeliveryDate?: InputMaybe<NullableDateUpdate>;
  /** The new invoice id provided by the client */
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * When changing the status from DRAFT to CONFIRMED or FINALISED the total_number_of_packs for
   * existing invoice items gets updated.
   */
  status?: InputMaybe<UpdateOutboundShipmentStatusInput>;
  tax?: InputMaybe<TaxInput>;
  /** External invoice reference, e.g. purchase or shipment number */
  theirReference?: InputMaybe<Scalars['String']['input']>;
  transportReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOutboundShipmentLineError = {
  __typename: 'UpdateOutboundShipmentLineError';
  error: UpdateOutboundShipmentLineErrorInterface;
};

export type UpdateOutboundShipmentLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateOutboundShipmentLineInput = {
  id: Scalars['String']['input'];
  numberOfPacks?: InputMaybe<Scalars['Float']['input']>;
  prescribedQuantity?: InputMaybe<Scalars['Float']['input']>;
  stockLineId?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<TaxInput>;
};

export type UpdateOutboundShipmentLineResponse =
  | InvoiceLineNode
  | UpdateOutboundShipmentLineError;

export type UpdateOutboundShipmentLineResponseWithId = {
  __typename: 'UpdateOutboundShipmentLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateOutboundShipmentLineResponse;
};

export type UpdateOutboundShipmentNameError = {
  __typename: 'UpdateOutboundShipmentNameError';
  error: UpdateNameErrorInterface;
};

export type UpdateOutboundShipmentNameInput = {
  id: Scalars['String']['input'];
  otherPartyId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOutboundShipmentNameResponse =
  | InvoiceNode
  | UpdateOutboundShipmentNameError;

export type UpdateOutboundShipmentResponse =
  | InvoiceNode
  | NodeError
  | UpdateOutboundShipmentError;

export type UpdateOutboundShipmentResponseWithId = {
  __typename: 'UpdateOutboundShipmentResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateOutboundShipmentResponse;
};

export type UpdateOutboundShipmentServiceLineError = {
  __typename: 'UpdateOutboundShipmentServiceLineError';
  error: UpdateOutboundShipmentServiceLineErrorInterface;
};

export type UpdateOutboundShipmentServiceLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateOutboundShipmentServiceLineInput = {
  id: Scalars['String']['input'];
  itemId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<TaxInput>;
  totalBeforeTax?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateOutboundShipmentServiceLineResponse =
  | InvoiceLineNode
  | UpdateOutboundShipmentServiceLineError;

export type UpdateOutboundShipmentServiceLineResponseWithId = {
  __typename: 'UpdateOutboundShipmentServiceLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateOutboundShipmentServiceLineResponse;
};

export enum UpdateOutboundShipmentStatusInput {
  Allocated = 'ALLOCATED',
  Picked = 'PICKED',
  Shipped = 'SHIPPED',
}

export type UpdateOutboundShipmentUnallocatedLineError = {
  __typename: 'UpdateOutboundShipmentUnallocatedLineError';
  error: UpdateOutboundShipmentUnallocatedLineErrorInterface;
};

export type UpdateOutboundShipmentUnallocatedLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateOutboundShipmentUnallocatedLineInput = {
  id: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type UpdateOutboundShipmentUnallocatedLineResponse =
  | InvoiceLineNode
  | UpdateOutboundShipmentUnallocatedLineError;

export type UpdateOutboundShipmentUnallocatedLineResponseWithId = {
  __typename: 'UpdateOutboundShipmentUnallocatedLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateOutboundShipmentUnallocatedLineResponse;
};

/**
 * All fields in the input object will be used to update the patient record.
 * This means that the caller also has to provide the fields that are not going to change.
 * For example, if the last_name is not provided, the last_name in the patient record will be cleared.
 */
export type UpdatePatientInput = {
  address1?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  code2?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['NaiveDate']['input']>;
  dateOfDeath?: InputMaybe<Scalars['NaiveDate']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<GenderType>;
  id: Scalars['String']['input'];
  isDeceased?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  nextOfKinId?: InputMaybe<Scalars['String']['input']>;
  nextOfKinName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePatientResponse = PatientNode;

export type UpdatePluginDataInput = {
  data: Scalars['String']['input'];
  dataIdentifier: Scalars['String']['input'];
  id: Scalars['String']['input'];
  pluginCode: Scalars['String']['input'];
  relatedRecordId?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePluginDataResponse = PluginDataNode;

export type UpdatePrescriptionError = {
  __typename: 'UpdatePrescriptionError';
  error: UpdatePrescriptionErrorInterface;
};

export type UpdatePrescriptionErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdatePrescriptionInput = {
  clinicianId?: InputMaybe<NullableStringUpdate>;
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  diagnosisId?: InputMaybe<NullableStringUpdate>;
  id: Scalars['String']['input'];
  insuranceDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  insuranceDiscountPercentage?: InputMaybe<Scalars['Float']['input']>;
  nameInsuranceJoinId?: InputMaybe<NullableStringUpdate>;
  patientId?: InputMaybe<Scalars['String']['input']>;
  prescriptionDate?: InputMaybe<Scalars['DateTime']['input']>;
  programId?: InputMaybe<NullableStringUpdate>;
  status?: InputMaybe<UpdatePrescriptionStatusInput>;
  theirReference?: InputMaybe<NullableStringUpdate>;
};

export type UpdatePrescriptionLineError = {
  __typename: 'UpdatePrescriptionLineError';
  error: UpdatePrescriptionLineErrorInterface;
};

export type UpdatePrescriptionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdatePrescriptionLineInput = {
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  numberOfPacks?: InputMaybe<Scalars['Float']['input']>;
  stockLineId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePrescriptionLineResponse =
  | InvoiceLineNode
  | UpdatePrescriptionLineError;

export type UpdatePrescriptionLineResponseWithId = {
  __typename: 'UpdatePrescriptionLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdatePrescriptionLineResponse;
};

export type UpdatePrescriptionResponse =
  | InvoiceNode
  | NodeError
  | UpdatePrescriptionError;

export type UpdatePrescriptionResponseWithId = {
  __typename: 'UpdatePrescriptionResponseWithId';
  id: Scalars['String']['output'];
  response: UpdatePrescriptionResponse;
};

export enum UpdatePrescriptionStatusInput {
  Cancelled = 'CANCELLED',
  Picked = 'PICKED',
  Verified = 'VERIFIED',
}

export type UpdatePrinterInput = {
  address: Scalars['String']['input'];
  description: Scalars['String']['input'];
  id: Scalars['String']['input'];
  labelHeight: Scalars['Int']['input'];
  labelWidth: Scalars['Int']['input'];
  port: Scalars['Int']['input'];
};

export type UpdatePrinterResponse = PrinterNode;

export type UpdateProgramEnrolmentInput = {
  /** Program document data */
  data: Scalars['JSON']['input'];
  parent: Scalars['String']['input'];
  patientId: Scalars['String']['input'];
  /** The schema id used for the program data */
  schemaId: Scalars['String']['input'];
  /** The program type */
  type: Scalars['String']['input'];
};

export type UpdateProgramEnrolmentResponse = ProgramEnrolmentNode;

export type UpdateProgramPatientInput = {
  /** Patient document data */
  data: Scalars['JSON']['input'];
  parent: Scalars['String']['input'];
  /** The schema id used for the patient data */
  schemaId: Scalars['String']['input'];
};

export type UpdateProgramPatientResponse = PatientNode;

export type UpdateRequestRequisitionError = {
  __typename: 'UpdateRequestRequisitionError';
  error: UpdateRequestRequisitionErrorInterface;
};

export type UpdateRequestRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateRequestRequisitionInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  expectedDeliveryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  maxMonthsOfStock?: InputMaybe<Scalars['Float']['input']>;
  minMonthsOfStock?: InputMaybe<Scalars['Float']['input']>;
  otherPartyId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UpdateRequestRequisitionStatusInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRequestRequisitionLineError = {
  __typename: 'UpdateRequestRequisitionLineError';
  error: UpdateRequestRequisitionLineErrorInterface;
};

export type UpdateRequestRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateRequestRequisitionLineInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  optionId?: InputMaybe<Scalars['String']['input']>;
  requestedQuantity?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateRequestRequisitionLineResponse =
  | RequisitionLineNode
  | UpdateRequestRequisitionLineError;

export type UpdateRequestRequisitionLineResponseWithId = {
  __typename: 'UpdateRequestRequisitionLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateRequestRequisitionLineResponse;
};

export type UpdateRequestRequisitionResponse =
  | RequisitionNode
  | UpdateRequestRequisitionError;

export type UpdateRequestRequisitionResponseWithId = {
  __typename: 'UpdateRequestRequisitionResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateRequestRequisitionResponse;
};

export enum UpdateRequestRequisitionStatusInput {
  Sent = 'SENT',
}

export type UpdateResponseRequisitionError = {
  __typename: 'UpdateResponseRequisitionError';
  error: UpdateResponseRequisitionErrorInterface;
};

export type UpdateResponseRequisitionErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateResponseRequisitionInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  status?: InputMaybe<UpdateResponseRequisitionStatusInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateResponseRequisitionLineError = {
  __typename: 'UpdateResponseRequisitionLineError';
  error: UpdateResponseRequisitionLineErrorInterface;
};

export type UpdateResponseRequisitionLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateResponseRequisitionLineInput = {
  additionInUnits?: InputMaybe<Scalars['Float']['input']>;
  averageMonthlyConsumption?: InputMaybe<Scalars['Float']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  daysOutOfStock?: InputMaybe<Scalars['Float']['input']>;
  expiringUnits?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['String']['input'];
  incomingUnits?: InputMaybe<Scalars['Float']['input']>;
  initialStockOnHand?: InputMaybe<Scalars['Float']['input']>;
  lossInUnits?: InputMaybe<Scalars['Float']['input']>;
  optionId?: InputMaybe<Scalars['String']['input']>;
  outgoingUnits?: InputMaybe<Scalars['Float']['input']>;
  requestedQuantity?: InputMaybe<Scalars['Float']['input']>;
  stockOnHand?: InputMaybe<Scalars['Float']['input']>;
  supplyQuantity?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateResponseRequisitionLineResponse =
  | RequisitionLineNode
  | UpdateResponseRequisitionLineError;

export type UpdateResponseRequisitionResponse =
  | RequisitionNode
  | UpdateResponseRequisitionError;

export enum UpdateResponseRequisitionStatusInput {
  Finalised = 'FINALISED',
}

export type UpdateResult = {
  __typename: 'UpdateResult';
  logo?: Maybe<Scalars['String']['output']>;
  theme?: Maybe<Scalars['String']['output']>;
};

export type UpdateReturnOtherPartyErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateRnRFormInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  lines: Array<UpdateRnRFormLineInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRnRFormLineInput = {
  adjustedQuantityConsumed: Scalars['Float']['input'];
  adjustments?: InputMaybe<Scalars['Float']['input']>;
  averageMonthlyConsumption: Scalars['Float']['input'];
  calculatedRequestedQuantity: Scalars['Float']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  confirmed: Scalars['Boolean']['input'];
  enteredRequestedQuantity?: InputMaybe<Scalars['Float']['input']>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  finalBalance: Scalars['Float']['input'];
  id: Scalars['String']['input'];
  initialBalance: Scalars['Float']['input'];
  losses?: InputMaybe<Scalars['Float']['input']>;
  lowStock: LowStockStatus;
  maximumQuantity: Scalars['Float']['input'];
  minimumQuantity: Scalars['Float']['input'];
  quantityConsumed?: InputMaybe<Scalars['Float']['input']>;
  quantityReceived?: InputMaybe<Scalars['Float']['input']>;
  stockOutDuration: Scalars['Int']['input'];
};

export type UpdateRnRFormResponse = RnRFormNode;

export type UpdateSensorError = {
  __typename: 'UpdateSensorError';
  error: UpdateSensorErrorInterface;
};

export type UpdateSensorErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateSensorInput = {
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationId?: InputMaybe<NullableStringUpdate>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSensorResponse = SensorNode | UpdateSensorError;

export type UpdateStockLineError = {
  __typename: 'UpdateStockLineError';
  error: UpdateStockLineErrorInterface;
};

export type UpdateStockLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateStockLineInput = {
  /** Empty barcode will unlink barcode from StockLine */
  barcode?: InputMaybe<Scalars['String']['input']>;
  batch?: InputMaybe<Scalars['String']['input']>;
  campaignId?: InputMaybe<NullableStringUpdate>;
  costPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  donorId?: InputMaybe<NullableStringUpdate>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  itemVariantId?: InputMaybe<NullableStringUpdate>;
  location?: InputMaybe<NullableStringUpdate>;
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  sellPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  vvmStatusId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStockLineLineResponse = StockLineNode | UpdateStockLineError;

export type UpdateStocktakeError = {
  __typename: 'UpdateStocktakeError';
  error: UpdateStocktakeErrorInterface;
};

export type UpdateStocktakeErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateStocktakeInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  countedBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isLocked?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<UpdateStocktakeStatusInput>;
  stocktakeDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  verifiedBy?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStocktakeLineError = {
  __typename: 'UpdateStocktakeLineError';
  error: UpdateStocktakeLineErrorInterface;
};

export type UpdateStocktakeLineErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateStocktakeLineInput = {
  batch?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  costPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  countedNumberOfPacks?: InputMaybe<Scalars['Float']['input']>;
  donorId?: InputMaybe<NullableStringUpdate>;
  expiryDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  /** @deprecated Since 2.8.0. Use reason_option_id */
  inventoryAdjustmentReasonId?: InputMaybe<Scalars['String']['input']>;
  itemVariantId?: InputMaybe<NullableStringUpdate>;
  location?: InputMaybe<NullableStringUpdate>;
  note?: InputMaybe<Scalars['String']['input']>;
  packSize?: InputMaybe<Scalars['Float']['input']>;
  reasonOptionId?: InputMaybe<Scalars['String']['input']>;
  sellPricePerPack?: InputMaybe<Scalars['Float']['input']>;
  snapshotNumberOfPacks?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateStocktakeLineResponse =
  | StocktakeLineNode
  | UpdateStocktakeLineError;

export type UpdateStocktakeLineResponseWithId = {
  __typename: 'UpdateStocktakeLineResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateStocktakeLineResponse;
};

export type UpdateStocktakeResponse = StocktakeNode | UpdateStocktakeError;

export type UpdateStocktakeResponseWithId = {
  __typename: 'UpdateStocktakeResponseWithId';
  id: Scalars['String']['output'];
  response: UpdateStocktakeResponse;
};

export enum UpdateStocktakeStatusInput {
  Finalised = 'FINALISED',
}

export type UpdateSupplierReturnInput = {
  colour?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  onHold?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<UpdateSupplierReturnStatusInput>;
  theirReference?: InputMaybe<Scalars['String']['input']>;
  transportReference?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSupplierReturnLinesInput = {
  supplierReturnId: Scalars['String']['input'];
  supplierReturnLines: Array<SupplierReturnLineInput>;
};

export type UpdateSupplierReturnLinesResponse = InvoiceNode;

export type UpdateSupplierReturnOtherPartyError = {
  __typename: 'UpdateSupplierReturnOtherPartyError';
  error: UpdateReturnOtherPartyErrorInterface;
};

export type UpdateSupplierReturnOtherPartyInput = {
  id: Scalars['String']['input'];
  otherPartyId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSupplierReturnOtherPartyResponse =
  | InvoiceNode
  | UpdateSupplierReturnOtherPartyError;

export type UpdateSupplierReturnResponse = InvoiceNode;

export enum UpdateSupplierReturnStatusInput {
  Picked = 'PICKED',
  Shipped = 'SHIPPED',
}

export type UpdateSyncSettingsResponse = SyncErrorNode | SyncSettingsNode;

export type UpdateTemperatureBreachInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  unacknowledged: Scalars['Boolean']['input'];
};

export type UpdateTemperatureBreachResponse = TemperatureBreachNode;

export type UpdateUserError = {
  __typename: 'UpdateUserError';
  error: UpdateUserErrorInterface;
};

export type UpdateUserErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateUserNode = {
  __typename: 'UpdateUserNode';
  lastSuccessfulSync?: Maybe<Scalars['DateTime']['output']>;
};

export type UpdateUserResponse = UpdateUserError | UpdateUserNode;

export type UpdateVvmStatusLogInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type UpdateVvmStatusResponse = IdResponse;

export type UpdateVaccinationError = {
  __typename: 'UpdateVaccinationError';
  error: UpdateVaccinationErrorInterface;
};

export type UpdateVaccinationErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateVaccinationInput = {
  clinicianId?: InputMaybe<NullableStringUpdate>;
  comment?: InputMaybe<Scalars['String']['input']>;
  facilityFreeText?: InputMaybe<NullableStringUpdate>;
  facilityNameId?: InputMaybe<NullableStringUpdate>;
  given?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  itemId?: InputMaybe<NullableStringUpdate>;
  notGivenReason?: InputMaybe<Scalars['String']['input']>;
  stockLineId?: InputMaybe<NullableStringUpdate>;
  updateTransactions?: InputMaybe<Scalars['Boolean']['input']>;
  vaccinationDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type UpdateVaccinationResponse =
  | UpdateVaccinationError
  | VaccinationNode;

export type UpdateVaccineCourseError = {
  __typename: 'UpdateVaccineCourseError';
  error: UpdateVaccineCourseErrorInterface;
};

export type UpdateVaccineCourseErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpdateVaccineCourseInput = {
  coverageRate: Scalars['Float']['input'];
  demographicId?: InputMaybe<Scalars['String']['input']>;
  doses: Array<UpsertVaccineCourseDoseInput>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  useInGapsCalculations: Scalars['Boolean']['input'];
  vaccineItems: Array<UpsertVaccineCourseItemInput>;
  wastageRate: Scalars['Float']['input'];
};

export type UpdateVaccineCourseResponse =
  | UpdateVaccineCourseError
  | VaccineCourseNode;

export type UploadedPluginError = {
  __typename: 'UploadedPluginError';
  error: UploadedPluginErrorVariant;
};

export enum UploadedPluginErrorVariant {
  CannotParseFile = 'CANNOT_PARSE_FILE',
}

export type UploadedPluginInfoResponse = PluginInfoNode | UploadedPluginError;

export type UpsertBundledItemError = {
  __typename: 'UpsertBundledItemError';
  error: UpsertBundledItemErrorInterface;
};

export type UpsertBundledItemErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpsertBundledItemInput = {
  bundledItemVariantId: Scalars['String']['input'];
  id: Scalars['String']['input'];
  principalItemVariantId: Scalars['String']['input'];
  ratio: Scalars['Float']['input'];
};

export type UpsertBundledItemResponse =
  | BundledItemNode
  | UpsertBundledItemError;

export type UpsertCampaignError = {
  __typename: 'UpsertCampaignError';
  error: UpsertCampaignErrorInterface;
};

export type UpsertCampaignErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpsertCampaignInput = {
  endDate?: InputMaybe<Scalars['NaiveDate']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startDate?: InputMaybe<Scalars['NaiveDate']['input']>;
};

export type UpsertCampaignResponse = CampaignNode | UpsertCampaignError;

export type UpsertItemVariantError = {
  __typename: 'UpsertItemVariantError';
  error: UpsertItemVariantErrorInterface;
};

export type UpsertItemVariantErrorInterface = {
  description: Scalars['String']['output'];
};

export type UpsertItemVariantInput = {
  coldStorageTypeId?: InputMaybe<NullableStringUpdate>;
  dosesPerUnit: Scalars['Int']['input'];
  id: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  manufacturerId?: InputMaybe<NullableStringUpdate>;
  name: Scalars['String']['input'];
  packagingVariants: Array<PackagingVariantInput>;
  vvmType?: InputMaybe<NullableStringUpdate>;
};

export type UpsertLogLevelInput = {
  level: LogLevelEnum;
};

export type UpsertLogLevelResponse = {
  __typename: 'UpsertLogLevelResponse';
  level: LogLevelEnum;
};

export type UpsertPackVariantResponse =
  | ItemVariantNode
  | UpsertItemVariantError;

export type UpsertPreferencesInput = {
  allowTrackingOfStockByDonor?: InputMaybe<Scalars['Boolean']['input']>;
  manageVaccinesInDoses?: InputMaybe<Array<BoolStorePrefInput>>;
  manageVvmStatusForStock?: InputMaybe<Array<BoolStorePrefInput>>;
  showContactTracing?: InputMaybe<Scalars['Boolean']['input']>;
  sortByVvmStatusThenExpiry?: InputMaybe<Array<BoolStorePrefInput>>;
  useSimplifiedMobileUi?: InputMaybe<Array<BoolStorePrefInput>>;
};

export type UpsertVaccineCourseDoseInput = {
  customAgeLabel?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  label: Scalars['String']['input'];
  maxAge: Scalars['Float']['input'];
  minAge: Scalars['Float']['input'];
  minIntervalDays: Scalars['Int']['input'];
};

export type UpsertVaccineCourseItemInput = {
  id: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
};

export type UseSuggestedQuantityError = {
  __typename: 'UseSuggestedQuantityError';
  error: UseSuggestedQuantityErrorInterface;
};

export type UseSuggestedQuantityErrorInterface = {
  description: Scalars['String']['output'];
};

export type UseSuggestedQuantityInput = {
  requestRequisitionId: Scalars['String']['input'];
};

export type UseSuggestedQuantityResponse =
  | RequisitionLineConnector
  | UseSuggestedQuantityError;

export type UserNode = {
  __typename: 'UserNode';
  defaultStore?: Maybe<UserStoreNode>;
  /** The user's email address */
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  jobTitle?: Maybe<Scalars['String']['output']>;
  language: LanguageType;
  lastName?: Maybe<Scalars['String']['output']>;
  permissions: UserStorePermissionConnector;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  stores: UserStoreConnector;
  /** Internal user id */
  userId: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserNodePermissionsArgs = {
  storeId?: InputMaybe<Scalars['String']['input']>;
};

export enum UserPermission {
  AssetCatalogueItemMutate = 'ASSET_CATALOGUE_ITEM_MUTATE',
  AssetMutate = 'ASSET_MUTATE',
  AssetMutateViaDataMatrix = 'ASSET_MUTATE_VIA_DATA_MATRIX',
  AssetQuery = 'ASSET_QUERY',
  ColdChainApi = 'COLD_CHAIN_API',
  CreateRepack = 'CREATE_REPACK',
  CustomerReturnMutate = 'CUSTOMER_RETURN_MUTATE',
  CustomerReturnQuery = 'CUSTOMER_RETURN_QUERY',
  DocumentMutate = 'DOCUMENT_MUTATE',
  DocumentQuery = 'DOCUMENT_QUERY',
  EditCentralData = 'EDIT_CENTRAL_DATA',
  InboundShipmentMutate = 'INBOUND_SHIPMENT_MUTATE',
  InboundShipmentQuery = 'INBOUND_SHIPMENT_QUERY',
  InventoryAdjustmentMutate = 'INVENTORY_ADJUSTMENT_MUTATE',
  ItemMutate = 'ITEM_MUTATE',
  ItemNamesCodesAndUnitsMutate = 'ITEM_NAMES_CODES_AND_UNITS_MUTATE',
  LocationMutate = 'LOCATION_MUTATE',
  LogQuery = 'LOG_QUERY',
  NamePropertiesMutate = 'NAME_PROPERTIES_MUTATE',
  OutboundShipmentMutate = 'OUTBOUND_SHIPMENT_MUTATE',
  OutboundShipmentQuery = 'OUTBOUND_SHIPMENT_QUERY',
  PatientMutate = 'PATIENT_MUTATE',
  PatientQuery = 'PATIENT_QUERY',
  PrescriptionMutate = 'PRESCRIPTION_MUTATE',
  PrescriptionQuery = 'PRESCRIPTION_QUERY',
  Report = 'REPORT',
  RequisitionCreateOutboundShipment = 'REQUISITION_CREATE_OUTBOUND_SHIPMENT',
  RequisitionMutate = 'REQUISITION_MUTATE',
  RequisitionQuery = 'REQUISITION_QUERY',
  RequisitionSend = 'REQUISITION_SEND',
  RnRFormMutate = 'RN_R_FORM_MUTATE',
  RnRFormQuery = 'RN_R_FORM_QUERY',
  SensorMutate = 'SENSOR_MUTATE',
  SensorQuery = 'SENSOR_QUERY',
  ServerAdmin = 'SERVER_ADMIN',
  StocktakeMutate = 'STOCKTAKE_MUTATE',
  StocktakeQuery = 'STOCKTAKE_QUERY',
  StockLineMutate = 'STOCK_LINE_MUTATE',
  StockLineQuery = 'STOCK_LINE_QUERY',
  StoreAccess = 'STORE_ACCESS',
  SupplierReturnMutate = 'SUPPLIER_RETURN_MUTATE',
  SupplierReturnQuery = 'SUPPLIER_RETURN_QUERY',
  TemperatureBreachQuery = 'TEMPERATURE_BREACH_QUERY',
  TemperatureLogQuery = 'TEMPERATURE_LOG_QUERY',
  ViewAndEditVvmStatus = 'VIEW_AND_EDIT_VVM_STATUS',
}

export type UserResponse = UserNode;

export type UserStoreConnector = {
  __typename: 'UserStoreConnector';
  nodes: Array<UserStoreNode>;
  totalCount: Scalars['Int']['output'];
};

export type UserStoreNode = {
  __typename: 'UserStoreNode';
  code: Scalars['String']['output'];
  createdDate?: Maybe<Scalars['NaiveDate']['output']>;
  homeCurrencyCode?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isDisabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  nameId: Scalars['String']['output'];
  preferences: StorePreferenceNode;
  storeMode: StoreModeNodeType;
};

export type UserStorePermissionConnector = {
  __typename: 'UserStorePermissionConnector';
  nodes: Array<UserStorePermissionNode>;
  totalCount: Scalars['Int']['output'];
};

export type UserStorePermissionNode = {
  __typename: 'UserStorePermissionNode';
  context: Array<Scalars['String']['output']>;
  permissions: Array<UserPermission>;
  storeId: Scalars['String']['output'];
};

export type VaccinationCardItemNode = {
  __typename: 'VaccinationCardItemNode';
  batch?: Maybe<Scalars['String']['output']>;
  customAgeLabel?: Maybe<Scalars['String']['output']>;
  facilityName?: Maybe<Scalars['String']['output']>;
  given?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  maxAgeMonths: Scalars['Float']['output'];
  minAgeMonths: Scalars['Float']['output'];
  minIntervalDays: Scalars['Int']['output'];
  status?: Maybe<VaccinationCardItemNodeStatus>;
  stockLine?: Maybe<StockLineNode>;
  suggestedDate?: Maybe<Scalars['NaiveDate']['output']>;
  vaccinationDate?: Maybe<Scalars['NaiveDate']['output']>;
  vaccinationId?: Maybe<Scalars['String']['output']>;
  vaccineCourseDoseId: Scalars['String']['output'];
  vaccineCourseId: Scalars['String']['output'];
};

export type VaccinationCardItemNodeFacilityNameArgs = {
  storeId: Scalars['String']['input'];
};

export enum VaccinationCardItemNodeStatus {
  Given = 'GIVEN',
  Late = 'LATE',
  NotGiven = 'NOT_GIVEN',
  Pending = 'PENDING',
}

export type VaccinationCardNode = {
  __typename: 'VaccinationCardNode';
  enrolmentStoreId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<VaccinationCardItemNode>;
  patientFirstName?: Maybe<Scalars['String']['output']>;
  patientLastName?: Maybe<Scalars['String']['output']>;
  programName: Scalars['String']['output'];
};

export type VaccinationCardResponse = NodeError | VaccinationCardNode;

export type VaccinationNode = {
  __typename: 'VaccinationNode';
  clinician?: Maybe<ClinicianNode>;
  clinicianId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  facilityFreeText?: Maybe<Scalars['String']['output']>;
  facilityName?: Maybe<Scalars['String']['output']>;
  facilityNameId?: Maybe<Scalars['String']['output']>;
  given: Scalars['Boolean']['output'];
  givenStoreId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  invoice?: Maybe<InvoiceNode>;
  invoiceId?: Maybe<Scalars['String']['output']>;
  item?: Maybe<ItemNode>;
  notGivenReason?: Maybe<Scalars['String']['output']>;
  stockLine?: Maybe<StockLineNode>;
  vaccinationDate: Scalars['NaiveDate']['output'];
};

export type VaccineCourseConnector = {
  __typename: 'VaccineCourseConnector';
  nodes: Array<VaccineCourseNode>;
  totalCount: Scalars['Int']['output'];
};

export type VaccineCourseDoseNode = {
  __typename: 'VaccineCourseDoseNode';
  customAgeLabel?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  maxAgeMonths: Scalars['Float']['output'];
  minAgeMonths: Scalars['Float']['output'];
  minIntervalDays: Scalars['Int']['output'];
  /** Will return deleted vaccine courses as well, to support display of existing vaccinations. */
  vaccineCourse: VaccineCourseNode;
};

export type VaccineCourseDoseResponse = NodeError | VaccineCourseDoseNode;

export type VaccineCourseFilterInput = {
  id?: InputMaybe<EqualFilterStringInput>;
  name?: InputMaybe<StringFilterInput>;
  programId?: InputMaybe<EqualFilterStringInput>;
};

export type VaccineCourseItemNode = {
  __typename: 'VaccineCourseItemNode';
  id: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type VaccineCourseMutations = {
  __typename: 'VaccineCourseMutations';
  deleteVaccineCourse: DeleteVaccineCourseResponse;
  insertVaccineCourse: InsertVaccineCourseResponse;
  updateVaccineCourse: UpdateVaccineCourseResponse;
};

export type VaccineCourseMutationsDeleteVaccineCourseArgs = {
  vaccineCourseId: Scalars['String']['input'];
};

export type VaccineCourseMutationsInsertVaccineCourseArgs = {
  input: InsertVaccineCourseInput;
  storeId: Scalars['String']['input'];
};

export type VaccineCourseMutationsUpdateVaccineCourseArgs = {
  input: UpdateVaccineCourseInput;
  storeId: Scalars['String']['input'];
};

export type VaccineCourseNode = {
  __typename: 'VaccineCourseNode';
  coverageRate: Scalars['Float']['output'];
  demographic?: Maybe<DemographicNode>;
  demographicId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  programId: Scalars['String']['output'];
  useInGapsCalculations: Scalars['Boolean']['output'];
  vaccineCourseDoses?: Maybe<Array<VaccineCourseDoseNode>>;
  vaccineCourseItems?: Maybe<Array<VaccineCourseItemNode>>;
  wastageRate: Scalars['Float']['output'];
};

export type VaccineCourseResponse = NodeError | VaccineCourseNode;

export enum VaccineCourseSortFieldInput {
  Name = 'name',
}

export type VaccineCourseSortInput = {
  desc?: InputMaybe<Scalars['Boolean']['input']>;
  key: VaccineCourseSortFieldInput;
};

export type VaccineCoursesResponse = VaccineCourseConnector;

export type ValueTypeNotCorrect = UpdateIndicatorValueErrorInterface & {
  __typename: 'ValueTypeNotCorrect';
  description: Scalars['String']['output'];
};

export enum VenCategoryType {
  E = 'E',
  N = 'N',
  NotAssigned = 'NOT_ASSIGNED',
  V = 'V',
}

export type VvmstatusConnector = {
  __typename: 'VvmstatusConnector';
  nodes: Array<VvmstatusNode>;
};

export type VvmstatusLogConnector = {
  __typename: 'VvmstatusLogConnector';
  nodes: Array<VvmstatusLogNode>;
};

export type VvmstatusLogNode = {
  __typename: 'VvmstatusLogNode';
  comment?: Maybe<Scalars['String']['output']>;
  createdDatetime: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  invoiceLineId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<VvmstatusNode>;
  stockLine?: Maybe<StockLineNode>;
  user?: Maybe<UserNode>;
};

export type VvmstatusLogResponse = VvmstatusLogConnector;

export type VvmstatusNode = {
  __typename: 'VvmstatusNode';
  code: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  reasonId?: Maybe<Scalars['String']['output']>;
  unusable: Scalars['Boolean']['output'];
};

export type VvmstatusesResponse = VvmstatusConnector;

export type WarningNode = {
  __typename: 'WarningNode';
  code: Scalars['String']['output'];
  id: Scalars['String']['output'];
  itemId: Scalars['String']['output'];
  priority: Scalars['Boolean']['output'];
  warningId: Scalars['String']['output'];
  warningText: Scalars['String']['output'];
};
