import React, { PureComponent } from 'react';

import Image from './Image';

const PADDING = 5;

export default class DoubleImage extends PureComponent {
  onClick = () => {
    const { onImageClick, index } = this.props;
    onImageClick(index);
  }

  render() {
    const { platformProps } = this.props;
    const {
      FlipperInteractiveView,
      FlipperView,
      interactiveProp,
      frontRotationForPercentage,
      backRotationForPercentage,
      frontOpacityForPercentage,
      backOpacityForPercentage,
      frontZIndexForPercentage,
      backZIndexForPercentage
    } = platformProps;
    const { tweenFlag, frontImage, backImage, flipPercentage, width, height, row, col, first, last } = this.props;
    const firstLastClass = first ? 'first' : last ? 'last' : null;
    const className = 'double-image' + (firstLastClass ? ' ' + firstLastClass : '');
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

    const imageProps = {
      flipPercentage,
      platformProps,
      width: innerWidth,
      height: innerHeight
    };

    return (
      <FlipperInteractiveView
        className={className}
        {...{ [interactiveProp]: this.onClick}}
        style={doubleContainerStyle}>
        <FlipperView className="double-image-inner" style={doubleInnerStyle}>
          <Image key={backImage} {...imageProps} className="image-back" image={backImage} flipRotation={backRotationForPercentage} flipOpacity={backOpacityForPercentage} flipZIndex={backZIndexForPercentage}/>
          <Image key={frontImageKey} {...imageProps} className="image-front" image={frontImage} flipRotation={frontRotationForPercentage} flipOpacity={frontOpacityForPercentage} flipZIndex={frontZIndexForPercentage}/>
        </FlipperView>
      </FlipperInteractiveView>
    );
  }
}