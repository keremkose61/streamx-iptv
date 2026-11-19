/**
 * StreamX Spatial Navigation Engine
 * High-performance 10-foot D-Pad geometric navigation system for Smart TVs.
 */
(function (window) {
  'use strict';

  class SpatialNavigation {
    constructor() {
      this.currentFocused = null;
      this.activeScope = null; // null for full document, or element selector for modal
      this.lastFocusedInGroups = {};
      this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    }

    init(initialSelector) {
      document.addEventListener('keydown', this.boundHandleKeyDown, true);

      // Set initial focus
      const initial = initialSelector
        ? document.querySelector(initialSelector)
        : this.getFocusableElements()[0];

      if (initial) {
        this.focus(initial);
      }
    }

    setScope(scopeSelector) {
      this.activeScope = scopeSelector;
      const elements = this.getFocusableElements();
      if (elements.length > 0) {
        this.focus(elements[0]);
      }
    }

    clearScope() {
      this.activeScope = null;
    }

    getFocusableElements() {
      const scope = this.activeScope ? document.querySelector(this.activeScope) : document;
      if (!scope) return [];

      const selector = '.focusable, .nav-item, .category-pill, .channel-card, .btn-action';
      const nodeList = scope.querySelectorAll(selector);
      return Array.from(nodeList).filter((el) => {
        // Must be visible and not disabled
        if (el.offsetParent === null) return false;
        if (el.hasAttribute('disabled')) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
    }

    focus(element) {
      if (!element || element === this.currentFocused) return;

      if (this.currentFocused) {
        this.currentFocused.classList.remove('focused');
        this.currentFocused.blur();
      }

      this.currentFocused = element;
      element.classList.add('focused');

      // Save to group memory if element has data-nav-group
      const group = element.getAttribute('data-nav-group');
      if (group) {
        this.lastFocusedInGroups[group] = element;
      }

      // Smooth scroll into visible viewport
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });

      const event = new CustomEvent('tv:focus', { detail: { element } });
      element.dispatchEvent(event);
    }

    handleKeyDown(e) {
      let direction = null;

      switch (e.keyCode) {
        case 37: // Left
          direction = 'left';
          break;
        case 38: // Up
          direction = 'up';
          break;
        case 39: // Right
          direction = 'right';
          break;
        case 40: // Down
          direction = 'down';
          break;
        case 13: // Enter / OK
          if (this.currentFocused) {
            e.preventDefault();
            this.currentFocused.click();
          }
          return;
      }

      if (direction) {
        e.preventDefault();
        this.move(direction);
      }
    }

    move(direction) {
      if (!this.currentFocused) {
        const first = this.getFocusableElements()[0];
        if (first) this.focus(first);
        return;
      }

      const currentRect = this.currentFocused.getBoundingClientRect();
      const candidates = this.getFocusableElements().filter((el) => el !== this.currentFocused);

      if (candidates.length === 0) return;

      let bestCandidate = null;
      let minDistance = Infinity;

      for (const candidate of candidates) {
        const targetRect = candidate.getBoundingClientRect();

        if (!this.isValidDirection(currentRect, targetRect, direction)) {
          continue;
        }

        const distance = this.calculateDistance(currentRect, targetRect, direction);
        if (distance < minDistance) {
          minDistance = distance;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate) {
        this.focus(bestCandidate);
      }
    }

    isValidDirection(cur, target, direction) {
      const curCenterX = cur.left + cur.width / 2;
      const curCenterY = cur.top + cur.height / 2;
      const targetCenterX = target.left + target.width / 2;
      const targetCenterY = target.top + target.height / 2;

      switch (direction) {
        case 'left':
          return targetCenterX < curCenterX - 5;
        case 'right':
          return targetCenterX > curCenterX + 5;
        case 'up':
          return targetCenterY < curCenterY - 5;
        case 'down':
          return targetCenterY > curCenterY + 5;
        default:
          return false;
      }
    }

    calculateDistance(cur, target, direction) {
      const curCenterX = cur.left + cur.width / 2;
      const curCenterY = cur.top + cur.height / 2;
      const targetCenterX = target.left + target.width / 2;
      const targetCenterY = target.top + target.height / 2;

      const deltaX = Math.abs(targetCenterX - curCenterX);
      const deltaY = Math.abs(targetCenterY - curCenterY);

      // Primary axis distance + weighted orthogonal penalty for natural line-of-sight feel
      let primaryDist, orthogonalDist;
      if (direction === 'left' || direction === 'right') {
        primaryDist = deltaX;
        orthogonalDist = deltaY;
      } else {
        primaryDist = deltaY;
        orthogonalDist = deltaX;
      }

      return primaryDist + orthogonalDist * 2.2;
    }
  }

  window.SpatialNavigation = new SpatialNavigation();
})(window);
