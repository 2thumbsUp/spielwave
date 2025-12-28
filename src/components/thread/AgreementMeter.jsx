import React from 'react';
import { calculateAgreementPercentage, getControversyLevel } from '../../utils/formatters';

export const AgreementMeter = ({ agrees, disagrees }) => {
  const percentage = calculateAgreementPercentage(agrees, disagrees);
  const controversy = getControversyLevel(agrees, disagrees);
  
  const getBarColor = () => {
    if (controversy === 'consensus') {
      return percentage >= 50 ? 'bg-green-500' : 'bg-red-500';
    }
    if (controversy === 'controversial') {
      return 'bg-gradient-to-r from-orange-400 to-orange-500';
    }
    return percentage >= 50 ? 'bg-green-400' : 'bg-red-400';
  };

  const getLabel = () => {
    if (controversy === 'consensus') {
      return percentage >= 50 ? 'Strong Consensus' : 'Strong Disagreement';
    }
    if (controversy === 'controversial') {
      return 'Highly Controversial';
    }
    return 'Divided Opinion';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{getLabel()}</span>
        <span className="font-semibold text-gray-700">{percentage}% agree</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};