import metaDataManager from './metaData/metaDataManager.js';
import { metaDataProvider } from './metaData/metaDataProvider.js';
import VolumeAcquisition from './VolumeAcquisition.js';
import ImageId from './ImageId.js';
import augmentPromise from './augmentPromise.js';
import cornerstoneEvents from './cornerstoneEvents.js';

const nifti = {
  loadImage (imageId) {
    const imageIdObject = ImageId.fromURL(imageId);
    const volumeAcquisition = VolumeAcquisition.getInstance();

    cornerstoneEvents.imageLoadStart(imageIdObject);

    let promise = volumeAcquisition.acquire(imageIdObject).
      then((volume) => volume.slice(imageIdObject)).
      then((slice) => {
        metaDataManager.add(imageIdObject.url, slice.compoundMetaData);
        cornerstoneEvents.imageLoadEnd(imageIdObject);

        return slice.cornerstoneImageObject;
      });

    // temporary 'hack' to make the loader work with applications that expect
    // jquery.deferred promises (such as the StudyPrefetcher in OHIF)
    promise = augmentPromise(promise);

    // temporary 'hack' to make the loader work on both cornerstone@1 and @2
    // @1 expected a promise to be returned directly, whereas @2 expects an
    // object like { promise, cancelFn }
    promise.promise = promise;

    return promise;
  },

  ImageId,

  register (cornerstone) {
    cornerstone.registerImageLoader('nifti', this.loadImage);
    cornerstone.metaData.addProvider(metaDataProvider);
  }
};

export default nifti;
