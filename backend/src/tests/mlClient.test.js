const { mapAssessmentToGrade, getFallbackResponse, assessCropImage } = require('../services/mlClient');

describe('ML Client & Quality Assessment Mapping', () => {
  test('Maps healthy harvest with >80% confidence to GRADE_A', () => {
    const assessment = {
      overall_health: 'healthy',
      confidence: 0.92,
      detections: [],
    };
    expect(mapAssessmentToGrade(assessment)).toBe('GRADE_A');
  });

  test('Maps healthy harvest with moderate confidence to GRADE_B', () => {
    const assessment = {
      overall_health: 'healthy',
      confidence: 0.74,
      detections: [],
    };
    expect(mapAssessmentToGrade(assessment)).toBe('GRADE_B');
  });

  test('Maps crop with high severity disease to REJECTED', () => {
    const assessment = {
      overall_health: 'diseased',
      confidence: 0.88,
      detections: [{ disease_name: 'Late Blight', severity: 'high' }],
    };
    expect(mapAssessmentToGrade(assessment)).toBe('REJECTED');
  });

  test('Maps crop with low/medium severity disease to GRADE_C', () => {
    const assessment = {
      overall_health: 'diseased',
      confidence: 0.82,
      detections: [{ disease_name: 'Leaf Mold', severity: 'medium' }],
    };
    expect(mapAssessmentToGrade(assessment)).toBe('GRADE_C');
  });

  test('Fallback envelope provides PENDING_ASSESSMENT without throwing', () => {
    const fallback = getFallbackResponse('CONNECTION_ERROR');
    expect(fallback.success).toBe(false);
    expect(fallback.qualityGrade).toBe('PENDING_ASSESSMENT');
    expect(fallback.fallbackReason).toBe('CONNECTION_ERROR');
  });

  test('Gracefully returns fallback when connecting to non-existent endpoint', async () => {
    const dummyImage = Buffer.from('fake_image_bytes');
    const result = await assessCropImage(dummyImage, 'image/jpeg', 'tomato', 'http://127.0.0.1:59999');

    expect(result.success).toBe(false);
    expect(result.qualityGrade).toBe('PENDING_ASSESSMENT');
    expect(result.fallbackReason).toBe('CONNECTION_ERROR');
  });
});
