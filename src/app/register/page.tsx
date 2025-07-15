'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Globe, Briefcase, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    telephone: '',
    activite: '',
    pays: '',
    role: 'client'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Vérification des champs obligatoires
    if (!formData.nom || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création du compte');
      } else {
        setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setFormData({
          nom: '',
          email: '',
          password: '',
          telephone: '',
          activite: '',
          pays: '',
          role: 'client'
        });
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
          <h1 className="text-4xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-gray-400">Inscrivez-vous pour accéder à ProTrack</p>
        </div>

        {/* Formulaire d'inscription */}
        <form className="bg-gray-800 rounded-lg shadow-xl p-8" onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email <span className="text-red-500">*</span>
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
                Mot de passe <span className="text-red-500">*</span>
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

            {/* Téléphone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            {/* Activité */}
            <div>
              <label htmlFor="activite" className="block text-sm font-medium text-gray-300 mb-2">
                Activité
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="activite"
                  name="activite"
                  value={formData.activite}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="Secteur d'activité"
                />
              </div>
            </div>

            {/* Pays */}
            <div>
              <label htmlFor="pays" className="block text-sm font-medium text-gray-300 mb-2">
                Pays
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="pays"
                  name="pays"
                  value={formData.pays}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-colors"
                  placeholder="Pays"
                />
              </div>
            </div>

            {/* Message d'erreur ou succès */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-800 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                "S'inscrire"
              )}
            </button>

            {/* Lien vers la connexion */}
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Déjà inscrit ? Se connecter
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