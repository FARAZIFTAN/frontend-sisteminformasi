import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';
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
  const [submitted, setSubmitted] = useState(false);
  
  const { login, isLoading } = useAuth();
  const { addAlert } = useAlert();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Silakan masukkan email Anda.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid. Contoh: user@email.com';
    }
    if (!password) {
      newErrors.password = 'Silakan masukkan password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
      console.error('Login error:', error);
      addAlert({
        type: 'error',
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/30 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-orange-300/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse-gentle"></div>
      </div>
      
      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center animate-fadeIn">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-200 transform rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-110 mb-8">
            <GraduationCap className="text-white text-4xl" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Masuk ke <span className="text-orange-600 font-bold">ULBI UKM System</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Kelola kegiatan UKM dengan mudah dan efisien
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 animate-slideIn">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                error={submitted ? errors.email : undefined}
                leftIcon={<Mail className="h-5 w-5" />}
                required
              />
              {submitted && errors.email && (
                <div className="flex items-center mt-1 text-xs text-red-600 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                error={submitted ? errors.password : undefined}
                leftIcon={<Lock className="h-5 w-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-orange-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
              >
                Lupa password?
              </button>
            </div>

            <Button
              type="submit"
              size="md"
              loading={isLoading}
              className="w-full"
              icon={<LogIn className="h-5 w-5" />}
            >
              {isLoading ? 'Masuk...' : 'Masuk ke Sistem'}
            </Button>
          </form>

        </div>

        {/* Register Link */}
        <div className="text-center animate-fadeIn">
          <p className="text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200 hover:underline"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 animate-fadeIn">
          <p>© 2025 ULBI Campus. All rights reserved.</p>
          <p className="mt-1">Sistem Informasi Manajemen UKM v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;