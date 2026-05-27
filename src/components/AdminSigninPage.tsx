import React from 'react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ShieldAlert, LogIn, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';

export default function AdminSigninPage() {
  const { currentUser } = useAuthOrder();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        navigate('/admin');
      } else {
        setErrorMsg('Unauthorized: Placed in customer user-state. Sign out or re-login.');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setWorking(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        // Transparently register and authorize staff/admin test user if credentials aren't found in Supabase yet
        if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('user not found')) {
          const signupRes = await supabase.auth.signUp({
            email,
            password
          });
          if (signupRes.error) throw signupRes.error;
        } else {
          throw error;
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Staff login credentials unrecognized.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen section-container flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-sm w-full p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
        
        <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6 border border-brand-primary/20 mx-auto">
          <Key size={20} />
        </div>

        <h2 className="text-xl font-bold mb-2 text-center uppercase tracking-tight text-white">Staff Login Portal</h2>
        <p className="text-xs text-text-dim mb-6 text-center">
          Security clearance required to view and manage customer purchase orders.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Administrative Email</label>
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="developer@bongtech.cc" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-card border border-border rounded p-2.5 pl-8 text-xs text-white focus:border-brand-primary outline-none"
              />
              <Mail size={12} className="absolute left-2.5 top-3.5 text-zinc-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1 font-mono">Secure Access Code</label>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-border rounded p-2.5 pl-8 text-xs text-white focus:border-brand-primary outline-none"
              />
              <Key size={12} className="absolute left-2.5 top-3.5 text-zinc-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={working}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-6 font-bold uppercase tracking-wider text-xs"
          >
            <LogIn size={14} />
            {working ? 'Verifying Authorization...' : 'Authenticate'}
          </button>
        </form>

        {errorMsg && (
          <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded p-3 mt-4 font-bold flex gap-2 items-start">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-8 border-t border-border pt-4 text-[10px] text-zinc-500 text-center leading-relaxed">
          Default Super Admin test login:<br />
          Email: <strong className="text-zinc-300">sambathhok.true@gmail.com</strong><br />
          Password: <strong className="text-zinc-300">any password</strong> (auto-created locally)
        </div>
      </motion.div>
    </div>
  );
}
