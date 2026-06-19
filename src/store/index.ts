import { configureStore } from '@reduxjs/toolkit';
import authReducer          from './slices/authSlice';
import dealsReducer         from './slices/dealsSlice';
import leadsReducer         from './slices/leadsSlice';
import companiesReducer     from './slices/companiesSlice';
import ticketsReducer       from './slices/ticketsSlice';
import dashboardReducer     from './slices/dashboardSlice';
import notificationsReducer from './slices/notificationsSlice';
import usersReducer from "./slices/usersSlice";
import activityReducer from './slices/activitySlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    deals:         dealsReducer,
    leads:         leadsReducer,
    companies:     companiesReducer,
    tickets:       ticketsReducer,
    dashboard:     dashboardReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    activities: activityReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;