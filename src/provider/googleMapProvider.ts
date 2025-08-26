import React, { ReactNode } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import config from '../utils/config';

interface GoogleMapsProviderProps {
  children: ReactNode;
}

const GoogleMapsProvider = ({ children }: GoogleMapsProviderProps): React.ReactElement => {
  return React.createElement(Wrapper, {
    apiKey: config.API_GOOGLE_MAP_KEY || "",
    version: 'beta',
    libraries: ['places'],
    render: (status: Status) => {
      if (status === 'LOADING') return React.createElement('div', null, 'Loading Maps...');
      if (status === 'FAILURE') return React.createElement('div', null, 'Failed to load Maps');
      return children as React.ReactElement;
    },
  });
};

export default GoogleMapsProvider;
