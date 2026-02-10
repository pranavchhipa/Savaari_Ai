'use client';

// Singleton to track script loading state
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve) => {
        // Check if already loaded (e.g. by @vis.gl/react-google-maps APIProvider)
        if (typeof window !== 'undefined' && window.google?.maps?.places) {
            scriptLoaded = true;
            resolve();
            return;
        }

        if (scriptLoaded) {
            resolve();
            return;
        }

        loadCallbacks.push(resolve);

        if (scriptLoading) return;
        scriptLoading = true;

        if (typeof document === 'undefined') return;

        // Check if a Google Maps script tag already exists in the DOM
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            // Script exists but hasn't loaded yet — wait for it
            const checkReady = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(checkReady);
                    scriptLoaded = true;
                    loadCallbacks.forEach(cb => cb());
                    loadCallbacks.length = 0;
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            scriptLoaded = true;
            loadCallbacks.forEach(cb => cb());
            loadCallbacks.length = 0;
        };
        script.onerror = () => {
            console.error('Failed to load Google Maps script');
            scriptLoading = false;
        };
        document.head.appendChild(script);
    });
}
