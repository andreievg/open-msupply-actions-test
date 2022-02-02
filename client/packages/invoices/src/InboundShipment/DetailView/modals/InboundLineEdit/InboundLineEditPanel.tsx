import React, { FC } from 'react';

import { styled, TabPanel, Box } from '@openmsupply-client/common';
import { DraftInboundLine } from './InboundLineEdit';

const StyledTabPanel = styled(TabPanel)({
  height: '100%',
});

const StyledTabContainer = styled(Box)(({ theme }) => ({
  borderColor: theme.palette.divider,
  flexDirection: 'row',
  display: 'flex',
}));

interface InboundLineEditPanel {
  value: string;
  lines: DraftInboundLine[];
  updateDraftLine: (patch: Partial<DraftInboundLine> & { id: string }) => void;
}

export const InboundLineEditPanel: FC<InboundLineEditPanel> = ({
  value,
  children,
}) => {
  return (
    <StyledTabPanel value={value}>
      <StyledTabContainer>{children}</StyledTabContainer>
    </StyledTabPanel>
  );
};
