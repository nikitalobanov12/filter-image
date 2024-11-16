// /utils/IOhandler.js
const fs = require('fs');
const { PNG } = require('pngjs');

const filters = {
  grayscale: (data, width, height) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const gray = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
        data[idx] = gray;
        data[idx + 1] = gray;
        data[idx + 2] = gray;
      }
    }
  },
  invert: (data, width, height) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        data[idx] = 255 - data[idx];
        data[idx + 1] = 255 - data[idx + 1];
        data[idx + 2] = 255 - data[idx + 2];
      }
    }
  },
   sepiaFilter: (data, width, height) => {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const red = data[idx];
            const green = data[idx + 1];
            const blue = data[idx + 2];
            data[idx] = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue); // Red channel
            data[idx + 1] = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue); // Green channel
            data[idx + 2] = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue); // Blue channel
        }
    }
},
brightnessFilter: (data, width, height, adjustment = 40) => {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            data[idx] = Math.min(255, Math.max(0, data[idx] + adjustment)); // Red
            data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + adjustment)); // Green
            data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + adjustment)); // Blue
        }
    }
},
contrastFilter:  (data, width, height, contrast = 20) => {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            data[idx] = Math.min(255, Math.max(0, factor * (data[idx] - 128) + 128)); // Red
            data[idx + 1] = Math.min(255, Math.max(0, factor * (data[idx + 1] - 128) + 128)); // Green
            data[idx + 2] = Math.min(255, Math.max(0, factor * (data[idx + 2] - 128) + 128)); // Blue
        }
    }
},
thresholdFilter: (data, width, height, threshold = 128) => {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) << 2;
            const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            const value = avg > threshold ? 255 : 0;
            data[idx] = value;
            data[idx + 1] = value;
            data[idx + 2] = value;
        }
    }
},
vintageFilter: (data, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const red = data[idx];
      const green = data[idx + 1];
      const blue = data[idx + 2];
      data[idx] = Math.min(255, 0.9 * red + 0.2 * green);
      data[idx + 1] = Math.min(255, 0.8 * green + 0.2 * blue);
      data[idx + 2] = Math.min(255, 0.5 * blue + 0.2 * red);
    }
  }
},
warmFilter: (data, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = Math.min(255, data[idx] + 30); // Add warmth to red
      data[idx + 1] = Math.min(255, data[idx + 1] + 15); // Slight warmth to green
      data[idx + 2] = Math.max(0, data[idx + 2] - 15); // Reduce blue for warmth
    }
  }
},
coolFilter: (data, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = Math.max(0, data[idx] - 20); // Reduce red
      data[idx + 1] = Math.min(255, data[idx + 1] + 10); // Add a slight green tint
      data[idx + 2] = Math.min(255, data[idx + 2] + 30); // Add coolness to blue
    }
  }
},
fadeFilter: (data, width, height) => {
  const fadeAmount = 50; // Adjust as needed
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = Math.min(255, (data[idx] + fadeAmount) / 2); // Red
      data[idx + 1] = Math.min(255, (data[idx + 1] + fadeAmount) / 2); // Green
      data[idx + 2] = Math.min(255, (data[idx + 2] + fadeAmount) / 2); // Blue
    }
  }
},
dramaticFilter: (data, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = Math.min(255, data[idx] * 1.2); // Increase highlights for red
      data[idx + 1] = Math.min(255, data[idx + 1] * 1.1); // Increase green slightly
      data[idx + 2] = Math.min(255, data[idx + 2] * 1.3); // Boost blue
    }
  }
},
vibrantFilter: (data, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      data[idx] = Math.min(255, data[idx] * 1.1); // Boost red
      data[idx + 1] = Math.min(255, data[idx + 1] * 1.2); // Boost green
      data[idx + 2] = Math.min(255, data[idx + 2] * 1.3); // Boost blue
    }
  }
},
original: (data, width, height) => {
//show the original image back to the user haven't figured out a better way to do this
}
};

const applyFilter = async (input, output, filterName) => {
  const filterFunction = filters[filterName];
  if (!filterFunction) throw new Error('Invalid filter');

  return new Promise((resolve, reject) => {
    fs.createReadStream(input)
      .pipe(new PNG({ filterType: 4 }))
      .on('parsed', function () {
        filterFunction(this.data, this.width, this.height);
        this.pack()
          .pipe(fs.createWriteStream(output))
          .on('finish', resolve)
          .on('error', reject);
      })
      .on('error', reject);
  });
};

export default applyFilter;
