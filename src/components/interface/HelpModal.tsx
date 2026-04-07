import { Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { ReactMarkdownWrapper } from '../ReactMarkdownWrapper';
import { useStoreDispatch, useStoreSelector, useStoreActions } from '../../store/store';
import { getStaticAssetByPath } from '../../utils/getStaticAsset';
import { ResourceNotFound } from '../../ResourceNotFound';
import { useCurrentComponent } from '../../routes/utils';
import { ComponentBlock, MarkdownComponent } from '../../parser/types';


const findPreviousIntro = (data: ComponentBlock, targetComponent: string) => {
  let lastIntro = null; // 마지막 intro 저장
  let found = false; // target을 찾았는지 여부

  const traverse = (components: (string | ComponentBlock)[]) => {
    if (!components || !Array.isArray(components)) return;

    for (let i = 0; i < components.length; i++) {
      const item = components[i];

      // 문자열 타입 요소
      if (typeof item === "string") {
        if (item.endsWith("-intro")) {
          lastIntro = item; // 마지막 intro 업데이트
        }
        if (item === targetComponent) {
          found = true;
          return;
        }
      }

      // 객체 타입 요소 (재귀 탐색)
      if (typeof item === "object" && item.components) {
        traverse(item.components);
        if (found) return; // 찾았으면 탐색 종료
      }
    }
  };

  traverse(data.components);
  return found ? lastIntro : null;
};

export function HelpModal() {
  const showHelpText = useStoreSelector((state) => state.showHelpText);
  const config = useStoreSelector((state) => state.config);
  const currentComponent = useCurrentComponent();
  const PreviousIntro = findPreviousIntro(config.sequence, currentComponent);
  const PreviousIntroPath = PreviousIntro ? (config.components[PreviousIntro] as MarkdownComponent).path : null;

  const storeDispatch = useStoreDispatch();
  const { toggleShowHelpText } = useStoreActions();

  const [helpText, setHelpText] = useState('');

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchText() {
      let combinedText = '';

      if (PreviousIntroPath) {
        const previousIntroAsset = await getStaticAssetByPath(PreviousIntroPath);
        if (previousIntroAsset !== undefined) {
          combinedText += previousIntroAsset + '\n\n'; // Append with spacing
        }
      }

      // add divider if both previous intro and help text are present
      if (PreviousIntroPath && config.uiConfig.helpTextPath) {
        combinedText += '---\n\n';
      }

      if (config.uiConfig.helpTextPath) {
        const helpTextAsset = await getStaticAssetByPath(config.uiConfig.helpTextPath);
        if (helpTextAsset !== undefined) {
          combinedText += helpTextAsset;
        }
      }

      if (combinedText) {
        setHelpText(combinedText);
      }

      setLoading(false);
    }

    fetchText();
  }, [config.uiConfig.helpTextPath, PreviousIntroPath]);

  return (
    <Modal size="70%" opened={showHelpText} withCloseButton={false} onClose={() => storeDispatch(toggleShowHelpText())}>
      {loading || helpText
        ? <ReactMarkdownWrapper text={helpText} />
        : <ResourceNotFound path={config.uiConfig.helpTextPath} />}
    </Modal>
  );
}
