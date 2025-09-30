import React, { useState } from 'react';
import { City, TouristSpot, Itinerary } from '../types';
import { generateItinerary } from '../services/geminiService';
import LoadingIndicator from './LoadingSpinner';
import { ShareIcon, CopyIcon } from '../constants';

interface PlanPageProps {
  city: City;
  selectedSpots: TouristSpot[];
  itinerary: Itinerary | null;
  onPlanGenerated: (itinerary: Itinerary) => void;
  onNavigateToTracker: () => void;
  onNavigateToBookGuide: () => void;
  isSharedView: boolean;
}

const PlanPage: React.FC<PlanPageProps> = ({ city, selectedSpots, itinerary, onPlanGenerated, onNavigateToTracker, onNavigateToBookGuide, isSharedView }) => {
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]));
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  const toggleDay = (day: number) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(day)) {
      newOpenDays.delete(day);
    } else {
      newOpenDays.add(day);
    }
    setOpenDays(newOpenDays);
  };

  const handleShare = () => {
    setCopyButtonText('Copy Link');
    setIsShareModalOpen(true);
  };

  const generateShareLink = () => {
    if (!itinerary) return '';
    const planJson = JSON.stringify(itinerary);
    // Unicode-safe base64 encoding
    const encodedPlan = btoa(
        encodeURIComponent(planJson).replace(/%([0-9A-F]{2})/g, (match, p1) =>
            String.fromCharCode(Number(`0x${p1}`))
        )
    );
    return `${window.location.origin}${window.location.pathname}?plan=${encodeURIComponent(encodedPlan)}`;
  };

  const handleCopyLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    });
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    const result = await generateItinerary(city.name, days, selectedSpots, startDate);
    setIsLoading(false);
    if (result) {
      onPlanGenerated(result);
    } else {
      setError("Sorry, I couldn't create a plan right now. The AI might be busy. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-12 glass-card rounded-lg shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Crafting your perfect journey...</h2>
        <p className="text-slate-400 mb-8">Our AI is exploring the best routes, finding hidden gems, and scheduling your adventure. This might take a moment.</p>
        <LoadingIndicator />
      </div>
    );
  }

  if (itinerary) {
    const shareLink = generateShareLink();
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="printable-container">
          <div className="printable-area">
            <h2 className="text-4xl font-poppins font-extrabold text-center mb-4 gradient-text gradient-text-print">{itinerary.tripTitle}</h2>
            <div className="space-y-8 mt-8">
              {itinerary.dailyPlans.map((plan) => {
                const isOpen = openDays.has(plan.day);
                return(
                <div key={plan.day} className="day-plan-container flex flex-col md:flex-row items-start gap-6">
                  <div className="day-indicator-print flex items-center justify-center p-1.5 gradient-bg rounded-full w-20 h-20 shrink-0 shadow-lg shadow-purple-500/20">
                    <div className="bg-slate-900 w-full h-full rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-bold text-xl text-slate-300">Day</div>
                          <div className="text-3xl font-extrabold text-slate-100">{plan.day}</div>
                        </div>
                    </div>
                  </div>
                  <div className="glass-card p-0 rounded-xl shadow-md w-full plan-card-print overflow-hidden">
                    <button onClick={() => toggleDay(plan.day)} className="flex justify-between items-center w-full text-left p-6 hover:bg-slate-800/20 transition-colors">
                      <h3 className="text-2xl font-bold text-slate-100 mb-0">{plan.title}</h3>
                      <svg className={`chevron-icon ${isOpen ? 'open' : ''} h-6 w-6 text-slate-400 shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className={`day-content ${isOpen ? 'open' : ''}`}>
                      <div className="px-6 pb-6 pt-0">
                          <div className="space-y-4 border-t border-slate-700/50 pt-4">
                            {plan.activities.map((activity, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="font-semibold gradient-text w-32 shrink-0">{activity.time}</div>
                                <div>
                                  <p className="font-semibold text-slate-200">{activity.location}</p>
                                  <p className="text-slate-400">{activity.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {plan.specialEvent && (
                            <div className="mt-6 border-t pt-4 border-slate-700 border-dashed">
                              <h4 className="font-bold text-lg text-purple-400 mb-2">✨ Special Evening Event</h4>
                              <p className="font-semibold text-slate-200">{plan.specialEvent.name} at {plan.specialEvent.location}</p>
                              <p className="text-slate-400">{plan.specialEvent.details}</p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
        
        {!isSharedView && (
            <div className="no-print mt-12 text-center space-y-4">
                <h3 className="text-2xl font-bold text-slate-200">Next Steps</h3>
                <div className="flex justify-center flex-wrap gap-4 p-4 glass-card rounded-lg mt-4">
                    <button onClick={handleShare} className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition duration-150 flex items-center gap-2">
                        <ShareIcon className="h-5 w-5" /> Share Plan
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition duration-150">
                        Print / Save as PDF
                    </button>
                    <button onClick={onNavigateToBookGuide} className="bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition duration-150">
                        Book a Local Guide
                    </button>
                    <button onClick={onNavigateToTracker} className="gradient-bg text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition duration-150 transform hover:scale-105">
                        Start Journey Tracker
                    </button>
                </div>
            </div>
        )}
        
        {isShareModalOpen && (
            <div className="share-modal-overlay no-print" onClick={() => setIsShareModalOpen(false)}>
                <div className="glass-card rounded-lg shadow-xl p-8 max-w-lg w-full m-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-slate-100 mb-2">Share Your Itinerary</h3>
                    <p className="text-slate-400 mb-6">Anyone with this link will be able to view a read-only version of your plan.</p>
                    <div className="relative">
                        <input type="text" readOnly value={shareLink} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 pr-28 text-slate-300" />
                        <button onClick={handleCopyLink} className="absolute right-2 top-1/2 -translate-y-1/2 gradient-bg text-white font-bold py-1.5 px-3 rounded-md text-sm flex items-center gap-1.5 hover:opacity-90 transition">
                            <CopyIcon className="h-4 w-4"/>
                            {copyButtonText}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center glass-card p-8 rounded-xl shadow-lg no-print">
      <h2 className="text-3xl font-bold mb-4 text-slate-100">Final Step!</h2>
      <p className="text-slate-400 mb-8">Configure your adventure in {city.name}.</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Trip duration</label>
            <div className="flex items-center justify-center space-x-2">
                <button onClick={() => setDays(d => Math.max(1, d - 1))} className="bg-slate-800 w-10 h-10 rounded-full font-bold text-xl hover:bg-slate-700">-</button>
                <span className="text-4xl font-bold w-20 text-center">{days} days</span>
                <button onClick={() => setDays(d => d + 1)} className="bg-slate-800 w-10 h-10 rounded-full font-bold text-xl hover:bg-slate-700">+</button>
            </div>
        </div>
        <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-1">Start date</label>
            <input 
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-slate-700 bg-slate-800 rounded-lg p-2 text-center text-slate-200"
            />
        </div>
      </div>
      
      {selectedSpots.length > 0 ? (
        <p className="text-slate-400 mb-8">Your plan will be built around your selections: {selectedSpots.map(s => s.name).join(', ')}</p>
      ) : (
        <p className="text-slate-400 mb-8">This will be a general plan based on popular attractions in {city.name}.</p>
      )}

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex justify-center">
        <button onClick={handleGeneratePlan} className="gradient-bg text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition duration-150 transform hover:scale-105">Generate My Plan</button>
      </div>
    </div>
  );
};

export default PlanPage;