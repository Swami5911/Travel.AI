export enum Page {
  LOGIN,
  DESTINATION,
  SPOTS,
  PLAN,
  TRACKER,
  BOOK_GUIDE,
  SHARED_PLAN,
}

export interface User {
  name: string;
}

export interface Country {
  name: string;
  code: string;
}

export interface State {
  name: string;
}

// Represents a city in a list before its full details are fetched
export interface CityInfo {
    name: string;
    country: string;
    image: string;
}

// Represents the full city object with tourist spots after fetching details
export interface City extends CityInfo {
  spots: TouristSpot[];
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface ItineraryActivity {
  time: string;
  description: string;
  location: string;
}

export interface ItinerarySpecialEvent {
  name: string;
  location: string;
  details: string;
}

export interface DailyPlan {
  day: number;
  title: string;
  activities: ItineraryActivity[];
  specialEvent?: ItinerarySpecialEvent;
}

export interface Itinerary {
  tripTitle: string;
  dailyPlans: DailyPlan[];
}

export interface Guide {
  name: string;
  specialties: string[];
  bio: string;
  image: string;
}