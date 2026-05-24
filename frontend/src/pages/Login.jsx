import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../store/authSlice';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isRegister ? register(form) : login(form);
    const result = await dispatch(action);
    if (!result.error) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-indigo-900 mb-6">Persona Builder</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text" placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <input
            type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password" placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="mt-4 text-sm text-indigo-600">
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );
}
