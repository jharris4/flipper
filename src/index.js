import React from 'react';
import { render } from 'react-dom';

import Root from './components/Root';

import "./flipper.css";

const container = document.getElementById('root');

const baseUrl = PUBLIC_PATH + 'data/';
const manifestLocation = 'images.json';

const loadWebImage = (url) =>
  new Promise((resolve, reject) => {
    try {
      let loadingImage = new Image();
      loadingImage.onload = () => {
        resolve(loadingImage);
      }
      loadingImage.src = url;
    }
    catch (e) {
      reject(e);
    }
  });

render((
  <Root baseUrl={baseUrl} manifestLocation={manifestLocation} loadImage={loadWebImage}/>
), container);
