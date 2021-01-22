import React from 'react';
import {
  Draggable,
  DragDropContext,
  Droppable
} from 'react-beautiful-dnd';
import {
  ColumnsContainer,
  Column,
  GhostPlaceholder,
  Task,
  marginTop
} from 'components/presentational/styledComponents/todoComponents';
import initialData from 'initialData';

function getDraggedElement (id) {
  const queryAttr = 'data-rbd-drag-handle-draggable-id';
  const domQuery = `[${queryAttr}='${id}']`;
  const draggedDOM = document.querySelector(domQuery);
  return draggedDOM;
}

function App () {
  const [state, setState] = React.useState(initialData);
  const [
    ghostPlaceholderProps,
    setGhostPlaceholderProps
  ] = React.useState({});

  const computeGhostPlaceholderProps = React.useCallback(
    (index, draggableId) => {
      const draggedDOM = getDraggedElement(draggableId);
      if (!draggedDOM) return;

      const { offsetHeight, offsetWidth } = draggedDOM;
      const elementsFromTop = [
        ...draggedDOM.parentNode.children
      ].slice(0, index);
      const offsetTop = elementsFromTop.reduce((total, current) => {
        const styles = window.getComputedStyle(current);
        const marginTop = parseFloat(styles.marginTop);

        return total + current.offsetHeight + marginTop;
      }, 0);

      const targetTaskId = Number(
        draggableId.replace(/draggable-/, '')
      );
      const task = state.tasks.find(
        task => task.id === targetTaskId
      );

      setGhostPlaceholderProps({
        taskTitle: task.title,
        height: offsetHeight,
        width: offsetWidth,
        top: offsetTop - marginTop
      });
    },
    [state.tasks]
  );

  const onDragStart = React.useCallback(
    event => {
      const { source, draggableId } = event;
      computeGhostPlaceholderProps(source.index, draggableId);
    },
    [computeGhostPlaceholderProps]
  );

  const onDragUpdate = React.useCallback(
    event => {
      const { destination, draggableId } = event;
      computeGhostPlaceholderProps(destination.index, draggableId);
    },
    [computeGhostPlaceholderProps]
  );

  const onDragEnd = React.useCallback(event => {
    setGhostPlaceholderProps({});
    const { source, destination, draggableId } = event;
    if (!destination) return;

    const { index: sourceIndex } = source;
    const { index: destinationIndex, droppableId } = destination;
    if (sourceIndex === destinationIndex) return;

    setState(oldState => {
      const targetColumnId = Number(
        droppableId.replace(/droppable-/gim, '')
      );
      const targetTaskId = Number(
        draggableId.replace(/draggable-/, '')
      );

      const columns = oldState.columns.map(column => {
        if (column.id !== targetColumnId) return column;

        return {
          ...column,
          tasks: column.tasks.reduce(
            (accumulator, current, index) => {
              if (index === sourceIndex) return accumulator;
              if (index === destinationIndex) {
                if (sourceIndex < destinationIndex)
                  return accumulator.concat(current, targetTaskId);

                return accumulator.concat(targetTaskId, current);
              }

              return accumulator.concat(current);
            },
            []
          )
        };
      });

      return {
        ...oldState,
        columns
      };
    });
  }, []);

  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
    >
      <ColumnsContainer>
        {state.columns.map(column => {
          const { id: columnId, title: columnTitle } = column;
          const tasks = column.tasks.map(taskId =>
            state.tasks.find(task => task.id === taskId)
          );

          return (
            <Column key={columnId}>
              <p>{columnTitle}</p>
              <Droppable droppableId={`droppable-${columnId}`}>
                {(provided, snapshot) => {
                  const {
                    innerRef,
                    droppableProps,
                    placeholder
                  } = provided;
                  const { isDraggingOver } = snapshot;

                  return (
                    <div
                      ref={innerRef}
                      {...droppableProps}
                      style={{ position: 'relative' }}
                    >
                      {tasks.map((task, index) => {
                        const {
                          id: taskId,
                          title: taskTitle
                        } = task;

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
                                dragHandleProps
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
                      {isDraggingOver && ghostPlaceholderProps && (
                        <GhostPlaceholder {...ghostPlaceholderProps}>
                          <Task>
                            <p>{ghostPlaceholderProps.taskTitle}</p>
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
