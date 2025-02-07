import React, { useEffect, useState } from 'react';
import {
  Grid,
  BasicTextInput,
  useTranslation,
  NumericTextInput,
  Box,
  Typography,
  useFormatNumber,
  useDebounceCallback,
  InputLabel,
  useDebouncedValueCallback,
  TableProvider,
  createTableStore,
  createQueryParamsStore,
  InlineSpinner,
  TypedTFunction,
  LocaleKey,
  NumUtils,
  ItemNode,
  useAuthContext,
  DropdownMenu,
  DropdownMenuItem,
  TextArea,
  InputWithLabelRow,
} from '@openmsupply-client/common';
import {
  StockItemSearchInput,
  ItemRowFragment,
} from '@openmsupply-client/system';
import { usePrescription } from '../api';
import { PackSizeController } from '../../StockOut';
import {
  StockOutAlert,
  StockOutAlerts,
  getAllocationAlerts,
} from '../../StockOut';
import { DraftStockOutLine } from '../../types';
import { isA } from '../../utils';
import { AccordionPanelSection } from './PanelSection';
import { PrescriptionLineEditTable } from './PrescriptionLineEditTable';
import { getPrescriptionDirections } from './getPrescriptionDirections';
import { useAbbreviations } from '../api/hooks/useAbbreviations';

interface PrescriptionLineEditFormProps {
  allocatedUnits: number;
  availableUnits: number;
  item: ItemRowFragment | null;
  onChangeItem: (newItem: ItemRowFragment | null) => void;
  onChangeQuantity: (
    quantity: number,
    packSize: number | null,
    isAutoAllocated: boolean,
    prescribedQuantity: number | null
  ) => DraftStockOutLine[] | undefined;
  packSizeController: PackSizeController;
  disabled: boolean;
  isNew: boolean;
  canAutoAllocate: boolean;
  isAutoAllocated: boolean;
  updateNotes: (note: string) => void;
  draftPrescriptionLines: DraftStockOutLine[];
  showZeroQuantityConfirmation: boolean;
  hasOnHold: boolean;
  hasExpired: boolean;
  isLoading: boolean;
  updateQuantity: (batchId: string, updateQuantity: number) => void;
  programId?: string;
}

export const PrescriptionLineEditForm: React.FC<
  PrescriptionLineEditFormProps
> = ({
  allocatedUnits,
  onChangeItem,
  onChangeQuantity,
  item,
  packSizeController,
  disabled,
  isNew,
  canAutoAllocate,
  updateNotes,
  draftPrescriptionLines,
  showZeroQuantityConfirmation,
  isAutoAllocated,
  hasOnHold,
  hasExpired,
  isLoading,
  updateQuantity,
  programId,
}) => {
  const t = useTranslation();
  const { format } = useFormatNumber();
  const { rows: items } = usePrescription();
  const { store: { preferences } = {} } = useAuthContext();

  const [issueUnitQuantity, setIssueUnitQuantity] = useState(0);
  const [prescribedQuantity, setPrescribedQuantity] = useState<number | null>(
    null
  );
  const [allocationAlerts, setAllocationAlerts] = useState<StockOutAlert[]>([]);
  const [defaultDirection, setDefaultDirection] = useState<string>();
  const [abbreviation, setAbbreviation] = useState<string>('');

  const debouncedSetAllocationAlerts = useDebounceCallback(
    warning => setAllocationAlerts(warning),
    []
  );

  const allocate = (
    numPacks: number,
    packSize: number,
    prescribedQuantity: number
  ) => {
    const newAllocateQuantities = onChangeQuantity(
      numPacks,
      packSize === -1 || packSize === 1 ? null : packSize,
      true,
      prescribedQuantity
    );
    const placeholderLine = newAllocateQuantities?.find(isA.placeholderLine);
    const allocatedQuantity =
      newAllocateQuantities?.reduce(
        (acc, { numberOfPacks, packSize }) => acc + numberOfPacks * packSize,
        0
      ) ?? 0;
    const allocateInUnits = packSize === null;
    const messageKey = allocateInUnits
      ? 'warning.cannot-create-placeholder-units'
      : 'warning.cannot-create-placeholder-packs';
    const hasRequestedOverAvailable =
      numPacks > allocatedQuantity && newAllocateQuantities !== undefined;
    const alerts = getAllocationAlerts(
      numPacks * (packSize === -1 ? 1 : packSize),
      // suppress the allocation warning if the user has requested more than the available amount of stock
      hasRequestedOverAvailable ? 0 : allocatedQuantity,
      placeholderLine?.numberOfPacks ?? 0,
      hasOnHold,
      hasExpired,
      format,
      t
    );
    if (hasRequestedOverAvailable) {
      alerts.push({
        message: t(messageKey, {
          allocatedQuantity: format(allocatedQuantity),
          requestedQuantity: format(numPacks),
        }),
        severity: 'warning',
      });
    }
    if (NumUtils.round(numPacks) !== numPacks) {
      const nearestAbove = Math.ceil(numPacks) * packSize;
      alerts.push({
        message: t('messages.partial-pack-warning', { nearestAbove }),
        severity: 'warning',
      });
    }
    debouncedSetAllocationAlerts(alerts);
    setIssueUnitQuantity(allocatedQuantity);
  };

  // using a debounced value for the allocation. In the scenario where
  // you have only pack sizes > 1 available, and try to type a quantity which starts with 1
  // e.g. 10, 12, 100.. then the allocation rounds the 1 up immediately to the available
  // pack size which stops you entering the required quantity.
  // See https://github.com/msupply-foundation/open-msupply/issues/2727
  // and https://github.com/msupply-foundation/open-msupply/issues/3532
  const debouncedAllocate = useDebouncedValueCallback(
    (numPacks, packSize, prescribedQuantity) => {
      allocate(numPacks, packSize, prescribedQuantity);
    },
    [],
    500,
    [draftPrescriptionLines] // this is needed to prevent a captured enclosure of onChangeQuantity
  );

  const handleIssueQuantityChange = (
    inputUnitQuantity?: number,
    quantityType: 'issue' | 'prescribed' = 'issue'
  ) => {
    // this method is also called onBlur... check that there actually has been a
    // change in quantity (to prevent triggering auto allocation if only focus
    // has moved)
    if (inputUnitQuantity === issueUnitQuantity) return;

    const quantity = inputUnitQuantity === undefined ? 0 : inputUnitQuantity;
    setIssueUnitQuantity(quantity);

    const packSize =
      packSizeController.selected?.value !== -1
        ? (packSizeController.selected?.value ?? 1)
        : 1;

    const numPacks = quantity / packSize;
    debouncedAllocate(
      numPacks,
      Number(packSize),
      quantityType === 'prescribed' ? inputUnitQuantity : prescribedQuantity
    );
  };

  const handlePrescribedQuantityChange = (inputPrescribedQuantity?: number) => {
    if (inputPrescribedQuantity == null) return;
    setPrescribedQuantity(inputPrescribedQuantity);
    handleIssueQuantityChange(inputPrescribedQuantity, 'prescribed');
  };

  const prescriptionLineWithNote = draftPrescriptionLines.find(l => !!l.note);
  const note = prescriptionLineWithNote?.note ?? '';

  useEffect(() => {
    const selectedItem = items.find(
      prescriptionItem => prescriptionItem.id === item?.id
    );
    if (preferences?.editPrescribedQuantityOnPrescription) {
      const newPrescribedQuantity: number =
        selectedItem?.lines?.find(
          ({ prescribedQuantity }) =>
            prescribedQuantity != null && prescribedQuantity > 0
        )?.prescribedQuantity ?? 0;

      setPrescribedQuantity(newPrescribedQuantity);
    }

    const newIssueQuantity = Math.round(
      allocatedUnits / Math.abs(Number(packSizeController.selected?.value || 1))
    );
    if (newIssueQuantity !== issueUnitQuantity)
      setIssueUnitQuantity(newIssueQuantity);
    setAllocationAlerts([]);
  }, [item?.id]);

  useEffect(() => {
    if (!isAutoAllocated) setIssueUnitQuantity(allocatedUnits);
  }, [packSizeController.selected?.value, allocatedUnits]);

  const key = item?.id ?? 'new';

  // //MOCK DATA FOR TESTING ABBREVIATIONS

  const defaultDirections = [
    { id: '1', item_link_id: 'a', direction: '1 per day', priority: 2 },
    { id: '2', item_link_id: 'b', direction: '2 per day', priority: 3 },
    { id: '3', item_link_id: 'c', direction: '3 per day', priority: 1 },
  ];

  // //END OF MOCK DATA

  const { data: options = [] } = useAbbreviations();

  const saveAbbreviation = () => {
    if (!abbreviation) return;

    const note = getPrescriptionDirections(abbreviation, options);
    updateNotes(note);
  };

  return (
    <Grid
      container
      gap="4px"
      sx={{ minHeight: 200, display: 'flex', flexDirection: 'column' }}
    >
      <AccordionPanelSection
        // Key ensures component will reload when switching item, but not when
        // making other changes within item (e.g. quantity)
        key={key + '_item_search'}
        title={t('label.item', { count: 1 })}
        closedSummary={item?.name}
        defaultExpanded={isNew && !disabled}
      >
        <Grid flex={1}>
          <StockItemSearchInput
            autoFocus={!item}
            openOnFocus={!item}
            disabled={!isNew || disabled}
            currentItemId={item?.id}
            onChange={onChangeItem}
            includeNonVisibleWithStockOnHand
            extraFilter={
              disabled
                ? undefined
                : item => !items?.some(({ id }) => id === item.id)
            }
            programId={programId}
          />
        </Grid>
      </AccordionPanelSection>
      {item && (
        <>
          {!disabled && (
            <StockOutAlerts
              allocationAlerts={allocationAlerts}
              showZeroQuantityConfirmation={showZeroQuantityConfirmation}
              isAutoAllocated={isAutoAllocated}
            />
          )}
          <AccordionPanelSection
            title={t('label.quantity')}
            closedSummary={summarise(draftPrescriptionLines, t)}
            defaultExpanded={isNew && !disabled}
            key={key + '_quantity'}
          >
            <Grid
              container
              alignItems="center"
              display="flex"
              flexDirection="row"
              gap={5}
            >
              {preferences?.editPrescribedQuantityOnPrescription && (
                <Grid display="flex" alignItems="center" gap={1}>
                  <InputLabel sx={{ fontSize: 12 }}>
                    {t('label.prescribed-quantity')}
                  </InputLabel>
                  <NumericTextInput
                    autoFocus={
                      preferences?.editPrescribedQuantityOnPrescription
                    }
                    disabled={disabled}
                    value={prescribedQuantity ?? undefined}
                    onChange={handlePrescribedQuantityChange}
                    min={0}
                    decimalLimit={2}
                    onBlur={() => {}}
                  />
                </Grid>
              )}
              <Grid display="flex" alignItems="center" gap={1}>
                <InputLabel sx={{ fontSize: 12 }}>
                  {t('label.issue')}
                </InputLabel>
                <NumericTextInput
                  autoFocus={!preferences?.editPrescribedQuantityOnPrescription}
                  disabled={disabled}
                  value={issueUnitQuantity}
                  onChange={handleIssueQuantityChange}
                  min={0}
                  decimalLimit={2}
                />
                <InputLabel sx={{ fontSize: 12 }}>
                  {t('label.unit-plural_one', {
                    // unit-plural_one has been specified to deactivate pluralisation.
                    // This is to handle the case where units have not been entered for the item.
                    // see https://github.com/msupply-foundation/open-msupply/issues/5978
                    count: issueUnitQuantity,
                    unit: item?.unitName,
                  })}
                </InputLabel>
              </Grid>
            </Grid>
            <TableWrapper
              canAutoAllocate={canAutoAllocate}
              currentItem={item}
              isLoading={isLoading}
              packSizeController={packSizeController}
              updateQuantity={updateQuantity}
              draftPrescriptionLines={draftPrescriptionLines}
              allocatedUnits={allocatedUnits}
              isDisabled={disabled}
            />
          </AccordionPanelSection>
        </>
      )}
      {item && (
        <AccordionPanelSection
          title={t('label.directions')}
          closedSummary={note}
          defaultExpanded={(isNew || !note) && !disabled}
          key={item?.id ?? 'new'}
        >
          <Grid container paddingBottom={1} gap={1} width={'100%'}>
            <InputWithLabelRow
              label={t('label.abbreviation')}
              Input={
                <BasicTextInput
                  value={abbreviation}
                  disabled={disabled}
                  onChange={e => {
                    setAbbreviation(e.target.value);
                    setDefaultDirection('');
                  }}
                  onBlur={saveAbbreviation}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      saveAbbreviation();
                    }
                  }}
                  style={{ flex: 1 }}
                />
              }
            />
            <DropdownMenu
              sx={{ flex: 1 }}
              selectSx={{ width: '100%' }}
              label={
                defaultDirection
                  ? defaultDirection
                  : t('placeholder.item-directions')
              }
              disabled={disabled}
            >
              {defaultDirections
                .sort((a, b) => a.priority - b.priority)
                .map(
                  direction =>
                    direction && (
                      <DropdownMenuItem
                        key={direction.id}
                        value={direction.direction}
                        onClick={() => {
                          updateNotes(direction.direction);
                          setDefaultDirection(direction.direction);
                          setAbbreviation('');
                        }}
                        sx={{ fontSize: 14 }}
                      >
                        {direction.direction}
                      </DropdownMenuItem>
                    )
                )}
            </DropdownMenu>
          </Grid>
          <Grid>
            <InputWithLabelRow
              label={t('label.directions')}
              Input={
                <TextArea
                  value={note}
                  disabled={disabled}
                  onChange={e => {
                    updateNotes(e.target.value);
                    setAbbreviation('');
                    setDefaultDirection('');
                  }}
                  style={{ flex: 1 }}
                />
              }
            />
          </Grid>
        </AccordionPanelSection>
      )}
      {/* {!item && <Box height={100} />} */}
    </Grid>
  );
};

interface TableProps {
  canAutoAllocate: boolean;
  currentItem: ItemRowFragment | null;
  isLoading: boolean;
  packSizeController: PackSizeController;
  updateQuantity: (batchId: string, updateQuantity: number) => void;
  draftPrescriptionLines: DraftStockOutLine[];
  allocatedUnits: number;
  isDisabled: boolean;
}

const TableWrapper: React.FC<TableProps> = ({
  canAutoAllocate,
  currentItem,
  isLoading,
  // packSizeController,
  updateQuantity,
  draftPrescriptionLines,
  allocatedUnits,
  isDisabled,
}) => {
  const t = useTranslation();

  if (!currentItem) return null;

  if (isLoading)
    return (
      <Box
        display="flex"
        flex={1}
        height={400}
        justifyContent="center"
        alignItems="center"
      >
        <InlineSpinner />
      </Box>
    );

  if (!canAutoAllocate)
    return (
      <Box sx={{ margin: 'auto' }}>
        <Typography>{t('messages.no-stock-available')}</Typography>
      </Box>
    );

  return (
    <>
      <TableProvider
        createStore={createTableStore}
        queryParamsStore={createQueryParamsStore({
          initialSortBy: { key: 'expiryDate' },
        })}
      >
        <PrescriptionLineEditTable
          // packSizeController={packSizeController}
          onChange={updateQuantity}
          rows={draftPrescriptionLines}
          item={currentItem}
          allocatedUnits={allocatedUnits}
          isDisabled={isDisabled}
        />
      </TableProvider>
    </>
  );
};

const summarise = (
  lines: DraftStockOutLine[],
  t: TypedTFunction<LocaleKey>
) => {
  // Count how many of each pack size
  const counts: Record<number, { unitName: string; count: number }> = {};
  lines.forEach(({ packSize, numberOfPacks, stockLine }) => {
    if (numberOfPacks === 0) return;
    if (counts[packSize]) {
      counts[packSize].count += packSize * numberOfPacks;
    } else {
      counts[packSize] = {
        unitName: (stockLine?.item as ItemNode)?.unitName ?? 'unit',
        count: NumUtils.round(packSize * numberOfPacks),
      };
    }
  });

  // Summarise counts in words
  const summary: string[] = [];
  Object.entries(counts).forEach(([size, { unitName, count }]) => {
    const unitWord = t('label.unit-plural', {
      count,
      unit: unitName,
    });
    if (Number(size) > 1) {
      const packs = NumUtils.round(count / Number(size), 3);
      summary.push(t('label.packs-of-size', { packs, count, size, unitWord }));
    } else {
      summary.push(t('label.packs-of-1', { count, unitWord }));
    }
  });

  return summary.join('\n');
};
