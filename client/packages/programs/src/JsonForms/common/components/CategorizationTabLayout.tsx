import React, { FC, useState } from 'react';
import {
  and,
  Categorization,
  categorizationHasCategory,
  Category,
  isLayout,
  isScoped,
  isVisible,
  Layout,
  LayoutProps,
  optionIs,
  RankedTester,
  rankWith,
  toDataPathSegments,
  uiTypeIs,
} from '@jsonforms/core';
import { useJsonForms, withJsonFormsLayoutProps } from '@jsonforms/react';
import { Button, Grid, Hidden, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DialogButton, useTranslation } from '@openmsupply-client/common';
import { ModalProps, useDialog } from '@common/hooks';
import {
  AjvProps,
  MaterialLayoutRendererProps,
  renderLayoutElements,
  withAjvProps,
} from '@jsonforms/material-renderers';
import { isEmpty } from 'lodash';

interface CategoryModalProps extends ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryModal: FC<CategoryModalProps> = ({
  children,
  isOpen,
  onClose,
  ...modalProps
}) => {
  const { Modal } = useDialog({
    isOpen,
    onClose,
  });
  return <Modal {...modalProps}>{children}</Modal>;
};

export const categorizationTabLayoutTester: RankedTester = rankWith(
  2,
  and(
    uiTypeIs('Categorization'),
    categorizationHasCategory,
    optionIs('variant', 'tab')
  )
);

const Icon = styled('i')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  height: 50,
  width: 50,
}));

// Specialized layout render to fix some layout issues in the modal
const CategoryLayoutRendererComponent = ({
  visible,
  elements,
  schema,
  path,
  enabled,
  direction,
  renderers,
  cells,
}: MaterialLayoutRendererProps) => {
  if (isEmpty(elements) || !schema || path === undefined) {
    return null;
  } else {
    return (
      <Hidden xsUp={!visible}>
        <Grid
          container
          direction={direction}
          spacing={direction === 'row' ? 2 : 0}
          // this is changed compared to the default renderer:
          flexWrap={'nowrap'}
        >
          {renderLayoutElements(
            elements,
            schema,
            path,
            enabled ?? true,
            renderers,
            cells
          )}
        </Grid>
      </Hidden>
    );
  }
};
const CategoryLayoutRenderer = React.memo(CategoryLayoutRendererComponent);

// Try to extract a more precise error path
const propertyPathFromError = (error: {
  instancePath: string;
  keyword: string;
  params: Record<string, any>;
}): string => {
  // see https://ajv.js.org/api.html#error-objects
  switch (error.keyword) {
    case 'dependencies':
      return `${error.instancePath}/${error.params['missingProperty']}`;
    case 'required':
      return `${error.instancePath}/${error.params['missingProperty']}`;
    case 'propertyNames':
      return `${error.instancePath}/${error.params['propertyName']}`;
    default:
      return error.instancePath;
  }
};

// Recursively goes through a layout and collects all element paths that have errors
const containsErrors = (layout: Layout, errorPaths: string[]): string[] => {
  const results = [];
  for (const element of layout.elements) {
    if (isScoped(element)) {
      const scopePath = toDataPathSegments(element.scope).reduce(
        (prev, current) => {
          return `${prev}/${current}`;
        },
        ''
      );
      for (const errorPath of errorPaths) {
        if (scopePath.startsWith(errorPath)) {
          results.push(errorPath);
        }
      }
    } else if (isLayout(element)) {
      results.push(...containsErrors(element, errorPaths));
    }
  }
  return results;
};

const ErrorStringComponent: FC<{
  category: Category;
  errorPaths: string[];
}> = ({ category, errorPaths }) => {
  const t = useTranslation('common');

  if (errorPaths.length === 0) {
    return null;
  }
  const foundPaths = containsErrors(category, errorPaths);
  if (foundPaths.length === 0) {
    return null;
  }
  return (
    <Typography
      sx={{
        position: 'absolute',
        right: 2,
        bottom: 2,
        color: theme => theme.palette.error.main,
        backgroundColor: theme => theme.palette.background.login,
        borderRadius: 4,
        paddingX: 2,
      }}
    >
      {t('error.missing-inputs', { count: foundPaths.length })}
    </Typography>
  );
};

const UIComponent: FC<LayoutProps & AjvProps> = ({
  ajv,
  data,
  path,
  renderers,
  schema,
  uischema,
  visible,
  cells,
}) => {
  const [activeCategory, setActiveCategory] = useState<number | undefined>();
  const categorization = uischema as Categorization;

  const categories = categorization.elements.filter(
    (category: Category | Categorization): category is Category =>
      isVisible(category, data, '', ajv) && category.type === 'Category'
  );

  const { core } = useJsonForms();
  const errorPaths = core?.errors?.map(e => propertyPathFromError(e)) ?? [];

  const childProps: MaterialLayoutRendererProps = {
    elements:
      activeCategory === undefined
        ? []
        : categorization.elements[activeCategory]?.elements ?? [],
    schema,
    // assume the root path if not specified
    path: path ?? '',
    direction: 'column',
    visible,
    renderers,
    cells,
  };

  const onClose = () => setActiveCategory(undefined);

  return (
    <Grid
      item
      display="flex"
      justifyContent="center"
      alignContent="center"
      flex={1}
      flexWrap="wrap"
      gap={2}
      padding={2}
    >
      {categories.map((category: Category, idx: number) => (
        <Grid item key={category.label} display="inline-flex">
          <Button
            variant="outlined"
            startIcon={<Icon className={`${category.options?.['icon']}`} />}
            key={category.label}
            onClick={() => setActiveCategory(idx)}
            sx={{
              width: '150px',
              height: '150px',
              flexDirection: 'column',
              textTransform: 'none',
              '& .MuiButton-startIcon': {
                paddingBottom: '8px',
              },
            }}
          >
            {category.label}
            <ErrorStringComponent category={category} errorPaths={errorPaths} />
          </Button>
          <CategoryModal
            onClose={onClose}
            isOpen={activeCategory === idx}
            title={category.options?.['title'] ?? category.label}
            okButton={<DialogButton variant="ok" onClick={onClose} />}
            width={700}
          >
            <CategoryLayoutRenderer {...childProps} />
          </CategoryModal>
        </Grid>
      ))}
    </Grid>
  );
};

export const CategorizationTabLayout = withJsonFormsLayoutProps(
  withAjvProps(UIComponent)
);
