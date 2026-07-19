import { useState } from 'react';
import { Home, User, Building2, Mail, Lock, UserCircle, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'signup';
type Role = 'seeker' | 'landlord';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<Role>('seeker');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            role,
            phone: phone || null,
          });
          if (profileError) throw profileError;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream-100">
      {/* Left brand panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-950 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #c9a030 1px, transparent 1px), radial-gradient(circle at 70% 60%, #c9a030 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gold-600 flex items-center justify-center">
            <Home className="w-6 h-6 text-charcoal-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">JujaHomes</h1>
            <p className="text-gold-400 text-xs">Find your next home in Juja</p>
          </div>
        </div>

        <div className="relative z-10 my-12 lg:my-0">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mb-4">
            House hunting in Juja,<br /><span className="text-gold-400">made simple.</span>
          </h2>
          <p className="text-cream-200 text-lg max-w-md">
            Browse verified rental listings, view photos and details, and unlock landlord contact info for a small fee.
          </p>
        </div>

        <div className="relative z-10 hidden lg:flex gap-6 text-sm text-cream-300">
          <div><span className="block text-2xl font-bold text-gold-400">120+</span>Active listings</div>
          <div><span className="block text-2xl font-bold text-gold-400">8</span>Juja neighborhoods</div>
          <div><span className="block text-2xl font-bold text-gold-400">KES 100</span>Unlock fee</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex bg-cream-200 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'}`}
            >
              Sign Up
            </button>
          </div>

          <h2 className="text-2xl font-bold text-charcoal-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-charcoal-500 text-sm mb-6">
            {mode === 'login' ? 'Sign in to continue house hunting' : 'Choose your account type to get started'}
          </p>

          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'seeker' ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}
              >
                <User className={`w-6 h-6 mb-2 ${role === 'seeker' ? 'text-gold-600' : 'text-charcoal-400'}`} />
                <p className={`font-semibold text-sm ${role === 'seeker' ? 'text-charcoal-900' : 'text-charcoal-700'}`}>House Seeker</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Browse & unlock listings</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('landlord')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'landlord' ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-cream-400'}`}
              >
                <Building2 className={`w-6 h-6 mb-2 ${role === 'landlord' ? 'text-gold-600' : 'text-charcoal-400'}`} />
                <p className={`font-semibold text-sm ${role === 'landlord' ? 'text-charcoal-900' : 'text-charcoal-700'}`}>Landlord</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Post & manage listings</p>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <InputField icon={<UserCircle className="w-5 h-5" />} placeholder="Full name" value={fullName} onChange={setFullName} required />
                <InputField icon={<Phone className="w-5 h-5" />} placeholder="Phone (optional)" value={phone} onChange={setPhone} />
              </>
            )}
            <InputField icon={<Mail className="w-5 h-5" />} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
            <InputField icon={<Lock className="w-5 h-5" />} type="password" placeholder="Password" value={password} onChange={setPassword} required />

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-charcoal-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-gold-700 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon, type = 'text', placeholder, value, onChange, required,
}: {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-cream-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-100 outline-none transition-all text-charcoal-900 placeholder:text-charcoal-400 bg-white"
      />
    </div>
  );
}
