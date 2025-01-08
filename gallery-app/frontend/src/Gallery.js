import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDrag, useDrop } from 'react-dnd';
import { Modal } from 'bootstrap';


function scrollToTopAndShowModal() {
  if (window.scrollY > 0) {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  const modal = document.querySelector('#modal');
}


const Gallery = () => {

  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [isEditingCaptionInModal, setIsEditingCaptionInModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');

 
  const loadImages = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }, []);

 
  useEffect(() => {
    loadImages();
  }, [loadImages]);

 
  const moveImage = async (draggedIndex, hoveredIndex) => {
    const updatedImages = [...images];
    const [draggedImage] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(hoveredIndex, 0, draggedImage);

    setImages(updatedImages);
 
    const newOrder = updatedImages.map((image) => image.name);

    try {
      const response = await fetch('http://localhost:3001/update/position', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });

      const data = await response.json();

      if (!data.success) {
        notification('Error updating image positions');
      }

    } catch (error) {
      console.error('Error updating positions:', error);
      alert('Error updating image positions.');
    }
  };

 
  const getRenderLimit = () => {
    const len = images.length;
    if (len >= 60) return 60;
    if (len >= 55) return 55;
    if (len >= 45) return 45;
    if (len >= 33) return 33;
    if (len >= 27) return 27;
    if (len >= 19) return 14;
    if (len >= 13) return 14;

    return len;
  };

  const imagesToRender = images.slice(0, getRenderLimit())

  const RenderImageItem = ({ img, index, deleteCaption, addCaption, deleteImage, getRenderLimit }) => {

    const [isEditingCaption, setIsEditingCaption] = useState(false);
    const [newCaption, setNewCaption] = useState(img.caption || '');
    const [showModal, setShowModal] = useState(false);

    const isLastImage = index === getRenderLimit() - 1;

    const [{ isDragging }, drag] = useDrag({
      type: 'IMAGE',
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'IMAGE',
      hover: (item) => {
        if (item.index !== index) {
          moveImage(item.index, index);
          item.index = index;
        }
      },
    });

    const handleCaptionClick = () => {
      setShowModal(true);
      scrollToTopAndShowModal();
    };

    const handleModalClose = () => {
      setShowModal(false);
    };

    const handleUpdateCaption = () => {
      setIsEditingCaption(true);
      setNewCaption(img.caption);
      setShowModal(false);
    };

    const handleDeleteCaption = () => {
      deleteCaption(img.name);
      setShowModal(false);
    };

    const handleCaptionSubmit = (event) => {
      if (event.key === 'Enter') {
        if (newCaption.trim()) {
          addCaption(img.name, newCaption);
          setIsEditingCaption(false);
        } else {
          notification('Caption cannot be empty');
        }
      }
    };

    const handleCaptionInputChange = (event) => {
      setNewCaption(event.target.value);
    };

    const modalStyle = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '90%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000',
      boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
    };

    const modalDialogStyle = {
      border: 'none',
      margin: '0 auto',
    };

    const modalContentStyle = {
      padding: '15px',
      borderRadius: '10px',
      background: 'white',
      color: 'black',
      textAlign: 'center',
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'auto',
    };

    const modalBodyStyle = {
      padding: '10px 20px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
    };

    const updateBtnStyle = {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '5px',
      border: 'none',
      fontSize: '10px',
    };

    const deleteBtnStyle = {
      backgroundColor: '#f44336',
      color: 'white',
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '5px',
      border: 'none',
      fontSize: '10px',
    };

    const cancelBtnStyle = {
      backgroundColor: '#9e9e9e',
      color: 'white',
      padding: '10px 20px',
      cursor: 'pointer',
      borderRadius: '5px',
      border: 'none',
      fontSize: '10px',
    };

    return (
      <div
        ref={(node) => drag(drop(node))}
        key={img.name}
        className="gallery-item"
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <img
          src={`http://localhost:3001/images/${img.name}`}
          alt={img.name}
          className="gallery-image"
          onClick={() => {
            if (img.name) {
              setCurrentImageIndex(index);
              const imageModal = new Modal(document.getElementById('imageModal'));
              imageModal.show();
            }
          }}
        />

        <button
          className="delete-button"
          onClick={(event) => {
            event.stopPropagation();
            deleteImage(img.name);
          }}
        >
          X
        </button>

        {/* Show the "Add Caption" button when the image does not have a caption and is not in editing mode */}
        {!isEditingCaption && !img.caption && (
          <button
            className="caption-button"
            onClick={() => {
              setIsEditingCaption(true);
            }}
          >
            Add Caption+
          </button>
        )}

        {/* Input field for editing caption */}
        {isEditingCaption && (
          <input
            type="text"
            value={newCaption}
            onChange={handleCaptionInputChange}
            onKeyDown={handleCaptionSubmit}
            autoFocus
            className="caption-input"
          />
        )}


        {/* Display caption if not in editing mode */}
        {img.caption && !isEditingCaption && (
          <span
            className="image-caption"
            onClick={handleCaptionClick}
          >
            {img.caption}
          </span>
        )}


        {isLastImage && images.length > getRenderLimit() && (
          <span className="remaining-images-text">
            +{images.length - getRenderLimit()}
          </span>
        )}


      {/* Modal for update/delete caption */}
      {showModal && (
        <div className="modal fade show" id="captionModal" tabIndex="-1" aria-labelledby="captionModalLabel" aria-hidden="true" style={modalStyle}>
          <div className="modal-dialog modal-dialog-centered" style={modalDialogStyle}>
            <div className="modal-content" style={modalContentStyle}>
              <div className="modal-body" style={modalBodyStyle}>
                <h3 style={{fontSize: '15px'}}>What would you like to do with the caption?</h3>
                <button
                  className="update-btn"
                  onClick={handleUpdateCaption}
                  style={updateBtnStyle}
                >
                  Update
                </button>
                <button
                  className="delete-btn"
                  onClick={handleDeleteCaption}
                  style={deleteBtnStyle}
                >
                  Delete
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleModalClose}
                  style={cancelBtnStyle}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  };

  const modalDialogStyle = {
    border: 'none',
    margin: '0 auto',
    position: 'absolute',
    top: '-100px',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'top 0.5s ease',
  };

  const modalContentStyle = {
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
    background: 'white',
    color: 'black',
    textAlign: 'center',
    width: 'auto',
  };

  const modalBodyStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
  };

  const notification = (message) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalDialog = document.createElement('div');
    Object.assign(modalDialog.style, modalDialogStyle);

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, modalContentStyle);

    const modalBody = document.createElement('div');
    Object.assign(modalBody.style, modalBodyStyle);

    modalBody.textContent = message;
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    setTimeout(() => {
      modalDialog.style.top = '0';
    }, 250);

    setTimeout(() => {
      modalDialog.style.top = '-100px';
    }, 2000);

    setTimeout(() => {
      modal.remove();
    }, 2500);
  };

  const confirm = (message, callback) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const modalDialog = document.createElement('div');
    Object.assign(modalDialog.style, modalDialogStyle);

    const modalContent = document.createElement('div');
    Object.assign(modalContent.style, modalContentStyle);

    const modalBody = document.createElement('div');
    Object.assign(modalBody.style, modalBodyStyle);

    modalBody.textContent = message;
    modalContent.appendChild(modalBody);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '10px';

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.style.padding = '10px 20px';
    yesButton.style.backgroundColor = '#4CAF50';
    yesButton.style.color = 'white';
    yesButton.style.border = 'none';
    yesButton.style.borderRadius = '5px';
    yesButton.style.cursor = 'pointer';

    yesButton.onclick = () => {
      callback(true);
      modal.remove();
    };

    const noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.style.padding = '10px 20px';
    noButton.style.backgroundColor = '#f44336';
    noButton.style.color = 'white';
    noButton.style.border = 'none';
    noButton.style.borderRadius = '5px';
    noButton.style.cursor = 'pointer';

    noButton.onclick = () => {
      callback(false);
      modal.remove();
    };

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    modalContent.appendChild(buttonContainer);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    setTimeout(() => {
      modalDialog.style.top = '0';
    }, 250);

    setTimeout(() => {
      modalDialog.style.top = '-100px';
    }, 5000);

    setTimeout(() => {
      modal.remove();
    }, 5500);
  };

  const deleteImage = (imageName) => {
    confirm('Are you sure you want to delete this image?', (isConfirmed) => {
      if (isConfirmed) {
        fetch(`http://localhost:3001/delete/images/${imageName}`, { method: 'DELETE' })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              notification('Image deleted successfully!');
              setImages(images.filter((img) => img.name !== imageName));
            } else {
              notification('Error deleting image: ' + data.error);
            }
          })

          .catch((error) => {
            console.error('Error deleting image:', error);
            notification('Error deleting image.');
          });
      } else {
        console.log('Image deletion canceled.');
      }
    });
  };

  const addCaption = async (imageName, caption) => {
    if (!caption || caption.trim() === '') {
      alert('Caption cannot be empty or just spaces!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/update/caption/${imageName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });

      const data = await response.json();

      if (data.success) {
        notification('Caption added/updated successfully!');
        setImages(
          images.map((img) =>
            img.name === imageName ? { ...img, caption } : img
          )
        );
      } else {
        notification('Error adding/updating caption: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding/updating caption:', error);
      notification('Error adding/updating caption.');
    }
  };

  const deleteCaption = async (imageName) => {
    try {
      const response = await fetch(`http://localhost:3001/update/caption/${imageName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: '' }),
      });

      const data = await response.json();

      if (data.success) {
        notification('Caption deleted successfully!');
        setImages(
          images.map((img) =>
            img.name === imageName ? { ...img, caption: '' } : img
          )
        );
      } else {
        notification('Error deleting caption: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting caption:', error);
      notification('Error deleting caption.');
    }
  };

  const handleCaptionSubmit = (event) => {
    if (event.key === 'Enter') {
      if (newCaption.trim()) {
        addCaption(images[currentImageIndex]?.name, newCaption);
        setIsEditingCaption(false);
      } else {
        notification('Caption cannot be empty');
      }
    }
  };

  const handleArrowKeys = useCallback((event) => {
    if (event.key === 'ArrowLeft' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (event.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  }, [currentImageIndex, images.length]);

  const updateExpandedImage = useCallback(() => {
    const expandedImage = document.getElementById('expanded-image');
    expandedImage.src = 'http://localhost:3001/images/' + images[currentImageIndex]?.name;
  }, [currentImageIndex, images]);

  useEffect(() => {
    updateExpandedImage();
  }, [currentImageIndex, updateExpandedImage]);

  useEffect(() => {
    loadImages();
    document.addEventListener('keydown', handleArrowKeys);
    return () => {
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [handleArrowKeys, loadImages]);

  useEffect(() => {
    updateExpandedImage();
  }, [currentImageIndex, updateExpandedImage]);

  useEffect(() => {
    setIsEditingCaptionInModal(false);
    setNewCaption(images[currentImageIndex]?.caption || '');
  }, [currentImageIndex, images]);

  const prevStyle = {
    fontSize: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: '50%', 
    border: 'none',
    color: 'white',
    position: 'fixed',
    top: '50%',
    left: '160px', 
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    boxSizing: 'border-box',
    paddingBottom: '20px'
  };

  const nextStyle = {
    fontSize: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: '50%', 
    border: 'none',
    color: 'white',
    position: 'fixed',
    top: '50%',
    right: '160px', 
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    boxSizing: 'border-box',
    paddingBottom: '20px',
  };

  const modalStyles = {
    modal: {
      border: 'none',
      boxShadow: 'none',
    },
    modalDialog: {
      border: 'none',
      boxShadow: 'none',
    },
    modalContent: {
      border: 'none',
      boxShadow: 'none',
    },
    modalBody: {
      padding: 0,
    },
    expandedImage: {
      border: 'none',
      width: '100%',
      height: 'auto',
      objectFit: 'contain',
      display: 'block',
      margin: '0 auto',
    },
  };

  const addCaptionStyle = {
    fontSize: '20px',
    background: 'none',
    borderRadius: '50%',
    border: 'none',
    color: 'white',
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
  }

  return (
    <div className="gallery-container">
      <div className="content">
        <div className="container-fluid mt-4">
          <div id="image-gallery">
          {imagesToRender.map((img, index) => (
            <RenderImageItem
              key={img.name}
              img={img}
              index={index}
              deleteCaption={deleteCaption}
              addCaption={addCaption}
              deleteImage={deleteImage}
              getRenderLimit={getRenderLimit}
            />
          ))}
          </div>
        </div>
      </div>

      <div  className="modal fade" id="imageModal" tabIndex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" style={modalStyles.modalDialog}>
          <div  className="modal-content" style={modalStyles.modalContent}>
            <div className="modal-body" style={modalStyles.modalBody}>
              <img  id="expanded-image" src="" alt="" />

              <button
                className="delete-button-expanded"
                onClick={() => {
                  const imageName = images[currentImageIndex]?.name;
                  deleteImage(imageName);
                  const modal = Modal.getInstance(document.getElementById('imageModal'));
                  modal.hide();
                }}
              >
                X
              </button>
              <button
                className="prev-btn"
                style={prevStyle}
                onClick={() => currentImageIndex > 0 && setCurrentImageIndex(currentImageIndex - 1)}
              >
                &lt;
              </button>
              <button
                className="next-btn"
                style={nextStyle}
                onClick={() => currentImageIndex < images.length - 1 && setCurrentImageIndex(currentImageIndex + 1)}
              >
                &gt;
              </button>

              {!images[currentImageIndex]?.caption && !isEditingCaptionInModal && (
                <button
                  className="modal-caption-button"
                  style={addCaptionStyle}
                  onClick={() => setIsEditingCaptionInModal(true)}
                >
                  Add Caption +
                </button>
              )}

              {images[currentImageIndex]?.caption && !isEditingCaptionInModal && (
                <span
                  className="image-caption"
                  onClick={() => {
                    setIsEditingCaptionInModal(true);
                    setNewCaption(images[currentImageIndex]?.caption);
                  }}
                >
                  {images[currentImageIndex]?.caption}
                </span>
              )}

              {isEditingCaptionInModal && (
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  onKeyDown={handleCaptionSubmit}
                  autoFocus
                  className="caption-input"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
