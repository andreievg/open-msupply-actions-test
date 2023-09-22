import React, { FC, useEffect, useState } from 'react';
import {
  useTranslation,
  Grid,
  Typography,
  DialogButton,
  useDialog,
  ObjUtils,
  useConfirmationModal,
  ModalTabs,
  usePluginProvider,
} from '@openmsupply-client/common';
import { StockLineRowFragment, useStock } from '../api';
import { LogList } from '../../Log';
import { StockLineForm } from './StockLineForm';

interface StockLineEditModalProps {
  isOpen: boolean;
  onClose: () => void;

  stockLine: StockLineRowFragment;
}

interface UseDraftStockLineControl {
  draft: StockLineRowFragment;
  onUpdate: (patch: Partial<StockLineRowFragment>) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

const useDraftStockLine = (
  seed: StockLineRowFragment
): UseDraftStockLineControl => {
  const [stockLine, setStockLine] = useState<StockLineRowFragment>({ ...seed });
  const { mutate, isLoading } = useStock.line.update();

  const onUpdate = (patch: Partial<StockLineRowFragment>) => {
    setStockLine({ ...stockLine, ...patch });
  };

  const onSave = async () => mutate(stockLine);

  return {
    draft: stockLine,
    onUpdate,
    onSave,
    isLoading,
  };
};

export const StockLineEditModal: FC<StockLineEditModalProps> = ({
  stockLine,
  isOpen,
  onClose,
}) => {
  const t = useTranslation('inventory');
  const { Modal } = useDialog({ isOpen, onClose });
  const getConfirmation = useConfirmationModal({
    title: t('heading.are-you-sure'),
    message: t('messages.confirm-save-stock-line'),
  });

  const { draft, onUpdate, onSave } = useDraftStockLine(stockLine);
  // const { dispatchEvent, addEventListener, removeEventListener } =
  //   usePluginProvider();
  const addEventListener = usePluginProvider(state => state.addEventListener);
  const removeEventListener = usePluginProvider(
    state => state.removeEventListener
  );
  const dispatchEvent = usePluginProvider(state => state.dispatchEvent);
  const [hasChanged, setHasChanged] = useState(false);

  const tabs = [
    {
      Component: <StockLineForm draft={draft} onUpdate={onUpdate} />,
      value: 'label.details',
    },
    {
      Component: <LogList recordId={draft?.id ?? ''} />,
      value: 'label.log',
    },
  ];

  const onChange = () => setHasChanged(true);

  useEffect(() => {
    addEventListener('onChange', 'StockEditForm', onChange);

    return () => removeEventListener('onChange', 'StockEditForm', onChange);
  }, []);

  return (
    <Modal
      width={700}
      height={575}
      slideAnimation={false}
      title={t('title.stock-line-details')}
      okButton={
        <DialogButton
          variant="ok"
          disabled={ObjUtils.isEqual(draft, stockLine) && !hasChanged}
          onClick={() =>
            getConfirmation({
              onConfirm: async () => {
                await onSave();
                dispatchEvent('onSave', 'StockEditForm', new Event(draft.id));
                onClose();
              },
            })
          }
        />
      }
      cancelButton={<DialogButton variant="cancel" onClick={onClose} />}
    >
      <Grid
        container
        paddingBottom={4}
        alignItems="center"
        flexDirection="column"
      >
        <Typography sx={{ fontWeight: 'bold' }} variant="h6">
          {stockLine.item.name}
        </Typography>
        <Typography sx={{ fontWeight: 'bold', marginBottom: 3 }}>
          {`${t('label.code')} : ${stockLine.item.code}`}
        </Typography>
        <ModalTabs tabs={tabs} />
      </Grid>
    </Modal>
  );
};
