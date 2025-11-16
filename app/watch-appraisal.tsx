import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WatchListingCard from '@/components/WatchListingCard';
import AutocompleteInput from '@/components/AutocompleteInput';
import { Picker } from "@react-native-picker/picker";
import CheckBox, {Checkbox} from 'expo-checkbox';
import useColorScheme from 'hooks/useColorScheme';

const API_URL = 'http://10.0.0.170:5000';

type Country = 'switzerland' | 'germany' | 'japan' | 'usa' | 'france' | 'italy';
type Warranty = 'none' | '1year' | '2years' | '3years' | '5years';
type ClaspType = 'deployable' | 'folding' | 'velcro';
type WatchSize = 'small' | 'medium' | 'large';


type WatchBrandGroup = {
  label: string;
  options: string[];
};


type Condition = 'poor' | 'fair' | 'good' | 'excellent';
type CaseMaterial = '' | '23ktGold' | '22ktGold' | '18ktGold' | '14ktGold' | '10ktGold' | 'whiteGold' | 'yellowGold' | 'roseGold' | 'platinum' | 'silver' | 'titanium' | 'plastic';
type BandMaterial = '' | 'gold' | 'platinum' | 'metal' | 'rubber' | 'silver' | 'fabric' | 'leather';
type MovementType = '' | 'automatic' | 'winder' | 'battery' | 'solar' | 'tourbillon';
type Rarity = '' | 'common' | 'uncommon' | 'rare' | 'veryRare' | 'extremelyRare';
type WaterResistance = '' | 'none' | 'splashProof' | 'waterResistant' | 'diver';


export default function WatchAppraisalScreen() {
  const router = useRouter();

   const scheme = useColorScheme();   // ✅ always called
  const styles = themedStyles(scheme);


  // State
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(0);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [condition, setCondition] = useState<Condition>('good');
  const [isNew, setIsNew] = useState(true);
  const [caseMaterial, setCaseMaterial] = useState<CaseMaterial>('');
  const [bandMaterial, setBandMaterial] = useState<BandMaterial>('');
  const [movementType, setMovementType] = useState<MovementType>('');
  const [rarity, setRarity] = useState<Rarity>('');
  const [waterResistance, setWaterResistance] = useState<WaterResistance>('');
  const [hasOriginalPackaging, setHasOriginalPackaging] = useState(false);
  const [hasDiamonds, setHasDiamonds] = useState(false);
  const [yearOfManufacture, setYearOfManufacture] = useState('');
  const [price, setPrice] = useState<string>('');
  const [countryOfOrigin, setCountryOfOrigin] = useState<Country | ''>('');
  const [warranty, setWarranty] = useState<Warranty | ''>('');
  const [claspType, setClaspType] = useState<ClaspType | ''>('');
  const [watchSize, setWatchSize] = useState<WatchSize | ''>('');
  const [skeletalBack, setSkeletalBack] = useState(false);
  const [flipSkeletalBack, setFlipSkeletalBack] = useState(false);
  const [fullSkeletalWatch, setFullSkeletalWatch] = useState(false);





  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (brandName) {
      fetchModels(brandName);
    }
  }, [brandName]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/api/brands`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchModels = async (brand: string) => {
    try {
      const response = await fetch(`${API_URL}/api/models?brand=${encodeURIComponent(brand)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setModels(data);
      setFilteredModels(data); // Auto-show all models when a brand is selected
      setSelectedModelIndex(0);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleBrandChange = (text: string) => {
    setBrandName(text);
    const filtered = brands.filter((b: string) =>
      b.toLowerCase().startsWith(text.toLowerCase())
    );
    setFilteredBrands(filtered);
    setSelectedBrandIndex(0);
  };

  const handleModelChange = (text: string) => {
    setModelName(text);
    const filtered = models.filter((m: string) =>
      m.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredModels(filtered);
    setSelectedModelIndex(0);
  };

  const handleAppraiseAndList = async () => {
    const payload = {
      countryOfOrigin,
      warranty,
      brand: brandName,
      model: modelName,
      modelNumber,
      condition,
      isNew,
      caseMaterial,
      bandMaterial,
      movementType,
      rarity,
      waterResistance,
      hasOriginalPackaging,
      hasDiamonds,
      yearOfManufacture,

    };

    try {
      // Get estimated value from backend
      const valueRes = await fetch(`${API_URL}/api/appraise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!valueRes.ok) {
        throw new Error(`HTTP error! status: ${valueRes.status}`);
      }

      const valueResult = await valueRes.json();

      if (valueResult.success) {
        setPrice(valueResult.estimatedValue.toString());
        alert(`Watch appraised at $${valueResult.estimatedValue}`);
      } else {
        alert('Failed to appraise watch.');
      }
    } catch (error) {
      console.error('Error appraising watch:', error);
      alert('Error appraising watch');
    }
  };

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
const toggleFeature = (feature: string) => {
  setSelectedFeatures((prev) =>
    prev.includes(feature)
      ? prev.filter((f) => f !== feature)
      : [...prev, feature]
  );
};




  return (
     <ScrollView
       style={[
        styles.container,
        { backgroundColor: '#fff'  }
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={scheme === 'dark' ? '#f0f0f0' : '#1A202C'}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⌚ Watch Price Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <AutocompleteInput
  label="Country of Origin"
  value={countryOfOrigin}
onValueChange={(v) => setCountryOfOrigin(v as Country)}

  options={[
    { label: 'Select country of origin', value: '' },
    { label: 'Switzerland', value: 'switzerland' },
    { label: 'Germany', value: 'germany' },
    { label: 'Japan', value: 'japan' },
    { label: 'USA', value: 'usa' },
    { label: 'France', value: 'france' },
    { label: 'Italy', value: 'italy' },
  ]}
/>

        <AutocompleteInput
  label="Warranty"
  value={warranty}
  onValueChange={(v) => setWarranty(v as Warranty)}

  options={[
    { label: 'Select warranty', value: '' },
    { label: 'None', value: 'none' },
    { label: '1 Year', value: '1year' },
    { label: '2 Years', value: '2years' },
    { label: '3 Years', value: '3years' },
    { label: '5 Years', value: '5years' },
  ]}
/>

        <Text style={styles.label}>Brand Name</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Rolex"
            value={brandName}
            onChangeText={handleBrandChange}
          />
          <View style={styles.arrowButtons}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                const newIndex = Math.max(selectedBrandIndex - 1, 0);
                setSelectedBrandIndex(newIndex);
                if (filteredBrands.length > 0) {
                  setBrandName(filteredBrands[newIndex]);
                  setFilteredBrands([]);
                }
              }}
            >
              <Ionicons name="chevron-up" size={20} color="#4A5568"/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                const newIndex = Math.min(selectedBrandIndex + 1, filteredBrands.length - 1);
                setSelectedBrandIndex(newIndex);
                if (filteredBrands.length > 0) {
                  setBrandName(filteredBrands[newIndex]);
                  setFilteredBrands([]);
                }
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#4A5568"/>
            </TouchableOpacity>
          </View>
        </View>

        {filteredBrands.length > 0 && (
          <View style={styles.dropdown}>
            {filteredBrands.map((brand, index) => (
              <TouchableOpacity
                key={brand}
                onPress={() => {
                  setBrandName(brand);
                  setFilteredBrands([]);
                }}
                style={[
                  styles.dropdownItem,
                  index === selectedBrandIndex && styles.highlightedItem
                ]}
              >
                <Text>{brand}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Model Name</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Daytona"
            value={modelName}
            onChangeText={handleModelChange}
          />
          <View style={styles.arrowButtons}>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                const newIndex = Math.max(selectedModelIndex - 1, 0);
                setSelectedModelIndex(newIndex);
                if (filteredModels.length > 0) {
                  setModelName(filteredModels[newIndex]);
                  setFilteredModels([]);
                }
              }}
            >
              <Ionicons name="chevron-up" size={20} color="#4A5568"/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                const newIndex = Math.min(selectedModelIndex + 1, filteredModels.length - 1);
                setSelectedModelIndex(newIndex);
                if (filteredModels.length > 0) {
                  setModelName(filteredModels[newIndex]);
                  setFilteredModels([]);
                }
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#4A5568"/>
            </TouchableOpacity>
          </View>
        </View>

        {filteredModels.length > 0 && (
          <View style={styles.dropdown}>
            {filteredModels.map((model, index) => (
              <TouchableOpacity
                key={model}
                onPress={() => {
                  setModelName(model);
                  setFilteredModels([]);
                }}
                style={[
                  styles.dropdownItem,
                  index === selectedModelIndex && styles.highlightedItem
                ]}
              >
                <Text>{model}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Model Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 116500LN"
          value={modelNumber}
          onChangeText={setModelNumber}
        />

        <Text style={styles.label}>Year of Manufacture</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2020"
          keyboardType="number-pad"
          value={yearOfManufacture}
          onChangeText={setYearOfManufacture}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Condition & Status</Text>

        <AutocompleteInput
          label="Condition"
          value={condition}
          onValueChange={(v) => setCondition(v as Condition)}
          options={[
            {label: 'Poor', value: 'poor'},
            {label: 'Fair', value: 'fair'},
            {label: 'Good', value: 'good'},
            {label: 'Excellent', value: 'excellent'},
          ]}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.label}>New/Used</Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.toggleButton, isNew && styles.toggleButtonActive]}
              onPress={() => setIsNew(true)}
            >
              <Text style={[styles.toggleText, isNew && styles.toggleTextActive]}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isNew && styles.toggleButtonActive]}
              onPress={() => setIsNew(false)}
            >
              <Text style={[styles.toggleText, !isNew && styles.toggleTextActive]}>Used</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Materials</Text>





          <AutocompleteInput
            label="Case Material"
            value={caseMaterial}
            onValueChange={(v) => setCaseMaterial(v as CaseMaterial)}
            options={[
              {label: 'Select case material', value: ''},
              {label: 'Platinum', value: 'platinum'},
              {label: 'Yellow Gold', value: 'yellowGold'},
               {label: 'Rose Gold', value: 'roseGold'},
               {label: 'White Gold', value: 'whiteGold'},
               {label: 'Silver', value: 'silver'},
              {label: 'Titanium', value: 'titanium'},
               {label: 'Stainless steel', value: 'Stainless Steel'},
              {label: '23 kt Gold', value: '23ktGold'},
              {label: '22 kt Gold', value: '22ktGold'},
              {label: '18 kt Gold', value: '18ktGold'},
              {label: '14 kt Gold', value: '14ktGold'},
              {label: '10 kt Gold', value: '10ktGold'},
            ]}
          />

         <AutocompleteInput
  label="Band Material"
  value={bandMaterial}
  onValueChange={(v) => setBandMaterial(v as BandMaterial)}
  options={[
    { label: 'Select band material', value: '' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Gold', value: 'gold' },
    { label: '23 kt Gold', value: '23ktGold' },
    { label: '22 kt Gold', value: '22ktGold' },
    { label: '18 kt Gold', value: '18ktGold' },
    { label: '14 kt Gold', value: '14ktGold' },
    { label: '10 kt Gold', value: '10ktGold' },
    { label: 'Silver', value: 'silver' },
    { label: 'Stainless Steel', value: 'stainlessSteel' },
    { label: 'Metal', value: 'metal' },
    { label: 'Aluminum', value: 'aluminum' },
    { label: 'Titanium', value: 'titanium' },
    { label: 'Ceramic', value: 'ceramic' },
    { label: 'Copper', value: 'copper' },
    { label: 'Rubber', value: 'rubber' },
    { label: 'Fabric', value: 'fabric' },
    { label: 'Leather', value: 'leather' },
  ]}
/>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Technical Specifications</Text>

  <AutocompleteInput
    label="Movement Type"
    value={movementType}
    onValueChange={(v) => setMovementType(v as MovementType)}
    options={[
      { label: 'Select movement type', value: '' },
      { label: 'Automatic', value: 'automatic' },
      { label: 'Winder', value: 'winder' },
      { label: 'Battery', value: 'battery' },
      { label: 'Solar', value: 'solar' },
      { label: 'Tourbillon', value: 'tourbillon' },
      { label: 'Power Reserve', value: 'powerReserve' },
      { label: 'Quartz', value: 'quartz' },
      { label: 'Digital', value: 'digital' },
      { label: 'Minute Repeater', value: 'minuteRepeater' },
      { label: 'Perpetual Calendar', value: 'perpetualCalendar' },
    ]}
  />

  <Text style={styles.fieldLabel}>🧠 Watch Features</Text>
  {[
    'Power Reserve',
    'Quartz',
    'Digital',
    'Minute Repeater',
    'Perpetual Calendar',
  ].map((feature) => (
    <View key={feature} style={styles.checkboxRow}>
      <CheckBox
        value={selectedFeatures.includes(feature)}
        onValueChange={() => toggleFeature(feature)}
      />
      <Text>{feature}</Text>
    </View>
  ))}

  <Text style={styles.fieldLabel}>🔗 Clasp Type</Text>
  <Picker
    selectedValue={claspType}
    onValueChange={setClaspType}
    style={styles.picker}
  >
    <Picker.Item label="Select clasp type" value="" />
    <Picker.Item label="Deployable Clasp" value="deployable" />
    <Picker.Item label="Folding Clasp" value="folding" />
    <Picker.Item label="Velcro" value="velcro" />
  </Picker>

  <Text style={styles.fieldLabel}>📏 Watch Size</Text>
  <Picker
    selectedValue={watchSize}
    onValueChange={setWatchSize}
    style={styles.picker}
  >
    <Picker.Item label="Select watch size" value="" />
    <Picker.Item label="Small" value="small" />
    <Picker.Item label="Medium" value="medium" />
    <Picker.Item label="Large" value="large" />
  </Picker>

  <View style={styles.skeletalGroup}>
  {[
    { label: 'Skeletal Back', value: skeletalBack, setter: setSkeletalBack },
    { label: 'Flip Skeletal Back', value: flipSkeletalBack, setter: setFlipSkeletalBack },
    { label: 'Full Skeletal Watch', value: fullSkeletalWatch, setter: setFullSkeletalWatch },
  ].map(({ label, value, setter }) => (
    <View key={label} style={styles.checkboxRow}>
      <Checkbox
  value={value}
  onValueChange={setter}
  color={value ? '#FF6B35' : undefined}
/>

      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  ))}
</View>


  <AutocompleteInput
    label="Water Resistance"
    value={waterResistance}
    onValueChange={(v) => setWaterResistance(v as WaterResistance)}
    options={[
      { label: 'Select water resistance', value: '' },
      { label: 'None', value: 'none' },
      { label: 'Splash Proof', value: 'splashProof' },
      { label: 'Water Resistant', value: 'waterResistant' },
      { label: 'Diver', value: 'diver' },
    ]}
  />

  <AutocompleteInput
    label="Rarity"
    value={rarity}
    onValueChange={(v) => setRarity(v as Rarity)}
    options={[
      { label: 'Select rarity', value: '' },
      { label: 'Common', value: 'common' },
      { label: 'Uncommon', value: 'uncommon' },
      { label: 'Rare', value: 'rare' },
      { label: 'Very Rare', value: 'veryRare' },
      { label: 'Extremely Rare', value: 'extremelyRare' },
    ]}
  />
</View>

<AutocompleteInput
  label="Country of Origin"
  value={countryOfOrigin}
  onValueChange={(v) => setCountryOfOrigin(v as Country)}
  options={[
    { label: 'Select country of origin', value: '' },
    { label: 'Switzerland', value: 'switzerland' },
    { label: 'Germany', value: 'germany' },
    { label: 'Japan', value: 'japan' },
    { label: 'USA', value: 'usa' },
    { label: 'France', value: 'france' },
    { label: 'Italy', value: 'italy' },
  ]}
/>

<AutocompleteInput
  label="Warranty"
  value={warranty}
  onValueChange={(v) => setWarranty(v as Warranty)}
  options={[
    { label: 'Select warranty', value: '' },
    { label: 'None', value: 'none' },
    { label: '1 Year', value: '1year' },
    { label: '2 Years', value: '2years' },
    { label: '3 Years', value: '3years' },
    { label: '5 Years', value: '5years' },
  ]}
/>







<View style={styles.section}>
  <Text style={styles.sectionTitle}>Additional Features</Text>

  <TouchableOpacity
    style={styles.checkboxRow}
    onPress={() => setHasOriginalPackaging(!hasOriginalPackaging)}
  >
    <Ionicons
      name={hasOriginalPackaging ? 'checkbox' : 'square-outline'}
      size={24}
      color="#FF6B35"
    />
    <Text style={styles.checkboxLabel}>Original Packaging</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.checkboxRow}
    onPress={() => setHasDiamonds(!hasDiamonds)}
  >
    <Ionicons
      name={hasDiamonds ? 'checkbox' : 'square-outline'}
      size={24}
      color="#FF6B35"
    />
    <Text style={styles.checkboxLabel}>Diamonds / Gemstones</Text>
  </TouchableOpacity>
</View>

<TouchableOpacity
  style={styles.appraiseButton}
  onPress={handleAppraiseAndList}
>
  <Text style={styles.appraiseButtonText}>Get Appraisal</Text>
</TouchableOpacity>

{!!(price) && (
  <View style={styles.priceContainer}>
    <Text style={styles.priceLabel}>💰 Estimated Value</Text>
    <Text style={styles.priceValue}>${price}</Text>
    <Text style={styles.disclaimer}>
      *Estimated based on materials, condition, and features. Actual market value may vary.
    </Text>
  </View>
)}

{!!(price) && (
  <WatchListingCard
    imageUrl={'https://example.com/watch.jpg'}
    brand={brandName}
    model={modelName}
    price={price}
    year={yearOfManufacture}
    isNew={isNew}
  />
)}
</ScrollView>
);
}

export const themedStyles = (scheme: 'light' | 'dark') => {
  const isDark = scheme === 'dark';

  // Define palette once
  const palette = {
    background: isDark ? '#000' : '#F7FAFC',
    cardBackground: isDark ? '#111' : '#fff',
    border: isDark ? '#333' : '#E2E8F0',
    dropdownBorder: isDark ? '#555' : '#ccc',
    dropdownBackground: isDark ? '#222' : '#fff',
    textPrimary: isDark ? '#f0f0f0' : '#1A202C',
    textSecondary: isDark ? '#ddd' : '#4A5568',
    textMuted: isDark ? '#aaa' : '#718096',
    inputBorder: isDark ? '#555' : '#ccc',
    inputBackground: isDark ? '#222' : '#fff',
    inputText: isDark ? '#f0f0f0' : '#333',
    highlight: isDark ? '#333' : '#d0ebff',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    contentContainer: {
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: palette.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.textPrimary,
    },
    section: {
      backgroundColor: palette.cardBackground,
      padding: 16,
      marginTop: 12,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: palette.dropdownBorder,
      borderRadius: 6,
      marginTop: 4,
      backgroundColor: palette.dropdownBackground,
      maxHeight: 150,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 4,
      color: palette.textPrimary,
    },
    picker: {
      borderWidth: 1,
      borderColor: palette.dropdownBorder,
      borderRadius: 6,
      padding: 8,
      backgroundColor: palette.dropdownBackground,
      marginBottom: 12,
    },
    skeletalGroup: {
      marginTop: 12,
      marginBottom: 12,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    checkboxLabel: {
      fontSize: 14,
      color: palette.textPrimary,
      marginLeft: 12,
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#444' : '#eee',
    },
    highlightedItem: {
      backgroundColor: palette.highlight,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4A5568',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    arrowButtons: {
      position: 'absolute',
      right: 1,
      top: 1,
      bottom: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      borderLeftWidth: 1,
      borderLeftColor: palette.border,
      backgroundColor: palette.cardBackground,
      borderTopRightRadius: 6,
      borderBottomRightRadius: 6,
      width: 32,
    },
    arrowButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      borderWidth: 1,
      borderColor: palette.inputBorder,
      padding: 10,
      paddingRight: 40,
      borderRadius: 6,
      backgroundColor: palette.inputBackground,
      fontSize: 16,
      color: palette.inputText,
    },
    appraiseButton: {
      flexDirection: 'row',
      backgroundColor: '#FF6B35',
      marginHorizontal: 16,
      marginTop: 20,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF6B35',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    appraiseButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.textPrimary,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSecondary,
      marginTop: 12,
      marginBottom: 6,
    },
    toggleRow: {
      marginTop: 12,
    },
    toggleButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isDark ? '#444' : '#E2E8F0',
      backgroundColor: palette.dropdownBackground,
      alignItems: 'center',
    },
    toggleButtonActive: {
      borderColor: '#FF6B35',
      backgroundColor: isDark ? '#332019' : '#FFF5F2',
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textMuted,
    },
    toggleTextActive: {
      color: '#FF6B35',
    },
    priceContainer: {
      backgroundColor: palette.cardBackground,
      marginTop: 20,
      marginHorizontal: 16,
      padding: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#FF6B35',
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.textSecondary,
      marginBottom: 8,
    },
    priceValue: {
      fontSize: 36,
      fontWeight: '700',
      color: '#FF6B35',
      marginBottom: 12,
    },
    disclaimer: {
      fontSize: 11,
      color: palette.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    listButton: {
      flexDirection: 'row',
      backgroundColor: '#FF6B35',
      marginHorizontal: 16,
      marginTop: 20,
      paddingVertical: 0,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF6B35',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    listButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
    },
  });
};