import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;

const Header = ({ setShowFilters }) => (
  <View style={styles.header}>
    <Text style={styles.appName}>MotoMap</Text>
    <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
      <Text style={styles.filterText}>Filtres</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        height: 0.15 * windowHeight,
    },
    appName: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    filterButton: {
      backgroundColor: '#eee',
      padding: 10,
      borderRadius: 5,
    },
    filterText: {
      fontSize: 16,
    },
    });

export default Header;