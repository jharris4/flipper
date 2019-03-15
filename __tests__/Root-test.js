/**
 * @format
 */

import 'react-native';
import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image);

import Root from '../src/components/Root';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json'
const loadNativeImage = (url) => Image.prefetch(url);

it('renders correctly', () => {
  const rootProps = {
    baseUrl,
    manifestLocation,
    loadImage: loadNativeImage,
    INTERACTIVE_VIEW: props => <TouchableOpacity {...props} />,
    INTERACTIVE_PROP: 'onPress',
    VIEW: props => <View {...props} />,
    IMAGE: props => <CachedImage {...props} />,
    IMAGE_PROP: 'source'
  };
  renderer.create(<Root {...rootProps} />);
});
