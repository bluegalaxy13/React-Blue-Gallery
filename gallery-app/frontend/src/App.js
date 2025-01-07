import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Gallery from './Gallery';

import './App.css';

 

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

 

const Header = ({ onNavClick, notification }) => {

 

  const handleFileUpload = async (event) => {

    const fileInputs = event.target.files;

    if (!fileInputs || fileInputs.length === 0) return;

 

    const formData = new FormData();

 

    // Append each file to the FormData

    for (let i = 0; i < fileInputs.length; i++) {

      formData.append('images', fileInputs[i]);

    }

 

    try {

      // Use await to wait for the fetch request to resolve

      const response = await fetch('http://localhost:3001/upload', {

        method: 'POST',

        body: formData,

      });

 

      const data = await response.json();

 

      if (data.filenames && data.filenames.length > 0) {

        localStorage.setItem('notification', 'Images uploaded successfully!');

        window.location.reload(); // Optional: You could consider a state-based update here instead of a reload

      } else {

        localStorage.setItem('notification', 'Error uploading images');

      }

    } catch (error) {

      console.error('Error uploading images:', error);

      notification('Error uploading images');

    }

  };

 

  const headerStyle = {

    backgroundColor: '#053B65',

    padding: '20px 0',

    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'flex-start',

    height: '50px',

    paddingLeft: '30px',

    position: 'fixed',

    top: '0',

    left: '0',

    width: '100%',

    zIndex: '1000',

  };

 

  const imageStyle = {

    width: '30px',

    height: '35px',

    filter: 'drop-shadow(-1px 3px 10px rgba(255, 255, 255, 0.2))',

  };

 

  const navLinksStyle = {

    display: 'flex',

    gap: '15px',

    marginLeft: '20px',

  };

 

  const linkStyle = {

    color: 'white',

    textDecoration: 'none',

    fontSize: '13px',

    fontWeight: 'bold',

    filter: 'drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.4))',

  };

 

  return (

    <header style={headerStyle}>

      <img src="RHM.png" alt="Rheinmetall Denel Munition" style={imageStyle} />

      <br />

      <div style={navLinksStyle}>

        <a href="#" style={linkStyle}>

          Home

        </a>

        <a href="#" onClick={() => onNavClick('gallery')} style={linkStyle}>

          Gallery

        </a>

        <a href="#" onClick={() => onNavClick('videos')} style={linkStyle}>

          Videos

        </a>

        <a href="#" onClick={() => onNavClick('publifications')} style={linkStyle}>

          Publifications

        </a>

        <input

          type="file"

          id="file-input"

          multiple

          style={{ display: 'none' }}

          onChange={handleFileUpload}

        />

        <a href="#" onClick={() => document.getElementById('file-input').click()} style={linkStyle}>

          +

        </a>

      </div>

    </header>

  );

};

 

function NavBar({ onNavClick, notification }) {

 

  const handleFileUpload = (event) => {

    const fileInputs = event.target.files;

    if (!fileInputs || fileInputs.length === 0) return;

 

    const formData = new FormData();

 

    for (let i = 0; i < fileInputs.length; i++) {

      formData.append('images', fileInputs[i]);

    }

 

    fetch('http://localhost:3001/upload', {

      method: 'POST',

      body: formData,

    })

      .then((response) => response.json())

      .then((data) => {

        if (data.filenames && data.filenames.length > 0) {

          localStorage.setItem('notification', 'Images uploaded successfully!');

          window.location.reload();

        } else {

          localStorage.setItem('notification', 'Error uploading images');

          window.location.reload();

        }

      })

      .catch((error) => {

        console.error('Error uploading images:', error);

        localStorage.setItem('notification', 'Error uploading images');

        window.location.reload();

      });

  };

 

 

useEffect(() => {

  const notificationMessage = localStorage.getItem('notification');

  if (notificationMessage) {

    notification(notificationMessage);

    localStorage.removeItem('notification');

  }

}, []);

 

 

  return (

    <div className="sidebar">
      <nav className="nav">
        <a>
          <img src="logo2.png" className="logo" alt="Logo" />
        </a>

        <a href="#" onClick={() => onNavClick('gallery')}>
          Gallery
        </a>

        <a href="#" onClick={() => onNavClick('videos')}>

          Videos

        </a>


 

        <a>

          <div className="upload-button-container">

            <input

              type="file"

              id="file-input"

              multiple

              style={{ display: 'none' }}

              onChange={handleFileUpload}

            />

            <p style={{ color: '#303030' }}>Add Yours:</p>

 

            <button

              id="upload-button"

              className="btn btn-success"

              onClick={() => document.getElementById('file-input').click()}

            >

              Upload

            </button>

          </div>

        </a>

        <br />

        <br />

        <br />

        <br />

        <br />

        <p>

          <span

            style={{

              color: '#004d99',

              padding: '0 10px',

              filter: 'drop-shadow(4px 6px 10px rgba(0, 0, 0, 0.5))',

            }}

          >

            TAKING RESPONSIBILITY

          </span>

          <br />

          <span

            style={{

              color: '#202020',

              padding: '0 10px',

              filter: 'drop-shadow(4px 6px 10px rgba(0, 0, 0, 0.5))',

            }}

          >

            IN A CHANGING WORLD

          </span>

        </p>

      </nav>

    </div>

  );

}

 

function App() {

  const [activeSection, setActiveSection] = useState('gallery');

  const [isMobile, setIsMobile] = useState(false);

 

  useEffect(() => {

    const handleResize = () => {

      setIsMobile(window.innerWidth < 1024);

    };

 

    window.addEventListener('resize', handleResize);

    handleResize();

 

    return () => {

      window.removeEventListener('resize', handleResize);

    };

  }, []);

 

  const handleNavClick = (section) => {

    setActiveSection(section);

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

 

  return (

    <div className="App">

      {isMobile ? <Header onNavClick={handleNavClick} notification={notification} /> : <NavBar onNavClick={handleNavClick} notification={notification} />}

      {activeSection === 'gallery' && <Gallery />}


    </div>

  );

}

 

export default App;