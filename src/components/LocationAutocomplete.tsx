/* global google */
import { useState, useRef, useEffect } from 'react';
import { TextField, Box, CircularProgress } from '@mui/material';

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  name?: string;
}

interface LocationAutocompleteProps {
  onSelect: (location: LocationData) => void;
  label?: string;
  defaultValue?: string;
}

const LocationAutocomplete = ({ 
  onSelect, 
  label = "Location", 
  defaultValue = "" 
}: LocationAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsLoading(e.target.value.trim().length > 0);
  };

  useEffect(() => {
    if (!inputRef.current || typeof google === 'undefined') return;
    // Add this style to fix z-index issue
    const style = document.createElement('style');
    style.innerHTML = `
      .pac-container {
        z-index: 1400 !important; // Material-UI Dialog has z-index: 1300
      }
    `;
    document.head.appendChild(style);

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['geocode'],
        fields: ['formatted_address', 'geometry', 'name']
      }
    );

    const placeChangedListener = autocompleteRef.current.addListener(
      'place_changed',
      () => {
        const place = autocompleteRef.current?.getPlace();
        setIsLoading(false);

        if (place?.geometry?.location) {
          setInputValue(place.formatted_address || '');
          
          onSelect({
            address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            distance : 0,
            name: place.name
          });
        }
      }
    );

    return () => {
      if (placeChangedListener) {
        google.maps.event.removeListener(placeChangedListener);
      }
    };
  }, [onSelect]);

  return (
    <Box position="relative">
      <TextField
        fullWidth
        variant="outlined"
        required
        inputRef={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        label={label}
        placeholder="Complete address"
        InputProps={{
          endAdornment: isLoading && (
            <CircularProgress size={20} />
          ),
        }}
      />
    </Box>
  );
};

export default LocationAutocomplete;