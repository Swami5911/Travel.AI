import React, { useState } from 'react';
import { UserIcon, CompassIcon } from '../constants';

interface LoginPageProps {
  onLogin: (user: { name: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({ name: name.trim() });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-90px)] flex items-center justify-center -m-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }}
      >
        <div className="absolute inset-0 bg-slate-900 opacity-70"></div>
      </div>
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto p-8">
        <div className="text-white">
            <div className="flex items-center space-x-3 mb-4">
                <CompassIcon className="h-12 w-12 gradient-text" />
                <h1 className="text-5xl font-poppins font-extrabold tracking-tight">AI Travel Planner</h1>
            </div>
          <p className="text-xl text-slate-300 mb-6">
            Your personal trip architect. We leverage the power of AI to build hyper-personalized travel itineraries tailored to your interests, budget, and schedule. Discover hidden gems, experience local culture, and travel smarter.
          </p>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-center"><span className="text-orange-400 mr-3">✔</span> Dynamic, date-aware event suggestions</li>
            <li className="flex items-center"><span className="text-orange-400 mr-3">✔</span> Personalized plans around your must-see spots</li>
            <li className="flex items-center"><span className="text-orange-400 mr-3">✔</span> Real-time geolocation to keep you on track</li>
          </ul>
        </div>

        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-2xl w-full border-slate-700">
          <h2 className="text-3xl font-bold text-slate-100 mb-2 text-center">Start Your Adventure!</h2>
          <p className="text-slate-400 mb-8 text-center">Enter your name to begin.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
                aria-label="Your name"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full gradient-bg text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 disabled:bg-slate-600 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out transform hover:scale-105"
            >
              Start Exploring
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;