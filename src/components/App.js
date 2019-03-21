import React, { Component } from 'react';

import DoubleImage from './DoubleImage';

const DESIRED_COLUMN_WIDTH = 200;

function getColumnsForWidth(width) {
  // return width < 200 ? 1 : width < 500 ? 2 : width < 1200 ? 4 : 5;
  return width < DESIRED_COLUMN_WIDTH ? 1 : Math.floor(width / DESIRED_COLUMN_WIDTH);
}

function getHeightForWidth(width) {
  return width * 1.25;
}

export default class App extends Component {
  render() {
    const { platformProps } = this.props;
    const { FlipperScrollView } = platformProps;
    const { width, height, images, tweenFlags, frontImages, backImages, flipPercentages,
      baseUrl, loadedImages, onImageClick } = this.props;
    const columns = getColumnsForWidth(width);
    const rows = Math.ceil(images.length / columns);
    const imageWidth = Math.floor(width / columns);
    const imageHeight = getHeightForWidth(imageWidth);
    const rowsHeight = rows * imageHeight;

    const appStyle = {
      width,
      height: rowsHeight,
      position: 'relative',
      minWidth: width,
      minHeight: height
    };

    return (
      <FlipperScrollView className="app" style={appStyle}>
        {images ? images.map((image, i) => {
          const frontImage = frontImages.get(i) ? baseUrl + frontImages.get(i) : null;
          const backImage = backImages.get(i) ? baseUrl + backImages.get(i) : null;
          return (
            <DoubleImage
              key={i}
              platformProps={platformProps}
              index={i}
              tweenFlag={tweenFlags.get(i)}
              frontImage={frontImage}
              backImage={backImage}
              flipPercentage={flipPercentages.get(i)}
              loaded={loadedImages.get(i)}
              onImageClick={onImageClick}
              width={imageWidth}
              height={imageHeight}
              row={Math.floor(i / columns)}
              col={i % columns}
              first={i % columns === 0}
              last={i % columns === columns -1}/>
          )
        }) : null}
      </FlipperScrollView>
    );
  }
}
