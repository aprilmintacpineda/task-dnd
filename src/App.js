import React from "react";
import initialData from "./initialData";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
`;

const Column = styled.div`
  border: 1px solid #000;
  padding: 10px;
  min-width: 250px;
`;

const GhostPlaceholder = styled.div`
  transition: top 250ms;
  position: absolute;
  will-change: top;
  top: ${({ top }) => top || 0}px;
  left: 0;
  width: ${({ width }) => width || 0}px;
  height: ${({ height }) => height || 0}px;
  opacity: 0.5;
`;

const marginTop = 5;
const Task = styled.div`
  border: 1px solid #000;
  margin-top: ${marginTop}px;
  padding: 5px;
  cursor: pointer;
  background-color: ${({ isDragging }) =>
    isDragging ? "lightgreen" : "white"};
`;

function getDraggedElement(id) {
  const queryAttr = "data-rbd-drag-handle-draggable-id";
  const domQuery = `[${queryAttr}='${id}']`;
  const draggedDOM = document.querySelector(domQuery);
  return draggedDOM;
}

function App() {
  const [state, setState] = React.useState(initialData);
  const [customPlaceHolder, setCustomPlaceholder] = React.useState({});

  const onDragStart = React.useCallback(
    (event) => {
      const { source, draggableId } = event;
      const draggedDOM = getDraggedElement(draggableId);
      if (!draggedDOM) return;

      const { offsetHeight, offsetWidth } = draggedDOM;
      const sourceIndex = source.index;
      const elementsFromTop = [...draggedDOM.parentNode.children].slice(
        0,
        sourceIndex
      );
      const offsetTop = elementsFromTop.reduce((total, current) => {
        const styles = window.getComputedStyle(current);
        const marginTop = parseFloat(styles.marginTop);

        return total + current.offsetHeight + marginTop;
      }, 0);

      const targetTaskId = Number(draggableId.replace(/draggable-/, ""));
      const task = state.tasks.find((task) => task.id === targetTaskId);

      setCustomPlaceholder({
        taskTitle: task.title,
        height: offsetHeight,
        width: offsetWidth,
        top: offsetTop - marginTop,
      });
    },
    [state.tasks]
  );

  const onDragUpdate = React.useCallback(
    (event) => {
      const { destination } = event;
      if (!destination) return;

      const { draggableId } = event;
      const draggedDOM = getDraggedElement(draggableId);
      if (!draggedDOM) return;

      const { offsetHeight, offsetWidth } = draggedDOM;
      const destinationIndex = destination.index;
      const elementsFromTop = [...draggedDOM.parentNode.children].slice(
        0,
        destinationIndex
      );

      const offsetTop = elementsFromTop.reduce((total, current) => {
        const styles = window.getComputedStyle(current);
        const marginTop = parseFloat(styles.marginTop);
        return total + current.offsetHeight + marginTop;
      }, 0);

      const targetTaskId = Number(draggableId.replace(/draggable-/, ""));
      const task = state.tasks.find((task) => task.id === targetTaskId);

      setCustomPlaceholder({
        taskTitle: task.title,
        height: offsetHeight,
        width: offsetWidth,
        top: offsetTop - marginTop,
      });
    },
    [state.tasks]
  );

  const onDragEnd = React.useCallback((event) => {
    setCustomPlaceholder({});
    const { source, destination, draggableId } = event;
    if (!destination) return;

    const { index: sourceIndex } = source;
    const { index: destinationIndex, droppableId } = destination;
    if (sourceIndex === destinationIndex) return;

    setState((oldState) => {
      const targetColumnId = Number(droppableId.replace(/droppable-/gim, ""));
      const targetTaskId = Number(draggableId.replace(/draggable-/, ""));

      const columns = oldState.columns.map((column) => {
        if (column.id !== targetColumnId) return column;

        return {
          ...column,
          tasks: column.tasks.reduce((accumulator, current, index) => {
            if (index === sourceIndex) return accumulator;
            if (index === destinationIndex) {
              if (sourceIndex < destinationIndex)
                return accumulator.concat(current, targetTaskId);

              return accumulator.concat(targetTaskId, current);
            }

            return accumulator.concat(current);
          }, []),
        };
      });

      return {
        ...oldState,
        columns,
      };
    });
  }, []);

  console.log(customPlaceHolder);

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
    >
      <ColumnsContainer>
        {state.columns.map((column) => {
          const { id: columnId, title: columnTitle } = column;
          const tasks = column.tasks.map((taskId) =>
            state.tasks.find((task) => task.id === taskId)
          );

          return (
            <Column key={columnId}>
              <p>{columnTitle}</p>
              <Droppable droppableId={`droppable-${columnId}`}>
                {(provided, snapshot) => {
                  const { innerRef, droppableProps, placeholder } = provided;
                  const { isDraggingOver } = snapshot;

                  return (
                    <div
                      ref={innerRef}
                      {...droppableProps}
                      style={{ position: "relative" }}
                    >
                      {tasks.map((task, index) => {
                        const { id: taskId, title: taskTitle } = task;

                        return (
                          <Draggable
                            key={taskId}
                            draggableId={`draggable-${taskId}`}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const {
                                innerRef,
                                draggableProps,
                                dragHandleProps,
                              } = provided;
                              const { isDragging } = snapshot;

                              return (
                                <Task
                                  ref={innerRef}
                                  {...draggableProps}
                                  {...dragHandleProps}
                                  isDragging={isDragging}
                                >
                                  <p>{taskTitle}</p>
                                </Task>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                      {placeholder}
                      {isDraggingOver && customPlaceHolder && (
                        <GhostPlaceholder {...customPlaceHolder}>
                          <Task>
                            <p>{customPlaceHolder.taskTitle}</p>
                          </Task>
                        </GhostPlaceholder>
                      )}
                    </div>
                  );
                }}
              </Droppable>
            </Column>
          );
        }, [])}
      </ColumnsContainer>
    </DragDropContext>
  );
}

export default App;
