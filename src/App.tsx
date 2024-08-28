import { useState, useEffect } from 'react'
import './App.css'

interface MealGroup {
  name: string;
  numbers: (number | '')[];
}

function App() {
  const [mealGroups, setMealGroups] = useState<MealGroup[]>(() => {
    const savedMealGroups = localStorage.getItem('mealGroups');
    return savedMealGroups
      ? JSON.parse(savedMealGroups)
      : [
        { name: 'Reggeli', numbers: [0] },
        { name: 'Ebéd', numbers: [0] },
        { name: 'Uzsonna', numbers: [0] },
        { name: 'Vacsora', numbers: [0] },
      ];
  });

  const [totalSum, setTotalSum] = useState<number>(0);

  useEffect(() => {
    const total = mealGroups.reduce(
      (groupAcc, group) => {
        const groupSum = group.numbers?.reduce((acc, curr) => !isNaN(+curr) && !isNaN(+acc) ? (+acc) + (+curr) : acc, 0);
        console.log(groupSum);
        return !isNaN(+groupSum) && !isNaN(+groupAcc) ? (+groupSum) + (+groupAcc) : groupAcc;
      },
      0
    );
    setTotalSum(total);
    localStorage.setItem('mealGroups', JSON.stringify(mealGroups));
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

  return (
    <div className='root'>
      <div className="container">
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

export default App
