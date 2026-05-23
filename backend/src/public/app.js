// Global App State
let activeSessionId = null;
let pollInterval = null;
let displayedMessageIds = new Set();
let scenarioList = [];

// DOM Elements
const scenarioSelect = document.getElementById("scenario-select");
const scenarioDesc = document.getElementById("scenario-desc");
const startBtn = document.getElementById("start-btn");
const uploadDialog = document.getElementById("upload-dialog");
const missingFieldsContainer = document.getElementById("missing-fields-container");
const uploadDocBtn = document.getElementById("upload-doc-btn");
const skipUploadBtn = document.getElementById("skip-upload-btn");
const terminalLogs = document.getElementById("terminal-logs");
const terminalTyping = document.getElementById("terminal-typing");
const statusIndicator = document.getElementById("status-indicator");

// Dashboard Elements
const compScoreEl = document.getElementById("comp-score");
const compClassEl = document.getElementById("comp-class");
const gapsContainer = document.getElementById("gaps-list-container");
const reportPreview = document.getElementById("report-preview");
const jsonViewer = document.getElementById("json-viewer");

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  await loadScenarios();
  
  // Event Listeners
  startBtn.addEventListener("click", startPipeline);
  scenarioSelect.addEventListener("change", handleScenarioChange);
  uploadDocBtn.addEventListener("click", handleMockUpload);
  skipUploadBtn.addEventListener("click", handleSkipUpload);
});

// --- Tab Switching Logic ---
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetTabId = tab.getAttribute("data-tab");
      const contents = document.querySelectorAll(".tab-content");
      contents.forEach(c => {
        c.classList.remove("active");
        if (c.id === targetTabId) {
          c.classList.add("active");
        }
      });
    });
  });
}

// --- Fetch scenarios on load ---
async function loadScenarios() {
  try {
    const res = await fetch("/api/scenarios");
    scenarioList = await res.json();
    
    scenarioSelect.innerHTML = scenarioList.map(s => 
      `<option value="${s.id}">${s.name}</option>`
    ).join("");
    
    handleScenarioChange();
  } catch (err) {
    console.error("Failed to load scenarios:", err);
    scenarioDesc.textContent = "Error loading scenarios. Please check your backend connection.";
  }
}

function handleScenarioChange() {
  const selectedId = scenarioSelect.value;
  const scenario = scenarioList.find(s => s.id === selectedId);
  if (scenario) {
    scenarioDesc.textContent = scenario.description;
  }
}

// --- Start the Compliance Check ---
async function startPipeline() {
  // Clear previous session state
  if (pollInterval) clearInterval(pollInterval);
  activeSessionId = "session_" + Math.random().toString(36).substr(2, 9);
  displayedMessageIds.clear();
  terminalLogs.innerHTML = `<div class="system-message">New compliance session initialized: <strong>${activeSessionId}</strong></div>`;
  uploadDialog.classList.add("hidden");
  
  const scenario = scenarioSelect.value;
  
  setStatus("active", "STARTING");
  setTypingIndicator(true, "Orchestrating agent network...");

  try {
    const res = await fetch("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSessionId, scenario })
    });
    const data = await res.json();
    
    // Start Polling loop (every 750ms for hyper-responsiveness)
    pollInterval = setInterval(() => pollSession(activeSessionId), 750);
  } catch (err) {
    console.error("Failed to start session:", err);
    addSystemLog("CRITICAL ERROR: API Server is unreachable. Ensure the backend is running.");
    setTypingIndicator(false);
    setStatus("idle", "ERROR");
  }
}

// --- Poll active session details ---
async function pollSession(sessionId) {
  try {
    const res = await fetch(`/api/session/${sessionId}`);
    const state = await res.json();
    
    updateDashboardUI(state);
    processMessageLogs(state.messages);
    
    // Manage Status state transitions
    if (state.status === "AWAITING_USER_UPLOAD") {
      setStatus("waiting", "WAITING FOR DOCUMENTS");
      setTypingIndicator(false);
      showUploadDialog(state.missingFields);
    } 
    else if (state.status.startsWith("COMPLETED")) {
      setStatus("idle", "COMPLETED");
      setTypingIndicator(false);
      uploadDialog.classList.add("hidden");
      clearInterval(pollInterval);
      addSystemLog("Pipeline process complete. Access final results in the dashboard panels.");
    } 
    else {
      setStatus("active", state.status);
      setTypingIndicator(true, getProgressLabel(state.status));
    }
  } catch (err) {
    console.error("Polling error:", err);
  }
}

// --- Append message logs into Terminal ---
function processMessageLogs(messages) {
  let newMessagesAdded = false;
  
  messages.forEach(msg => {
    if (displayedMessageIds.has(msg.id)) return;
    displayedMessageIds.add(msg.id);
    
    newMessagesAdded = true;
    
    // Skip logging system-initiated internal transitions to reduce noise
    if (msg.type === "LOG" && msg.content.includes("status updated")) return;
    
    const logDiv = document.createElement("div");
    logDiv.className = "log-item animate-slide-in";
    
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tagClass = `tag-${msg.sender.toLowerCase()}`;
    
    logDiv.innerHTML = `
      <div class="log-meta">
        <span class="tag ${tagClass}">${msg.sender}</span>
        <span class="tag-arrow">→</span>
        <span class="tag tag-system">${msg.recipient}</span>
        <span class="log-time">${time}</span>
      </div>
      <div class="log-content">${escapeHTML(msg.content)}</div>
    `;
    
    terminalLogs.appendChild(logDiv);
  });
  
  if (newMessagesAdded) {
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }
}

// --- Prompt supplementary documents dialog ---
function showUploadDialog(missingFields) {
  if (!uploadDialog.classList.contains("hidden")) return; // Already showing
  
  missingFieldsContainer.innerHTML = missingFields.map(f => 
    `<span class="field-tag">${formatFieldLabel(f)}</span>`
  ).join("");
  
  uploadDialog.classList.remove("hidden");
  addSystemLog("🚨 Pipeline paused. Manual compliance document uploads requested.");
}

// --- Mock Document Upload Click ---
async function handleMockUpload() {
  if (!activeSessionId) return;
  
  // Choose a relevant mock document name based on what's missing
  const filesToUpload = ["supplementary_clinical_monitoring_procedures.pdf"];
  
  uploadDialog.classList.add("hidden");
  setStatus("active", "UPLOADING");
  setTypingIndicator(true, "Parsing supplemental files...");
  addSystemLog(`User uploaded document: [${filesToUpload[0]}]`);

  try {
    await fetch(`/api/session/${activeSessionId}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: filesToUpload })
    });
  } catch (err) {
    console.error("Upload error:", err);
  }
}

// --- Skip Document Upload Click ---
async function handleSkipUpload() {
  if (!activeSessionId) return;
  
  uploadDialog.classList.add("hidden");
  setStatus("active", "SKIPPING");
  setTypingIndicator(true, "Converging risk files...");
  addSystemLog("User bypassed file uploads. Continuing with known deficiencies.");

  try {
    await fetch(`/api/session/${activeSessionId}/skip`, {
      method: "POST"
    });
  } catch (err) {
    console.error("Skip error:", err);
  }
}

// --- Render Dashboard panel data ---
function updateDashboardUI(state) {
  // Scorecards
  if (state.humanizedSummary) {
    compScoreEl.textContent = `${state.humanizedSummary.complianceScore}%`;
    compScoreEl.style.color = state.humanizedSummary.complianceScore >= 80 ? "var(--color-success)" : "var(--color-warning)";
    compClassEl.textContent = state.humanizedSummary.riskClassification || "-";
  } else {
    compScoreEl.textContent = "-";
    compClassEl.textContent = state.riskClassification || "-";
  }
  
  // Checklist Items Grid
  const govData = state.governanceData || {};
  const fields = ["documentation", "riskManagement", "transparency", "humanOversight", "monitoring", "logging", "accountability", "roleClarity"];
  
  fields.forEach(field => {
    const itemEl = document.querySelector(`[data-field="${field}"]`);
    if (itemEl) {
      const statusEl = itemEl.querySelector(".status");
      if (govData[field]) {
        statusEl.textContent = "✅ PRESENT";
        statusEl.className = "status status-present";
      } else if (state.status === "IDLE" || state.status === "PARSING") {
        statusEl.textContent = "-";
        statusEl.className = "status";
      } else {
        statusEl.textContent = "❌ MISSING";
        statusEl.className = "status status-missing";
      }
    }
  });

  // Gaps warning rendering
  if (state.gaps && state.gaps.length > 0) {
    gapsContainer.innerHTML = state.gaps.map(gap => 
      `<div class="gap-card">${escapeHTML(gap)}</div>`
    ).join("");
  } else if (state.status === "COMPLETED_SUCCESS") {
    gapsContainer.innerHTML = `<div class="empty-state" style="color: var(--color-success)">🎉 All 8 governance criteria met successfully!</div>`;
  } else {
    gapsContainer.innerHTML = `<p class="empty-state">No gaps identified yet. Run evaluation.</p>`;
  }

  // Assumptions list rendering
  const assumptionsContainer = document.getElementById("assumptions-list-container");
  if (assumptionsContainer) {
    if (state.assumptions && state.assumptions.length > 0) {
      assumptionsContainer.innerHTML = state.assumptions.map(ass => 
        `<div class="assumption-card">${escapeHTML(ass)}</div>`
      ).join("");
    } else {
      assumptionsContainer.innerHTML = `<p class="empty-state">No assumptions analyzed yet. Run evaluation.</p>`;
    }
  }

  // Prevention markdown converter
  if (state.preventionOutput) {
    reportPreview.innerHTML = parseMarkdownToHTML(state.preventionOutput);
  } else {
    reportPreview.innerHTML = `<p class="empty-state">Report will be compiled once pipeline converges.</p>`;
  }

  // JSON viewer
  jsonViewer.textContent = JSON.stringify(state, null, 2);
}

// --- Auxiliary Helpers ---

function setStatus(cls, text) {
  statusIndicator.className = `status-indicator status-${cls}`;
  statusIndicator.textContent = text;
}

function setTypingIndicator(show, text = "") {
  if (show) {
    terminalTyping.classList.remove("hidden");
    terminalTyping.querySelector(".typing-text").textContent = text;
  } else {
    terminalTyping.classList.add("hidden");
  }
}

function getProgressLabel(status) {
  switch (status) {
    case "PARSING": return "InputParser is extracting proposal text...";
    case "CLASSIFYING": return "DecisionTree is evaluating risk category...";
    case "ANALYZING_GOVERNANCE": return "JudgeOfGovernance is checking parameters...";
    case "CHECKING_MISSING_INFO": return "MissingInfoChecker is assessing gaps...";
    case "CONVERGING": return "AssumptionsChecker & PreventionOfConfidence compiling report...";
    default: return "Multi-agent network processing...";
  }
}

function addSystemLog(content) {
  const logDiv = document.createElement("div");
  logDiv.className = "system-message animate-slide-in";
  logDiv.innerHTML = content;
  terminalLogs.appendChild(logDiv);
  terminalLogs.scrollTop = terminalLogs.scrollHeight;
}

function formatFieldLabel(field) {
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function parseMarkdownToHTML(markdown) {
  let html = markdown;
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Warning indicators
  html = html.replace(/⚠️/g, '⚠️');
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  
  // Wrap list items in ul
  // Simply wrap consecutive lists
  return html;
}
