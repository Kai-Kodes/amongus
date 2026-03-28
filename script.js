let currentSceneIndex = 1;
const totalScenes = 7;
let voteInterval = null;

// Parse URL params
const urlParams = new URLSearchParams(window.location.search);
const toName = urlParams.get('to') || 'Crewmate';

// Inject names dynamically
document.querySelectorAll('.inject-name').forEach(el => {
    el.textContent = toName;
});

function initSetup() {
    const loaderBar = document.querySelector('.loader-bar');
    const cta = document.querySelector('.cta-setup');
    let progress = 0;
    
    // The loader container appears at 4 seconds (due to delay-4 animation).
    setTimeout(() => {
        const interval = setInterval(() => {
            progress += 1;
            if(loaderBar) loaderBar.style.width = `${progress}%`;
            
            if(progress >= 100) {
                clearInterval(interval);
                if(cta) cta.classList.add('visible');
            }
        }, 25); // 100 steps * 25ms = 2500ms (2.5 seconds)
    }, 4500); // 4.5s start offset guarantees the loader is visible
}

function startVoteCounter() {
    const voteText = document.getElementById('vote-counter-text');
    if (!voteText) return;
    
    let dots = 0;
    voteInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        const dotsStr = ".".repeat(dots);
        voteText.textContent = `Voting in progress${dotsStr}`;
    }, 500);
}

function stopVoteCounter() {
    if (voteInterval) clearInterval(voteInterval);
}


// --- FAKE CONTROL LOGIC ---
function staySilent() {
    const btnSilent = document.getElementById('btn-silent');
    const btnDefend = document.getElementById('btn-defend');
    if(btnSilent) btnSilent.disabled = true;
    if(btnDefend) btnDefend.disabled = true;
    startTensionTimer();
}

function defendYourself() {
    const btnSilent = document.getElementById('btn-silent');
    const btnDefend = document.getElementById('btn-defend');
    const msg = document.getElementById('too-late-msg');
    
    if(btnSilent) btnSilent.disabled = true;
    if(btnDefend) btnDefend.disabled = true;
    if(msg) msg.classList.remove('hidden');
    
    setTimeout(() => {
        startTensionTimer();
    }, 1500); // 1.5s delay after reading message
}

function startTensionTimer() {
    stopVoteCounter();
    const overlay = document.getElementById('tension-overlay');
    const numberEl = document.getElementById('countdown-number');
    if(!overlay || !numberEl) { nextScene(); return; }
    
    overlay.classList.add('visible');
    
    let count = 3;
    numberEl.textContent = count;
    
    // Countdown immediately from 3 -> 2 -> 1 over 3 intervals
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            numberEl.textContent = count;
            // Pop animation manually via scaling toggle
            numberEl.style.transform = 'scale(1.2)';
            setTimeout(() => numberEl.style.transform = 'scale(1)', 150);
        } else {
            clearInterval(countInterval);
            overlay.classList.remove('visible');
            nextScene(); 
        }
    }, 1000);
}


function nextScene() {
    const currentScene = document.getElementById(`scene-${currentSceneIndex}`);
    if (currentScene) {
        currentScene.classList.remove('active');
    }
    
    currentSceneIndex++;
    if (currentSceneIndex > totalScenes) return;

    const nextSceneEl = document.getElementById(`scene-${currentSceneIndex}`);
    if (nextSceneEl) {
        nextSceneEl.classList.add('active');
        handleSceneSpecifics(currentSceneIndex);
    }
}

function handleSceneSpecifics(index) {
    if (index === 3) {
        startVoteCounter();
    } else {
        stopVoteCounter(); // backup stop
    }

    if (index === 4) {
        // Elimination auto-progress
        const impostorText = document.getElementById('impostor-text');
        
        setTimeout(() => {
            if(impostorText) impostorText.classList.remove('hidden');
        }, 1500);

        // Auto transition to Scan Result (Scene 5) after 4 seconds total
        setTimeout(() => {
            nextScene();
        }, 4000);
    }
    
    if (index === 5) {
        // Scan Result auto-progress
        setTimeout(() => {
            nextScene(); // To Reveal Scene 6
        }, 7000); // 7s allows time for reading stats
    }
}

function shareUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied! Task remaining: Send to your friend.");
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Ensure initSetup only runs once the scene is active
let setupInitialized = false;
document.addEventListener("DOMContentLoaded", () => {
    if (!setupInitialized) { setupInitialized = true; initSetup(); }
});
if (document.readyState === "complete" || document.readyState === "interactive") {
    // Fallback if event already fired
    setTimeout(() => {
        if (!setupInitialized && currentSceneIndex === 1) { setupInitialized = true; initSetup(); }
    }, 100);
}
