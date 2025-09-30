import React, { useState, useEffect } from 'react';
import { Country, State, CityInfo } from '../types';
import { getCountries, getStates, getTopCities } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import { SearchIcon } from '../constants';
import ImageWithFallback from './ImageWithFallback';

interface DestinationPageProps {
  onSelectCity: (city: { name: string; country: string }) => void;
}

type SelectionStep = 'country' | 'state' | 'city';

const DestinationPage: React.FC<DestinationPageProps> = ({ onSelectCity }) => {
  const [step, setStep] = useState<SelectionStep>('country');
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<CityInfo[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      const fetchedCountries = await getCountries();
      if (fetchedCountries) {
        setCountries(fetchedCountries);
      } else {
        setError('Could not load countries. Please refresh the page.');
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country);
    setStep('state');
    setIsLoading(true);
    setError(null);
    const fetchedStates = await getStates(country.name);
    if (fetchedStates) {
      setStates(fetchedStates);
    } else {
      setError(`Could not load states for ${country.name}. Please try again.`);
    }
    setIsLoading(false);
  };

  const handleSelectState = async (state: State) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setStep('city');
    setIsLoading(true);
    setError(null);
    const fetchedCities = await getTopCities(state.name, selectedCountry.name);
    if (fetchedCities) {
      setCities(fetchedCities);
    } else {
      setError(`Could not load cities for ${state.name}. Please try again.`);
    }
    setIsLoading(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()){
      const parts = searchTerm.split(',').map(p => p.trim());
      const cityName = parts[0];
      const countryName = parts[1] || '';
      onSelectCity({ name: cityName, country: countryName });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      const skeletonCount = step === 'city' ? 6 : 18;
      const gridClass = step === 'city'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          : "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4";

      return (
          <div className={gridClass}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                  <SkeletonLoader key={i} className={step === 'city' ? 'h-80' : 'h-12'} />
              ))}
          </div>
      );
    }
    if (error) {
      return <p className="text-center text-red-400 mt-16">{error}</p>;
    }
    switch (step) {
      case 'country':
      case 'state':
        const items = step === 'country' ? countries : states;
        const handler = step === 'country' ? handleSelectCountry : handleSelectState;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item: any) => (
              <button key={item.code || item.name} onClick={() => handler(item)} 
                className="p-3 text-center text-slate-300 bg-slate-800/70 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-700/80 transition-all duration-200 transform hover:-translate-y-1">
                {item.name}
              </button>
            ))}
          </div>
        );
      case 'city':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <div key={city.name} onClick={() => onSelectCity(city)} 
                   className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500/20">
                <ImageWithFallback src={city.image} alt={city.name} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-orange-500/70 transition-shadow duration-300 rounded-lg"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-3xl font-bold font-poppins">{city.name}</h3>
                  <p className="text-lg">{city.country}</p>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  const getBreadcrumbs = () => {
      let crumbs = [<button key="home" onClick={() => setStep('country')} className="hover:text-orange-400">Countries</button>];
      if(step === 'state' || step === 'city') {
          crumbs.push(<span key="sep1" className="mx-2 text-slate-500">&gt;</span>);
          crumbs.push(<button key="country" onClick={() => setStep('state')} className="hover:text-orange-400">{selectedCountry?.name}</button>);
      }
      if(step === 'city' && selectedState) {
          crumbs.push(<span key="sep2" className="mx-2 text-slate-500">&gt;</span>);
          crumbs.push(<span key="state" className="font-semibold text-slate-200">{selectedState.name}</span>);
      }
      return <div className="text-slate-400 mb-4">{crumbs}</div>
  }

  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-poppins font-bold text-center mb-4 text-slate-100">Choose Your Destination</h2>
      <p className="text-center text-slate-400 mb-8">Select a destination below or search directly to begin your adventure.</p>
      
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 relative">
        <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., 'Paris, France'"
            className="w-full pl-5 pr-14 py-3 bg-slate-800/80 border border-slate-700 rounded-full text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
        />
        <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 gradient-bg text-white rounded-full hover:opacity-90 transition-opacity">
            <SearchIcon className="h-5 w-5"/>
        </button>
      </form>
      
      {step !== 'country' && getBreadcrumbs()}
      {renderContent()}
    </div>
  );
};

export default DestinationPage;