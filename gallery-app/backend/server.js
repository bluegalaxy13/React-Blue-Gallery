const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();


// Middleware
app.use(bodyParser.json());
app.use(cors());

// Define the upload folder for images
const uploadDir = path.join(__dirname, 'public', 'images');
const metadataPath = path.join(__dirname, 'image-metadata.json');
let imageMetadata = fs.existsSync(metadataPath)
  ? JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
  : {};

 
// Ensure the 'images' folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
 

// Set up Multer for image file handling
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory to store the images
  },

  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase();
    const filename = Date.now() + extname; // Unique filename with proper extension
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to initialize image positions based on metadata
const initializeImagePositions = () => {

  const files = fs.readdirSync(uploadDir);

  // We should only update positions for new images or those missing from metadata
  files.forEach((fileName, index) => {

    if (!imageMetadata[fileName]) {

      // Assign positions to new images
      imageMetadata[fileName] = {
        filename: fileName,
        caption: '',
        position: index + 1 // Position starts from 1
      };
    }
  });

  // Save the updated metadata back to the file
  fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2));
};


// Endpoint to get the list of images
app.get('/images', (req, res) => {

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read image directory.' });
    }

    // Load existing metadata
    let imageMetadata = {};
    if (fs.existsSync(metadataPath)) {
      const metadata = fs.readFileSync(metadataPath, 'utf8');
      if (metadata) {
        imageMetadata = JSON.parse(metadata); 
      }
    }

    // Map through the images and return the name and caption
    const imagesWithCaptions = files.map(fileName => ({
      name: fileName,
      caption: imageMetadata[fileName]?.caption || '',  // If caption doesn't exist, use empty string
      position: imageMetadata[fileName]?.position || 0
    }));

    // Sort the images by position
    imagesWithCaptions.sort((a, b) => a.position - b.position);

    res.json(imagesWithCaptions); // Send back an array of images with captions
  });
});

 
// Endpoint to handle multiple image uploads
app.post('/upload', upload.array('images'), (req, res) => {

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  // Store metadata for each uploaded image
  const uploadedImages = req.files.map((file, index) => {

    const newImage = {
      filename: file.filename,
      caption: '', // Initialize with no caption
      position: Object.keys(imageMetadata).length + index + 1, // Incremental position
    };

    // Add the new image to the metadata
    imageMetadata[newImage.filename] = newImage;
    return newImage;
  });

  // Update the metadata file with the new image data
  fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2));

  // Ensure positions for all images are updated correctly
  initializeImagePositions();

  // Respond with the list of uploaded image filenames
  res.json({
    message: 'Images uploaded successfully!',
    filenames: uploadedImages.map((image) => image.filename),
  });
});

 
// Endpoint to handle image deletion
app.delete('/delete/images/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(uploadDir, imageName);

  // Check if the image exists
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Delete the image
    fs.unlink(imagePath, (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error deleting image' });
      }

      // Remove metadata entry for the deleted image
      delete imageMetadata[imageName];
      fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2));

      // Recalculate positions for remaining images based on updated metadata
      initializeImagePositions();

      return res.json({ success: true, message: 'Image deleted successfully!' });
    });
  });
});


// Endpoint to update caption
app.put('/update/caption/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const caption = req.body.caption;

  if (imageMetadata[imageName]) {
    imageMetadata[imageName].caption = caption; // Update the caption
    fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Image not found' });
  }
});


app.put('/update/position', (req, res) => {
  const newOrder = req.body.order; // Order should be an array of image filenames in the new order
 
  if (!Array.isArray(newOrder)) {
    return res.status(400).json({ error: 'Invalid order format. Expected an array of filenames.' });
  }

  // Ensure that all images in the new order exist in the metadata
  for (const imageName of newOrder) {
    if (!imageMetadata[imageName]) {
      return res.status(400).json({ error: `Image '${imageName}' not found in metadata.` });
    }
  }

  // Update the position of each image based on the new order
  newOrder.forEach((imageName, index) => {
    imageMetadata[imageName].position = index + 1; // Set new position based on the order
  });

  // Save the updated metadata back to the file
  fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2));

  // Respond with a success message
  res.json({ success: true, message: 'Image positions updated successfully.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
