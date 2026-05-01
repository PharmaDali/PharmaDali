import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const RxIcon = ({ width = 24, height = 24, fill = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24">
    <Path d="M6 3v18h2v-7h4l4 7h2l-5-8.5C15.5 11.5 17 9.5 17 7c0-2.2-1.8-4-4-4H6zm2 2h5c1.1 0 2 0.9 2 2s-0.9 2-2 2H8V5zm0 6V9h5c1.1 0 2 0.9 2 2s-0.9 2-2 2H8z" fill={fill} />
  </Svg>
);

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
  const productData = product || null;
  const generic = productData?.generic_name;
  const brand = productData?.brand_name || productData?.product_name || generic;
  const strengthForm = [productData?.strength, productData?.form].filter(Boolean).join(' ');
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

  // Base multiplier to scale fonts and paddings dynamically with the requested size (100 is base for clear math)
  const scale = Math.min(width, height) / 100;

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
          padding: 8 * scale,
        },
        containerStyle,
      ]}
    >
      <View className="flex-1 flex-col items-start">
        {/* Generic */}
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
                fontSize: 10 * scale,
                fontFamily: 'Poppins-Medium',
                lineHeight: 12 * scale,
              }}
              numberOfLines={3}
            >
              {generic}
            </Text>
          </View>
        )}

        {/* Brand */}
        <Text
          className="font-bold border-0"
          style={{
            color: colors.fill,
            fontSize: 13 * scale,
            fontFamily: 'Poppins-Bold',
            lineHeight: 15 * scale,
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
              fontSize: 10 * scale,
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
            className="font-medium mt-1"
            style={{
              color: colors.fill,
              fontSize: 9 * scale,
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
          <View style={{ position: 'absolute', right: -2 * scale, bottom: -4 * scale }}>
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