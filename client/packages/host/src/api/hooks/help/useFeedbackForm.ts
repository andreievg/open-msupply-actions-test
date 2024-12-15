import { InsertContactFormInput } from '@common/types';
import { useState } from 'react';
import { useFeedbackFormGraphQL } from './useFeedbackFormGraphQL';
import {
  FnUtils,
  isEmpty,
  useMutation,
  useDebounceCallback,
  useTranslation,
} from '@openmsupply-client/common';

type ContactFormInput = Pick<InsertContactFormInput, 'replyEmail' | 'body'>;

export function useFeedbackForm() {
  const defaultDraft: ContactFormInput = {
    replyEmail: '',
    body: '',
  };
  const [draft, setDraft] = useState<ContactFormInput>(defaultDraft);
  const [emailError, setEmailError] = useState('');
  const t = useTranslation();

  const { mutateAsync: insert } = useInsert();

  const updateDraft = (newData: Partial<ContactFormInput>) => {
    const newDraft: ContactFormInput = { ...draft, ...newData };
    setDraft(newDraft);
  };

  const resetDraft = () => {
    setDraft(defaultDraft);
  };

  const checkEmailIsValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const debounceValidation = useDebounceCallback(
    (email: string) => {
      if (!checkEmailIsValid(email))
        return setEmailError(t('messages.error-not-valid-email'));
      return setEmailError('');
    },
    [setEmailError],
    100
  );

  const isValidInput =
    !!draft.replyEmail && !!draft.body && checkEmailIsValid(draft.replyEmail);

  return {
    updateDraft,
    resetDraft,
    saveFeedback: insert,
    draft,
    isValidInput,
    checkEmailIsValid,
    debounceValidation,
    emailError,
  };
}

const useInsert = () => {
  const { api, storeId } = useFeedbackFormGraphQL();

  const mutationFn = async ({ replyEmail, body }: ContactFormInput) => {
    const apiResult = await api.insertContactForm({
      storeId,
      input: {
        id: FnUtils.generateUUID(),
        replyEmail,
        body,
      },
    });

    if (!isEmpty(apiResult)) {
      const result = apiResult.insertContactForm;

      if (result.__typename === 'InsertResponse') {
        return result;
      }
    }
  };

  return useMutation({
    mutationFn,
  });
};
