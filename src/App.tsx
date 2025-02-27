import React, { useState, useEffect } from 'react';
import { Calculator, Flame, RotateCcw } from 'lucide-react';

// Types
type Rank = '横綱' | '大関' | '関脇' | '小結' | '前頭1枚目' | '前頭2枚目' | '前頭3枚目' | '前頭4枚目' | '前頭5枚目' | 
  '前頭6枚目' | '前頭7枚目' | '前頭8枚目' | '前頭9枚目' | '前頭10枚目' | '前頭11枚目' | '前頭12枚目' | '前頭13枚目' | 
  '前頭14枚目' | '前頭15枚目';

type Day = '初日' | '2日目' | '3日目' | '4日目' | '5日目' | '6日目' | '7日目' | '中日' | '9日目' | '10日目' | 
  '11日目' | '12日目' | '13日目' | '14日目' | '千秋楽';

type Result = '東方力士勝利' | '西方力士勝利';

// Constants
const DAYS: Day[] = ['初日', '2日目', '3日目', '4日目', '5日目', '6日目', '7日目', '中日', '9日目', '10日目', 
  '11日目', '12日目', '13日目', '14日目', '千秋楽'];

const RANKS: Rank[] = ['横綱', '大関', '関脇', '小結', '前頭1枚目', '前頭2枚目', '前頭3枚目', '前頭4枚目', '前頭5枚目', 
  '前頭6枚目', '前頭7枚目', '前頭8枚目', '前頭9枚目', '前頭10枚目', '前頭11枚目', '前頭12枚目', '前頭13枚目', 
  '前頭14枚目', '前頭15枚目'];

const RESULTS: Result[] = ['東方力士勝利', '西方力士勝利'];

// Helper functions
const getDayNumber = (day: Day): number => {
  if (day === '初日') return 1;
  if (day === '中日') return 8;
  if (day === '千秋楽') return 15;
  return parseInt(day.replace('日目', ''));
};

const getRankValue = (rank: Rank): number => {
  if (rank === '横綱') return 5;
  if (rank === '大関') return 4;
  if (rank === '関脇') return 3;
  if (rank === '小結') return 2;
  
  // Extract number from 前頭X枚目
  const match = rank.match(/前頭(\d+)枚目/);
  if (match) {
    const number = parseInt(match[1]);
    // Decreasing value as the rank number increases
    return 1 - (number - 1) * 0.05;
  }
  
  return 0;
};

function App() {
  const [day, setDay] = useState<Day>('初日');
  const [eastRank, setEastRank] = useState<Rank>('横綱');
  const [westRank, setWestRank] = useState<Rank>('横綱');
  const [eastWins, setEastWins] = useState<number>(0);
  const [eastLosses, setEastLosses] = useState<number>(0);
  const [westWins, setWestWins] = useState<number>(0);
  const [westLosses, setWestLosses] = useState<number>(0);
  const [result, setResult] = useState<Result>('東方力士勝利');
  const [heatScore, setHeatScore] = useState<number | null>(null);
  const [maxPossibleWins, setMaxPossibleWins] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');

  // Update max possible wins when day changes
  useEffect(() => {
    const dayNumber = getDayNumber(day);
    setMaxPossibleWins(dayNumber - 1);
    
    // Reset records if they exceed the new maximum
    if (eastWins + eastLosses > maxPossibleWins) {
      setEastWins(0);
      setEastLosses(0);
    }
    
    if (westWins + westLosses > maxPossibleWins) {
      setWestWins(0);
      setWestLosses(0);
    }
  }, [day]);

  const calculateHeatScore = () => {
    // Base score starts at 50
    let score = 50;
    const dayNumber = getDayNumber(day);
    const eastRankValue = getRankValue(eastRank);
    const westRankValue = getRankValue(westRank);
    
    let factors = [];

    // Factor 1: Rank difference
    const rankDifference = Math.abs(eastRankValue - westRankValue);
    if (rankDifference > 2) {
      // Big rank difference
      score += 15;
      factors.push(`大きな番付差 (+15)`);
    } else if (rankDifference > 1) {
      // Moderate rank difference
      score += 10;
      factors.push(`中程度の番付差 (+10)`);
    } else if (rankDifference > 0.5) {
      // Small rank difference
      score += 5;
      factors.push(`小さな番付差 (+5)`);
    } else {
      // Same or very close rank
      score += 0;
      factors.push(`同等の番付 (+0)`);
    }

    // Factor 2: High rank match
    const averageRank = (eastRankValue + westRankValue) / 2;
    if (averageRank > 4) {
      // Both are Yokozuna
      score += 25;
      factors.push(`横綱同士の対決 (+25)`);
    } else if (averageRank > 3) {
      // At least one Yokozuna or both Ozeki
      score += 20;
      factors.push(`上位力士の対決 (+20)`);
    } else if (averageRank > 2) {
      // High-ranked match
      score += 15;
      factors.push(`上位力士の対決 (+15)`);
    }

    // Factor 3: Tournament day importance
    if (day === '千秋楽') {
      score += 30;
      factors.push(`千秋楽の重要な一番 (+30)`);
    } else if (dayNumber >= 13) {
      score += 20;
      factors.push(`場所終盤の重要な一番 (+20)`);
    } else if (dayNumber >= 10) {
      score += 15;
      factors.push(`場所後半の一番 (+15)`);
    } else if (dayNumber >= 8) {
      score += 10;
      factors.push(`中日以降の一番 (+10)`);
    } else if (dayNumber === 1) {
      score += 5;
      factors.push(`初日の一番 (+5)`);
    }

    // Factor 4: Record difference and upset
    const eastRecord = eastWins / (eastWins + eastLosses || 1);
    const westRecord = westWins / (westWins + westLosses || 1);
    
    if ((eastWins + eastLosses > 0) && (westWins + westLosses > 0)) {
      const recordDifference = Math.abs(eastRecord - westRecord);
      
      if (recordDifference > 0.5) {
        score += 10;
        factors.push(`大きな星差 (+10)`);
        
        // Upset factor
        if ((eastRecord > westRecord && result === '西方力士勝利') || 
            (westRecord > eastRecord && result === '東方力士勝利')) {
          score += 15;
          factors.push(`番狂わせ (+15)`);
        }
      } else if (recordDifference > 0.2) {
        score += 5;
        factors.push(`中程度の星差 (+5)`);
      }
      
      // Perfect record factor
      if (eastWins === maxPossibleWins && eastLosses === 0) {
        score += 15;
        factors.push(`東方力士の全勝記録 (+15)`);
        
        if (result === '西方力士勝利') {
          score += 10;
          factors.push(`全勝記録が途絶えた (+10)`);
        }
      }
      
      if (westWins === maxPossibleWins && westLosses === 0) {
        score += 15;
        factors.push(`西方力士の全勝記録 (+15)`);
        
        if (result === '東方力士勝利') {
          score += 10;
          factors.push(`全勝記録が途絶えた (+10)`);
        }
      }
    }

    // Factor 5: Lower rank beats higher rank
    if ((eastRankValue > westRankValue && result === '西方力士勝利') ||
        (westRankValue > eastRankValue && result === '東方力士勝利')) {
      const rankDiff = Math.abs(eastRankValue - westRankValue);
      if (rankDiff > 2) {
        score += 25;
        factors.push(`大番狂わせ！下位力士の勝利 (+25)`);
      } else if (rankDiff > 1) {
        score += 15;
        factors.push(`番狂わせ！下位力士の勝利 (+15)`);
      } else {
        score += 5;
        factors.push(`下位力士の勝利 (+5)`);
      }
    }

    // Ensure score is between 0 and 100
    score = Math.min(100, Math.max(0, score));
    
    setHeatScore(Math.round(score));
    setExplanation(factors.join('\n'));
  };

  const resetCalculation = () => {
    setHeatScore(null);
    setExplanation('');
  };

  const handleEastRecordChange = (wins: number) => {
    if (wins <= maxPossibleWins) {
      setEastWins(wins);
      // Automatically set losses to fill the remaining matches
      setEastLosses(maxPossibleWins - wins);
    }
  };

  const handleWestRecordChange = (wins: number) => {
    if (wins <= maxPossibleWins) {
      setWestWins(wins);
      // Automatically set losses to fill the remaining matches
      setWestLosses(maxPossibleWins - wins);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Flame className="mr-2 text-red-500" size={32} />
            大相撲 取組熱量スコア計算機
          </h1>
          <p className="text-gray-600">
            取組の条件を入力して、その熱量スコアをシミュレーションしましょう
          </p>
        </header>

        {heatScore === null ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">取組情報</h2>
                
                {/* Day Selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">取組の日程</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={day}
                    onChange={(e) => setDay(e.target.value as Day)}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* East Wrestler Rank */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">東方力士の番付</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={eastRank}
                    onChange={(e) => setEastRank(e.target.value as Rank)}
                  >
                    {RANKS.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>

                {/* West Wrestler Rank */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">西方力士の番付</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={westRank}
                    onChange={(e) => setWestRank(e.target.value as Rank)}
                  >
                    {RANKS.map((rank) => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">対戦成績と結果</h2>
                
                {/* Previous Record - East */}
                {getDayNumber(day) > 1 && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        前日までの対戦成績（東方力士）
                        <span className="text-sm text-gray-500 ml-2">
                          最大 {maxPossibleWins} 試合
                        </span>
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-700">白星:</span>
                          <select 
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={eastWins}
                            onChange={(e) => handleEastRecordChange(parseInt(e.target.value))}
                          >
                            {Array.from({ length: maxPossibleWins + 1 }, (_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-700">黒星:</span>
                          <span className="p-2 bg-gray-100 border border-gray-300 rounded-md min-w-[40px] text-center">
                            {eastLosses}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Previous Record - West */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        前日までの対戦成績（西方力士）
                        <span className="text-sm text-gray-500 ml-2">
                          最大 {maxPossibleWins} 試合
                        </span>
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-700">白星:</span>
                          <select 
                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={westWins}
                            onChange={(e) => handleWestRecordChange(parseInt(e.target.value))}
                          >
                            {Array.from({ length: maxPossibleWins + 1 }, (_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-700">黒星:</span>
                          <span className="p-2 bg-gray-100 border border-gray-300 rounded-md min-w-[40px] text-center">
                            {westLosses}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Match Result */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">試合結果</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={result}
                    onChange={(e) => setResult(e.target.value as Result)}
                  >
                    {RESULTS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Calculate Button */}
                <button 
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                  onClick={calculateHeatScore}
                >
                  <Calculator className="mr-2" size={20} />
                  盛り上がり度合いを見る
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
              <Flame className="mr-2 text-red-500" size={24} />
              取組の熱量スコア
            </h2>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-full max-w-md h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transition-all duration-500"
                  style={{ width: `${heatScore}%` }}
                ></div>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {heatScore} <span className="text-lg font-normal text-gray-600">/ 100</span>
              </div>
              
              <div className="mt-2 text-center">
                {heatScore >= 90 ? (
                  <div className="text-red-600 font-semibold">超激アツ！歴史に残る名勝負！</div>
                ) : heatScore >= 75 ? (
                  <div className="text-orange-600 font-semibold">大激戦！会場が沸く熱戦！</div>
                ) : heatScore >= 60 ? (
                  <div className="text-yellow-600 font-semibold">見応えのある好取組！</div>
                ) : heatScore >= 45 ? (
                  <div className="text-green-600 font-semibold">普通の取組</div>
                ) : (
                  <div className="text-blue-600 font-semibold">淡々とした取組</div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-medium text-gray-800 mb-2">熱量スコア計算要素:</h3>
              <pre className="whitespace-pre-line text-sm text-gray-700">
                {explanation}
              </pre>
            </div>
            
            <button 
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
              onClick={resetCalculation}
            >
              <RotateCcw className="mr-2" size={20} />
              もう一度算出する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;