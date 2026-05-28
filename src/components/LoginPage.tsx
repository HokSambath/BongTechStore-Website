import React from 'react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Key, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const { signInGoogle, currentUser, isFirebaseActive } = useAuthOrder();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = '/'; // Redirect to Home page as requested

  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setIsSignUp(searchParams.get('signup') === 'true');
  }, [searchParams]);

  useEffect(() => {
    if (currentUser) {
      const checkRealSessionAndNavigate = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate(redirect);
        }
      };
      checkRealSessionAndNavigate();
    }
  }, [currentUser, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setSuccessMsg('');
    setWorking(true);

    try {
      if (isSignUp) {
        if (!name || !phone) {
          setErrorMsg('Please specify your name and phone number for shipping.');
          setWorking(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone
            }
          }
        });
        if (error) throw error;

        // Force user to be logged out to prevent auto-login
        if (data?.session) {
          await supabase.auth.signOut();
        }

        // Set success message for the prefilled Sign-In page
        setSuccessMsg('Your account has been created. Please check your email and verify your address before logging in.');
        
        // Clear sensitive inputs but preserve the email
        setPassword('');
        setName('');
        setPhone('');

        // Clean query parameters and switch tab natively
        navigate('/login', { replace: true });
        setWorking(false);
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          // Transparently register and log in the user if their credentials aren't found in Supabase yet
          if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found')) {
            const signupRes = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  name: email.split('@')[0],
                  phone: ''
                }
              }
            });
            if (signupRes.error) throw signupRes.error;

            if (!signupRes.data?.session) {
              setSuccessMsg('Check your email and confirm your account before logging in.');
              setWorking(false);
              return;
            }
          } else {
            throw error;
          }
        } else {
          if (!data?.session) {
            setErrorMsg('Authentication succeeded but no active session was established.');
            setWorking(false);
            return;
          }
        }
      }
      navigate(redirect);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication issue. Check details and retry.');
    } finally {
      setWorking(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setWorking(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google login was interrupted or declined.');
      setWorking(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen section-container flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
        
        {/* Toggle Mode */}
        <div className="flex border-b border-border mb-6">
          <button 
            type="button"
            onClick={() => { navigate('/login', { replace: true }); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider border-b-2 text-center transition-all ${!isSignUp ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim'}`}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => { navigate('/login?signup=true', { replace: true }); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider border-b-2 text-center transition-all ${isSignUp ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim'}`}
          >
            Create Account
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gradient">
          {isSignUp ? 'Join Bong Tech Store' : 'Welcome Back Gamer'}
        </h2>
        <p className="text-xs text-text-dim mb-6">
          {isSignUp ? 'Create your user account to track pending orders and save delivery parameters.' : 'Log in to checkout and review order statuses.'}
        </p>

        {/* Form Notifications & Feedback coordinates located above the form */}
        {successMsg && (
          <div className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 rounded p-3 mb-6 font-bold">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded p-3 mb-6 font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Email Coordinates *</label>
            <input 
              type="email" 
              required
              placeholder="e.g. sambath@gmail.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none"
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sambath Hok" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Shipping Phone *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. 0767676887" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Secure Password *</label>
            <input 
              type="password" 
              required
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-card border border-border rounded p-2.5 text-xs text-white focus:border-brand-primary outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={working}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-6 font-bold uppercase tracking-wider text-xs"
          >
            {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            {working ? 'Processing...' : isSignUp ? 'Create Profile' : 'Enter Store'}
          </button>
        </form>

        {true && (
          <>
            <div className="relative text-center my-6">
              <span className="absolute inset-x-0 top-1/2 h-px bg-border -z-10" />
              <span className="bg-[#151619] px-3 text-[10px] text-text-dim font-black uppercase tracking-widest">Or Continue with</span>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={working}
              className="w-full bg-white hover:bg-zinc-100 text-bg-dark flex items-center justify-center gap-2 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.67 0 3.14.58 4.3 1.69l3.22-3.23C17.58 1.6 15 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.7 8.92 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.51h6.46c-.28 1.48-1.11 2.73-2.34 3.56v2.96h3.78c2.22-2.04 3.6-5.04 3.6-8.68z"/>
                <path fill="#FBBC05" d="M5.36 14.5A7.14 7.14 0 0 1 5 12c0-.87.15-1.72.41-2.5L1.5 6.5C.54 8.5 0 10.75 0 12s.54 3.5 1.5 5.5l3.86-3z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.78-2.96c-1.07.72-2.45 1.15-4.15 1.15-3.08 0-5.73-2.66-6.64-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z"/>
              </svg>
              Google Account
            </button>
          </>
        )}


      </motion.div>
    </div>
  );
}
