import React, { PureComponent } from 'react';

import Image from './Image';

const PADDING = 5;

export default class DoubleImage extends PureComponent {
  onClick = () => {
    const { onImageClick, index } = this.props;
    onImageClick(index);
  }

  render() {
    const { INTERACTIVE_VIEW, INTERACTIVE_PROP, VIEW, IMAGE, IMAGE_PROP } = this.props;
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

    const imageProps = {
      VIEW,
      IMAGE,
      IMAGE_PROP,
      width: innerWidth,
      height: innerHeight
    };

    return (
      <INTERACTIVE_VIEW
        className={className}
        {...{[INTERACTIVE_PROP]: this.onClick}}
        style={doubleContainerStyle}>
        <VIEW className="double-image-inner" style={doubleInnerStyle}>
          <Image key={backImage} {...imageProps} className="image-back" image={backImage} flipRotation={backRotation} flipOpacity={backOpacity} />
          <Image key={frontImageKey} {...imageProps} className="image-front" image={frontImage} flipRotation={frontRotation} flipOpacity={frontOpacity} />
        </VIEW>
      </INTERACTIVE_VIEW>
    );
  }
}