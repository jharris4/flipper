import React, { Component } from 'react';
import { AppRegistry, TouchableOpacity, View, Image} from 'react-native';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image);

import { name as appName } from './app.json';
import Root from './src/components/Root';

const PUBLIC_PATH = '/static/flipper/';

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json'

const loadNativeImage = (url) => Image.prefetch(url);

class Index extends Component {
  render() {
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
    return (
      <Root {...rootProps} />
    );
  }
}

AppRegistry.registerComponent(appName, () => Index);


