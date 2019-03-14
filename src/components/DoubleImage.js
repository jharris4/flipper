import React, { PureComponent } from 'react';

import Image from './Image';

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
    const useBackImage = true;
    const userFrontImage = tweenFlag;
    return (
      <div className={className} style={{ width: width, height: height, top: row * height, left: col * width }} onClick={this.onClick}>
        <div className="double-image-inner">
          <Image className="image-back" image={backImage} visible={useBackImage} flipRotation={backRotation} flipOpacity={backOpacity} />
          <Image className="image-front" image={frontImage} visible={userFrontImage} flipRotation={frontRotation} flipOpacity={frontOpacity} />
        </div>
      </div>
    );
  }
}