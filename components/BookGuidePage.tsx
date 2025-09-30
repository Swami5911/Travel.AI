import React, { useState, useEffect } from 'react';
import { City, Guide } from '../types';
import { generateGuides } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import ImageWithFallback from './ImageWithFallback';

interface BookGuidePageProps {
  city: City;
  showToast: (message: string) => void;
}

export const BookGuidePage: React.FC<BookGuidePageProps> = ({ city, showToast }) => {
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);
      setError(null);
      const result = await generateGuides(city.name);
      if (result) {
        setGuides(result);
      } else {
        setError('Could not find available guides at this time. Please try again later.');
      }
      setIsLoading(false);
    };

    fetchGuides();
  }, [city.name]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="glass-card rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <SkeletonLoader className="h-64 w-full" />
              <div className="p-6">
                <SkeletonLoader className="h-8 w-3/4 mb-4 rounded" />
                <div className="flex flex-wrap gap-2 my-3">
                  <SkeletonLoader className="h-5 w-20 rounded-full" />
                  <SkeletonLoader className="h-5 w-24 rounded-full" />
                </div>
                <SkeletonLoader className="h-4 w-full mb-1 rounded" />
                <SkeletonLoader className="h-4 w-full mb-4 rounded" />
                <SkeletonLoader className="h-10 w-full mt-auto rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error || !guides) {
      return <p className="text-center text-red-400 mt-16">{error}</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide, index) => (
          <div key={index} className="glass-card rounded-2xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-105 hover:shadow-purple-500/20">
            <div className="h-64 w-full">
              <ImageWithFallback src={guide.image} alt={`Portrait of ${guide.name}`} className="w-full h-full object-cover object-center" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold text-slate-100">{guide.name}</h3>
              <div className="flex flex-wrap gap-2 my-3">
                {guide.specialties.map(spec => (
                  <span key={spec} className="bg-slate-700 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{spec}</span>
                ))}
              </div>
              <p className="text-slate-400 flex-grow mb-4">{guide.bio}</p>
              <button 
                onClick={() => showToast(`Contacting ${guide.name}...`)}
                className="mt-auto w-full gradient-bg text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition"
              >
                Contact {guide.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto">
      <h2 className="text-4xl font-poppins font-extrabold text-center mb-2">Meet Your Local Guides for <span className="gradient-text">{city.name}</span></h2>
      <p className="text-center text-slate-400 mb-12">Our AI has curated a list of expert guides to elevate your travel experience.</p>
      {renderContent()}
    </div>
  );
};