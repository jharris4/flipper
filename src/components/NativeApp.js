import React, { Component } from 'react';
import { View } from 'react-native';

import NativeDoubleImage from './NativeDoubleImage';

const DESIRED_COLUMN_WIDTH = 200;

function getColumnsForWidth(width) {
  // return width < 200 ? 1 : width < 500 ? 2 : width < 1200 ? 4 : 5;
  return width < DESIRED_COLUMN_WIDTH ? 1 : Math.floor(width / DESIRED_COLUMN_WIDTH);
}

function getHeightForWidth(width) {
  return width * 1.25;
}

export class App extends Component {
  render() {
    const { width, height, images, tweenFlags, frontImages, backImages, flipRotations, flipOpacities,
      baseUrl, loadedImages, onImageClick } = this.props;
    const columns = getColumnsForWidth(width);
    const imageWidth = Math.floor(width / columns);
    const imageHeight = getHeightForWidth(imageWidth);

    const appStyle = {
      width,
      height,
      position: 'relative',
      width: '100%',
      height: '100%',
      minWidth: '100%',
      minHeight: '100%'
    };

    return (
      <View className="app" style={appStyle}>
        {images ? images.map((image, i) => {
          const frontImage = frontImages.get(i) ? baseUrl + frontImages.get(i) : null;
          const backImage = backImages.get(i) ? baseUrl + backImages.get(i) : null;
          return (
            <NativeDoubleImage
              key={i}
              index={i}
              tweenFlag={tweenFlags.get(i)}
              frontImage={frontImage}
              backImage={backImage}
              flipRotation={flipRotations.get(i)}
              flipOpacity={flipOpacities.get(i)}
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
      </View>
    );
  }
}
