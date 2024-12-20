let parasitesData = []; // Declare it globally so it's available throughout the script

document.addEventListener("DOMContentLoaded", () => {
  // Check if there's any character data in the URL (encoded in the query string)
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get("data");

  if (encodedData) {
    try {
      // Decode and parse the character data from the URL
      const characterData = JSON.parse(decodeURIComponent(encodedData));

      // Save the character data to localStorage
      localStorage.setItem("characterData", JSON.stringify(characterData));

      // Reload the character sheets with the loaded data
      fetch("parasites.json")
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error fetching parasites data: ${response.status}`);
          }
          return response.json();
        })
        .then(parasitesData => {
          renderCharacterSheets(characterData, parasitesData);
        })
        .catch(error => {
          console.error("Error fetching parasites.json:", error);
        });

    } catch (error) {
      console.error("Error parsing character data from URL:", error);
    }
  } else {
    // If no URL data is found, proceed with regular flow (loading from localStorage)
    const characterData = JSON.parse(localStorage.getItem("characterData")) || [];
    fetch("parasites.json")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching parasites data: ${response.status}`);
        }
        return response.json();
      })
      .then(parasitesData => {
        renderCharacterSheets(characterData, parasitesData);
      })
      .catch(error => {
        console.error("Error fetching parasites.json:", error);
      });
  }

  // Add event listener for creating a new character
  const createCharacterButton = document.getElementById("create-character-btn");
  if (createCharacterButton) {
    createCharacterButton.addEventListener("click", openCharacterFormModal);
  }

  // Add event listener for the form submission
  const characterForm = document.getElementById("character-form");
  if (characterForm) {
    characterForm.addEventListener("submit", handleCharacterFormSubmit);
  }
});

// Event listener for share button
const shareButton = document.getElementById("share-button");
if (shareButton) {
  shareButton.addEventListener("click", () => {
    // Get the character data from localStorage
    const characterData = JSON.parse(localStorage.getItem("characterData")) || [];

    // Generate a shareable URL by encoding the character data into the query string
    const encodedData = encodeURIComponent(JSON.stringify(characterData));

    const shareUrl = `${window.location.origin}?data=${encodedData}`;

    // Set the URL in the share modal input field
    const shareInput = document.getElementById("share-url");
    if (shareInput) {
      shareInput.value = shareUrl;
    }

    // Show the share modal
    const shareModal = document.getElementById("share-modal");
    if (shareModal) {
      shareModal.style.display = "block";
    }
  });
}

// Event listener for closing the share modal
const closeShareModalButton = document.getElementById("close-share-modal");
if (closeShareModalButton) {
  closeShareModalButton.addEventListener("click", () => {
    const shareModal = document.getElementById("share-modal");
    if (shareModal) {
      shareModal.style.display = "none";
    }
  });
}

// Function to render character sheets
function renderCharacterSheets(characterData, parasitesData) {
  const container = document.getElementById("character-sheets-container");
  container.innerHTML = ""; // Clear the container before rendering

  if (characterData.length === 0) {
    container.innerHTML = "<p>No character data available. Please add a character.</p>";
    return;
  }

  characterData.forEach(character => {
    const sheet = document.createElement("div");
    sheet.classList.add("character-sheet");

    // Calculate purity based on the number of parasites
    const purity = character.parasites.length;

    // Map the parasite IDs to their names and descriptions
    const parasiteDetails = character.parasites.map(id => {
      const parasite = parasitesData.find(p => p.id === id);
      return parasite ? {
        name: parasite.name,
        description: parasite.description
      } : { name: "Unknown Parasite", description: "No description available." };
    });

    sheet.innerHTML = `
      <div class="character-details cell">
        <span>${character.name}</span>
        <button class="delete-character-btn">Delete</button>
      </div>
      <div class="stats">
        <div class="cell">
          <label for="flesh">Flesh<br></label>
          <span class="value">${character.flesh}</span>
        </div>
        <div class="cell">
          <label for="spike">Spike<br></label>
          <span class="value">${character.spike}</span>
        </div>
        <div class="cell">
          <label for="crunch">Crunch<br></label>
          <span class="value">${character.crunch}</span>
        </div>
      </div>
      <div class="vitals">
        <div class="cell">
          <label for="vigour">Vigour</label>
           <div class="countable">
          <input type="number" value="${character.vigour[1]}" class="edit-vigour" data-name="${character.name}" />/<span>${character.vigour[0]}</span>
          </div>
          
        </div>
        <div class="cell">
          <label for="fatigue">Fatigue<br></label>
          <div class="countable">
            <input type="number" value="${character.fatigue[1]}" class="edit-fatigue" data-name="${character.name}" />/<span>${character.fatigue[0]}</span> 
          </div>
         
        </div>
      </div>
      <div class="parasites cell">
        <label>Parasites Infected</label>
        ${parasiteDetails.length > 0 ? parasiteDetails.map(parasite => 
          `<a class="parasite-name" data-name="${parasite.name}" data-description="${parasite.description}">${parasite.name}</a>`
        ).join("<br>") : "<span class='none'>None</span>"}
      </div>
      <div class="purity cell">
        <label>Parasitic Purity</label>
        <div class="purity-bar">${generatePurityBar(purity)}</div>
      </div>
    `;

    container.appendChild(sheet);
  });

  // Add event listener for parasite names
  document.querySelectorAll('.parasite-name').forEach(element => {
    element.addEventListener('click', event => {
      openModal(event.target.dataset.name, event.target.dataset.description);
    });
  });

  // Add event listener for delete button
  document.querySelectorAll('.delete-character-btn').forEach(button => {
    button.addEventListener('click', handleDeleteCharacter);
  });

  // Add event listeners for editable fields (fatigue and vigour)
  document.querySelectorAll('.edit-vigour').forEach(input => {
    input.addEventListener('blur', handleEditVigour);
  });
  document.querySelectorAll('.edit-fatigue').forEach(input => {
    input.addEventListener('blur', handleEditFatigue);
  });
}

// Function to generate purity bar based on the purity score
function generatePurityBar(purity) {
  const steps = 10; // Divide into 10 steps
  let barHTML = "";
  for (let i = 1; i <= steps; i++) {
    const active = i <= purity ? "active" : "";
    barHTML += `<div class="${active}"></div>`;
  }
  return barHTML;
}

// Function to open the modal with parasite details
function openModal(name, description) {
  const modal = document.getElementById("parasite-modal");
  const modalContent = document.getElementById("parasite-modal-content");

  if (!modal || !modalContent) {
    return;
  }

  modal.style.display = "block";
  modalContent.innerHTML = `
    <h2>${name}</h2>
    <p>${description}</p>
    <button id="close-modal">Close</button>
  `;

  // Add close functionality
  document.getElementById("close-modal")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal if user clicks outside of it
  window.addEventListener("click", event => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Function to open the character creation form modal
function openCharacterFormModal() {
  const formModal = document.getElementById("character-form-modal");
  if (formModal) {
    formModal.style.display = "block";
  }
}

function handleCharacterFormSubmit(event, parasitesData) {
  event.preventDefault(); // Prevent form from submitting and reloading the page

  // Get form elements by ID
  const nameInput = document.getElementById("character-name");
  const fleshInput = document.getElementById("character-flesh");
  const spikeInput = document.getElementById("character-spike");
  const crunchInput = document.getElementById("character-crunch");
  const vigourMaxInput = document.getElementById("character-vigour-max");
  const vigourCurrentInput = document.getElementById("character-vigour-current");
  const fatigueMaxInput = document.getElementById("character-fatigue-max");
  const fatigueCurrentInput = document.getElementById("character-fatigue-current");

  // Check if any of the inputs are missing
  if (!nameInput || !fleshInput || !spikeInput || !crunchInput || !vigourMaxInput || !vigourCurrentInput || !fatigueMaxInput || !fatigueCurrentInput) {
    console.error("One or more form fields are missing!");
    return; // Stop the function execution if fields are missing
  }

  const name = nameInput.value;
  const flesh = parseInt(fleshInput.value) || 0;
  const spike = parseInt(spikeInput.value) || 0;
  const crunch = parseInt(crunchInput.value) || 0;

  // Ensure that current and max vigour/fatigue are the same
  const vigourMax = parseInt(vigourMaxInput.value) || 0;
  const vigourCurrent = vigourMax;  // Set current vigour to max vigour
  const fatigueMax = parseInt(fatigueMaxInput.value) || 0;
  const fatigueCurrent = fatigueMax;  // Set current fatigue to max fatigue

  const parasites = []; // Set the initial parasites array to an empty array

  const newCharacter = {
    name,
    flesh,
    spike,
    crunch,
    vigour: [vigourMax, vigourCurrent],
    fatigue: [fatigueMax, fatigueCurrent],
    parasites
  };

  saveCharacterData(newCharacter);

  // Close the form modal after submission
  const formModal = document.getElementById("character-form-modal");
  if (formModal) {
    formModal.style.display = "none";
  }

  // Clear form fields
  document.getElementById("character-form").reset();

  // Reload the character sheets with the updated data
  const updatedCharacterData = JSON.parse(localStorage.getItem("characterData")) || [];
  renderCharacterSheets(updatedCharacterData, parasitesData);
}

// Function to close a modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// Add event listeners for all close buttons
document.addEventListener("DOMContentLoaded", () => {
  // Close modal when clicking the close button
  document.getElementById("close-share-modal")?.addEventListener("click", () => closeModal("share-modal"));
  document.getElementById("close-parasite-modal")?.addEventListener("click", () => closeModal("parasite-modal"));
  document.getElementById("close-character-form-modal")?.addEventListener("click", () => closeModal("character-form-modal"));
  
  // Close modal if user clicks outside of it
  window.addEventListener("click", event => {
    const modals = ["share-modal", "parasite-modal", "character-form-modal"];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (event.target === modal) {
        closeModal(modalId);
      }
    });
  });
});


// Function to save character data to local storage
function saveCharacterData(character) {
  const characterData = JSON.parse(localStorage.getItem("characterData")) || [];
  characterData.push(character);
  localStorage.setItem("characterData", JSON.stringify(characterData));

  // Show an alert confirming that the character has been saved
  alert("Character has been saved successfully!");
}


// Function to handle character deletion
function handleDeleteCharacter(event) {
  const characterName = event.target.closest('.character-sheet').querySelector('.character-details span').textContent;

  // Get current character data from localStorage
  const characterData = JSON.parse(localStorage.getItem("characterData"));

  // Filter out the character to delete
  const updatedCharacterData = characterData.filter(character => character.name !== characterName);

  // Save the updated character data to localStorage
  localStorage.setItem("characterData", JSON.stringify(updatedCharacterData));

  // Reload the character sheets with the updated data
  renderCharacterSheets(updatedCharacterData, parasitesData);
}

// Function to handle the editing of vigour
function handleEditVigour(event) {
  const characterName = event.target.getAttribute("data-name");
  const newVigour = parseInt(event.target.value);

  // Get current character data from localStorage
  const characterData = JSON.parse(localStorage.getItem("characterData"));
  const character = characterData.find(c => c.name === characterName);

  if (character) {
    character.vigour[1] = newVigour;
    localStorage.setItem("characterData", JSON.stringify(characterData));
  }
}

// Function to handle the editing of fatigue
function handleEditFatigue(event) {
  const characterName = event.target.getAttribute("data-name");
  const newFatigue = parseInt(event.target.value);

  // Get current character data from localStorage
  const characterData = JSON.parse(localStorage.getItem("characterData"));
  const character = characterData.find(c => c.name === characterName);

  if (character) {
    character.fatigue[1] = newFatigue;
    localStorage.setItem("characterData", JSON.stringify(characterData));
  }
}
