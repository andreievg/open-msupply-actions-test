import {
  InvoiceNodeStatus,
  FnUtils,
  InvoiceLineNodeType,
} from '@openmsupply-client/common';
import { DraftOutboundLine } from './../../../types';
import {
  createDraftOutboundLine,
  createPlaceholderRow,
} from './hooks/useDraftOutboundLines';
import { allocateQuantities } from './utils';

type TestLineParams = {
  id?: string;
  itemId?: string;
  packSize?: number;
  totalNumberOfPacks?: number;
  availableNumberOfPacks?: number;
  numberOfPacks?: number;
  onHold?: boolean;
  expiryDate?: string;
};

const createTestLine = ({
  itemId = FnUtils.generateUUID(),
  packSize = 1,
  totalNumberOfPacks = 1,
  availableNumberOfPacks = 1,
  numberOfPacks = 0,
  id = FnUtils.generateUUID(),
  onHold = false,
  expiryDate,
}: TestLineParams): DraftOutboundLine =>
  createDraftOutboundLine({
    invoiceId: '',
    invoiceLine: {
      id,
      totalAfterTax: 0,
      totalBeforeTax: 0,
      sellPricePerPack: 0,
      item: {
        id: itemId,
        code: '',
        name: '',
        unitName: '',
        __typename: 'ItemNode',
      },
      type: InvoiceLineNodeType.StockOut,
      packSize,
      invoiceId: '',
      __typename: 'InvoiceLineNode',
      numberOfPacks,
      expiryDate,
      stockLine: {
        __typename: 'StockLineNode',
        id: 'a',
        totalNumberOfPacks,
        availableNumberOfPacks,
        onHold,
        sellPricePerPack: 0,
        itemId,
        packSize,
      },
    },
  });

const getPlaceholder = (
  line?: Partial<DraftOutboundLine>
): DraftOutboundLine => ({
  ...createPlaceholderRow('', 'placeholder', 'placeholder'),
  ...line,
});

describe('allocateQuantities - standard behaviour.', () => {
  it('allocates quantity to a row', () => {
    const placeholder = getPlaceholder();
    const lineOne = createTestLine({
      availableNumberOfPacks: 10,
      totalNumberOfPacks: 10,
    });
    const draftOutboundLines = [lineOne, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const expected = [
      { ...lineOne, numberOfPacks: 3, isUpdated: true },
      placeholder,
    ];

    expect(allocate(3, 1)).toEqual(expected);
  });

  it('allocates quantity spread over multiple lines', () => {
    const one = createTestLine({ id: '1' });
    const two = createTestLine({ id: '2' });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, two, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const lineTwo = { ...two, isUpdated: true };
    lineTwo.numberOfPacks = 1;

    const expected = [lineOne, lineTwo, placeholder];
    const allocated = allocate(2, 1);

    expect(allocated).toEqual(expected);
  });
});

describe('Allocate quantities - placeholder row behaviour', () => {
  it('allocates excess quantity to the placeholder row when the status is new', () => {
    const one = createTestLine({ id: '1' });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const placeholderLine = { ...placeholder, numberOfPacks: 9 };

    const expected = [lineOne, placeholderLine];

    expect(allocate(10, 1)).toEqual(expected);
  });

  it('allocates quantity spread over multiple lines and placeholders when there is excess', () => {
    const one = createTestLine({ id: '1' });
    const two = createTestLine({ id: '2' });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, two, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const lineTwo = { ...two, isUpdated: true };
    lineTwo.numberOfPacks = 1;
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 1;

    const expected = [lineOne, lineTwo, placeholderLine];

    expect(allocate(3, 1)).toEqual(expected);
  });

  it('does not allocate excess quantity to the placeholder row when the status is not new', () => {
    const run = (status: InvoiceNodeStatus) => {
      const one = createTestLine({ id: '1' });
      const placeholder = getPlaceholder();

      const draftOutboundLines = [one, placeholder];
      const allocate = allocateQuantities(status, draftOutboundLines);

      const lineOne = { ...one, isUpdated: true };
      lineOne.numberOfPacks = 1;
      const placeholderLine = getPlaceholder();

      const expected = [lineOne, placeholderLine];
      return { allocate, expected };
    };

    const allocatedStatusTest = run(InvoiceNodeStatus.Allocated);
    expect(allocatedStatusTest.allocate(10, 1)).toEqual(
      allocatedStatusTest.expected
    );

    const pickedStatusTest = run(InvoiceNodeStatus.Picked);
    expect(pickedStatusTest.allocate(10, 1)).toEqual(pickedStatusTest.expected);

    const deliveredStatusTest = run(InvoiceNodeStatus.Delivered);
    expect(deliveredStatusTest.allocate(10, 1)).toEqual(
      deliveredStatusTest.expected
    );

    const verifiedStatusTest = run(InvoiceNodeStatus.Verified);
    expect(verifiedStatusTest.allocate(10, 1)).toEqual(
      verifiedStatusTest.expected
    );
  });
});

describe('Allocate quantities - differing pack size behaviour', () => {
  it('does not allocate any quantity to lines which are not of the pack size selected', () => {
    const one = createTestLine({ id: '1' });
    const two = createTestLine({ id: '2', packSize: 2 });
    const placeholder = getPlaceholder();

    const draftOutboundLines = [one, two, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const lineTwo = { ...two };
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 2;

    const expected = [lineOne, lineTwo, placeholderLine];

    expect(allocate(3, 1)).toEqual(expected);
  });

  it('after changing to a different pack size, all quantities allocated to the original pack size are removed.', () => {
    const one = createTestLine({ id: '1' });
    const two = createTestLine({ id: '2', packSize: 2 });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, two, placeholder];
    let allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const lineTwo = { ...two };
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 2;

    const expected = [lineOne, lineTwo, placeholderLine];

    expect(allocate(3, 1)).toEqual(expected);

    allocate = allocateQuantities(InvoiceNodeStatus.New, expected);
    const lineOneAfterChange = { ...one, isUpdated: true };
    const lineTwoAfterChange = { ...two, isUpdated: true };
    lineOneAfterChange.numberOfPacks = 0;
    lineTwoAfterChange.numberOfPacks = 1;
    const placeholderAfterChange = { ...placeholder };
    placeholderAfterChange.numberOfPacks = 4;
    const expectedAfterChange = [
      lineOneAfterChange,
      lineTwoAfterChange,
      placeholderAfterChange,
    ];

    expect(allocate(3, 2)).toEqual(expectedAfterChange);
  });
});

describe('Allocating quantities - behaviour when mixing placeholders and pack sizes greater than one', () => {
  it('issues any left over quantities to the placeholder at a pack size of 1 (the number of units) when issuing to pack sizes of one', () => {
    const one = createTestLine({ id: '1' });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 9;

    const expected = [lineOne, placeholderLine];

    expect(allocate(10, 1)).toEqual(expected);
  });
  it('issues any left over quantities to the placeholder at a pack size of 1 (the number of units) when issuing to non-one pack sizes', () => {
    const one = createTestLine({ id: '2', packSize: 2 });
    const placeholder = getPlaceholder();
    const draftOutboundLines = [one, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one, isUpdated: true };
    lineOne.numberOfPacks = 1;
    // The total number of units being allocated is 20. The line with a pack size of two has 1 pack available.
    // So, 18 units should be assigned to the placeholder - the 9 remaining packs * the pack size of two.
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 18;

    const expected = [lineOne, placeholderLine];

    expect(allocate(10, 2)).toEqual(expected);
  });
});

describe('Allocated quantities - expiry date behaviour', () => {
  const now = Date.now();
  const expiringFirstDate = new Date(now + 10000).toISOString();
  const expiringLastDate = new Date(now + 100000).toISOString();

  const expiringLastLine = createTestLine({
    id: '1',
    expiryDate: expiringLastDate,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
  });

  const expiringFirstLine = createTestLine({
    id: '2',
    expiryDate: expiringFirstDate,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
  });
  const placeholder = getPlaceholder();
  it('issues to lines with the earliest expiring invoice line', () => {
    const draftOutboundLines = [
      { ...expiringLastLine },
      { ...expiringFirstLine },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const expiringLast = { ...expiringLastLine, isUpdated: true };
    const expiringFirst = {
      ...expiringFirstLine,
      numberOfPacks: 10,
      isUpdated: true,
    };

    expect(allocate(10, 1)).toEqual([expiringLast, expiringFirst, placeholder]);
  });
  it('allocates units to the first expiry batch, with left overs being assigned to later expiring lines', () => {
    const draftOutboundLines = [
      { ...expiringLastLine },
      { ...expiringFirstLine },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const expiringLast = {
      ...expiringLastLine,
      numberOfPacks: 5,
      isUpdated: true,
    };
    const expiringFirst = {
      ...expiringFirstLine,
      numberOfPacks: 10,
      isUpdated: true,
    };

    expect(allocate(15, 1)).toEqual([expiringLast, expiringFirst, placeholder]);
  });
});

describe('Allocated quantities - behaviour for expired lines', () => {
  const now = Date.now();
  const expiredDate = new Date(now - 100000).toISOString();
  const notExpiredDate = new Date(now + 100000).toISOString();

  const expiringLastLine = createTestLine({
    id: '1',
    expiryDate: notExpiredDate,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
  });

  const expiredLine = createTestLine({
    id: '2',
    expiryDate: expiredDate,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
  });

  const placeholder = getPlaceholder();

  it('does not allocate any quantity to expired lines', () => {
    const draftOutboundLines = [
      { ...expiringLastLine },
      { ...expiredLine },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const expiringLast = {
      ...expiringLastLine,
      numberOfPacks: 10,
      isUpdated: true,
    };
    const expired = { ...expiredLine, numberOfPacks: 0 };

    expect(allocate(10, 1)).toEqual([expiringLast, expired, placeholder]);
  });
});

describe('Allocated quantities - behaviour generally not possible through the UI', () => {
  it('issues all quantities to the place holder when issuing to a pack size that has no available quantity', () => {
    const one = createTestLine({
      id: '1',
      packSize: 2,
      availableNumberOfPacks: 0,
    });
    const placeholder = getPlaceholder();

    const draftOutboundLines = [one, placeholder];
    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const lineOne = { ...one };
    const placeholderLine = { ...placeholder };
    placeholderLine.numberOfPacks = 10;

    const expected = [lineOne, placeholderLine];

    expect(allocate(10, 1)).toEqual(expected);
  });
});

describe('Allocated quantities - coping with over-allocation', () => {
  const now = Date.now();
  const expiringDate1 = new Date(now + 1000).toISOString();
  const expiringDate2 = new Date(now + 2000).toISOString();
  const expiringDate3 = new Date(now + 3000).toISOString();
  const expiringDate4 = new Date(now + 4000).toISOString();

  const Line1 = createTestLine({
    id: '1',
    expiryDate: expiringDate1,
    availableNumberOfPacks: 5,
    totalNumberOfPacks: 10,
    packSize: 1,
  });

  const Line2 = createTestLine({
    id: '2',
    expiryDate: expiringDate2,
    availableNumberOfPacks: 5,
    totalNumberOfPacks: 10,
    packSize: 1,
  });
  const Line3 = createTestLine({
    id: '3',
    expiryDate: expiringDate3,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
    packSize: 10,
  });
  const Line4 = createTestLine({
    id: '4',
    expiryDate: expiringDate4,
    availableNumberOfPacks: 10,
    totalNumberOfPacks: 10,
    packSize: 1,
  });

  const placeholder = getPlaceholder();
  it('issues to lines by expiry date without over allocating', () => {
    const draftOutboundLines = [
      { ...Line1 },
      { ...Line2 },
      { ...Line3 },
      { ...Line4 },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const line1 = { ...Line1, numberOfPacks: 2, isUpdated: true };
    const line2 = { ...Line2, numberOfPacks: 0, isUpdated: true };
    const line3 = { ...Line3, numberOfPacks: 1, isUpdated: true };
    const line4 = { ...Line4, numberOfPacks: 0 };

    expect(allocate(12, null)).toEqual([
      line1,
      line2,
      line3,
      line4,
      placeholder,
    ]);
  });

  it('reduces previously allocated lines as needed', () => {
    const draftOutboundLines = [
      { ...Line1 },
      { ...Line2 },
      { ...Line3 },
      { ...Line4, packSize: 10 },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const line1 = { ...Line1, numberOfPacks: 2, isUpdated: true };
    const line2 = { ...Line2, numberOfPacks: 0, isUpdated: true };
    const line3 = { ...Line3, numberOfPacks: 1, isUpdated: true };
    const line4 = { ...Line4, numberOfPacks: 0, packSize: 10 };

    expect(allocate(12, null)).toEqual([
      line1,
      line2,
      line3,
      line4,
      placeholder,
    ]);
  });

  it('reduces large pack size lines too', () => {
    const draftOutboundLines = [{ ...Line3 }, { ...Line4 }, { ...placeholder }];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    const line1 = { ...Line3, numberOfPacks: 1, isUpdated: true };
    const line2 = { ...Line4, numberOfPacks: 2, isUpdated: true };

    expect(allocate(12, null)).toEqual([line1, line2, placeholder]);
  });

  it('reduces large pack size lines, allocating to other lines', () => {
    const line1 = {
      ...Line1,
      packSize: 12,
      availableNumberOfPacks: 40,
      isUpdated: true,
    };
    const line2 = { ...Line2, availableNumberOfPacks: 100, isUpdated: true };
    const line3 = {
      ...Line3,
      packSize: 1,
      availableNumberOfPacks: 100,
      isUpdated: true,
    };
    const line4 = { ...Line4 };

    const draftOutboundLines = [
      { ...line1 },
      { ...line2 },
      { ...line3 },
      { ...line4 },
      { ...placeholder },
    ];

    const allocate = allocateQuantities(
      InvoiceNodeStatus.New,
      draftOutboundLines
    );

    expect(allocate(61, null)).toEqual([
      { ...line1, numberOfPacks: 5 },
      { ...line2, numberOfPacks: 1 },
      line3,
      { ...line4, isUpdated: true },
      placeholder,
    ]);
  });
});
