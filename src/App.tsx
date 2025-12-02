import { RouterProvider } from 'react-router';
import { router } from './utils/routes';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './components/AuthContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}