const apiKey = process.env.GEMINI_API_KEY || '';

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 10 && apiKey !== 'sua-gemini-api-key-aqui');
}

export async function callGeminiStructured<T>(
  systemPrompt: string,
  userPrompt: string,
  modelName = 'gemini-flash-latest'
): Promise<T> {
  if (!isGeminiConfigured()) {
    throw new Error(
      'GEMINI_API_KEY_NOT_CONFIGURED: A chave da API do Gemini não foi configurada na Vercel.'
    );
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.2,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey.trim(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Erro retornado pela API do Gemini:', response.status, errText);
    throw new Error(`Falha na API do Gemini (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error('Falha ao fazer parse do JSON retornado pelo Gemini:', text);
    throw new Error('Falha no formato JSON gerado pela IA. Tente novamente.');
  }
}
