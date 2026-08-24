'use client';

import { useEffect } from 'react';

const avatarPath = '/agent-robot.svg';

export default function ChatbotAvatarOverride() {
  useEffect(() => {
    let shadowObserver: MutationObserver | undefined;

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
