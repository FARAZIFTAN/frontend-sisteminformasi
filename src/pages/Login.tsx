import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, isLoading } = useAuth();
  const { addAlert } = useAlert();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!password) {
      newErrors.password = 'Password harus diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const success = await login(email, password);
      if (success) {
        addAlert({
          type: 'success',
          message: 'Login berhasil! Selamat datang di ULBI UKM System.'
        });
      } else {
        addAlert({
          type: 'error',
          message: 'Email atau password salah. Silakan coba lagi.'
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-200 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <GraduationCap className="text-white text-3xl" />
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Selamat Datang
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Sistem Informasi Kegiatan UKM
          </p>
          <p className="text-orange-600 font-semibold">
            Universitas Logistik dan Bisnis Internasional
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg py-10 px-8 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="nama@ulbi.ac.id"
                required
              />
            </div>
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-orange-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              size="lg"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Masuk ke Sistem
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-800 font-medium mb-2">Demo Akun:</p>
            <div className="space-y-1 text-xs text-orange-700">
              <p><span className="font-medium">Admin:</span> admin@ulbi.ac.id</p>
              <p><span className="font-medium">User:</span> mahasiswa@ulbi.ac.id</p>
              <p><span className="font-medium">Password:</span> password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;