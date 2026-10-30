import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/auth-context";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isAdmin, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/word-manager');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'register') {
      const { error, isFirstAdmin } = await signUp(email, password);
      setLoading(false);
      if (error) {
        toast.error('Kayıt başarısız: ' + error.message);
      } else if (isFirstAdmin) {
        toast.success('Admin hesabı oluşturuldu!');
      } else {
        toast.info('Hesap oluşturuldu ancak admin yetkisi atanamadı (zaten bir admin mevcut).');
      }
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        toast.error('Giriş başarısız: ' + error.message);
      } else {
        toast.success('Giriş başarılı');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-foreground">Admin Girişi</h1>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              className={`flex-1 py-1.5 rounded-lg text-sm font-display font-bold transition-all ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setMode('login')}
            >
              Giriş Yap
            </button>
            <button
              className={`flex-1 py-1.5 rounded-lg text-sm font-display font-bold transition-all ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setMode('register')}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">E-posta</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-display font-bold text-muted-foreground">Şifre</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full font-display" disabled={loading}>
              {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>

          {user && !isAdmin && (
            <p className="text-xs text-destructive mt-3 text-center font-display">
              Bu hesap admin yetkisine sahip değil.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
