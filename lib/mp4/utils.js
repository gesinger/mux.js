var
  sumFrameByteLengths,
  concatenateAacFrameData,
  generateAacSampleTable;

/**
 * Sum the `byteLength` properties of the data
 */
sumFrameByteLengths = function(array) {
  var
    i,
    currentObj,
    sum = 0;

  // sum the byteLength's all each nal unit in the frame
  for (i = 0; i < array.length; i++) {
    currentObj = array[i];
    sum += currentObj.data.byteLength;
  }

  return sum;
};

// generate the track's sample table from an array of frames
concatenateAacFrameData = function(frames) {
  var
    i,
    currentFrame,
    dataOffset = 0,
    data = new Uint8Array(sumFrameByteLengths(frames));

  for (i = 0; i < frames.length; i++) {
    currentFrame = frames[i];

    data.set(currentFrame.data, dataOffset);
    dataOffset += currentFrame.data.byteLength;
  }
  return data;
};

// generate the track's raw mdat data from an array of frames
generateAacSampleTable = function(frames) {
  var
    i,
    currentFrame,
    samples = [];

  for (i = 0; i < frames.length; i++) {
    currentFrame = frames[i];
    samples.push({
      size: currentFrame.data.byteLength,
      duration: 1024 // For AAC audio, all samples contain 1024 samples
    });
  }
  return samples;
};

module.exports = {
  concatenateAacFrameData: concatenateAacFrameData,
  generateAacSampleTable: generateAacSampleTable
};
