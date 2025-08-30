import React, { useState } from 'react';
import styled from 'styled-components';

interface DropdownMenuProps {
  options: string[];
  onSelect: (option: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOptionClick = (option: string): void => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Select Method</button>
      {isOpen && (
        <DropdownList>
          {options.map((option) => (
            <DropdownItem key={option} onClick={() => handleOptionClick(option)}>
              {option}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </div>
  );
};

const DropdownList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  background-color: #1e1e1e;
  border-radius: 4px;
`;

interface DropdownItemProps {
  backgroundColor?: string;
}

const DropdownItem = styled.li<DropdownItemProps>`
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
  ${({ backgroundColor }) => backgroundColor && `background-color: ${backgroundColor};`}
`;

const getBackgroundColor = (method: string): string => {
  const methodColors: Record<string, string> = {
    GET: 'rgb(108, 221, 153)',
    POST: 'yellow',
    PUT: 'blue',
    PATCH: 'purple',
    DELETE: 'red'
  };

  return methodColors[method] || '';
};

export default DropdownMenu;
