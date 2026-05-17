/**
 * Ambient Sanctuary Logic for BiblioDrift
 * Handles background ambient sounds (Rain, Fireplace, Ocean) with volume control.
 * Handles background ambient sounds (Rain, Fireplace) with volume control.
 * FIXED: Volume now persists across pages using localStorage
 */

class AmbientManager {
    constructor() {
        this.toggleBtn = document.getElementById('ambientToggle');
        this.panel = document.getElementById('ambientPanel');
        this.rainToggle = document.getElementById('rainToggle');
        this.fireToggle = document.getElementById('fireToggle');
        this.oceanToggle = document.getElementById('oceanToggle');
        this.stormToggle = document.getElementById('stormToggle');
        this.volumeSlider = document.getElementById('ambientVolume');

        // Defensive check: only initialize if elements exist
        if (!this.toggleBtn || !this.panel) return;

        this.rainAudio = new Audio('https://archive.org/download/Red_Library_Nature_Rain/R22-25-General%20Rain.mp3');
        this.rainAudio.preload = 'auto';
        this.fireAudio = new Audio('https://archive.org/download/1-hour-cozy-fire-crackling-fireplace-320/1%20hour%20Cozy%20Fire%20Crackling%20Fireplace%20320.mp3');
        this.fireAudio.preload = 'auto';
        this.oceanAudio = new Audio('../assets/sounds/calm-ocean-waves.mp3');
        this.oceanAudio.preload = 'auto';
        this.stormAudio = new Audio('../assets/sounds/Rain-and-storm.mp3');
        this.stormAudio.preload = 'auto';
        
        this.rainAudio.loop = true;
        this.fireAudio.loop = true;
        this.oceanAudio.loop = true;
        this.stormAudio.loop = true;

        // Prevent the weird 'high bass' or thunder sound at the very end of the rain track
        this.rainAudio.addEventListener('timeupdate', () => {
            if (this.rainAudio.duration && this.rainAudio.currentTime >= this.rainAudio.duration - 4) {
                this.rainAudio.currentTime = 0;
                this.rainAudio.play().catch(e => {});
            }
        });

        // Global Audio Unlock (Required by modern browsers)
        this.audioUnlocked = false;
        this.unlockAudio = () => {
            if (this.audioUnlocked) return;
            this.rainAudio.play().then(() => { this.rainAudio.pause(); }).catch(e => {});
            this.fireAudio.play().then(() => { this.fireAudio.pause(); }).catch(e => {});
            this.oceanAudio.play().then(() => { this.oceanAudio.pause(); }).catch(e => {});
            console.log("Audio Context Unlocked");
            this.audioUnlocked = true;
            window.removeEventListener('click', this.unlockAudio);
        };
        window.addEventListener('click', this.unlockAudio);

        // FIXED: Load saved volume from localStorage
        this.loadVolume();
        this.loadAudioStates();
        this.init();
    }

    /**
     * Load volume preference from localStorage
     */
    loadVolume() {
        const savedVolume = localStorage.getItem('bibliodrift_ambient_volume');
        const volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
        
        // Set audio volumes
        this.rainAudio.volume = volume;
        this.fireAudio.volume = volume;
        
        // Set slider to match
        if (this.volumeSlider) {
            this.volumeSlider.value = volume;
        }
        
        console.log(`Loaded ambient volume: ${volume}`);
    }
    /**
     * Load audio states from localStorage
     */
    loadAudioStates() {
        const rainState = localStorage.getItem('bibliodrift_rain_state');
        const fireState = localStorage.getItem('bibliodrift_fire_state');
        
        if (rainState === 'true') {
            this.rainToggle.checked = true;
            this.rainAudio.play().catch(e => {});
        }
        
        if (fireState === 'true') {
            this.fireToggle.checked = true;
            this.fireAudio.play().catch(e => {});
        }
    }
    
    /**
     * Save audio state to localStorage
     */
    saveAudioState(type, isPlaying) {
        localStorage.setItem(`bibliodrift_${type}_state`, isPlaying.toString());
    }

    /**
     * Save volume preference to localStorage
     */
    saveVolume(volume) {
        localStorage.setItem('bibliodrift_ambient_volume', volume.toString());
        console.log(`Saved ambient volume: ${volume}`);
    }

    init() {
        // Toggle Panel
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.unlockAudio();
            this.panel.classList.toggle('active');
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && e.target !== this.toggleBtn) {
                this.panel.classList.remove('active');
            }
        });

        // Rain Toggle
        this.rainToggle.addEventListener('change', () => {
            if (this.rainToggle.checked) {
                this.rainAudio.currentTime = 0;
                this.rainAudio.play().then(() => {
                    console.log("Rain audio playing");
                    this.saveAudioState('rain', true); // ADD THIS
                }).catch(e => {
                    console.error("Rain audio failed:", e);
                });
            } else {
                this.rainAudio.pause();
                this.saveAudioState('rain', false); // ADD THIS
            }
        });

        // Fire Toggle - ADD saveAudioState
        this.fireToggle.addEventListener('change', () => {
            if (this.fireToggle.checked) {
                this.fireAudio.currentTime = 0;
                this.fireAudio.play().then(() => {
                    console.log("Fire audio playing");
                    this.saveAudioState('fire', true); // ADD THIS
                }).catch(e => {
                    console.error("Fire audio failed:", e);
                });
            } else {
                this.fireAudio.pause();
                this.saveAudioState('fire', false); // ADD THIS
            }
        });

        // Ocean Waves Toggle
        this.oceanToggle.addEventListener('change', () => {
            if (this.oceanToggle.checked) {
                this.oceanAudio.currentTime = 0;
                this.oceanAudio.play()
                    .then(() => console.log("Ocean audio playing"))
                    .catch(e => {
                        console.error("Ocean audio failed:", e);
                        if (typeof showToast === 'function') {
                            showToast("Audio playback blocked. Click anywhere to enable.", "info");
                        }
                    });
            } else {
                this.oceanAudio.pause();
            }
        });

        // Stormy Rain Toggle
        this.stormToggle.addEventListener('change', () => {
            if (this.stormToggle.checked) {
                this.stormAudio.currentTime = 0;
                this.stormAudio.play()
                    .then(() => console.log("Storm audio playing"))
                    .catch(e => {
                        console.error("Storm audio failed:", e);
                        if (typeof showToast === 'function') {
                            showToast("Audio playback blocked. Click anywhere to enable.", "info");
                        }
                    });
            } else {
                this.rainAudio.pause();
                this.saveAudioState('rain', false); // ADD THIS
            }
        });

        // Fire Toggle - ADD saveAudioState
        this.fireToggle.addEventListener('change', () => {
            if (this.fireToggle.checked) {
                this.fireAudio.currentTime = 0;
                this.fireAudio.play().then(() => {
                    console.log("Fire audio playing");
                    this.saveAudioState('fire', true); // ADD THIS
                }).catch(e => {
                    console.error("Fire audio failed:", e);
                });
            } else {
                this.fireAudio.pause();
                this.saveAudioState('fire', false); // ADD THIS
            }
        });

        // FIXED: Volume Control - now saves to localStorage
        this.volumeSlider.addEventListener('input', () => {
            const volume = parseFloat(this.volumeSlider.value);
            this.rainAudio.volume = volume;
            this.fireAudio.volume = volume;
            this.saveVolume(volume); // Save to localStorage
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.ambientManager = new AmbientManager();
});