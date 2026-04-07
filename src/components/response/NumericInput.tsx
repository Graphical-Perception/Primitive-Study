import { Box, Flex, NumberInput } from '@mantine/core';
import { NumericalResponse } from '../../parser/types';
import { generateErrorMessage } from './utils';
import { ReactMarkdownWrapper } from '../ReactMarkdownWrapper';
import { useEffect, useRef } from 'react';

export function NumericInput({
  response,
  disabled,
  answer,
  index,
  enumerateQuestions,
}: {
  response: NumericalResponse;
  disabled: boolean;
  answer: object;
  index: number;
  enumerateQuestions: boolean;
}) {
  const {
    prompt,
    required,
    min,
    max,
    placeholder,
    secondaryText,
  } = response;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <NumberInput
      disabled={disabled}
      placeholder={placeholder}
      ref={inputRef}
      label={(
        <Flex direction="row" wrap="nowrap" gap={4}>
          {enumerateQuestions && <Box style={{ minWidth: 'fit-content', fontSize: 16, fontWeight: 500 }}>{`${index}. `}</Box>}
          <Box style={{ display: 'block' }} className="no-last-child-bottom-padding">
            <ReactMarkdownWrapper text={prompt} required={required} />
          </Box>
        </Flex>
      )}
      description={secondaryText}
      radius="md"
      size="md"
      min={min}
      max={max}
      {...answer}
      error={generateErrorMessage(response, answer)}
    />
  );
}
