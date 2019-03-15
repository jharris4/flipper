import React, { Component } from 'react';
import { AppRegistry, Dimensions, TouchableOpacity, View, Image} from 'react-native';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image, { validProtocols: ['http', 'https'] });

import { name as appName } from './app.json';
import Root from './src/components/Root';

const SERVER_PATH = 'http://127.0.0.1:1234/static/flipper/data/';

const baseUrl = SERVER_PATH;
const manifestLocation = 'images.json'

const loadNativeImage = (url) => Image.prefetch(url);

const BLANK_URL = ''; // 'https://blank.jpg'

class Index extends Component {
  render() {
    const rootProps = {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      baseUrl,
      manifestLocation,
      loadImage: loadNativeImage,
      INTERACTIVE_VIEW: props => <TouchableOpacity {...props} />,
      INTERACTIVE_PROP: 'onPress',
      VIEW: props => <View {...props} />,
      VIEW_TRANSFORM: (flipRotation) => [{ rotateY:  flipRotation + 'deg' }],
      IMAGE: props => <CachedImage {...props} />,
      IMAGE_PROP: 'source',
      IMAGE_SRC: image => ({ uri: image ? image : BLANK_URL })
    };
    return (
      <Root {...rootProps} />
    );
  }
}

AppRegistry.registerComponent(appName, () => Index);


