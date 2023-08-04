import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStickyNote, faTrash , faPlus} from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const AddGoalWrapper = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Input = styled.input`
  flex-grow: 1;
  margin-right: 10px;
`;

const TwoColumnLayout = styled.div`
  display: flex;
`;

const GoalsColumn = styled.ul`
  flex: 1;
  list-style: none;
  padding: 0;
`;



const Goal = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  label {
    margin-left: 10px;
  }
`;

const NotesIcon = styled.div`
  cursor: pointer;
  margin-left: 10px;
`;

const GoalNotes = styled.div`
  flex: 1;
  textarea {
    width: 100%;
    margin-top: 5px;
  }
`;

const NotesColumn = styled.div`
  flex: 1;
  padding: 0 20px;
  border: 2px solid #4caf50; /* Add green border */
  border-radius: 5px;
  margin-top: 20px;
  textarea {
    width: 100%;
    resize: vertical;
  }
`;

const ToggleNotesButton = styled.button`
  margin-top: 10px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
`;

const ToggleNotesLabel = styled.span`
  margin-left: 5px;
`;

const LineNumber = styled.span`
  counter-increment: lineNumber;
  margin-right: 10px;
`;

const DragHandle = styled.div`
  cursor: move;
  margin-right: 10px;
`;

const GoalWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: move;
  border: 2px solid #007bff; /* Add blue border */
  border-radius: 5px; /* Add rounded corners */
  padding: 10px; /* Add some padding for better visual appearance */
`;

const AddGoalButton = styled.button`
  margin-left: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
`;

const App = () => {
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [focusedGoalIndex, setFocusedGoalIndex] = useState(null); // New state variable


  useEffect(() => {
    // Retrieve goals from localStorage if they exist
    const storedGoals = localStorage.getItem('dailyGoals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const addGoal = () => {
    if (newGoal.trim() === '') return;

    if (goals.length >= 50) {
      alert('You have reached the maximum limit of 50 daily goals.');
      return;
    }

    setGoals([...goals, { text: newGoal, completed: false, note: '' }]);
    setNewGoal('');
  };

  const deleteGoal = (index) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };

  const toggleComplete = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index].completed = !updatedGoals[index].completed;
    setGoals(updatedGoals);
  };

  const handleNoteChange = (index, note) => {
    const updatedGoals = [...goals];
    updatedGoals[index].note = note;
    setGoals(updatedGoals);
  };

  const handleDragStart = (index, e) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (event, index) => {
    // Get the index of the dragged goal from the data transfer
    const draggedIndex = event.dataTransfer.getData('text');
    if (draggedIndex !== index) {
      const updatedGoals = [...goals];
      const [draggedGoal] = updatedGoals.splice(draggedIndex, 1);
      updatedGoals.splice(index, 0, draggedGoal);
      setGoals(updatedGoals);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // const handleToggleNotes = (index) => {
  //   const updatedGoals = [...goals];
  //   updatedGoals[index].showNote = !updatedGoals[index].showNote;
  //   setGoals(updatedGoals);
  // };

  const handleToggleNotes = (index) => {
    const updatedGoals = [...goals];
    updatedGoals[index].showNote = !updatedGoals[index].showNote;
    setGoals(updatedGoals);

    // Set the focused goal index when toggling notes
    setFocusedGoalIndex(index);
  };
  
  const handleGoalNotesBlur = () => {
    setFocusedGoalIndex(null);
  };

  useEffect(() => {
    // Store goals in localStorage whenever there is a change
    localStorage.setItem('dailyGoals', JSON.stringify(goals));
  }, [goals]);

  return (
    <Container>
      <h1>50 Daily Goals</h1>
      <div>
        <ToggleNotesButton onClick={() => setShowNotes(!showNotes)}>
          <FontAwesomeIcon icon={faStickyNote} />
        </ToggleNotesButton>
        <ToggleNotesLabel>
          {showNotes ? 'Hide Main Notes' : 'Show Main Notes'}
        </ToggleNotesLabel>
      </div>
      <AddGoalWrapper>
        <Input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Add a new goal"
        />
        {/* <button onClick={addGoal}>Add Goal</button> */}
        <AddGoalButton onClick={addGoal}>
          <FontAwesomeIcon icon={faPlus} /> {/* Use the plus icon */}
        </AddGoalButton>
      </AddGoalWrapper>
      <TwoColumnLayout>
        <GoalsColumn onDragOver={handleDragOver}>
          {goals.map((goal, index) => (
            <GoalWrapper key={index}
              draggable // Set draggable attribute to true
              onDragStart={(e) => handleDragStart(index, e)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              >
              <DragHandle>
                <LineNumber>{index + 1}</LineNumber>
              </DragHandle>
              <Goal>                
                <FontAwesomeIcon
                  icon={faTrash}
                  onClick={() => deleteGoal(index)}
                  style={{ cursor: 'pointer', marginRight: '10px' }}
                />
                <NotesIcon onClick={() => handleToggleNotes(index)}>
                  <FontAwesomeIcon icon={faStickyNote} />
                </NotesIcon>
                <label>
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleComplete(index)}
                  />
                  {goal.text}
                </label>
              </Goal>
              
              {goal.showNote && (
                <GoalNotes>
                  <textarea
                    value={goal.note}
                    onChange={(e) => handleNoteChange(index, e.target.value)}
                    onBlur={handleGoalNotesBlur} 
                    rows="2"
                    cols="30"
                    placeholder="Add a note"
                  />
                </GoalNotes>
              )}
            </GoalWrapper>
          ))}
        </GoalsColumn>
        {showNotes && (
          <NotesColumn>
            {/* <h2>Main Notes</h2> */}
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows="50"
              cols="50"
            />
          </NotesColumn>
        )}
      </TwoColumnLayout>
 
    </Container>
  );
};

export default App;