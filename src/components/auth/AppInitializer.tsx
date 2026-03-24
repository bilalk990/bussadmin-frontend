import  { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import SplashScreen from './SplashScreen';

const AppInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      // Skip initialization if we're already on the splash screen or login page
      if (location.pathname === '/' || location.pathname === '/login') {
        setIsInitializing(false);
        return;
      }

      try {
        const token = authService.getToken();
        if (!token) {
          navigate('/login');
          setIsInitializing(false);
          return;
        }

        // Check if token is expired using isAuthenticated (client-side only)
        if (!authService.isAuthenticated()) {
          authService.removeToken();
          navigate('/login');
          setIsInitializing(false);
          return;
        }

        // Token is valid on client side, allow access
        setIsInitializing(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.removeToken();
        navigate('/login');
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [navigate, location]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  return null;
};

export default AppInitializer; 