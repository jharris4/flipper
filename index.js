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

const DEFAULT_USE_RAF = false;

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
    tweener.cancel(); // this cancels all tweens
  }
}

class AnimatedTweener {
  constructor() {
    this._valueMap = new Map();
    this._valueDelayMap = new Map();
  }

  start({ delay, duration, complete, startValue}) {
    if (this._valueMap.get(startValue)) {
      Animated.timing(startValue).stop();
    }
    if (this._valueDelayMap.get(startValue)) {
      clearTimeout(this._valueDelayMap.get(startValue));
    }
    const startTiming = () => {
      this._valueMap.set(startValue, true);
      Animated.timing(startValue, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start(() => {
        this._valueMap.delete(startValue);
        complete();
      });
    }
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this._valueDelayMap.delete(startValue);
        startTiming();
      }, delay);
      this._valueDelayMap.set(startValue, timeoutId);
    }
    else {
      startTiming();
    }
    this._valueMap.set(startValue, true);
  }

  cancel() {
    this._valueMap.forEach(value => {
      Animated.timing(value).stop();
    });
    this._valueDelayMap.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
  }
}

const flipAnimatedTweener = new AnimatedTweener();

const imageLoader = new ImageLoader(baseUrl, manifestLocation, loadNativeImage);

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orientation: Orientation.getInitialOrientation(),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      useRaf: DEFAULT_USE_RAF
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

  onUseRafPress = () => {
    this.setState(state => ({
      useRaf: !state.useRaf
    }));
  }

  render() {
    const { useRaf, width, height } = this.state;

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
      tweener: useRaf ? flipTweener : flipAnimatedTweener,
      imageLoader: imageLoader,
      width,
      height,
      baseUrl,
      flipDelay: 5,
      flipDuration: 1000,
      flipInterval: 5000,
      runTimer: false,
      platformProps: useRaf ? basePlatformProps : {
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
      <View style={{ position: 'relative', width, height }}>
        <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
          <Root key={useRaf} {...rootProps} />
        </View>
        <TouchableOpacity onPress={this.onUseRafPress} style={{ top: 45, left: 15, width: 20, height: 20 }}>
          <View style={{ width: '100%', height: '100%', backgroundColor: useRaf ? 'blue' : 'green' }}/>
        </TouchableOpacity>
      </View>
    );
  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this.onOrientationChange);
    Dimensions.removeEventListener("change", this.onDimensionsChange);
  }
}

AppRegistry.registerComponent(appName, () => Index);


