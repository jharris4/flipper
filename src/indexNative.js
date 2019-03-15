import React, { Component } from 'react';
import { AppRegistry, TouchableOpacity, View, Image} from 'react-native';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image);

import Root from './components/Root';

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

render((
  <Root {...rootProps} />
));

AppRegistry.registerComponent(appName, () => Index);


