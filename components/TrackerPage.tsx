import React, { useState, useEffect } from 'react';
import LoadingIndicator from './LoadingSpinner';

interface Position {
  coords: {
    latitude: number;
    longitude: number;
  };
}

const TrackerPage: React.FC = () => {
  const [location, setLocation] = useState<Position | null>(null);
  const [status, setStatus] = useState('Initializing tracker...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStatus('Tracker Unavailable');
      return;
    }

    setStatus('Getting your location...');
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setStatus('You are on track! Enjoy your journey.');
        setError(null);
      },
      () => {
        setError('Unable to retrieve your location. Please grant permission and try again.');
        setStatus('Location Access Denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center glass-card p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-green-400">Journey Tracker Active</h2>
      <p className="text-slate-400 mb-8">We're here to make sure you're on the right path. Your location will be updated in real-time.</p>

      <div className="bg-slate-900/70 p-6 rounded-lg min-h-[150px] flex flex-col justify-center items-center">
        {!location && !error && <LoadingIndicator />}
        <p className={`text-xl font-semibold mb-2 ${error ? 'text-red-400' : 'text-slate-200'}`}>
          {status}
        </p>
        {location && (
          <p className="text-slate-400">
            Current Position: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </p>
        )}
         {error && (
          <p className="text-red-400 mt-2">
            {error}
          </p>
        )}
      </div>
      <p className="text-sm text-slate-500 mt-4">
        You can now navigate back to your itinerary using the back arrow in the header.
      </p>
    </div>
  );
};

export default TrackerPage;