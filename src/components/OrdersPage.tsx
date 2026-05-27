import { useAuthOrder, Order } from '../contexts/AuthOrderContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function OrdersPage() {
  const { orders, currentUser, loading } = useAuthOrder();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuthAndRedirect();
  }, [navigate]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen section-container flex items-center justify-center text-text-dim">
        Loading orders...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-32 pb-20 min-h-screen section-container flex flex-col items-center justify-center text-center">
        <ClipboardList size={40} className="text-text-dim mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-text-dim mb-6">Please log in to view and track your purchase orders.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Log In Now
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen section-container">
      <h1 className="text-3xl font-black mb-8 text-gradient uppercase tracking-tight flex items-center gap-3">
        <ClipboardList size={28} className="text-brand-primary" />
        My Purchase Orders
      </h1>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-zinc-900 text-text-dim rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <ClipboardList size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">No Orders Found</h2>
          <p className="text-text-dim mb-6">You haven't placed any purchase orders yet. Go add some controllers to your cart!</p>
          <button onClick={() => navigate('/product')} className="btn-primary">
            Browse Gear
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => {
            const dateStr = typeof order.createdAt === 'object' && order.createdAt?.toDate 
              ? order.createdAt.toDate().toLocaleString() 
              : new Date(order.createdAt).toLocaleString();

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
                className="glass-card p-6 relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full bg-yellow-500 ${order.status === 'confirmed' ? 'bg-green-500' : ''} ${order.status === 'cancelled' ? 'bg-red-500' : ''}`} />
                
                <div className="flex flex-col md:flex-row justify-between border-b border-border pb-4 mb-4 items-start md:items-center gap-4">
                  <div>
                    <div className="text-xs text-text-dim font-mono">ORDER ID: <span className="text-white font-bold uppercase">{order.id}</span></div>
                    <div className="text-[11px] text-text-dim mt-1">Placed on: {dateStr}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-xs font-black uppercase px-2.5 py-1 rounded border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                    <span className="text-base font-black text-brand-primary">Total: {order.totalPrice}</span>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-bg-card border border-border">Qty {item.quantity}</span>
                        <span className="text-white font-medium">{item.productName}</span>
                        {item.color && (
                          <span className="text-xs text-text-dim">({item.color})</span>
                        )}
                      </div>
                      <div className="text-text-dim font-mono">{item.price} each</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-text-dim">
                  <div>Contact phone: <strong className="text-white">{order.customerPhone.split(' | ')[0]}</strong></div>
                  <div>Delivery Zone: <strong className="text-white">Phnom Penh, Cambodia</strong></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}
