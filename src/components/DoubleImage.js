import React, { Component } from 'react';

import Image from './Image';

export default class DoubleImage extends Component {
  onClick = () => {
    const { onImageClick, index } = this.props;
    onImageClick(index);
  }

  render() {
    const { tweenFlag, frontImage, backImage, flipRotation, flipOpacity, width, height, row, col, first, last } = this.props;
    const firstLastClass = first ? 'first' : last ? 'last' : null;
    const className = 'double-image' + (firstLastClass ? ' ' + firstLastClass : '');
    const backRotation = tweenFlag ? 180 - flipRotation : flipRotation;
    const frontRotation = flipRotation;
    const backOpacity = tweenFlag ? 1 - flipOpacity : flipOpacity;
    const frontOpacity = flipOpacity
    return (
      <div className={className} style={{ width: width, height: height, top: row * height, left: col * width }} onClick={this.onClick}>
        <div className="double-image-inner">
          {(tweenFlag || backImage) ? (
            <Image className="image-back" image={backImage} front={false} flipRotation={backRotation} flipOpacity={backOpacity}/>
           ): null}
          {frontImage ? (
            <Image className="image-front" image={frontImage} front={true} flipRotation={frontRotation} flipOpacity={frontOpacity}/>
           ) : null}
        </div>
      </div>
    );
  }
}