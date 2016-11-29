var coneOfSilence = require('../data/silence.js');
var mp4 = require('./mp4-generator.js');
var utils = require('./utils');
// var AudioSegmentStream = require('../index.js').AudioSegmentStream;

// var blindedMeWithSilence = function(clockTime, clockCycles, sampleRate) {
//  var audioSegmentStream = new AudioSegmentStream();
// };

// From hls.js
var getSilentFrame = function(channelCount) {
  if (channelCount === 1) {
    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x23, 0x80]);
  } else if (channelCount === 2) {
    return new Uint8Array([0x21, 0x00, 0x49, 0x90, 0x02, 0x19, 0x00, 0x23, 0x80]);
  } else if (channelCount === 3) {
    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x8e]);
  } else if (channelCount === 4) {
    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x80, 0x2c, 0x80, 0x08, 0x02, 0x38]);
  } else if (channelCount === 5) {
    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x38]);
  } else if (channelCount === 6) {
    return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x00, 0xb2, 0x00, 0x20, 0x08, 0xe0]);
  }
  return null;
}

var blindMeWithSilence = function(clockTime, clockCycles, audioInfo) {
  var
    i,
    clockStartTime = clockTime + 1024,
    frames = [],
    track = {
      type: 'audio',
      samplerate: audioInfo.samplerate,
      audioobjecttype: audioInfo.audioobjecttype,
      samplingfrequencyindex: audioInfo.samplingfrequencyindex,
      channelcount: audioInfo.channelcount,
    },
    mdat,
    moof,
    boxes,
    initSegment,
    bytes,
    // silence = coneOfSilence[track.samplerate],
    silence = getSilentFrame(track.channelcount),
    sequenceNumber = 1;

  if (clockCycles < 1024 || !silence) {
    return null;
  }

  for (i = 0; i < clockCycles - 1024; i += 1024) {
    frames.push({
      data: silence
    });
  }

  track.samples = utils.generateAacSampleTable(frames);
  mdat = mp4.mdat(utils.concatenateAacFrameData(frames));
  track.baseMediaDecodeTime = Math.floor(clockStartTime * (track.samplerate / 90000));
  moof = mp4.moof(sequenceNumber, [track]);
  boxes = new Uint8Array(moof.byteLength + mdat.byteLength);
  boxes.set(moof);
  boxes.set(mdat, moof.byteLength);

  initSegment = mp4.initSegment([track]);

  bytes = new Uint8Array(initSegment.byteLength + boxes.byteLength);
  bytes.set(initSegment);
  bytes.set(boxes, initSegment.byteLength);

  return bytes;
};

module.exports = {
  blindMeWithSilence: blindMeWithSilence
};
