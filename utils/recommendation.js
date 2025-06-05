// utils/recommendation.js
function getCourseRecommendation(profile) {
  const scores = [
    profile.english,
    profile.dzongkha,
    profile.subject1,
    profile.subject2,
    profile.optional
  ];

  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  const avg = validScores.length ? validScores.reduce((sum, val) => sum + val, 0) / validScores.length : 0;

  const stream = (profile.stream || '').toLowerCase();

  if (stream === 'science') {
    if (avg >= 80) return 'MBBS – KGUMSB / BSc or Engineering – CST';
    if (avg >= 70) return 'Engineering – JNEC / BSc – Sherubtse';
    if (avg >= 60) return 'Agriculture or Forestry – CNR / Education – SCE';
    if (avg >= 50) return 'Technical Training – VTI / Language & Culture – CLCS';
    return 'Diploma courses / Consider reattempting exams';
  }

  if (stream === 'commerce') {
    if (avg >= 80) return 'Business Intelligence or Accounting – GCBS / Data Science – Sherubtse';
    if (avg >= 70) return 'B.Com or BBA – GCBS / Digital Communication – Sherubtse';
    if (avg >= 60) return 'Education – SCE / Sustainable Development – CNR';
    if (avg >= 50) return 'Language & Culture – CLCS / Short-term training programs';
    return 'Diploma in Business or IT / Reattempt suggestion';
  }

  if (stream === 'arts') {
    if (avg >= 80) return 'BA in Language & Culture – CLCS / Digital Communication – Sherubtse';
    if (avg >= 70) return 'B.Ed – Paro/Samtse / BA in Political Science – Sherubtse';
    if (avg >= 60) return 'Sustainable Development – CNR / B.Ed in Dzongkha – PCE';
    if (avg >= 50) return 'Short-term skill training / Language programs – CLCS';
    return 'Diploma courses / Try again next year';
  }

  return 'Stream not specified or invalid';
}

module.exports = { getCourseRecommendation };
