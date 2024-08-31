import { useState, useEffect, useRef, ReactNode } from 'react';
import './App.css';

interface CalorieData {
  calories: number;
  label: string;
}

interface CalorieChartProps {
  data: CalorieData[];
  idealCalories: number;
}

function FullScreenDrawer({ open, onClose, children }: { open: boolean, onClose: () => void, children: ReactNode }) {

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);


  return (
    <div>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <button style={{ margin: '10px' }} onClick={onClose}>Bezárás</button>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
}


const CalorieChart = ({ data, idealCalories }: CalorieChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 300 });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const parentElement = canvasRef.current.parentElement;
        if (parentElement) {
          const newWidth = parentElement.clientWidth;
          const newHeight = parentElement.clientHeight || 300;
          setCanvasSize({ width: newWidth, height: newHeight });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = 200;
    ctx.font = '16px Arial';

    const chartWidth = canvas.width;
    const chartHeight = canvas.height;
    const padding = 40;
    const barWidth = (chartWidth - padding * 2) / data.length;
    const maxCalories = Math.max(...data.map(item => item.calories), idealCalories);

    ctx.clearRect(0, 0, chartWidth, chartHeight);

    const idealLineY = chartHeight - padding - (idealCalories / maxCalories) * (chartHeight - padding * 2);
    ctx.beginPath();
    ctx.moveTo(padding, idealLineY);
    ctx.lineTo(chartWidth - padding, idealLineY);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'red';
    ctx.fillText(`${idealCalories}`, chartWidth - padding + 5, idealLineY + 4);

    data.forEach((item, index) => {
      const { calories, label } = item;
      const barHeight = (calories / maxCalories) * (chartHeight - padding * 2);
      const x = padding + index * barWidth;
      const y = chartHeight - padding - barHeight;

      ctx.fillStyle = 'rgba(75, 192, 192, 0.6)';
      ctx.fillRect(x, y, barWidth - 10, barHeight);

      ctx.fillStyle = '#000';
      ctx.fillText(`${calories}`, x + (barWidth - 10) / 2 - ctx.measureText(`${calories}`).width / 2, y - 5);

      ctx.fillText(label, x + (barWidth - 10) / 2 - ctx.measureText(label).width / 2, chartHeight - padding + 20);
    });
  }, [data, idealCalories, canvasSize]);

  return <canvas ref={canvasRef} height={50} style={{ width: '100%' }}></canvas>;
};

interface MealGroup {
  name: string;
  numbers: (number | '')[];
}

const sumMealGroups = (mealGroups: MealGroup[]) => mealGroups.reduce(
  (groupAcc, group) => {
    const groupSum = group.numbers?.reduce(
      (acc, curr) => (!isNaN(+curr) && !isNaN(+acc) ? +acc + +curr : acc),
      0
    );
    return !isNaN(+groupSum) && !isNaN(+groupAcc) ? +groupSum + +groupAcc : groupAcc;
  },
  0
);
;

function App() {
  const curDate = new Date().toISOString().split('T')[0];
  const formatter = new Intl.DateTimeFormat('hu-HU', { weekday: 'short' });
  const [currentDate, setCurrentDate] = useState<string>(curDate);
  const [chartData, setChartData] = useState<CalorieData[]>([]);
  const [totalSum, setTotalSum] = useState<number>(0);
  const idealCaloriesStorage = localStorage.getItem('idealCalories');
  const [idealCalories, setIdealCalories] = useState<number | string>(idealCaloriesStorage ? parseInt(idealCaloriesStorage, 10) : 2000);
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

  useEffect(() => {
    const total = sumMealGroups(mealGroups);
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

  useEffect(() => {
    const curDate = new Date(currentDate);
    const data: CalorieData[] = [{ calories: sumMealGroups(mealGroups), label: formatter.format(curDate) }];

    for (let i = 1; i < 7; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(curDate.getDate() - i)
      const prevMealGroups = localStorage.getItem(prevDate.toISOString().split('T')[0]);
      const curMealGroups = prevMealGroups
        ? JSON.parse(prevMealGroups) : undefined;

      data.push({ calories: curMealGroups ? sumMealGroups(curMealGroups) : 0, label: formatter.format(prevDate) })
    }

    setChartData(data.reverse());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, mealGroups]);

  const [swipeDirection, setSwipeDirection] = useState(false);
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 150) {
      setSwipeDirection(true);
    }

    if (touchEndX - touchStartX > 150) {
      setSwipeDirection(true);
    }
  };

  const handleClose = () => {
    setSwipeDirection(false);
  }

  const handleChangeIdealCalories = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdealCalories(parseFloat(e.target.value) || '')
    localStorage.setItem('idealCalories', e.target.value)
  }

  return (
    <div className='root'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <p>{swipeDirection}</p>
      <FullScreenDrawer onClose={handleClose} open={swipeDirection}>
        <>
          <p>Ideális kalória</p>
          <input
            type="number"
            value={idealCalories}
            onChange={handleChangeIdealCalories}
            className="number-input"
            style={{ width: '100%' }}
          />
        </>
      </FullScreenDrawer>
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
        <p className="total-sum">Összesített összeg: {totalSum}kcal</p>
        <p className="total-sum">Utolsó 7 nap átlaga: {Math.ceil(chartData.reduce((acc, cur) => acc + cur.calories, 0) / 7)}kcal</p>
        <CalorieChart data={
          chartData
        }
          idealCalories={typeof idealCalories === 'number' ? idealCalories : 0}
        />
      </div>
    </div>
  );
}

export default App;
