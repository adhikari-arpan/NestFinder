import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import { LoadingScreen } from './ui/LoadingScreen';

// Blocks a route from guests. Waits for the initial session check
// (authLoading) before deciding, otherwise a logged-in user reloading the
// page would get bounced to /auth for a moment before their session loads.
export const RequireAuth = ({ children }) => {
  const { currentUser, authLoading } = useContext(AppContext);

  if (authLoading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/auth" replace />;
  return children;
};
