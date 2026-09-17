import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: '260px',
          padding: '32px',
          maxWidth: '100%',
          minHeight: '100vh',
          overflow: 'auto',
          transition: 'margin-left 0.25s ease',
        }}
      >
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', borderRadius: 8 },
          success: { iconTheme: { primary: '#22c55e', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />
    </div>
  );
}
