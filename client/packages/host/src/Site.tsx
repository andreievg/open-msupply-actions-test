import React, { FC, useEffect } from 'react';

import {
  AppFooterPortal,
  Box,
  DetailPanel,
  AppFooter,
  Routes,
  Route,
  RouteBuilder,
  Navigate,
  useLocation,
  useHostContext,
  useGetPageTitle,
  useAuthContext,
  useNotification,
  useTranslation,
  SnackbarProvider,
  BarcodeScannerProvider,
} from '@openmsupply-client/common';
import { AppDrawer, AppBar, Footer, NotFound } from './components';
import { CommandK } from './CommandK';
import { AppRoute } from '@openmsupply-client/config';
import { Settings } from './Admin/Settings';
import {
  DashboardRouter,
  CatalogueRouter,
  DistributionRouter,
  ReplenishmentRouter,
  InventoryRouter,
} from './routers';
import { RequireAuthentication } from './components/Navigation/RequireAuthentication';
import { QueryErrorHandler } from './QueryErrorHandler';
import { Sync } from './components/Sync';

const NotifyOnLogin = () => {
  const { success } = useNotification();
  const { store, storeId } = useAuthContext();
  const { name } = store || {};
  const t = useTranslation('app');
  useEffect(() => {
    if (!!name) success(t('login.store-changed', { store: name }))();
  }, [storeId]);

  return <></>;
};

export const Site: FC = () => {
  const location = useLocation();
  const getPageTitle = useGetPageTitle();
  const { setPageTitle } = useHostContext();

  useEffect(() => {
    setPageTitle(getPageTitle(location.pathname));
  }, [location]);

  return (
    <RequireAuthentication>
      <CommandK>
        <SnackbarProvider maxSnack={3}>
          <BarcodeScannerProvider>
            <AppDrawer />
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <AppBar />
              <NotifyOnLogin />
              <Box display="flex" flex={1} overflow="auto">
                <Routes>
                  <Route
                    path={RouteBuilder.create(AppRoute.Dashboard)
                      .addWildCard()
                      .build()}
                    element={<DashboardRouter />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Catalogue)
                      .addWildCard()
                      .build()}
                    element={<CatalogueRouter />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Distribution)
                      .addWildCard()
                      .build()}
                    element={<DistributionRouter />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Replenishment)
                      .addWildCard()
                      .build()}
                    element={<ReplenishmentRouter />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Inventory)
                      .addWildCard()
                      .build()}
                    element={<InventoryRouter />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Admin)
                      .addWildCard()
                      .build()}
                    element={<Settings />}
                  />
                  <Route
                    path={RouteBuilder.create(AppRoute.Sync)
                      .addWildCard()
                      .build()}
                    element={<Sync />}
                  />

                  <Route
                    path="/"
                    element={
                      <Navigate
                        replace
                        to={RouteBuilder.create(AppRoute.Dashboard).build()}
                      />
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
              <AppFooter />
              <AppFooterPortal SessionDetails={<Footer />} />
            </Box>
            <DetailPanel />
            <QueryErrorHandler />
          </BarcodeScannerProvider>
        </SnackbarProvider>
      </CommandK>
    </RequireAuthentication>
  );
};
