'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion');
      } else {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Ajout
        // Redirection selon le rôle
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'client') {
          router.push('/client/dashboard');
        } else {
          router.push('/'); // fallback
        }
      }
    } catch {
      setError('Erreur réseau ou serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Titre */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo ProTrack"
            width={100}
            height={100}
            className="mx-auto mb-4"
            priority
          />
          <p className="text-gray-400">Connectez-vous à votre espace</p>
        </div>

        {/* Formulaire de connexion */}
        <form className="bg-gray-800 rounded-lg shadow-xl p-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Sélection du rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.role === 'admin'
                      ? 'bg-red-900 text-white border-2 border-red-700'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  Administrateur
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('client')}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.role === 'client'
                      ? 'bg-red-900 text-white border-2 border-red-700'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <User className="w-4 h-4 mx-auto mb-1" />
                  Client
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-800 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Lien vers la page d'inscription */}
            <Link
              href="/register"
              className="text-sm text-gray-400 hover:text-white transition-colors block text-center mt-2"
            >
              Nouveau ? Créer un compte
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2025 Administration Dashboard. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}