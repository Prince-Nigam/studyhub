'use client';

import { useEffect } from 'react';

const avatarPath = '/agent-robot.svg';

export default function ChatbotAvatarOverride() {
  useEffect(() => {
    let shadowObserver: MutationObserver | undefined;
    let controlsReady = false;

    const replaceAvatar = () => {
      const host = document.querySelector('#chatzy-shadow-host');
      const root = host?.shadowRoot;
      if (!root) return false;

      const image = root.querySelector<HTMLImageElement>('.chatzy-chatbot-icon img');
      if (!image) return false;

      if (!image.src.endsWith(avatarPath)) {
        image.src = avatarPath;
        image.removeAttribute('srcset');
      }

      if (!controlsReady) {
        const launcher = root.querySelector<HTMLButtonElement>('.chatzy-chatbot-icon');
        const container = root.querySelector<HTMLElement>('.chatzy-chatbot-container');
        if (!launcher || !container) return false;

        launcher.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          container.classList.add('show');
          container.style.setProperty('visibility', 'visible', 'important');
          container.style.setProperty('transform', 'scale(1, 1)', 'important');
        }, { capture: true });

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'studyhub-chatbot-close';
        closeButton.setAttribute('aria-label', 'Close chat');
        closeButton.textContent = 'X';
        Object.assign(closeButton.style, {
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: '2',
          width: '32px',
          height: '32px',
          border: '0',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.72)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: '700',
          cursor: 'pointer',
        });
        closeButton.addEventListener('click', () => {
          container.classList.remove('show');
          container.style.removeProperty('visibility');
          container.style.removeProperty('transform');
        });
        container.appendChild(closeButton);
        controlsReady = true;
      }

      shadowObserver ??= new MutationObserver(replaceAvatar);
      shadowObserver.observe(root, { childList: true, subtree: true });
      return true;
    };

    const pageObserver = new MutationObserver(replaceAvatar);
    pageObserver.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(replaceAvatar, 250);
    replaceAvatar();

    return () => {
      window.clearInterval(timer);
      pageObserver.disconnect();
      shadowObserver?.disconnect();
    };
  }, []);

  return null;
}
