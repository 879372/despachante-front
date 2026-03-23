import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/token/', { username, password });
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      window.location.href = '/processes';
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 font-sans">
      <Card className="w-full max-w-sm shadow-lg border-0 ring-1 ring-black/5 rounded-xl overflow-hidden">
        <div className="h-1.5 bg-indigo-600 w-full"></div>
        <CardHeader className="space-y-3 pt-8 pb-5 text-center">
          <div className="mx-auto bg-indigo-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-1">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">DespachPro</CardTitle>
          <CardDescription className="text-sm text-gray-500 max-w-xs mx-auto">
            Acesse o seu sistema de despachante.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 px-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center shadow-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">Usuário</Label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 px-3 text-sm bg-gray-50/50 border-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg"
                placeholder="Seu usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-3 text-sm bg-gray-50/50 border-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg"
                placeholder="Sua senha"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-8 px-6">
            <Button className="w-full h-11 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all" type="submit" disabled={loading}>
              {loading ? 'Validando...' : 'Entrar no Sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
