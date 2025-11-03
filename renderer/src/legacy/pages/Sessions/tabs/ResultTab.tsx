import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Result } from '../../../model';

interface ResultTabProps {
  // Add props if needed
}

const ResultsTab: React.FC<ResultTabProps> = (props) => {
  // Get the result state.
  const result: Result | null = useSelector((state: RootState) => state.result);

  if (!result) {
    return (
      <div>
        <p>No result available yet. Please run a test first.</p>
      </div>
    );
  }

  return (
    <div>
      <p>Result: {JSON.stringify(result)}</p>
    </div>
  );
};

export default ResultsTab;
