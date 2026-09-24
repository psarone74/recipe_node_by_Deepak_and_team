import { api } from './api';

export interface ICulinaryAdviceResponse {
  answer: string;
  groundingSources: Array<{ title?: string; uri?: string }>;
}

export const aiService = {
  async getCulinaryAdvice(payload: {
    prompt?: string;
    recipeTitle?: string;
    requestedSubstitute?: string;
  }): Promise<ICulinaryAdviceResponse> {
    const res = await api.post('/ai/culinary-advisor', payload);
    return res.data.data;
  },
};
