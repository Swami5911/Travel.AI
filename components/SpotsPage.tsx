import React, { useState } from 'react';
import { City, TouristSpot } from '../types';
import LoadingIndicator from './LoadingSpinner';
import ImageWithFallback from './ImageWithFallback';

interface SpotsPageProps {
  city: City | null;
  cityName: string;
  isLoading: boolean;
  onSpotsSelected: (spots: TouristSpot[]) => void;
}

const SpotsPage: React.FC<SpotsPageProps> = ({ city, cityName, isLoading, onSpotsSelected }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSpot = (spotId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(spotId)) {
      newSelected.delete(spotId);
    } else {
      newSelected.add(spotId);
    }
    setSelected(newSelected);
  };

  const handleContinue = () => {
    const selectedSpots = city?.spots.filter(spot => selected.has(spot.id)) ?? [];
    onSpotsSelected(selectedSpots);
  };

  // 1. Initial loading state
  if (isLoading) {
    return (
      <div className="text-center p-12 glass-card rounded-lg shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Discovering {cityName}...</h2>
        <p className="text-slate-400 mb-8">Our AI is finding the most incredible sights and hidden gems for you. Please wait a moment.</p>
        <LoadingIndicator />
      </div>
    );
  }
  
  // 2. Hard error if city data is missing entirely after loading
  if (!city) {
     return (
      <div className="text-center p-12 glass-card rounded-lg shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Could Not Find Destination</h2>
        <p className="text-slate-400 mb-8">
          Sorry, our AI couldn't find detailed information for "{cityName}". This can happen with very specific or less common locations.
        </p>
        <p className="text-slate-400">
          Please use the back arrow to return to the destination selection and try a different city.
        </p>
      </div>
    );
  }

  // 3. Special case: City was found, but no specific spots were returned.
  if (!city.spots || city.spots.length === 0) {
    return (
      <div className="container mx-auto text-center max-w-2xl">
        <h2 className="text-4xl font-poppins font-bold mb-2">Ready to Explore <span className="gradient-text">{city.name}</span>?</h2>
        <p className="text-slate-400 mb-8">
          We couldn't pinpoint specific "must-see" attractions for this location, but that's the start of a real adventure! Our AI can create a wonderful general itinerary based on popular areas and local culture.
        </p>
        <button
          onClick={() => onSpotsSelected([])}
          className="gradient-bg text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition duration-150 transform hover:scale-105"
        >
          Create a General Plan
        </button>
      </div>
    );
  }

  // 4. Default case: Render the spots list for selection.
  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-poppins font-bold text-center mb-2">What do you want to see in <span className="gradient-text">{city.name}</span>?</h2>
      <p className="text-center text-slate-400 mb-8">Select your must-visit spots. You can also skip this and we'll create a general plan.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {city.spots.map((spot) => {
          const isSelected = selected.has(spot.id);
          return (
            <div
              key={spot.id}
              onClick={() => toggleSpot(spot.id)}
              className={`relative rounded-lg shadow-lg cursor-pointer transition-all duration-300 group ${isSelected ? 'scale-105' : 'hover:scale-105'}`}
            >
              {/* This div provides the gradient border effect via padding. */}
              <div className={`p-0.5 rounded-lg transition-all duration-300 ${isSelected ? 'gradient-bg' : ''}`}>
                {/* This is the actual content card with a solid background */}
                <div className="bg-slate-800 h-full w-full rounded-[7px] overflow-hidden">
                  <ImageWithFallback src={spot.image} alt={spot.name} className="w-full h-56 object-cover" />
                  <div className="p-4 text-white">
                    <h3 className="font-bold text-lg text-slate-200">{spot.name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">{spot.description}</p>
                  </div>
                </div>
              </div>

               {isSelected && (
                <div className="absolute top-3 right-3 gradient-bg text-white rounded-full p-1.5 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleContinue}
          className="gradient-bg text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500 transition duration-150 transform hover:scale-105"
        >
          {selected.size > 0 ? `Create Plan with ${selected.size} Spot${selected.size === 1 ? '' : 's'}` : 'Create a General Plan'}
        </button>
      </div>
    </div>
  );
};

export default SpotsPage;