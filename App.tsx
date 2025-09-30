import React, { useState, useEffect } from 'react';
import { Page, User, City, TouristSpot, Itinerary } from './types';
import { getCityInfo } from './services/geminiService';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import DestinationPage from './components/DestinationPage';
import SpotsPage from './components/SpotsPage';
import PlanPage from './components/PlanPage';
import TrackerPage from './components/TrackerPage';
import { BookGuidePage } from './components/BookGuidePage';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<TouristSpot[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isFetchingCity, setIsFetchingCity] = useState(false);
  const [initialCityName, setInitialCityName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planData = urlParams.get('plan');

    if (planData) {
      try {
        // Unicode-safe base64 decoding
        const decodedJson = decodeURIComponent(
            atob(decodeURIComponent(planData))
                .split('')
                .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join('')
        );
        const sharedItinerary: Itinerary = JSON.parse(decodedJson);
        setItinerary(sharedItinerary);
        setCurrentPage(Page.SHARED_PLAN);
      } catch (e) {
        console.error("Failed to parse shared plan data:", e);
        setCurrentPage(Page.LOGIN);
      }
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage(Page.DESTINATION);
  };

  const handleSelectCity = async (cityData: { name: string; country: string }) => {
    setIsFetchingCity(true);
    setInitialCityName(cityData.name);
    setCurrentPage(Page.SPOTS);
    const detailedCityInfo = await getCityInfo(cityData.name);
    // This check is now primarily for the state update, SpotsPage handles the null case.
    if (detailedCityInfo) {
      setSelectedCity(detailedCityInfo);
    } else {
      setSelectedCity(null);
    }
    setIsFetchingCity(false);
  };

  const handleSelectSpots = (spots: TouristSpot[]) => {
    setSelectedSpots(spots);
    setCurrentPage(Page.PLAN);
  };

  const handlePlanGenerated = (newItinerary: Itinerary) => {
    setItinerary(newItinerary);
  };
  
  const handleNavigateToTracker = () => {
    setCurrentPage(Page.TRACKER);
  };
  
  const handleNavigateToBookGuide = () => {
    setCurrentPage(Page.BOOK_GUIDE);
  };

  const handleBack = () => {
    // Reset city-specific state when going back from spots page
    if (currentPage === Page.SPOTS) {
        setSelectedCity(null);
        setInitialCityName("");
        setSelectedSpots([]);
    }
    // Reset plan-specific state
    if (currentPage === Page.PLAN) {
        setSelectedSpots([]);
        setItinerary(null);
    }

    if (currentPage === Page.BOOK_GUIDE) setCurrentPage(Page.PLAN);
    else if (currentPage === Page.TRACKER) setCurrentPage(Page.PLAN);
    else if (currentPage === Page.PLAN) setCurrentPage(Page.SPOTS);
    else if (currentPage === Page.SPOTS) setCurrentPage(Page.DESTINATION);
    else if (currentPage === Page.DESTINATION) setCurrentPage(Page.LOGIN);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.LOGIN:
        return <LoginPage onLogin={handleLogin} />;
      case Page.DESTINATION:
        return <DestinationPage onSelectCity={handleSelectCity} />;
      case Page.SPOTS:
        return <SpotsPage city={selectedCity} cityName={initialCityName} isLoading={isFetchingCity} onSpotsSelected={handleSelectSpots} />;
      case Page.PLAN:
        if (!selectedCity) {
            return <DestinationPage onSelectCity={handleSelectCity} />;
        }
        return <PlanPage city={selectedCity} selectedSpots={selectedSpots} onPlanGenerated={handlePlanGenerated} itinerary={itinerary} onNavigateToTracker={handleNavigateToTracker} onNavigateToBookGuide={handleNavigateToBookGuide} isSharedView={false} />;
      case Page.TRACKER:
        return <TrackerPage />;
      case Page.BOOK_GUIDE:
        if (!selectedCity) return <DestinationPage onSelectCity={handleSelectCity} />; // Fallback
        return <BookGuidePage city={selectedCity} showToast={showToast} />;
      case Page.SHARED_PLAN:
        if (!itinerary) return <LoginPage onLogin={handleLogin} />; // Fallback
        
        // We need a mock 'city' object for PlanPage props, which are not used in shared view.
        const mockCity: City = {
            name: itinerary.tripTitle.replace("Your Awesome Trip to ", "").replace("Trip to ",""),
            country: '',
            image: '',
            spots: [],
        };
        
        return <PlanPage 
            city={mockCity} 
            selectedSpots={[]}
            itinerary={itinerary}
            onPlanGenerated={() => {}}
            onNavigateToTracker={() => {}}
            onNavigateToBookGuide={() => {}}
            isSharedView={true}
        />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen">
      {currentPage !== Page.SHARED_PLAN && <Header user={user} onBack={handleBack} showBackButton={currentPage !== Page.LOGIN} />}
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;