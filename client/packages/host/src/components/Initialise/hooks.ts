import { useEffect, useState } from 'react';
import { AppRoute } from '@openmsupply-client/config';
import {
  useNavigate,
  useTranslation,
  ErrorWithDetailsProps,
  InitialisationStatusType,
  useInitialisationStatus,
  useNativeClient,
} from '@openmsupply-client/common';
import { useHost } from '../../api/hooks';
import { mapSyncError } from '../../api/api';

const STATUS_POLLING_INTERVAL = 500;
const DEFAULT_SYNC_INTERVAL_IN_SECONDS = 300;

interface InitialiseForm {
  // Error on validation of sync credentials, there is another error for sync progress
  siteCredentialsError: ErrorWithDetailsProps | null;
  // true:
  // * on start of initialisation
  // * on start of retry
  // * syncStatus exists and not erroneous
  // false - default:
  // * on site credentials vaidation
  // * sync exists and erroneous
  isLoading: boolean;
  // true - default (to make form non editable while before api result is known)
  // * initialisationStatus is Initialising
  // false:
  // * initialisationStatus is PreInitialising
  isInitialising: boolean;
  // password is set to empty string if isInitialising
  password: string;
  // set to settings value from api if isInitialising
  username: string;
  // set to settings value from api if isInitialising
  url: string;
  // Used to enable polling of syncStatus and initialisationStatus
  // false by default and toggled to STATUS_POLLING_INTERVAL when isInitialising
  refetchInterval: number | false;
}

const useInitialiseFormState = () => {
  const [state, set] = useState<InitialiseForm>({
    siteCredentialsError: null,
    isLoading: false,
    isInitialising: true,
    password: '',
    username: '',
    url: 'https://',
    refetchInterval: false,
  });

  return {
    ...state,
    setSiteCredentialsError: (
      siteCredentialsError: InitialiseForm['siteCredentialsError']
    ) => set(state => ({ ...state, siteCredentialsError })),
    setIsLoading: (isLoading: boolean) =>
      set(state => ({ ...state, isLoading })),
    setPassword: (password: string) => set(state => ({ ...state, password })),
    setUsername: (username: string) => set(state => ({ ...state, username })),
    setUrl: (url: string) => set(state => ({ ...state, url })),
    // When sync is already ongoing either after initialise button is pressed
    // or when initialisation page is loaded while sync is ongoing
    // inputs should be disabled and polling for syncStatus should start
    setIsInitialising: (isInitialising: boolean) =>
      set(state => ({
        ...state,
        isInitialising,
        refetchInterval: isInitialising && STATUS_POLLING_INTERVAL,
        password: '',
      })),
  };
};

// Hook will navigate to login if initialisationStatus is Initialised
export const useInitialiseForm = () => {
  const state = useInitialiseFormState();
  const navigate = useNavigate();
  const {
    setIsLoading,
    password,
    username,
    setSiteCredentialsError,
    url,
    refetchInterval,
    setIsInitialising,
    setUrl,
    setUsername,
  } = state;
  const t = useTranslation('app');
  const { mutateAsync: initialise } = useHost.sync.initialise();
  const { mutateAsync: manualSync } = useHost.sync.manualSync();
  // Both initialisationStatus and syncStatus are polled because we want to navigate
  // to login when initialisation is finished, but syncStatus will be behind auth after
  // initialisation has finished, whereas syncStatus is always an open API
  const { data: initStatus } = useInitialisationStatus(refetchInterval);
  const { data: syncStatus } = useHost.utils.syncStatus(refetchInterval);
  const { data: syncSettings } = useHost.settings.syncSettings();
  const { allowSleep, keepAwake } = useNativeClient();

  const onInitialise = async () => {
    setSiteCredentialsError(null);
    setIsLoading(true);
    try {
      const response = await initialise({
        intervalSeconds: DEFAULT_SYNC_INTERVAL_IN_SECONDS,
        password,
        url,
        username,
      });
      // Map structured error
      if (response.__typename === 'SyncErrorNode') {
        setSiteCredentialsError(
          mapSyncError(t, response, 'error.unable-to-initialise')
        );
        return setIsLoading(false);
      }
    } catch (e) {
      // Set standard error
      setSiteCredentialsError({
        error: t('error.unable-to-initialise'),
        details: (e as Error)?.message || '',
      });
      return setIsLoading(false);
    }

    setIsInitialising(true);
  };

  const onRetry = async () => {
    setIsLoading(true);
    await manualSync();
  };

  useEffect(() => {
    if (!initStatus) return;

    switch (initStatus.status) {
      case InitialisationStatusType.Initialised:
        allowSleep().then(() =>
          navigate(`/${AppRoute.Login}`, { replace: true })
        );
        break;
      case InitialisationStatusType.Initialising:
        keepAwake().then(() => setIsInitialising(true));
        break;
      case InitialisationStatusType.PreInitialisation:
        allowSleep().then(() => setIsInitialising(false));
        break;
    }
  }, [initStatus]);

  useEffect(() => {
    if (!syncStatus) return;
    // Need to be able to retry is syncStatus is erroneous
    setIsLoading(!syncStatus.error);
  }, [syncStatus]);

  useEffect(() => {
    // If page is loaded or reloaded when isInitialising
    // url and username should be set from api result
    if (
      initStatus?.status === InitialisationStatusType.Initialising &&
      !!syncSettings
    ) {
      setUsername(syncSettings.username);
      setUrl(syncSettings.url);
    }
  }, [syncSettings, initStatus]);

  return {
    isValid: !!username && !!password && !!url,
    onInitialise,
    onRetry,
    ...state,
    syncStatus,
    siteName: initStatus?.siteName,
  };
};
