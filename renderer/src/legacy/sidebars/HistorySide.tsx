import React from 'react';
import styled from 'styled-components';

const HistorySideDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const HistorySide: React.FC = () => {
  return (
    <HistorySideDiv>
      <p>History 1</p>
      <p>History 2</p>
    </HistorySideDiv>
  );
};

export default HistorySide;
