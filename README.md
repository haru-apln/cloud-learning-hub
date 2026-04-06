# ☁️ Cloud Learning HUD
A Chrome Extension to track learning progress across multiple platforms (AWS/Coursera, freeCodeCamp, Udacity) in one persistent dashboard.

### Features
* **Multi-Platform Sync:** Automatically scrapes progress from learning platforms such as Coursera, Udacity, FreeCodeCamp, etc.
* **State Persistence:** Uses `chrome.storage.local` to remember progress even when tabs are closed.
* **Dynamic CRUD:** Users can add or delete custom course trackers via the UI.
* **Platform Detection:** Logic to automatically identify the learning provider based on the domain.

### Tech Stack
* JavaScript (ES6+), HTML5, CSS3, Chrome Extensions API (Manifest V3).