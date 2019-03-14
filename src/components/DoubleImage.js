import React, { Component } from 'react';

import Image from './Image';

export default class DoubleImage extends Component {
  onClick = () => {
    const { onImageClick, index } = this.props;
    onImageClick(index);
  }

  render() {
    const { frontImage, backImage, flipRotation, width, height, row, col, first, last } = this.props;
    const firstLastClass = first ? 'first' : last ? 'last' : null;
    const className = 'double-image' + (firstLastClass ? ' ' + firstLastClass : '');
    // const backClass = 'image-back';
    const backClass = frontImage ? 'image-back' : 'image-front';
    return (
      <div className={className} style={{ width: width, height: height, top: row * height, left: col * width }} onClick={this.onClick}>
        <div className="double-image-inner" style={{ transform: 'rotateY(' + flipRotation + 'deg)' }}>
          <Image className={backClass} image={backImage}/>
          {frontImage ? (
            <Image className="image-front" image={frontImage}/>
          ) : null}
          {/* <Image className={'image-front'} image={frontImage} /> */}
        </div>
      </div>
    );
  }
}