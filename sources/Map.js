import React, { useEffect, useState, memo } from 'react';
import { Dimensions, Text, View, StyleSheet, Modal, Button, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from 'expo-location';
import data from '../json/gav-gam-06-09-2019.json';
import Header from './Header';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function Map() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [minPlaces, setMinPlaces] = useState(0);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [visibleRegion, setVisibleRegion] = useState(initialPos);

  const formattedData = data.features.map(item => {
    if (item.geometry && item.geometry.coordinates) {
      return {
        coordinates: item.geometry.coordinates,
        etat: item.properties.ETAT_,
        longueur: item.properties.LONGUEUR,
        largeur: item.properties.LARGEUR,
        nbPlaces: item.properties.NB_PLACE,
      };
    }
  }).filter(Boolean);
  
  const [filteredData, setFilteredData] = useState(formattedData);

  const applyFilters = () => {
    let filteredItems = formattedData;
    if (selectedFilter !== 'Tous') {
      filteredItems = filteredItems.filter(item => item.etat === selectedFilter);
    }
    filteredItems = filteredItems.filter(item => item.nbPlaces >= minPlaces);
    setFilteredData(filteredItems);
    setShowFilters(false);
  };

  const [initialPos, setInitialPos] =  useState({});
  useEffect(() => {userLocation()}, []);
  
  const userLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      if (locationSubscription) {
        locationSubscription.remove();
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
        },
        (location) => {
          setInitialPos({
            latitude: Number(location.coords.latitude),
            longitude: Number(location.coords.longitude),
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const onRegionChangeComplete = (region) => {
    setVisibleRegion(region);
  }
  
  const isMarkerVisible = (markerPos) => {
    if (visibleRegion) {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = visibleRegion;
      const latLowerBound = latitude - (latitudeDelta / 2);
      const latUpperBound = latitude + (latitudeDelta / 2);
      const lonLowerBound = longitude - (longitudeDelta / 2);
      const lonUpperBound = longitude + (longitudeDelta / 2);
  
      return (
        markerPos.latitude >= latLowerBound &&
        markerPos.latitude <= latUpperBound &&
        markerPos.longitude >= lonLowerBound &&
        markerPos.longitude <= lonUpperBound
      );
    }
    return false;
  }

  const GOOGLE_MAPS_APIKEY = 'AIzaSyCUz4GdzDK2fZZuYNcXDVz9wx-F9CmCKGE';
  const [destination, setDestination] = useState(null);

  return (
    <View style={styles.container}>
      <Header setShowFilters={setShowFilters} />
      <View style={styles.map}>
        <MapView style={styles.map} provider={PROVIDER_GOOGLE} region={initialPos} clusteringEnabled onRegionChangeComplete={onRegionChangeComplete}>
        <MapViewDirections origin={initialPos} destination={destination} apikey={GOOGLE_MAPS_APIKEY} strokeWidth={5} strokeColor='red'/>
        <Marker coordinate={initialPos} pinColor='rouge'>
        </Marker>
        {filteredData.map((place, index) => {
          const markerPos = {
            latitude: Number(place.coordinates[1]),
            longitude: Number(place.coordinates[0]),
          };
          if (isMarkerVisible(markerPos)) {
            return (             
              <Marker 
                pinColor='blue'
                key={index}
                coordinate={markerPos}
                onPress={() => {
                  setDestination(markerPos);
                  if ((destination && markerPos.latitude == destination.latitude && markerPos.longitude == destination.longitude) || !isMarkerVisible(markerPos)) {
                    setDestination(null);
                  }
                }}
              >
                {/* <Callout>
                  <View>
                    <Text style={styles.infoText}>État: {place.etat}</Text>
                    <Text style={styles.infoText}>Longueur: {Number(place.longueur).toFixed(1)} mètres</Text>
                    <Text style={styles.infoText}>Largeur: {Number(place.largeur).toFixed(1)} mètres</Text>
                    <Text style={styles.infoText}>Nombre de places: {place.nbPlaces}</Text>
                  </View>
                </Callout> */}
              </Marker>
            );
          }
        })}
        </MapView>
        <TouchableOpacity style={styles.locationButton} onPress={userLocation}>
          <Icon name='my-location' size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <Modal animationType="fade" transparent={true} visible={showFilters} onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalContainer}>
          {showFilters && (
            <View style={styles.modalContent}>
              <View style={{ flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 20 }}>Etat</Text>
                <Picker selectedValue={selectedFilter} onValueChange={(itemValue) => setSelectedFilter(itemValue)}>
                  <Picker.Item label="Tous" value="Tous" />
                  <Picker.Item label="En vigueur" value="En vigueur" />
                  <Picker.Item label="Supprimé(e)" value="Supprimé(e)" />
                  <Picker.Item label="En projet" value="En projet" />
                </Picker>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ textAlign: 'center', fontSize: 20 }}>Nombre de places minimum</Text>
                <Slider
                  style={{ width: 0.75 * windowWidth, height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={minPlaces}
                  onValueChange={(value) => setMinPlaces(value)}
                />
                <Text style={{ textAlign: 'center' }}>{minPlaces}</Text>
              </View>
              <Button title="Appliquer les filtres" onPress={applyFilters} />
            </View>
          )}
        </View>
      </Modal>
    </View>    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  map : {
    flex: 1,
    height: windowHeight,
    width: windowWidth,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    height: 0.6 * windowHeight,
    width: 0.8 * windowWidth,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 20,
    padding: 10,
  },
  locationButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 50,
  }
});