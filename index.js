import React, { Component } from 'react';
import { AppRegistry, Dimensions, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import Orientation from 'react-native-orientation';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image, { validProtocols: ['http', 'https'] });

import { name as appName } from './app.json';
import Root from './src/components/Root';

// ios 127.0.0.1 works, but for android it points to the device
// Your ip below must also be specified in android/app/src/debug/res/xml/react_native_config.xml
const SERVER_HOST = '192.168.1.14'; // '127.0.0.1';
const SERVER_PATH = 'http://' + SERVER_HOST + ':1234/static/flipper/data/';

const baseUrl = SERVER_PATH
const manifestLocation = 'images.json'

const loadNativeImage = (url) => Image.prefetch(url);

const BLANK_URL = ''; // 'https://blank.jpg'

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orientation: Orientation.getInitialOrientation(),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height
    };
    Orientation.addOrientationListener(this.onOrientationChange);
    Dimensions.addEventListener("change", this.onDimensionsChange);
  }

  onDimensionsChange = (e) => {
    this.setState({
      orientation: Orientation.getInitialOrientation(),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height
    });
  }

  onOrientationChange = (e) => {
    this.setState({
      orientation: Orientation.getInitialOrientation(),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height
    });
  }

  render() {
    const { width, height } = this.state;
    const rootProps = {
      width,
      height,
      baseUrl,
      manifestLocation,
      loadImage: loadNativeImage,
      flipDelay: 5,
      flipDuration: 1000,
      flipInterval: 5000,
      runTimer: true,
      SET_VALUE: v => v,
      RAF: requestAnimationFrame,
      GET_NOW: () => Date.now,
      USE_FIRST_RAF: false,
      SCROLL_VIEW: props => <View style={{width: width, height: height}}><ScrollView {...{ ...props, contentContainerStyle: { width: width, height: props.style.height } }} /></View>,
      INTERACTIVE_VIEW: props => <TouchableOpacity {...props} />,
      INTERACTIVE_PROP: 'onPress',
      VIEW: props => <View {...props} />,
      VIEW_TRANSFORM: (flipRotation) => [{ rotateY: flipRotation + 'deg' }],
      IMAGE: props => <CachedImage {...props} />,
      IMAGE_VIEW: props => <View {...props} />,
      IMAGE_PROP: 'source',
      IMAGE_SRC: image => ({ uri: image ? image : BLANK_URL })
    };

    return (
      <Root {...rootProps} />
    );
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this.onOrientationChange);
    Dimensions.removeEventListener("change", this.onDimensionsChange);
  }
}

AppRegistry.registerComponent(appName, () => Index);


