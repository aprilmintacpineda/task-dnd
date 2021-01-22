import styled from 'styled-components';

export const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
`;

export const Column = styled.div`
  border: 1px solid #000;
  padding: 10px;
  min-width: 250px;
`;

export const GhostPlaceholder = styled.div`
  position: absolute;
  will-change: top;
  top: ${({ top }) => top || 0}px;
  left: 0;
  width: ${({ width }) => width || 0}px;
  height: ${({ height }) => height || 0}px;
  opacity: 0.3;
`;

export const marginTop = 5;
export const Task = styled.div`
  border: 1px solid #000;
  margin-top: ${marginTop}px;
  padding: 5px;
  cursor: pointer;
  background-color: ${({ isDragging }) =>
    isDragging ? 'lightgreen' : 'white'};
`;
