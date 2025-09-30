import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, TouristSpot, City, Country, State, CityInfo, Guide } from '../types';

if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
  const userFriendlyMessage = "Gemini API key not found. Please open index.html and replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key.";
  
  // Display the message in a more visible way on the page itself
  const body = document.querySelector('body');
  if (body) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.padding = '1rem';
    errorDiv.style.backgroundColor = '#ef4444'; // red-500
    errorDiv.style.color = 'white';
    errorDiv.style.borderRadius = '0.5rem';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.fontFamily = 'sans-serif';
    errorDiv.innerHTML = `<b>Configuration Error:</b> ${userFriendlyMessage}`;
    body.prepend(errorDiv);
  }
  
  // Also log to console for developers
  console.error(userFriendlyMessage);

  // Throw an error to stop further execution
  throw new Error("API_KEY is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generic function to handle Gemini API calls with structured JSON output
async function fetchJson<T>(prompt: string, schema: object): Promise<T | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    return null;
  }
}

// Schemas for dynamic destination fetching
const countrySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        code: { type: Type.STRING, description: "Two-letter ISO 3166-1 alpha-2 code." },
    },
    required: ['name', 'code'],
};
const countriesSchema = { type: Type.ARRAY, items: countrySchema };

const stateSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING } }, required: ['name'] };
const statesSchema = { type: Type.ARRAY, items: stateSchema };

const cityInfoSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        country: { type: Type.STRING },
        image: { type: Type.STRING, description: "A direct, publicly accessible, high-resolution image URL." },
    },
    required: ['name', 'country', 'image'],
};
const citiesSchema = { type: Type.ARRAY, items: cityInfoSchema };

// Service functions for destination hierarchy
export const getCountries = () => fetchJson<Country[]>("List all countries in the world with their two-letter ISO 3166-1 alpha-2 code, sorted alphabetically by name.", countriesSchema);
export const getStates = (countryName: string) => fetchJson<State[]>(`List all major states/provinces/regions for ${countryName}, sorted alphabetically.`, statesSchema);
export const getTopCities = (stateName: string, countryName: string) => {
    const prompt = `
    List the top 10 most popular tourist cities in ${stateName}, ${countryName}.
    For each city, provide its name, country, and a stunning image URL.
    
    CRITICAL IMAGE REQUIREMENTS:
    - All image URLs MUST be direct links to an image file (e.g., ending in .jpg, .png, .webp).
    - The URLs MUST be publicly accessible and allow hotlinking.
    - Prioritize using reliable sources like Wikimedia Commons, Pexels, or Unsplash.
    - DO NOT provide URLs from stock photo sites with watermarks, pages that require logins, or URLs that lead to a webpage instead of an image file.
  `;
    return fetchJson<CityInfo[]>(prompt, citiesSchema);
};

// Schema and service for fetching detailed city info with spots
const touristSpotSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique, URL-friendly identifier for the spot (e.g., 'hawa-mahal')." },
    name: { type: Type.STRING },
    description: { type: Type.STRING, description: 'A detailed and engaging description of the spot, around 2-3 sentences long.' },
    image: { type: Type.STRING, description: 'A direct, high-resolution image URL for the spot.' },
  },
  required: ['id', 'name', 'description', 'image'],
};

const detailedCitySchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    country: { type: Type.STRING },
    image: { type: Type.STRING, description: 'A direct, high-resolution image URL representing the city.' },
    spots: {
      type: Type.ARRAY,
      description: 'A list of 6 of the most famous tourist spots in the city.',
      items: touristSpotSchema,
    },
  },
  required: ['name', 'country', 'image', 'spots'],
};

export const getCityInfo = (cityName: string): Promise<City | null> => {
  const prompt = `
    Generate detailed travel information for "${cityName}".
    You must return a single, valid JSON object that adheres to the provided schema.
    Include the city's name, country, and a stunning, high-resolution image URL representing the city.
    Also, provide a list of its 6 most famous tourist spots.
    For each spot, include a unique ID, name, an engaging description, and an image URL.
    
    CRITICAL IMAGE REQUIREMENTS:
    - All image URLs MUST be direct links to an image file (e.g., ending in .jpg, .png, .webp).
    - The URLs MUST be publicly accessible and allow hotlinking.
    - Prioritize using reliable sources like Wikimedia Commons, Pexels, or Unsplash.
    - DO NOT provide URLs from stock photo sites with watermarks, pages that require logins, or URLs that lead to a webpage instead of an image file.
  `;
  return fetchJson<City>(prompt, detailedCitySchema);
};

// Schema and service for generating the itinerary
const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING },
    dailyPlans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                description: { type: Type.STRING },
                location: { type: Type.STRING },
              },
              required: ['time', 'description', 'location'],
            },
          },
          specialEvent: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              details: { type: Type.STRING, description: "Details including timing and why it's recommended, relevant to the travel date." },
            },
          },
        },
        required: ['day', 'title', 'activities'],
      },
    },
  },
  required: ['tripTitle', 'dailyPlans'],
};

export const generateItinerary = async (
  cityName: string,
  days: number,
  selectedSpots: TouristSpot[],
  startDate: string
): Promise<Itinerary | null> => {
  const spotNames = selectedSpots.map(spot => spot.name).join(', ') || 'popular attractions';

  const prompt = `
    Create a vibrant, culturally-rich ${days}-day itinerary for ${cityName}, starting ${startDate}.
    The user's must-visit spots are: ${spotNames}.
    For each day, create a practical, timed schedule that logically includes the selected spots.
    For each evening, suggest a unique, specific local event relevant to the start date.
    Return a single JSON object.
  `;

  return fetchJson<Itinerary>(prompt, itinerarySchema);
};

// New Schema and service for generating guides
const guideSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        specialties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 short specialties (e.g., 'History', 'Foodie')." },
        bio: { type: Type.STRING, description: "A short, engaging bio for the guide, 2-3 sentences long." },
        image: { type: Type.STRING, description: "A direct, public, hotlink-able URL for a portrait-style photo of a person." },
    },
    required: ['name', 'specialties', 'bio', 'image'],
};

const guidesSchema = {
    type: Type.ARRAY,
    items: guideSchema,
};

export const generateGuides = (cityName: string): Promise<Guide[] | null> => {
    const prompt = `
      You are a travel agency manager. Create a list of 3 diverse, fictional tour guides for hire in ${cityName}.
      For each guide, provide:
      1. A realistic name.
      2. 2-3 specialties (e.g., 'Ancient History', 'Street Food Expert').
      3. A short, compelling bio (2-3 sentences).
      4. An image URL for a realistic, professional-looking portrait photograph of a person.

      CRITICAL IMAGE REQUIREMENTS:
      - The image URL MUST be a direct link to an image file (e.g., .jpg, .png, .webp).
      - The image MUST be a portrait of a person and clearly show their face. DO NOT use objects, animals, or landscapes.
      - It MUST be publicly accessible and allow hotlinking from reliable sources like Pexels or Unsplash.
      - DO NOT provide URLs that lead to a webpage instead of an image file.
    `;
    return fetchJson<Guide[]>(prompt, guidesSchema);
};