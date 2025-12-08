'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindowF,
} from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tweet } from './dashboard-page';

interface MapSectionProps {
  tweets: Tweet[];
  selectedTweetId?: string;
  onSelectTweet?: (tweet: Tweet) => void;
}

export default function MapSection({
  tweets,
  selectedTweetId,
  onSelectTweet,
}: MapSectionProps) {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const selectedTweet = tweets.find((t) => t.id === selectedTweetId);

  // Calculate map center from tweets
  const center =
    tweets.length > 0
      ? {
          lat: tweets.reduce((sum, t) => sum + t.latitude, 0) / tweets.length,
          lng: tweets.reduce((sum, t) => sum + t.longitude, 0) / tweets.length,
        }
      : { lat: 40.7128, lng: -74.006 };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // red-500
      case 'high':
        return '#f97316'; // orange-500
      case 'medium':
        return '#eab308'; // yellow-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  return (
    <Card className="border-2 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg">Incident Hotspots Map</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-600">Google Maps API Key not configured</p>
          </div>
        ) : (
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}>
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">Loading map...</p>
              </div>
            )}
            <GoogleMap
              mapContainerClassName="w-full h-full rounded-lg border border-blue-200 dark:border-blue-800"
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={12}
              ref={mapRef}
              options={{
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                fullscreenControl: true,
                streetViewControl: false,
              }}>
              {tweets.map((tweet) => {
                const isSelected = tweet.id === selectedTweetId;
                const severity = tweet.severity as string;

                return (
                  <MarkerF
                    key={tweet.id}
                    position={{ lat: tweet.latitude, lng: tweet.longitude }}
                    onClick={() => onSelectTweet?.(tweet)}
                    icon={
                      isSelected
                        ? {
                            path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
                            fillColor: getSeverityColor(severity),
                            fillOpacity: 1,
                            scale: 2,
                            strokeColor: '#ffffff',
                            strokeWeight: 2,
                          }
                        : {
                            path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
                            fillColor: getSeverityColor(severity),
                            fillOpacity: 1,
                            scale: 1.2,
                            strokeColor: '#ffffff',
                            strokeWeight: 1.5,
                          }
                    }
                    title={`${tweet.author}: ${severity}`}>
                    {isSelected && selectedTweet && (
                      <InfoWindowF onCloseClick={() => onSelectTweet?.(tweet)}>
                        <div className="p-2 text-sm">
                          <p className="font-semibold">
                            {selectedTweet.author}
                          </p>
                          <p className="text-xs text-gray-600">
                            {selectedTweet.severity}
                          </p>
                        </div>
                      </InfoWindowF>
                    )}
                  </MarkerF>
                );
              })}
            </GoogleMap>
          </LoadScript>
        )}

        {/* Legend */}
        <div className="mt-3 flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Medium</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
