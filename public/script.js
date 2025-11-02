// public/script.js
// -----------------------------------------------------------
// FRONTEND: Handles the two-step user interaction
// -----------------------------------------------------------

const outlineForm = document.getElementById('outline-form');
const outlineDisplay = document.getElementById('outline-display');
const draftOutput = document.getElementById('draft-output');
const loadingIndicator = document.getElementById('loading-indicator');
const errorDisplay = document.getElementById('error-message');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');

// State to hold the data generated in Step 1
let currentOutline = '';
let currentTopic = '';

// Helper function to show/hide loading state and errors
function setLoading(isLoading, message = '') {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
    errorDisplay.style.display = 'none';
    if (message) {
        errorDisplay.textContent = message;
        errorDisplay.style.display = 'block';
    }
}

// ------------------------------------------
// STEP 1: GENERATE OUTLINE
// ------------------------------------------
outlineForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);
    errorDisplay.style.display = 'none';
    
    const topic = document.getElementById('topic-input').value;
    const keywords = document.getElementById('keywords-input').value;

    try {
        const response = await fetch('/api/generate-outline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, keywords }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error during outline generation.');
        }

        const data = await response.json();
        
        // 1. Save data to the global state
        currentOutline = data.outline;
        currentTopic = data.mainTopic;
        
        // 2. Display outline for user interaction
        renderOutline(currentOutline);
        
        // 3. Switch UI view
        step1.style.display = 'none';
        step2.style.display = 'block';

    } catch (error) {
        setLoading(false, `Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
});

// Function to render the outline and make lines clickable
function renderOutline(outlineText) {
    // Split the outline into lines
    const lines = outlineText.split('\n').filter(line => line.trim() !== '');
    
    // Create clickable elements
    const clickableOutline = lines.map(line => {
        // Only make lines with content clickable
        if (line.trim().length > 3) { 
            return `<p class="outline-item" data-section-title="${line.trim()}">${line.trim()}</p>`;
        }
        return `<p>${line}</p>`;
    }).join('');

    outlineDisplay.innerHTML = clickableOutline;

    // Attach click listeners to the new items
    document.querySelectorAll('.outline-item').forEach(item => {
        item.addEventListener('click', draftSectionHandler);
    });
}

// ------------------------------------------
// STEP 2: DRAFT SECTION (CLICK HANDLER)
// ------------------------------------------
async function draftSectionHandler(event) {
    const sectionTitle = event.target.dataset.sectionTitle;
    
    if (!sectionTitle) return;

    setLoading(true);
    draftOutput.innerHTML = `<p>✍️ Drafting section: "${sectionTitle}"...</p>`;
    
    try {
        const response = await fetch('/api/draft-section', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fullOutline: currentOutline, 
                sectionTitle: sectionTitle,
                mainTopic: currentTopic 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error during section drafting.');
        }

        const data = await response.json();

        // Display the final drafted paragraph
        draftOutput.innerHTML = `<p><strong>Draft for: ${sectionTitle}</strong></p><hr><p>${data.draft}</p>`;

    } catch (error) {
        draftOutput.innerHTML = `<p class="error-message">❌ Error drafting section: ${error.message}</p>`;
    } finally {
        setLoading(false);
    }
}