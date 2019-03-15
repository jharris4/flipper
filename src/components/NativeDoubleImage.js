import React, { PureComponent } from 'react';

import { TouchableOpacity, View } from 'react-native';

import NativeImage from './NativeImage';

const PADDING = 5;

export default class NativeDoubleImage extends PureComponent {
  onClick = () => {
    const { onImageClick, index } = this.props;
    onImageClick(index);
  }

  render() {
    const { index, tweenFlag, frontImage, backImage, flipRotation, flipOpacity, width, height, row, col, first, last } = this.props;
    const firstLastClass = first ? 'first' : last ? 'last' : null;
    const className = 'double-image' + (firstLastClass ? ' ' + firstLastClass : '');
    const backRotation = tweenFlag ? 180 - flipRotation : flipRotation;
    const frontRotation = flipRotation;
    const backOpacity = tweenFlag ? 1 - flipOpacity : flipOpacity;
    const frontOpacity = tweenFlag ? flipOpacity : 0;
    const frontImageKey = tweenFlag ? frontImage : 'unused';

    const innerWidth = width - 2 * PADDING;
    const innerHeight = height - 2 * PADDING;

    const doubleContainerStyle = {
      width: innerWidth,
      height: innerHeight,
      position: 'absolute',
      top: row * height + PADDING,
      left: col * width + PADDING,
    };

    const doubleInnerStyle = {
      position: 'relative',
      transformStyle: 'preserve-3d',
      width: '100%',
      height: '100%'
    };

    return (
      <TouchableOpacity
        className={className}
        onPress={this.onClick}
        style={doubleContainerStyle}>
        <View className="double-image-inner" style={doubleInnerStyle}>
          <NativeImage key={backImage} width={innerWidth} height={innerHeight} className="image-back" image={backImage} flipRotation={backRotation} flipOpacity={backOpacity} />
          <NativeImage key={frontImageKey} width={innerWidth} height={innerHeight} className="image-front" image={frontImage} flipRotation={frontRotation} flipOpacity={frontOpacity} />
        </View>
      </TouchableOpacity>
    );
  }
}