import React, { ChangeEvent, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { SvgIconProps } from '.';
import { AlertIcon } from './Alert';
import { ArrowLeftIcon } from './ArrowLeft';
import { ArrowRightIcon } from './ArrowRight';
import { BarChartIcon } from './BarChart';
import { BookIcon } from './Book';
import { CartIcon } from './Cart';
import { CheckIcon } from './Check';
import { CheckboxCheckedIcon } from './CheckboxChecked';
import { CheckboxEmptyIcon } from './CheckboxEmpty';
import { CheckboxIndeterminateIcon } from './CheckboxIndeterminate';
import { ChevronDownIcon } from './ChevronDown';
import { ChevronsDownIcon } from './ChevronsDown';
import { CircleIcon } from './Circle';
import { ClockIcon } from './Clock';
import { CloseIcon } from './Close';
import { ColumnsIcon } from './Columns';
import { CopyIcon } from './Copy';
import { CustomersIcon } from './Customers';
import { DashboardIcon } from './Dashboard';
import { DeleteIcon } from './Delete';
import { DownloadIcon } from './Download';
import { EditIcon } from './Edit';
import { ExternalLinkIcon } from './ExternalLink';
import { EyeIcon } from './Eye';
import { EyeOffIcon } from './EyeOff';
import { FilterIcon } from './Filter';
import { HomeIcon } from './Home';
import { InfoIcon } from './Info';
import { InfoOutlineIcon } from './InfoOutline';
import { InvoiceIcon } from './Invoice';
import { MedicineIcon } from './MedicineIcon';
import { MSupplyGuy, AnimatedMSupplyGuy } from './MSupplyGuy';
import { MenuDotsIcon } from './MenuDots';
import { MessagesIcon } from './Messages';
import { MessageSquareIcon } from './MessageSquare';
import { PlusCircleIcon } from './PlusCircle';
import { PowerIcon } from './Power';
import { PrinterIcon } from './Printer';
import { RadioIcon } from './Radio';
import { ReportsIcon } from './Reports';
import { RewindIcon } from './Rewind';
import { RefreshIcon } from './Refresh';
import { SaveIcon } from './Save';
import { ScanIcon } from './Scan';
import { SearchIcon } from './Search';
import { SettingsIcon } from './Settings';
import { SidebarIcon } from './Sidebar';
import { SortAscIcon } from './SortAsc';
import { SortDescIcon } from './SortDesc';
import { StockIcon } from './Stock';
import { SuppliersIcon } from './Suppliers';
import { ToolsIcon } from './Tools';
import { TranslateIcon } from './Translate';
import { TruckIcon } from './Truck';
import { UserIcon } from './User';
import { XCircleIcon } from './XCircle';
import { ZapIcon } from './Zap';
import { Box, Grid, Paper, styled, TextField, Typography } from '@mui/material';

export default {
  title: 'Assets/Svg Icon',
  component: Grid,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Grid>;

const StyledPaper = styled(Paper)({
  textAlign: 'center',
  height: 90,
  padding: 10,
  width: 150,
});
type Icon = {
  icon: JSX.Element;
  name: string;
};

const Template: ComponentStory<React.FC<SvgIconProps>> = args => {
  const icons: Icon[] = [
    { icon: <AlertIcon {...args} />, name: 'Alert' },
    { icon: <ArrowLeftIcon {...args} />, name: 'ArrowLeft' },
    { icon: <ArrowRightIcon {...args} />, name: 'ArrowRight' },
    { icon: <BarChartIcon {...args} />, name: 'BarChart' },
    { icon: <BookIcon {...args} />, name: 'Book' },
    { icon: <CartIcon {...args} />, name: 'Cart' },
    { icon: <CheckIcon {...args} />, name: 'Check' },
    { icon: <CheckboxCheckedIcon {...args} />, name: 'CheckboxChecked' },
    {
      icon: <CheckboxIndeterminateIcon {...args} />,
      name: 'Checkbox Indeterminate',
    },
    { icon: <CheckboxEmptyIcon {...args} />, name: 'CheckboxEmpty' },
    { icon: <ChevronDownIcon {...args} />, name: 'ChevronDown' },
    { icon: <ChevronsDownIcon {...args} />, name: 'ChevronsDown' },
    { icon: <CircleIcon {...args} />, name: 'Circle' },
    { icon: <ClockIcon {...args} />, name: 'Clock' },
    { icon: <CloseIcon {...args} />, name: 'Close' },
    { icon: <ColumnsIcon {...args} />, name: 'Columns' },
    { icon: <CopyIcon {...args} />, name: 'Copy' },
    { icon: <CustomersIcon {...args} />, name: 'Customers' },
    { icon: <DashboardIcon {...args} />, name: 'Dashboard' },
    { icon: <DeleteIcon {...args} />, name: 'Delete' },
    { icon: <DownloadIcon {...args} />, name: 'Download' },
    { icon: <EditIcon {...args} />, name: 'Edit' },
    { icon: <ExternalLinkIcon {...args} />, name: 'External Link' },
    { icon: <EyeIcon {...args} />, name: 'Eye' },
    { icon: <EyeOffIcon {...args} />, name: 'EyeOff' },
    { icon: <FilterIcon {...args} />, name: 'Filter' },
    { icon: <HomeIcon {...args} />, name: 'Home' },
    { icon: <InfoIcon {...args} />, name: 'Info' },
    { icon: <InfoOutlineIcon {...args} />, name: 'InfoOutline' },
    { icon: <InvoiceIcon {...args} />, name: 'Invoice' },
    { icon: <MSupplyGuy {...args} size="medium" />, name: 'MSupplyGuy' },
    {
      icon: <AnimatedMSupplyGuy {...args} size="medium" />,
      name: 'AnimatedMSupplyGuy',
    },
    { icon: <MedicineIcon {...args} />, name: 'MedicineIcon' },
    { icon: <MenuDotsIcon {...args} />, name: 'MenuDots' },
    { icon: <MessagesIcon {...args} />, name: 'Messages' },
    { icon: <MessageSquareIcon {...args} />, name: 'MessageSquare' },
    { icon: <PlusCircleIcon {...args} />, name: 'PlusCircle' },
    { icon: <PowerIcon {...args} />, name: 'Power' },
    { icon: <PrinterIcon {...args} />, name: 'Printer' },
    { icon: <RadioIcon {...args} />, name: 'Radio' },
    { icon: <ReportsIcon {...args} />, name: 'Reports' },
    { icon: <RefreshIcon {...args} />, name: 'Refresh' },
    { icon: <RewindIcon {...args} />, name: 'Rewind' },
    { icon: <SaveIcon {...args} />, name: 'Save' },
    { icon: <ScanIcon {...args} />, name: 'Scan' },
    { icon: <SearchIcon {...args} />, name: 'Search' },
    { icon: <SettingsIcon {...args} />, name: 'Settings' },
    { icon: <SidebarIcon {...args} />, name: 'Sidebar' },
    { icon: <SortAscIcon {...args} />, name: 'SortAsc' },
    { icon: <SortDescIcon {...args} />, name: 'SortDesc' },
    { icon: <StockIcon {...args} />, name: 'Stock' },
    { icon: <SuppliersIcon {...args} />, name: 'Suppliers' },
    { icon: <ToolsIcon {...args} />, name: 'Tools' },
    { icon: <TranslateIcon {...args} />, name: 'Translate' },
    { icon: <TruckIcon {...args} />, name: 'Truck' },
    { icon: <UserIcon {...args} />, name: 'User' },
    { icon: <XCircleIcon {...args} />, name: 'XCircle' },
    { icon: <ZapIcon {...args} />, name: 'Zap' },
  ];
  const [filteredIcons, setFilteredIcons] = useState(icons);
  const filterIcons = (event: ChangeEvent<HTMLInputElement>) => {
    const re = new RegExp(event.target.value, 'i');
    setFilteredIcons(icons.filter(i => re.test(i.name)));
  };
  return (
    <>
      <Box padding={1}>
        <TextField
          onChange={filterIcons}
          label="Filter icons"
          variant="outlined"
        />
      </Box>
      <Grid item>
        <Grid container spacing={1}>
          {filteredIcons.map(i => (
            <Grid item xs key={i.name}>
              <StyledPaper>
                {i.icon}
                <Typography>{i.name}</Typography>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export const Primary = Template.bind({});
export const Secondary = Template.bind({});
export const Small = Template.bind({});
export const DefaultValues = Template.bind({});

Primary.args = { color: 'primary' } as SvgIconProps;
Secondary.args = { color: 'secondary' } as SvgIconProps;
Small.args = { fontSize: 'small', color: 'primary' } as SvgIconProps;
