document.addEventListener("DOMContentLoaded", () => {
  // Load character data from local storage or initialize with default values
  const characterData = JSON.parse(localStorage.getItem("characterData")) || [];

  // Load parasite data
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
          <label for="vigour">Vigour<br></label>
          <span>${character.vigour}</span>
        </div>
        <div class="cell">
          <label for="fatigue">Fatigue<br></label>
          <span>${character.fatigue}</span>
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

// Handle form submission to create a new character
// Handle form submission to create a new character
function handleCharacterFormSubmit(event) {
  event.preventDefault(); // Prevent form from submitting and reloading the page

  const name = document.getElementById("character-name").value;
  const flesh = parseInt(document.getElementById("character-flesh").value) || 0;
  const spike = parseInt(document.getElementById("character-spike").value) || 0;
  const crunch = parseInt(document.getElementById("character-crunch").value) || 0;
  const vigour = parseInt(document.getElementById("character-vigour").value) || 0;
  const fatigue = parseInt(document.getElementById("character-fatigue").value) || 0;
  const parasites = []; // Set the initial parasites array to an empty array

  const newCharacter = {
    name,
    flesh,
    spike,
    crunch,
    vigour,
    fatigue,
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


// Function to save character data to local storage
function saveCharacterData(character) {
  const characterData = JSON.parse(localStorage.getItem("characterData")) || [];
  characterData.push(character);
  localStorage.setItem("characterData", JSON.stringify(characterData));
}
