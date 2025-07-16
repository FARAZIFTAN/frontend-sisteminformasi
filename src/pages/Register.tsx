import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ukm: ''
  });
  const [ukmOptions, setUkmOptions] = useState<{ value: string; label: string }[]>([{ value: '', label: 'Pilih UKM' }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register, isLoading } = useAuth();
  const { addAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch kategori dari backend
    fetch('http://localhost:3000/kategori')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUkmOptions([
            { value: '', label: 'Pilih UKM' },
            ...data.map((k: any) => ({ value: k.nama_kategori, label: k.nama_kategori }))
          ]);
        }
      });
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    
    if (!formData.ukm) {
      newErrors.ukm = 'UKM harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        ukm: formData.ukm
      });
      if (success) {
        addAlert({
          type: 'success',
          message: 'Registrasi berhasil! Silakan login untuk melanjutkan.'
        });
<<<<<<< HEAD
        onSwitchToLogin();
=======
        navigate('/login');
>>>>>>> ba533139672ecbe1cbddce77fc76c7a8128d2ec2
      } else {
        addAlert({
          type: 'error',
          message: 'Registrasi gagal. Silakan coba lagi.'
        });
      }
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-200 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <GraduationCap className="text-white text-3xl" />
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Bergabung
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Daftar Akun UKM ULBI
          </p>
          <p className="text-orange-600 font-semibold">
            Mulai perjalanan organisasi Anda
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-lg py-8 px-8 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Nama Lengkap"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              placeholder="Masukkan nama lengkap"
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              placeholder="nama@ulbi.ac.id"
              required
            />
            
            <Select
              label="UKM"
              value={formData.ukm}
              onChange={(e) => handleInputChange('ukm', e.target.value)}
              error={errors.ukm}
              required
              options={ukmOptions}
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                placeholder="Minimal 6 karakter"
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
            
            <div className="relative">
              <Input
                label="Konfirmasi Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Ulangi password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-11 text-gray-400 hover:text-orange-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              size="lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Daftar Sekarang
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold text-orange-600 hover:text-orange-500 transition-colors hover:underline"
              >
                Masuk sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;