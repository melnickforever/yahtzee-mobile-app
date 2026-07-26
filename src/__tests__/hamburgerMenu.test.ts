import React from 'react';
import { act, create, ReactTestInstance } from 'react-test-renderer';
import { HamburgerMenu } from '../components/HamburgerMenu';

function renderMenu(props: {
  currentLanguage: 'uk' | 'en';
  onLanguageChange: (lang: 'uk' | 'en') => void;
  soundEnabled?: boolean;
  onSoundEnabledChange?: (enabled: boolean) => void;
}): ReactTestInstance {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      React.createElement(HamburgerMenu, {
        soundEnabled: true,
        onSoundEnabledChange: jest.fn(),
        ...props,
      })
    );
  });
  return renderer.root;
}

function findPressableByText(root: ReactTestInstance, text: string): ReactTestInstance {
  let node: ReactTestInstance | null = root.findByProps({ children: text });
  while (node && typeof node.props.onPress !== 'function') {
    node = node.parent;
  }
  if (!node) throw new Error(`No pressable ancestor found for text "${text}"`);
  return node;
}

function press(node: ReactTestInstance) {
  act(() => {
    node.props.onPress();
  });
}

function openMenu(root: ReactTestInstance) {
  press(root.findByProps({ hitSlop: 8 }));
}

describe('HamburgerMenu language selection', () => {
  it('reports the newly picked language when the user chooses it in Settings', () => {
    const onLanguageChange = jest.fn();
    const root = renderMenu({ currentLanguage: 'uk', onLanguageChange });

    openMenu(root);
    press(findPressableByText(root, 'Налаштування'));
    press(findPressableByText(root, 'Українська'));
    press(findPressableByText(root, 'English'));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });

  it('reports the newly picked language when switching back from English to Ukrainian', () => {
    const onLanguageChange = jest.fn();
    const root = renderMenu({ currentLanguage: 'en', onLanguageChange });

    openMenu(root);
    press(findPressableByText(root, 'Settings'));
    press(findPressableByText(root, 'English'));
    press(findPressableByText(root, 'Українська'));

    expect(onLanguageChange).toHaveBeenCalledTimes(1);
    expect(onLanguageChange).toHaveBeenCalledWith('uk');
  });

  it('renders the settings menu labels in the currently selected language', () => {
    const root = renderMenu({ currentLanguage: 'en', onLanguageChange: jest.fn() });

    openMenu(root);
    expect(() => root.findByProps({ children: 'Settings' })).not.toThrow();
    expect(() => root.findByProps({ children: 'About' })).not.toThrow();
  });
});
