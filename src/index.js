import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import AdminRouter from './Admin/adminRouter';
import Router from './Pages/Router/Router';
import { NotificationProvider } from './contexts/NotificationContext';

function AppRouter() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return <AdminRouter />;
  }
  // Lấy userId từ object user trong localStorage
  let userId = null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      userId = userObj.id;
    } catch (e) {
      userId = null;
    }
  }
  if (!userId) {
    return <Router />;
  }
  return (
    <NotificationProvider userId={userId}>
      <Router />
    </NotificationProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <AppRouter />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
