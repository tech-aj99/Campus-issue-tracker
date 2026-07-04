import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Role } from '../../types/user';
import { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

const roleRedirects: Record<Role, string> = {
  STUDENT: '/student',
  STAFF: '/staff',
  ADMIN: '/admin',
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true);
    try {
      const { user, token } = await loginApi(email, password);
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(roleRedirects[user.role]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏫</span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">CampusTrack</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@campus.edu"
            required
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600">Demo accounts:</p>
          <p>admin@campus.edu / admin123</p>
          <p>staff@campus.edu / staff123</p>
          <p>student@campus.edu / student123</p>
        </div>
      </div>
    </div>
  );
}
