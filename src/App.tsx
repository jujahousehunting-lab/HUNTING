import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import SeekerDashboard from './pages/SeekerDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import Header from './components/Header';

function AppContent() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
      </div>
    );
  }

  if (!session || !profile) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <Header />
      {profile.role === 'landlord' ? <LandlordDashboard /> : <SeekerDashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
