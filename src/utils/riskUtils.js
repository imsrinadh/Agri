// Risk level helpers
export const getRiskColor = (level) => {
  switch (level) {
    case 'Low':      return { bg: '#D4EDDA', text: '#1A5C2B', bar: '#28A745', fill: '#28A745' };
    case 'Moderate': return { bg: '#FFF3CD', text: '#856404', bar: '#FFC107', fill: '#FFC107' };
    case 'High':     return { bg: '#FFE4CC', text: '#913D00', bar: '#FD7E14', fill: '#FD7E14' };
    case 'Critical': return { bg: '#F8D7DA', text: '#842029', bar: '#DC3545', fill: '#DC3545' };
    default:         return { bg: '#F0F0EC', text: '#4A5C35', bar: '#6B9E3F', fill: '#6B9E3F' };
  }
};

export const getRiskLevel = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 35) return 'Moderate';
  return 'Low';
};

export const getRiskBarColor = (score) => {
  if (score >= 75) return '#DC3545';
  if (score >= 55) return '#FD7E14';
  if (score >= 35) return '#FFC107';
  return '#28A745';
};

export const getRiskGaugeColor = (score) => {
  if (score >= 75) return '#DC3545';
  if (score >= 55) return '#FD7E14';
  if (score >= 35) return '#FFC107';
  return '#28A745';
};

// Format score with leading zero
export const formatScore = (score) => {
  return score < 10 ? `0${score}` : `${score}`;
};

// Priority styles
export const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'High':   return { bg: '#FFE4CC', text: '#913D00', dot: '#FD7E14' };
    case 'Medium': return { bg: '#FFF3CD', text: '#856404', dot: '#FFC107' };
    case 'Low':    return { bg: '#D4EDDA', text: '#1A5C2B', dot: '#28A745' };
    default:       return { bg: '#F0F0EC', text: '#4A5C35', dot: '#6B9E3F' };
  }
};

// Chart colors
export const CHART_COLORS = {
  weather:    '#4A7C2F',
  soil:       '#8B6914',
  pest:       '#FD7E14',
  market:     '#6B9E3F',
  production: '#2D5016',
  avg:        '#C4A44A',
  rice:       '#4A7C2F',
  wheat:      '#C4A44A',
  cotton:     '#8B6914',
  maize:      '#6B9E3F',
};
