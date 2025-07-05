import Router from './Pages/Router/Router';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  // Lấy userId từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  return (
    <div className="App">
      <NotificationProvider userId={userId}>
        <Router/>
      </NotificationProvider>
    </div>
  );
}

export default App;
