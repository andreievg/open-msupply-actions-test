import React from 'react';
import { useFormatNumber, useTranslation } from '@common/intl';
import { Box, Tooltip, Typography } from '@openmsupply-client/common';

export interface ResponseStoreStatsProps {
  stockOnHand: number;
  incomingStock: number;
  stockOnOrder: number;
  requestedQuantity: number;
  otherRequestedQuantity: number;
}

const MIN_FLEX_BASIS_TO_SHOW_LABEL = 10;
const MIN_FLEX_BASIS_TO_SHOW_VALUE = 5;

const Divider = () => (
  <Box sx={{ backgroundColor: 'gray.dark', width: '1px', height: '45px' }} />
);

const ValueBar = ({
  value,
  total,
  label,
  colour,
}: {
  value: number;
  total: number;
  label: string;
  colour: string;
}) => {
  const formatNumber = useFormatNumber();
  if (value === 0) return null;

  const flexBasis = Math.min(Math.round((100 * value) / total), 100);

  return (
    <>
      <Tooltip title={`${label}: ${formatNumber.round(value)}`} placement="top">
        <Box flexBasis={`${flexBasis}%`} flexGrow={1}>
          <Box sx={{ backgroundColor: colour, height: '20px' }} />
          <Box
            style={{
              textAlign: 'end',
              paddingRight: 10,
              paddingTop: 10,
            }}
          >
            {flexBasis > MIN_FLEX_BASIS_TO_SHOW_LABEL ? (
              <Typography
                fontSize={12}
                style={{ textOverflow: 'ellipsis', height: 20 }}
              >
                {label}
              </Typography>
            ) : null}
            {flexBasis > MIN_FLEX_BASIS_TO_SHOW_VALUE ? (
              <Typography fontSize={12}>{formatNumber.round(value)}</Typography>
            ) : null}
          </Box>
        </Box>
      </Tooltip>
      <Divider />
    </>
  );
};

export const ResponseStoreStats: React.FC<ResponseStoreStatsProps> = ({
  stockOnHand,
  incomingStock,
  stockOnOrder,
  requestedQuantity,
  otherRequestedQuantity,
}) => {
  const t = useTranslation('distribution');
  const predictedStockLevels = stockOnHand + incomingStock + stockOnOrder;
  const totalRequested = requestedQuantity + otherRequestedQuantity;

  const predictedStockPercent =
    predictedStockLevels < totalRequested
      ? `${Math.round((100 * predictedStockLevels) / totalRequested).toString()}%`
      : '100%';
  const requestedPercent =
    totalRequested < predictedStockLevels
      ? Math.round((100 * totalRequested) / predictedStockLevels).toString() +
        '%'
      : '100%';

  return (
    <>
      <Box
        flex={1}
        sx={{
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 4,
          paddingBottom: 2,
        }}
      >
        <>
          <Box
            display="flex"
            alignItems="flex-start"
            width={predictedStockPercent}
          >
            <Divider />
            <ValueBar
              value={stockOnHand}
              total={predictedStockLevels}
              label={t('label.stock-on-hand')}
              colour="gray.dark"
            />
            <ValueBar
              value={incomingStock}
              total={predictedStockLevels}
              label={t('label.incoming-stock')}
              colour="gray.main"
            />
            <ValueBar
              value={stockOnOrder}
              total={predictedStockLevels}
              label={t('label.stock-on-order')}
              colour="gray.light"
            />
          </Box>
        </>
      </Box>
      <Box
        sx={{
          paddingLeft: 4,
          paddingRight: 4,
          paddingTop: 4,
          paddingBottom: 2,
        }}
      >
        <>
          <Box
            display="flex"
            alignItems="flex-start"
            width={requestedPercent}
          >
            <Divider />
            <ValueBar
              value={requestedQuantity}
              total={totalRequested}
              label={t('label.requested-quantity')}
              colour="primary.main"
            />
            <ValueBar
              value={otherRequestedQuantity}
              total={totalRequested}
              label={t('label.all-requested-quantity')}
              colour="primary.light"
            />
          </Box>
        </>
      </Box>
    </>
  );
};
