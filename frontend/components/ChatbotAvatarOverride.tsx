'use client';

import { useEffect } from 'react';

const avatarPath = '/agent-robot.svg';

export default function ChatbotAvatarOverride() {
  useEffect(() => {
    let shadowObserver: MutationObserver | undefined;
    let launcher: HTMLButtonElement | null = null;

    const forceOpen = (root: ShadowRoot) => {
      const container = root.querySelector<HTMLElement>('.chatzy-chatbot-container');
      container?.classList.add('show');
      container?.style.setProperty('visibility', 'visible', 'important');
      container?.style.setProperty('transform', 'scale(1, 1)', 'important');
    };

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

      if (!launcher) {
        launcher = root.querySelector<HTMLButtonElement>('.chatzy-chatbot-icon');
        launcher?.addEventListener('click', () => {
          [100, 400, 1000, 2000].forEach((delay) => {
            window.setTimeout(() => forceOpen(root), delay);
          });
        });
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
