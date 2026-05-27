import { useAuthOrder, Order } from '../contexts/AuthOrderContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle, XCircle, Clock, 
  DollarSign, TrendingUp, AlertCircle, ShoppingCart, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';

export default function AdminPage() {
  const { orders, currentUser, updateOrderStatus, loadAllOrdersForAdmin, logOutUser } = useAuthOrder();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Lock Admin access to staff & admin only
  useEffect(() => {
    let active = true;

    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session) {
        navigate('/admin/signin');
        return;
      }

      if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'staff') {
        navigate('/');
        return;
      }
    };

    checkAuthAndRedirect();

    let unsubscribe: any;
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
      unsubscribe = loadAllOrdersForAdmin();
    }

    return () => {
      active = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser, navigate]);

  const handleUpdateStatus = async (orderId: string, status: 'confirmed' | 'cancelled') => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, status);
    } catch (err) {
      alert('Error updating status: ' + err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  };

  // Stats calculation
  const calculateStats = () => {
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
    
    const earnings = orders
      .filter(o => o.status === 'confirmed')
      .reduce((sum, o) => {
        const val = parseFloat(o.totalPrice.replace('$', ''));
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

    return { totalCount, pendingCount, confirmedCount, earnings };
  };

  const stats = calculateStats();

  return (
    <div className="pt-32 pb-20 min-h-screen section-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gradient uppercase tracking-tight flex items-center gap-3">
            <ClipboardList size={30} className="text-brand-primary" />
            Admin Order Board
          </h1>
          <p className="text-xs text-text-dim mt-1">
            Logged in as: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role.toUpperCase()})
          </p>
        </div>

        <button 
          onClick={async () => {
            await logOutUser();
            navigate('/');
          }}
          className="flex items-center gap-1.5 text-xs font-black uppercase text-red-400 hover:text-red-500 hover:bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded transition-all"
        >
          <LogOut size={14} />
          Sign Out Portal
        </button>
      </div>

      {/* Grid Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
            Confirmed Revenue <TrendingUp size={14} className="text-green-400" />
          </div>
          <div className="text-2xl font-black text-brand-primary">${stats.earnings.toFixed(2)}</div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
            Active Orders <ShoppingCart size={14} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalCount}</div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
            Pending Checks <Clock size={14} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400">{stats.pendingCount}</div>
        </div>

        <div className="glass-card p-4 relative overflow-hidden">
          <div className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
            Confirmed Deliveries <CheckCircle size={14} className="text-green-400" />
          </div>
          <div className="text-2xl font-black text-green-400">{stats.confirmedCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${filter === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-dim'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table & List */}
      {getFilteredOrders().length === 0 ? (
        <div className="glass-card p-12 text-center">
          <AlertCircle size={32} className="text-text-dim mx-auto mb-2" />
          <h2 className="text-sm font-bold text-white">No orders matching "{filter}"</h2>
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredOrders().map((order) => {
            const dateStr = typeof order.createdAt === 'object' && order.createdAt?.toDate 
              ? order.createdAt.toDate().toLocaleString() 
              : new Date(order.createdAt).toLocaleString();

            return (
              <motion.div 
                layout
                key={order.id}
                className="glass-card p-5 flex flex-col md:flex-row justify-between relative overflow-hidden gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[10px] font-black text-zinc-500 font-mono">ID: {order.id.slice(0, 8).toUpperCase()}...</span>
                    <span className="text-xs font-black text-white">{order.customerName}</span>
                    <span className="text-xs text-text-dim font-mono">{order.customerPhone}</span>
                  </div>

                  {/* Order items info banner */}
                  <div className="pl-4 border-l border-zinc-800 space-y-1 my-3">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="text-xs text-zinc-400">
                        <strong className="text-brand-primary">{it.quantity}x</strong> {it.productName} 
                        {it.color && <span className="text-[10px] text-zinc-500 ml-1">({it.color})</span>}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-zinc-500">
                    Received: {dateStr}
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border gap-4">
                  <div className="flex flex-col items-end">
                    <div className="text-xs text-text-dim uppercase tracking-wider font-bold">Total price</div>
                    <div className="text-base font-black text-brand-primary">{order.totalPrice}</div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' ? (
                      <>
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-black font-black text-[10px] uppercase rounded flex items-center gap-1 transition-all"
                        >
                          <CheckCircle size={12} />
                          Confirm
                        </button>
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase rounded flex items-center gap-1 transition-all"
                        >
                          <XCircle size={12} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded border ${order.status === 'confirmed' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5'}`}>
                        {order.status === 'confirmed' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
