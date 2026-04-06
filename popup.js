document.addEventListener("DOMContentLoaded", async () => {
  const addBtn = document.getElementById("add-btn");
  const dynamicContainer = document.getElementById("dynamic-trackers");

  // 1. Initial Load from Storage
  chrome.storage.local.get(["customSites"], (data) => {
    const sites = data.customSites || [];
    renderCustomSites(sites);
    checkForSync(sites);
  });

  // 2. Add New Course Logic
  addBtn.addEventListener("click", () => {
    const nameVal = document.getElementById("new-name").value;
    const urlVal = document.getElementById("new-url").value;
    if (nameVal && urlVal) {
      chrome.storage.local.get(["customSites"], (data) => {
        const sites = data.customSites || [];
        sites.push({ name: nameVal, domain: urlVal, percent: "0%" });
        chrome.storage.local.set({ customSites: sites }, () => {
          renderCustomSites(sites);
          document.getElementById("new-name").value = "";
          document.getElementById("new-url").value = "";
        });
      });
    }
  });

  // 3. Delete Logic
  dynamicContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.getAttribute("data-index");
      chrome.storage.local.get(["customSites"], (data) => {
        let sites = data.customSites || [];
        sites.splice(index, 1);
        chrome.storage.local.set({ customSites: sites }, () =>
          renderCustomSites(sites),
        );
      });
    }
  });

  // 4. Drawing function
  function renderCustomSites(sites) {
    dynamicContainer.innerHTML = "";

    sites.forEach((site, index) => {
      const card = document.createElement("div");
      card.className = "course-card";
      const fixedUrl = site.domain.startsWith("http")
        ? site.domain
        : `https://${site.domain}`;

      // NEW: Logic to detect the platform name
      const platformName = detectPlatform(site.domain);

      card.innerHTML = `
      <div class="title-row">
        <div>
          <span class="platform-label">${platformName}</span>
          <a href="${fixedUrl}" target="_blank" class="course-link">${site.name} ↗</a>
        </div>
        <span class="delete-btn" data-index="${index}">Delete</span>
      </div>
      <div class="progress-bar"><div class="fill" style="width: ${site.percent};"></div></div>
      <div class="percent-text">Saved: ${site.percent}</div>
    `;
      dynamicContainer.appendChild(card);
    });
  }

  // NEW: Helper function for platform detection
  function detectPlatform(domain) {
    const d = domain.toLowerCase();
    if (d.includes("coursera")) return "Coursera";
    if (d.includes("freecodecamp")) return "freeCodeCamp";
    if (d.includes("udacity")) return "Udacity";
    if (d.includes("udemy")) return "Udemy";
    if (d.includes("youtube")) return "YouTube";
    return "External Provider"; // Default if not recognized
  }

  // 5. Universal Scraper (Supports % and X/Y)
  async function checkForSync(sites) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const index = sites.findIndex((s) => tab.url.includes(s.domain));

      if (index !== -1) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const text = document.body.innerText;
            // Matches "9%" or "15 / 300"
            const pctMatch = text.match(/(\d+)%/);
            const fracMatch = text.match(/(\d+)\s*[\/\s|of]+\s*(\d+)/);

            if (pctMatch) return pctMatch[0];
            if (fracMatch) {
              const p = Math.round(
                (parseInt(fracMatch[1]) / parseInt(fracMatch[2])) * 100,
              );
              return `${p}%`;
            }
            return null;
          },
        });

        if (results?.[0]?.result) {
          sites[index].percent = results[0].result;
          chrome.storage.local.set({ customSites: sites }, () =>
            renderCustomSites(sites),
          );
        }
      }
    } catch (err) {
      console.log("Sync skipped.");
    }
  }
});
