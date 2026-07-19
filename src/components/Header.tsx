import { Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-charcoal-900/95 backdrop-blur-md border-b border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-600 flex items-center justify-center">
            <Home className="w-5 h-5 text-charcoal-900" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">JujaHomes</h1>
            <p className="text-gold-400 text-xs">{profile?.role === 'landlord' ? 'Landlord Portal' : 'House Hunting'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{profile?.full_name}</p>
            <p className="text-xs text-cream-300 capitalize">{profile?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gold-600 text-charcoal-900 flex items-center justify-center font-bold text-sm">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-cream-300 hover:text-white hover:bg-charcoal-700 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
