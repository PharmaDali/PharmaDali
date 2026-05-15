import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const DEFAULT_COLORS = { fill: '#333333', stroke: '#CCCCCC' };

const CATEGORY_COLORS = {
  branded: { fill: '#48AAD9', stroke: '#2D9CDB' },
  generic: { fill: '#01A768', stroke: '#01A768' },
  injectables: { fill: '#1B6CA8', stroke: '#1B6CA8' },
  'eye med': { fill: '#67A1B4', stroke: '#67A1B4' },
  cream: { fill: '#B059D0', stroke: '#B059D0' },
  cosmetics: { fill: '#F2577C', stroke: '#F2577C' },
  hygiene: { fill: '#31C0B3', stroke: '#31C0B3' },
  diapers: { fill: '#72AAD9', stroke: '#72AAD9' },
  infant: { fill: '#FB8A79', stroke: '#FB8A79' },
  milk: { fill: '#DAB55A', stroke: '#DAB55A' },
  drinks: { fill: '#F2994A', stroke: '#F2994A' },
  vitamins: { fill: '#E2B019', stroke: '#E2B019' },
};

const RxIcon = ({ width = 22, height = 27, fill = 'currentColor' }) => (
  <Svg width={width} height={height} viewBox="0 0 22 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M1.392 16.8C0.624 16.8 0 16.176 0 15.408V1.392C0 0.624001 0.624 0 1.392 0H7.704C10.848 0 13.416 2.544 13.416 5.712C13.416 8.064 11.904 10.08 9.864 10.824V11.3008C9.06006 11.3008 9.63606 10.7728 9.06006 11.3008C8.79606 11.5168 8.87206 11.3008 8.56006 11.3008C8.15206 11.3008 8.82406 11.6128 8.56006 11.3008L6.672 11.4H2.808V15.408C2.808 16.176 2.184 16.8 1.392 16.8ZM2.808 8.616H7.704C9.312 8.616 10.608 7.32 10.608 5.712C10.608 4.104 9.312 2.808 7.704 2.808H2.808V8.616Z" fill={fill} />
    <Path d="M16.312 17.576L21.112 23.792C21.544 24.392 21.448 25.232 20.848 25.736C20.608 25.928 20.296 26.024 20.008 26.024C19.576 26.024 19.168 25.832 18.904 25.472L14.56 19.856L10.192 25.472C9.928 25.832 9.52 26.024 9.112 26.024C8.8 26.024 8.512 25.928 8.248 25.736C7.648 25.232 7.528 24.392 8.008 23.792L12.784 17.576L8.008 11.36C7.528 10.784 7.648 9.896 8.248 9.44C8.872 8.936 9.736 9.08 10.192 9.68L14.56 15.296L18.904 9.68C19.36 9.08 20.248 8.936 20.848 9.44C21.448 9.896 21.544 10.784 21.112 11.36L16.312 17.576Z" fill={fill} />
  </Svg>
);

function normalizeCategoryKey(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCategoryColors(name) {
  const key = normalizeCategoryKey(name);
  return CATEGORY_COLORS[key] || DEFAULT_COLORS;
}

export default function ProductImage({
  source,
  fallbackSource,
  product,
  categoryName,
  isPrescribed,
  width = 64,
  height = 64,
  containerStyle,
  imageStyle,
  resizeMode = 'contain',
}) {
  
  // Track whether brand name wrapped to 2 lines
  const [brandWrapped, setBrandWrapped] = useState(false);

  const productData = product || null;
  const generic = productData?.generic_name;
  const brand = productData?.brand_name || productData?.product_name || generic;
  const strengthForm = [productData?.strength, productData?.form, productData?.size].filter(Boolean).join(' ');
  const unit = productData?.unit || productData?.packaging || productData?.unit_of_measure;

  const prescribed = typeof isPrescribed === 'boolean'
    ? isPrescribed
    : Boolean(Number(productData?.is_prescribed ?? 0));

  const categoryToUse = categoryName || productData?.category_name;
  const colors = getCategoryColors(categoryToUse);

  const hasProductData = Boolean(generic || brand || strengthForm);

  if (!hasProductData && (source || fallbackSource)) {
    const finalSource = source || fallbackSource;
    const imageSource = typeof finalSource === 'string' ? { uri: finalSource } : finalSource;
    return (
      <Image
        source={imageSource || fallbackSource}
        style={[{ width, height }, imageStyle]}
        resizeMode={resizeMode}
      />
    );
  }

  const scale = Math.min(width, height) / 100;

  const brandBaseFontSize = brand && brand.length > 11 ? 11 : 11.5;
  const brandFontSize = brandWrapped
    ? (brand && brand.length > 11 ? 8 : 9) * scale
    : brandBaseFontSize * scale;
  const brandLineHeight = brandWrapped
    ? (brand && brand.length > 11 ? 10 : 11) * scale
    : (brand && brand.length > 11 ? 12 : 15) * scale;

  return (
    <View
      className="bg-white flex-col justify-between overflow-hidden relative"
      style={[
        {
          width,
          height,
          borderColor: colors.stroke,
          borderWidth: 2 * scale,
          borderTopLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopRightRadius: 24 * scale,
          borderBottomLeftRadius: 24 * scale,
          paddingHorizontal: 6 * scale,
          paddingVertical: 6 * scale,
        },
        containerStyle,
      ]}
    >
      <View className="flex-1 flex-col items-start">
        {/* Generic name */}
        {Boolean(generic) && (
          <View
            className="mb-1"
            style={{
              borderColor: colors.stroke,
              borderWidth: 1 * scale,
              borderRadius: 6 * scale,
              paddingHorizontal: 4 * scale,
              paddingVertical: 2 * scale,
            }}
          >
            <Text
              className="font-medium"
              style={{
                color: colors.fill,
                fontSize: 8.5 * scale,
                fontFamily: 'Poppins-Medium',
                lineHeight: 12 * scale,
              }}
              numberOfLines={3}
            >
              {generic}
            </Text>
          </View>
        )}

        {/* Brand name */}
        <Text
          className="font-bold border-0"
          style={{
            color: colors.fill,
            fontSize: brandFontSize,
            fontFamily: 'Poppins-Bold',
            lineHeight: brandLineHeight,
          }}
          numberOfLines={2}
        >
          {brand}
        </Text>

        {/* Strength */}
        {Boolean(strengthForm) && (
          <Text
            className="font-medium mt-[2px]"
            style={{
              color: colors.fill,
              fontSize: 7 * scale,
              fontFamily: 'Poppins-Medium',
            }}
            numberOfLines={2}
          >
            {strengthForm}
          </Text>
        )}
      </View>

      <View className="flex-row justify-between items-end w-full relative">
        {/* Unit */}
        {Boolean(unit) ? (
          <Text
            className="font-medium"
            style={{
              color: colors.fill,
              fontSize: 8 * scale,
              fontFamily: 'Poppins-Medium',
              maxWidth: '70%',
            }}
            numberOfLines={1}
          >
            {unit}
          </Text>
        ) : <View />}

        {/* RX Icon */}
        {prescribed && (
          <View style={{ position: 'absolute', right: -5 * scale, bottom: -5 * scale }}>
            <RxIcon
              width={26 * scale}
              height={26 * scale}
              fill={colors.fill}
            />
          </View>
        )}
      </View>
    </View>
  );
}