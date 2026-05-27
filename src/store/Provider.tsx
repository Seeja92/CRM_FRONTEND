'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { loadAuthFromStorage } from './slices/authSlice';

function AuthLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadAuthFromStorage());
  }, []);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader>
        {children}
      </AuthLoader>
    </Provider>
  );
}