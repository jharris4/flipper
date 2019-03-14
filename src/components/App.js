import React, { Component } from 'react';
import DoubleImage from './DoubleImage';

import sizer from 'react-sizer';

function getColumnsForWidth(width) {
  return width < 200 ? 1 : width < 500 ? 2 : width < 1200 ? 4 : 5;
}

function getHeightForWidth(width) {
  return width * 1.25;
}

class App extends Component {
  render() {
    const { width, height, images, frontImages, backImages, flipRotations, baseUrl, loadedImages, onImageClick } = this.props;
    const columns = getColumnsForWidth(width);
    const imageWidth = Math.floor(width / columns);
    const imageHeight = getHeightForWidth(imageWidth);
    return (
      <div className="app" style={{ width: width, height: height }}>
        {images ? images.map((image, i) => {
          const frontImage = frontImages.get(i) ? baseUrl + frontImages.get(i) : null;
          const backImage = backImages.get(i) ? baseUrl + backImages.get(i) : null;
          return (
            <DoubleImage key={i} index={i} frontImage={frontImage} backImage={backImage} flipRotation={flipRotations.get(i)} loaded={loadedImages.get(i)}
              width={imageWidth} height={imageHeight} onImageClick={onImageClick}
              row={Math.floor(i / columns)} col={i % columns}
              first={i % columns === 0} last={i % columns === columns -1}/>
          )
        }) : null}
      </div>
    );
  }
}

export default sizer()(App);