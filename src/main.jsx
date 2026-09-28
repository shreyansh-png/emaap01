import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { DataProvider } from './DataContext.jsx'

createRoot(document.querySelector(".root")).render(
  <AuthProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </AuthProvider>
);