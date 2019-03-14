import React, { PureComponent } from 'react';

import Image from './Image';

const PADDING = 5;

export default class DoubleImage extends PureComponent {
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

    return (
      <div
        className={className}
        onClick={this.onClick}
        style={{
          width: width - 2 * PADDING,
          height: height - 2 * PADDING,
          top: row * height + PADDING,
          left: col * width + PADDING
        }}>
        <div className="double-image-inner">
          <Image key={backImage} className="image-back" image={backImage} flipRotation={backRotation} flipOpacity={backOpacity} />
          <Image key={frontImageKey} className="image-front" image={frontImage} flipRotation={frontRotation} flipOpacity={frontOpacity} />
        </div>
      </div>
    );
  }
}