import React, { Component } from 'react';
import { AppRegistry, Dimensions, TouchableOpacity, View, Image, ScrollView, Animated } from 'react-native';
import Orientation from 'react-native-orientation';
import imageCacheHoc from 'react-native-image-cache-hoc';
const CachedImage = imageCacheHoc(Image, { validProtocols: ['http', 'https'] });

import { buildTweener } from './src/tween';
import { ImageLoader } from './src/imageLoader';

import { name as appName } from './app.json';
import Root from './src/components/Root';

// ios 127.0.0.1 works, but for android it points to the device
// Your ip below must also be specified in android/app/src/debug/res/xml/react_native_config.xml
const SERVER_HOST = '127.0.0.1'; // '192.168.1.14';
const SERVER_PATH = 'http://' + SERVER_HOST + ':1234/static/flipper/data/';

const baseUrl = SERVER_PATH
const manifestLocation = 'images.json'

const loadNativeImage = (url) => Image.prefetch(url);

const BLANK_URL = ''; // 'https://blank.jpg'

const USE_RAF = false;

const tweener = buildTweener(requestAnimationFrame, () => Date.now, false);

const flipTweener = {
  start: ({
    delay,
    duration,
    update,
    complete
  }) => {
    const tween = tweener.create(duration, delay);
    tween.onUpdate(update);
    tween.onComplete(complete);
    tween.start();
  },
  cancel: () => {
    // tweener.cancel(); // this cancels all tweens which is bad
  }
}

// TODO - the start function should just return the cancel function, but that requires storing state etc

const flipAnimatedTweener = {
  start: ({
    delay,
    duration,
    complete,
    startValue
  }) => {

    const startAnimated = () => {
      Animated.timing(startValue, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        complete();
      });
    };

    if (delay > 0) {
      setTimeout(startAnimated)
    }
    else {
      startAnimated();
    }
  },
  cancel: () => {
    
  }
}

const imageLoader = new ImageLoader(baseUrl, manifestLocation, loadNativeImage);

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

    const basePlatformProps = {
      setValue: v => v,
      FlipperScrollView: props => <View style={{ width: width, height: height }}><ScrollView {...{ ...props, contentContainerStyle: { width: width, height: props.style.height } }} /></View>,
      FlipperInteractiveView: props => <TouchableOpacity {...props} />,
      interactiveProp: 'onPress',
      FlipperView: props => <View {...props} />,
      FlipperImage: props => <CachedImage {...props} />,
      FlipperImageView: props => <View {...props} />,
      imageProp: 'source',
      getImageSrc: image => ({ uri: image ? image : BLANK_URL }),
      frontOpacityForPercentage: percentage => percentage < 0.5 ? 0 : 1,
      backOpacityForPercentage: percentage => percentage < 0.5 ? 1 : 0,
      frontRotationForPercentage: percentage => [{ rotateY: (180 - percentage * 180) + 'deg' }],
      backRotationForPercentage: percentage => [{ rotateY: (percentage * 180) + 'deg' }]
    };

    const rootProps = {
      tweener: USE_RAF ? flipTweener : flipAnimatedTweener,
      imageLoader: imageLoader,
      width,
      height,
      baseUrl,
      flipDelay: 5,
      flipDuration: 1000,
      flipInterval: 5000,
      runTimer: false,
      platformProps: USE_RAF ? basePlatformProps : {
          ...basePlatformProps,
        setValue: v => new Animated.Value(v),
        FlipperImageView: props => <Animated.View {...props} />,
        frontOpacityForPercentage: percentage => percentage.interpolate({ inputRange: [0.49, 0.5], outputRange: [0, 1] }),
        backOpacityForPercentage: percentage => percentage.interpolate({ inputRange: [0.49, 0.5], outputRange: [1, 0] }),
        frontRotationForPercentage: percentage => [{ rotateY: percentage.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] }) }],
        backRotationForPercentage: percentage => [{ rotateY: percentage.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }]
      }
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


