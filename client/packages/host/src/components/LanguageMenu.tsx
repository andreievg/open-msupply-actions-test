import React from 'react';
import {
  IntlUtils,
  useNavigate,
  Select,
  MenuItem,
  Option,
} from '@openmsupply-client/common';

export const LanguageMenu: React.FC = () => {
  const navigate = useNavigate();
  const i18n = IntlUtils.useI18N();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    i18n.changeLanguage(value);
    navigate(0);
  };

  const options = [
    { label: 'عربي', value: 'ar' },
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
    { label: 'Española', value: 'es' },
    { label: 'Tetum', value: 'tet' },
  ];

  const renderOption = (option: Option) => (
    <MenuItem
      key={option.value}
      value={option.value}
      sx={option.value === 'ar' ? { justifyContent: 'flex-end' } : {}}
    >
      {option.label}
    </MenuItem>
  );

  return (
    <Select
      onChange={handleChange}
      options={options}
      value={i18n.language}
      renderOption={renderOption}
    />
  );
};
