import { useState, useEffect } from 'react';
import './App.css';

interface MealGroup {
  name: string;
  numbers: (number | '')[];
}

function App() {
  const curDate = new Date().toISOString().split('T')[0]
  const [currentDate, setCurrentDate] = useState<string>(curDate);

  const [mealGroups, setMealGroups] = useState<MealGroup[]>(() => {
    const savedMealGroups = localStorage.getItem(curDate);
    return savedMealGroups
      ? JSON.parse(savedMealGroups)
      : [
        { name: 'Reggeli', numbers: [''] },
        { name: 'Ebéd', numbers: [''] },
        { name: 'Uzsonna', numbers: [''] },
        { name: 'Vacsora', numbers: [''] },
      ];
  });

  const [totalSum, setTotalSum] = useState<number>(0);

  useEffect(() => {
    const total = mealGroups.reduce(
      (groupAcc, group) => {
        const groupSum = group.numbers?.reduce(
          (acc, curr) => (!isNaN(+curr) && !isNaN(+acc) ? +acc + +curr : acc),
          0
        );
        return !isNaN(+groupSum) && !isNaN(+groupAcc) ? +groupSum + +groupAcc : groupAcc;
      },
      0
    );
    setTotalSum(total);
  }, [mealGroups]);

  useEffect(() => {
    localStorage.setItem(currentDate, JSON.stringify(mealGroups));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealGroups]);

  const handleNumberChange = (value: string, groupIndex: number, numberIndex: number) => {
    const updatedMealGroups = [...mealGroups];
    updatedMealGroups[groupIndex].numbers[numberIndex] = parseFloat(value) || '';
    setMealGroups(updatedMealGroups);
  };

  const addNumberField = (groupIndex: number) => {
    const updatedMealGroups = [...mealGroups];
    updatedMealGroups[groupIndex].numbers.push('');
    setMealGroups(updatedMealGroups);
  };

  const removeNumberField = (groupIndex: number, numberIndex: number) => {
    const updatedMealGroups = [...mealGroups];
    updatedMealGroups[groupIndex].numbers = updatedMealGroups[groupIndex].numbers.filter(
      (_, i) => i !== numberIndex
    );
    setMealGroups(updatedMealGroups);
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const prevDay = previousDay.toISOString().split('T')[0];
    setCurrentDate(prevDay);

    const savedMealGroups = localStorage.getItem(prevDay);
    setMealGroups(savedMealGroups
      ? JSON.parse(savedMealGroups)
      : [
        { name: 'Reggeli', numbers: [''] },
        { name: 'Ebéd', numbers: [''] },
        { name: 'Uzsonna', numbers: [''] },
        { name: 'Vacsora', numbers: [''] },
      ]);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nexDay = nextDay.toISOString().split('T')[0];
    setCurrentDate(nexDay);

    const savedMealGroups = localStorage.getItem(nexDay);
    setMealGroups(savedMealGroups
      ? JSON.parse(savedMealGroups)
      : [
        { name: 'Reggeli', numbers: [''] },
        { name: 'Ebéd', numbers: [''] },
        { name: 'Uzsonna', numbers: [''] },
        { name: 'Vacsora', numbers: [''] },
      ]);
  };

  return (
    <div className='root'>
      <div className="container">
        <div className="header">
          <button onClick={handlePreviousDay}>{'<'}</button>
          <span>{currentDate}</span>
          <button onClick={handleNextDay}>{'>'}</button>
        </div>
        {mealGroups.map((group, groupIndex) => (
          <div key={group.name} className="meal-group">
            <h2>{group.name}</h2>
            {group.numbers.map((number, numberIndex) => (
              <div key={numberIndex} className="input-row">
                <input
                  type="number"
                  value={number}
                  onChange={(e) => handleNumberChange(e.target.value, groupIndex, numberIndex)}
                  className="number-input"
                />
                <button
                  onClick={() => removeNumberField(groupIndex, numberIndex)}
                  className="delete-button"
                >
                  Törlés
                </button>
              </div>
            ))}
            <button onClick={() => addNumberField(groupIndex)} className="add-button">
              Új mező hozzáadása
            </button>
          </div>
        ))}
        <p className="total-sum">Összesített összeg: {totalSum}</p>
      </div>
    </div>
  );
}

export default App;
