import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi } from '../../api/authApi';
import { validateInviteToken, registerWithToken } from '../../api/inviteApi';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Role } from '../../types/user';
import { useState, useEffect } from 'react';

interface StudentRegisterForm {
  name: string;
  email: string;
  password: string;
}

interface StaffRegisterForm {
  name: string;
  password: string;
}

interface TokenInfo {
  email: string;
  name: string;
  role: string;
}

const roleRedirects: Record<Role, string> = {
  STUDENT: '/student',
  STAFF: '/staff',
  ADMIN: '/admin',
};

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const inviteToken = searchParams.get('token');

  // Student registration form
  const {
    register: registerStudent,
    handleSubmit: handleStudentSubmit,
    formState: { errors: studentErrors },
  } = useForm<StudentRegisterForm>();

  // Staff registration form (name + password only; email & role locked)
  const {
    register: registerStaff,
    handleSubmit: handleStaffSubmit,
    formState: { errors: staffErrors },
    setValue: setStaffValue,
  } = useForm<StaffRegisterForm>();

  // Validate invite token on mount if present
  useEffect(() => {
    if (!inviteToken) return;
    setTokenLoading(true);
    validateInviteToken(inviteToken)
      .then((info) => {
        setTokenInfo(info);
        setStaffValue('name', info.name);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'This invite link is invalid or has expired. Contact your administrator.';
        setTokenError(msg);
      })
      .finally(() => setTokenLoading(false));
  }, [inviteToken, setStaffValue]);

  // Student submit
  const onStudentSubmit = async ({ name, email, password }: StudentRegisterForm) => {
    setLoading(true);
    try {
      const { user, token } = await registerApi(name, email, password, 'STUDENT');
      login(user, token);
      toast.success('Account created!');
      navigate(roleRedirects[user.role]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Staff submit via invite token
  const onStaffSubmit = async ({ name, password }: StaffRegisterForm) => {
    if (!inviteToken) return;
    setLoading(true);
    try {
      const { user, token } = await registerWithToken(inviteToken, name, password);
      login(user, token);
      toast.success('Staff account created! Welcome aboard.');
      navigate(roleRedirects[user.role as Role]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Token loading state ──────────────────────────────────────────────────────
  if (inviteToken && tokenLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <span className="text-4xl">🔗</span>
          <p className="mt-4 text-sm text-gray-500">Validating your invite link…</p>
        </div>
      </div>
    );
  }

  // ── Token error state ────────────────────────────────────────────────────────
  if (inviteToken && tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 w-full max-w-sm text-center">
          <span className="text-4xl">❌</span>
          <h1 className="text-lg font-bold text-gray-900 mt-4">Invalid Invite Link</h1>
          <p className="text-sm text-red-600 mt-2">{tokenError}</p>
          <p className="text-sm text-gray-500 mt-4">
            Please contact your administrator for a new invite link.
          </p>
          <Link to="/login" className="mt-6 block text-indigo-600 text-sm font-medium hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── Staff registration via valid token ───────────────────────────────────────
  if (inviteToken && tokenInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🏫</span>
            <h1 className="text-xl font-bold text-gray-900 mt-2">Staff Registration</h1>
            <p className="text-sm text-gray-500 mt-1">
              You've been invited to join CampusTrack as{' '}
              <span className="font-semibold text-indigo-600">{tokenInfo.role}</span>
            </p>
          </div>

          <form onSubmit={handleStaffSubmit(onStaffSubmit)} className="space-y-4">
            {/* Email — locked from token */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email <span className="text-gray-400 text-xs">(from invite)</span>
              </label>
              <input
                type="email"
                value={tokenInfo.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Role — locked from token */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Role <span className="text-gray-400 text-xs">(from invite)</span>
              </label>
              <input
                type="text"
                value={tokenInfo.role}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Name — editable */}
            <Input
              label="Full Name"
              placeholder="Your full name"
              required
              error={staffErrors.name?.message}
              {...registerStaff('name', { required: 'Name is required' })}
            />

            {/* Password — editable */}
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              required
              error={staffErrors.password?.message}
              {...registerStaff('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Staff Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Default: student registration ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🏫</span>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Create Student Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join CampusTrack</p>
        </div>

        <form onSubmit={handleStudentSubmit(onStudentSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            required
            error={studentErrors.name?.message}
            {...registerStudent('name', { required: 'Name is required' })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@campus.edu"
            required
            error={studentErrors.email?.message}
            {...registerStudent('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            required
            error={studentErrors.password?.message}
            {...registerStudent('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
          />

          {/* Role is always STUDENT for self-registration */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500">
              Student
            </div>
            <p className="text-xs text-gray-400">
              Staff members must register via an invite link from an admin.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
