import { LocaleKey, TypedTFunction } from '@common/intl';
import { AssetCatalogueItemFragment } from './api';
import { Formatter } from '@common/utils';
import { ImportRow, LineNumber } from './ImportCatalogueItem';

function assetCatalogueItemFields(t: TypedTFunction<LocaleKey>) {
  return [
    t('label.sub-catalogue'),
    t('label.code'),
    t('label.type'),
    t('label.manufacturer'),
    t('label.model'),
    t('label.class'),
    t('label.category'),
  ];
}

export const assetCatalogueItemsListToCsv = (
  items: AssetCatalogueItemFragment[],
  t: TypedTFunction<LocaleKey>
) => {
  const fields = assetCatalogueItemFields(t);

  const data = items.map(node => [
    node.subCatalogue,
    node.code,
    node.assetType?.name,
    node.manufacturer,
    node.model,
    node.assetClass?.name,
    node.assetCategory?.name,
  ]);
  return Formatter.csv({ fields, data });
};

export const mapIdNameToOptions = (items: { id: string; name: string }[]) =>
  items.map(item => ({
    label: item.name,
    value: item.id,
  }));

export const importRowToCsv = (
  catalogueItems: Partial<ImportRow & LineNumber>[],
  t: TypedTFunction<LocaleKey>,
  includeErrors = true
) => {
  const fields = assetCatalogueItemFields(t);
  if (includeErrors) fields.push(t('label.error-message'));

  const data = catalogueItems.map(node => [
    node.subCatalogue,
    node.code,
    node.type,
    node.manufacturer,
    node.model,
    node.class,
    node.category,
    node.errorMessage,
  ]);

  return Formatter.csv({ fields, data });
};
