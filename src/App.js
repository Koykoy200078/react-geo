import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Linking,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import MapView, {Callout, Marker} from '@splicer97/react-native-osmdroid';

import Geolocation from 'react-native-geolocation-service';
import {IMAGES} from './config';

export default function () {
  const [data1, setData] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  const mapRef = useRef('map');
  const {width, height} = Dimensions.get('window');

  const region = {
    latitude: currentLocation ? currentLocation.latitude : 0,
    longitude: currentLocation ? currentLocation.longitude : 0,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03 * (width / height),
  };

  const openApp = () => {
    // Linking.openURL('yourapp://');
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url =
      scheme + `0,0?q=${encodeURIComponent('Enter your location here')}`;
    Linking.openURL(url);
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://api.apispreadsheets.com/data/khFOrmyoapgRNFGa',
      );
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    Geolocation.getCurrentPosition(
      position => {
        console.log('position ==>', position);
        setCurrentLocation({
          altitude: position.coords.altitude,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        // See error code charts below.
        console.error(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
      }}
      region={region}
      showsUserLocation
      minZoomLevel={10}
      maxZoomLevel={18}>
      {data1.data?.map((location, index) => {
        return (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(location.latitude),
              longitude: parseFloat(location.longitude),
            }}
            title={location.name}
            image={IMAGES.marker}
            onPress={() => {
              Alert.alert(
                `${location.name}`,
                `Latitude: ${location.latitude}${'\n'}Longitude: ${
                  location.longitude
                }`,
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Transaction cancelled'),
                    style: 'cancel',
                  },
                  {
                    text: 'View',
                    onPress: () => {
                      const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
                      const url =
                        scheme +
                        `0,0?q=${encodeURIComponent(
                          `${location.latitude},${location.longitude}`,
                        )}`;
                      Linking.openURL(url);
                    },
                  },
                ],
                {cancelable: false},
              );
            }}
          />
        );
      })}

      <Marker
        coordinate={{
          latitude: region.latitude,
          longitude: region.longitude,
        }}
        image={IMAGES.current_location}
        title="Current Location"
        showsUserLocation
      />
    </MapView>
  );
}
