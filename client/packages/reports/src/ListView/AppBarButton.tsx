import React, { FC, useState } from 'react';
import {
  AlertIcon,
  AppBarButtonsPortal,
  Box,
  BufferedTextArea,
  BufferedTextInput,
  ButtonWithIcon,
  ChevronDownIcon,
  DialogButton,
  Grid,
  LoadingButton,
  ModalRow,
  PlusCircleIcon,
  Typography,
  useDetailPanel,
  useDialog,
  useEditModal,
  useGql,
  useMutation,
  useNotification,
  useQueryClient,
  useTranslation,
} from '@openmsupply-client/common';
import { StyledInputRow } from 'packages/system/src/Stock/Components/StyledInputRow';
import { getSdk } from '../generateAiDashboard.generated';

export const AppBarButtonsComponent = () => {
  const { OpenButton } = useDetailPanel();
  const { isOpen, onClose, onOpen } = useEditModal();

  return (
    <AppBarButtonsPortal>
      {isOpen && <NewAiDashboard isOpen={isOpen} onClose={onClose} />}
      <Grid container gap={1}>
        <ButtonWithIcon
          Icon={<PlusCircleIcon />}
          label={'Create Grafana Dashboard'}
          onClick={onOpen}
        />
        {OpenButton}
      </Grid>
    </AppBarButtonsPortal>
  );
};

export const AppBarButtons = React.memo(AppBarButtonsComponent);

interface NewAiDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}
const useCreate = () => {
  const { client } = useGql();
  const queryClient = useQueryClient();
  const generate = getSdk(client);

  const mutationFn = async (input: { description: string; name: string }) => {
    return await generate.GenerateGrafanaDashboard(input);
  };

  return useMutation({
    mutationFn,
    onSuccess: () =>
      // Stock line list needs to be re-fetched to include the new stock line
      queryClient.invalidateQueries(['AI_DASHBOARD']),
  });
};

export const NewAiDashboard: FC<NewAiDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const { success, error } = useNotification();
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { mutateAsync: createMutation, isLoading } = useCreate();
  const [draft, setDraft] = useState({ name: '', description: '' });
  const { Modal } = useDialog({ isOpen, onClose });
  const createDashboard = async () => {
    setGenerateError(null);
    try {
      await createMutation(draft);
      success('Dashboard created successfully')();
      onClose();
    } catch (e) {
      setGenerateError(String(e));
      error('Failed to create dashboard')();
    }
  };

  return (
    <Modal
      width={400}
      height={200}
      slideAnimation={false}
      title={'Create grafana dashboard with Gemini'}
      okButton={
        <LoadingButton
          variant="outlined"
          isLoading={isLoading}
          label="Create"
          onClick={createDashboard}
        />
      }
      cancelButton={<DialogButton variant="cancel" onClick={onClose} />}
    >
      <Grid
        container
        paddingBottom={4}
        alignItems="center"
        flexDirection="column"
        gap={1}
      >
        <ModalRow>
          <StyledInputRow
            label={'Name'}
            Input={
              <BufferedTextInput
                value={draft.name}
                onChange={e =>
                  setDraft({ ...draft, name: String(e.target.value) })
                }
              />
            }
          />
        </ModalRow>
        <ModalRow>
          <StyledInputRow
            label={'Description'}
            Input={
              <BufferedTextArea
                slotProps={{
                  input: {
                    sx: {
                      backgroundColor: theme => theme.palette.background.menu,
                      width: 300,
                    },
                  },
                }}
                value={draft.description}
                onChange={e =>
                  setDraft({ ...draft, description: String(e.target.value) })
                }
              />
            }
          />
        </ModalRow>
        {generateError && (
          <ModalRow>
            <Error
              error={'Failed to create dashboard'}
              details={generateError}
              hint={'Please try again'}
            />
          </ModalRow>
        )}
      </Grid>
    </Modal>
  );
};

export type ErrorProps = {
  error: string;
  details: string;
  hint?: string;
};

export const Error = ({ error, details, hint }: ErrorProps) => {
  const t = useTranslation();
  const [expand, setExpand] = useState(false);
  const hasMoreInformation = !!(details || hint);
  const chevronCommonStyles = {
    width: '0.6em',
    marginTop: '0.1em',
    height: '0.6em',
  };

  return (
    <Box
      display="flex"
      sx={{ backgroundColor: 'error.background', borderRadius: 2 }}
      gap={1}
      padding={1}
    >
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row">
          <Box color="error.main">
            <AlertIcon />
          </Box>
          <Box
            sx={{
              '& > div': { display: 'inline-block' },
              alignContent: 'center',
              paddingLeft: 1,
            }}
          >
            <Typography
              sx={{ color: 'inherit' }}
              variant="body2"
              component="span"
            >
              {error}
            </Typography>
          </Box>
        </Box>
        {hasMoreInformation && (
          <Box display="flex" flexDirection="column" sx={{ paddingLeft: 4 }}>
            <Typography
              variant="body2"
              alignItems="center"
              display="flex"
              sx={{
                cursor: 'pointer',
                fontSize: 12,
                color: 'secondary.main',
              }}
              onClick={() => setExpand(!expand)}
            >
              {t('error.more-info')}
              {expand ? (
                <ChevronDownIcon
                  sx={{
                    ...chevronCommonStyles,
                  }}
                />
              ) : (
                <ChevronDownIcon
                  sx={{
                    transform: 'rotate(-90deg)',
                    ...chevronCommonStyles,
                  }}
                />
              )}
            </Typography>
            {expand && (
              <Box>
                <Typography sx={{ textWrap: 'wrap' }} variant="body2">
                  {!!hint && hint}
                  {!!hint && !!details && <br />}
                  {!!details && details}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
