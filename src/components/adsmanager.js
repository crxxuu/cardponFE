import {useEffect} from 'react'

// adManager.js - Comprehensive ad management utility
class AdManager {
    constructor() {
      this.adScripts = new Map();
      this.adConfig = {
        monetag: {
          src: 'https://fpyf8.com/88/tag.min.js',
          zone: '151276',
          selector: '[data-zone="151276"]'
        }
      };
      this.isSubscribed = false;
      this.observer = null;
      this.init();
    }
  
    init() {
      // Set up mutation observer to catch dynamically added ads
      this.setupMutationObserver();
    }
  
    setupMutationObserver() {
      this.observer = new MutationObserver((mutations) => {
        if (this.isSubscribed) {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.removeAdElementsFromNode(node);
              }
            });
          });
        }
      });
  
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  
    setSubscriptionStatus(isSubscribed) {
      this.isSubscribed = isSubscribed;
      
      if (isSubscribed) {
        this.removeAllAds();
      } else {
        this.loadAds();
      }
    }
  
    loadAds() {
      if (this.isSubscribed) return;
  
      this.loadMonetag();
    }
  
    loadMonetag() {
      const config = this.adConfig.monetag;
      
      // Check if script already exists
      if (this.adScripts.has('monetag') || document.querySelector(config.selector)) {
        return;
      }
  
      const script = document.createElement('script');
      script.src = config.src;
      script.setAttribute('data-zone', config.zone);
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      
      // Add error handling
      script.onerror = () => {
        console.error('Failed to load Monetag ad script');
        this.adScripts.delete('monetag');
      };
  
      script.onload = () => {
        console.log('Monetag ad script loaded successfully');
      };
  
      document.head.appendChild(script);
      this.adScripts.set('monetag', script);
    }
  
    removeAllAds() {
      this.removeMonetag();
      this.removeAllAdElements();
    }
  
    removeMonetag() {
      const script = this.adScripts.get('monetag');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
        this.adScripts.delete('monetag');
      }
  
      // Remove existing script
      const existingScript = document.querySelector(this.adConfig.monetag.selector);
      if (existingScript) {
        existingScript.remove();
      }
    }
  
    removeAllAdElements() {
      const adSelectors = [
        // Monetag specific
        '[id*="monetag"]',
        '[class*="monetag"]',
        '[id*="fpyf8"]',
        '[class*="fpyf8"]',
        '[data-zone="151276"]',
        // General ad selectors
        '.ad-container',
        '.advertisement',
        '[class*="ads"]',
        '[id*="ads"]',
        'iframe[src*="ads"]',
        'div[data-ad]'
      ];
  
      adSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element && element.parentNode) {
            element.style.display = 'none';
            element.parentNode.removeChild(element);
          }
        });
      });
    }
  
    removeAdElementsFromNode(node) {
      // Check if the node itself is an ad
      if (this.isAdElement(node)) {
        node.style.display = 'none';
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return;
      }
  
      // Check child elements
      const adElements = node.querySelectorAll && node.querySelectorAll('[id*="monetag"], [class*="monetag"], [id*="fpyf8"], [class*="fpyf8"]');
      if (adElements) {
        adElements.forEach(element => {
          element.style.display = 'none';
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
      }
    }
  
    isAdElement(element) {
      if (!element || !element.tagName) return false;
  
      const adIndicators = [
        'monetag',
        'fpyf8',
        'advertisement',
        'ads',
        'ad-container'
      ];
  
      const id = element.id || '';
      const className = element.className || '';
      const dataZone = element.getAttribute('data-zone') || '';
  
      return adIndicators.some(indicator => 
        id.toLowerCase().includes(indicator) || 
        className.toLowerCase().includes(indicator) ||
        dataZone === '151276'
      );
    }
  
    destroy() {
      this.removeAllAds();
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }
  
  // Create singleton instance
  const adManager = new AdManager();
  
  // Export for use in React components
  export const useAdManager = (isSubscribed) => {
    useEffect(() => {
      adManager.setSubscriptionStatus(isSubscribed);
    }, [isSubscribed]);
  
    useEffect(() => {
      return () => {
        // Cleanup on unmount
        if (isSubscribed) {
          adManager.removeAllAds();
        }
      };
    }, []);
  
    return {
      loadAds: () => adManager.loadAds(),
      removeAds: () => adManager.removeAllAds(),
      setSubscriptionStatus: (status) => adManager.setSubscriptionStatus(status)
    };
  };
  
  export default adManager;