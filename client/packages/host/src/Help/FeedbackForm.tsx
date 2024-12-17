import React from 'react';
import {
  Grid,
  useTranslation,
  TextArea,
  InputWithLabelRow,
  BasicTextInput,
  LoadingButton,
  MailIcon,
  useNotification,
  Select,
  ContactFormNodeType,
} from '@openmsupply-client/common';
import { useFeedbackForm } from '../api/hooks/help/useFeedbackForm';

export const FeedbackForm = () => {
  const t = useTranslation();
  const { success, error } = useNotification();
  const { updateDraft, resetDraft, saveFeedback, draft } = useFeedbackForm();

  const save = async () => {
    try {
      saveFeedback(draft);
      const successSnack = success(t('messages.message-sent'));
      successSnack();
      resetDraft();
    } catch {
      const errorSnack = error(t('messages.message-not-sent'));
      errorSnack();
    }
  };

  const sendButtonIsDisabled = !draft.contactFormType || !draft.replyEmail;

  return (
    <>
      <InputWithLabelRow
        label={t('label.reason-for-contacting')}
        labelWidth="200"
        Input={
          <Select
            fullWidth
            value={draft.contactFormType}
            onChange={e => updateDraft({ contactFormType: e.target.value })}
            margin="normal"
            options={[
              {
                label: t('label.feedback'),
                value: ContactFormNodeType.Feedback,
              },
              {
                label: t('label.support'),
                value: ContactFormNodeType.Support,
              },
            ]}
          />
        }
      />
      <InputWithLabelRow
        label={t('label.your-email-address')}
        labelWidth="200"
        Input={
          <BasicTextInput
            value={draft.replyEmail}
            onChange={e => updateDraft({ replyEmail: e.target.value })}
            fullWidth
          />
        }
      />
      <InputWithLabelRow
        label={t('label.message')}
        labelWidth="200"
        Input={
          <TextArea
            value={draft.body}
            onChange={e => {
              updateDraft({ body: e.target.value });
            }}
            InputProps={{
              sx: {
                backgroundColor: 'background.menu',
              },
            }}
            fullWidth
          />
        }
      />
      <Grid item justifyContent="flex-end" width="100%" display="flex">
        <LoadingButton
          isLoading={false}
          startIcon={<MailIcon />}
          type="submit"
          variant="contained"
          sx={{ fontSize: '12px' }}
          disabled={sendButtonIsDisabled}
          onClick={save}
        >
          {t('button.send')}
        </LoadingButton>
      </Grid>
    </>
  );
};
