import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from 'react';
import data from '../json/gav-gam-06-09-2019.json';
import Header from './Header';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function List() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [minPlaces, setMinPlaces] = useState(0);
  
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
    filteredItems = filteredItems.filter(item => item.nbPlaces >= minPlaces); // Filter by minimum places
    setFilteredData(filteredItems);
    setShowFilters(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.boxContainer}>
      <Text>État: {item.etat}</Text>
      <Text>Longueur: {Number(item.longueur).toFixed(1)} mètres</Text>
      <Text>Largeur: {Number(item.largeur).toFixed(1)} mètres</Text>
      <Text>Nombre de places: {item.nbPlaces}</Text>      
    </View>
  );

  return (
    <View style={styles.container}>
      <Header setShowFilters={setShowFilters} />
        <View style={styles.flatList}>
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
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
    backgroundColor: '#fff',
  },
  flatList: {
    flex: 1,
    height: 0.8 * windowHeight,
  },
  boxContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
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
  }
});