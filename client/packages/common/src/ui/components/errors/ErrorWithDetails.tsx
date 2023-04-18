import React from 'react';
import {
  Box,
  AlertIcon,
  Typography,
  InfoTooltipIcon,
} from '@openmsupply-client/common';

export type ErrorWithDetailsProps = {
  error: string;
  details: string;
};

export const ErrorWithDetails: React.FC<ErrorWithDetailsProps> = ({
  error,
  details,
}) => (
  <Box
    display="flex"
    sx={{ color: 'error.main' }}
    gap={1}
    justifyContent="center"
  >
    <Box display="flex" flexWrap="wrap" alignContent="center">
      <AlertIcon />
    </Box>
    <Box sx={{ '& > div': { display: 'inline-block' } }}>
      <Typography sx={{ color: 'inherit' }} component="span">
        {error}
      </Typography>
      <InfoTooltipIcon title={details} />
    </Box>
  </Box>
);
